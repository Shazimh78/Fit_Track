import random
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import hash_value, verify_value
from app.db.mongodb import otp_collection
from app.services.email_service import send_otp_email


def _generate_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


async def issue_otp(email: str, purpose: str) -> None:
    otp = _generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.otp_expire_minutes)

    # Only one live OTP per (email, purpose) at a time
    await otp_collection.delete_many({"email": email, "purpose": purpose})
    await otp_collection.insert_one({
        "email": email,
        "purpose": purpose,
        "otp_hash": hash_value(otp),
        "expires_at": expires_at,
        "attempts": 0,
    })

    send_otp_email(email, otp, purpose)


async def verify_otp(email: str, purpose: str, otp: str) -> None:
    record = await otp_collection.find_one({"email": email, "purpose": purpose})

    if not record:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No active code for this email. Request a new one.")

    if record["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        await otp_collection.delete_one({"_id": record["_id"]})
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Code expired. Request a new one.")

    if record["attempts"] >= settings.otp_max_attempts:
        await otp_collection.delete_one({"_id": record["_id"]})
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many incorrect attempts. Request a new code.")

    if not verify_value(otp, record["otp_hash"]):
        await otp_collection.update_one({"_id": record["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Incorrect code.")

    await otp_collection.delete_one({"_id": record["_id"]})
