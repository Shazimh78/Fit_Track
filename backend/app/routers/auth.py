from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_value,
    verify_value,
)
from app.db.mongodb import users_collection
from app.models.user import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    ResendOtpRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    VerifyOtpRequest,
)
from app.services.otp_service import issue_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_value(payload.password),
        "gender": payload.gender,
        "role": "user",
        "age": payload.age,
        "height_cm": payload.height_cm,
        "weight_kg": payload.weight_kg,
        "starting_weight_kg": payload.weight_kg,
        "target_weight_kg": payload.target_weight_kg,
        "activity_level": payload.activity_level,
        "is_verified": False,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }
    await users_collection.insert_one(user_doc)
    await issue_otp(payload.email, purpose="signup")

    return {"message": "Account created. Check your email for a verification code."}


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp_route(payload: VerifyOtpRequest):
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No account with this email.")

    await verify_otp(payload.email, purpose="signup", otp=payload.otp)

    await users_collection.update_one({"email": payload.email}, {"$set": {"is_verified": True}})

    user_id = str(user["_id"])
    return TokenResponse(
        access_token=create_access_token(user_id, user["role"], user["gender"]),
        refresh_token=create_refresh_token(user_id, user["role"], user["gender"]),
    )


@router.post("/resend-otp")
async def resend_otp(payload: ResendOtpRequest):
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No account with this email.")
    if user["is_verified"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Account is already verified.")

    await issue_otp(payload.email, purpose="signup")
    return {"message": "A new code has been sent."}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await users_collection.find_one({"email": payload.email})
    if not user or not verify_value(payload.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")

    if not user["is_verified"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account not verified. Check your email for a code.")

    if not user.get("is_active", True):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been deactivated.")

    user_id = str(user["_id"])
    return TokenResponse(
        access_token=create_access_token(user_id, user["role"], user["gender"]),
        refresh_token=create_refresh_token(user_id, user["role"], user["gender"]),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest):
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token.")

    return TokenResponse(
        access_token=create_access_token(data["sub"], data["role"], data["gender"]),
        refresh_token=create_refresh_token(data["sub"], data["role"], data["gender"]),
    )


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": payload.email})
    # Only send the OTP if the account actually exists, but return the exact
    # same response either way — revealing which emails are registered is
    # a real enumeration risk, not just a theoretical one.
    if user:
        await issue_otp(payload.email, purpose="reset_password")

    return {"message": "If an account exists for this email, a reset code has been sent."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    # verify_otp already fails cleanly (400) if no OTP was ever issued for
    # this email — which is also what happens for a nonexistent account,
    # since forgot_password only issues one for real accounts. So this
    # naturally doesn't leak account existence either.
    await verify_otp(payload.email, purpose="reset_password", otp=payload.otp)

    user = await users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid code or email.")

    await users_collection.update_one(
        {"_id": user["_id"]}, {"$set": {"password_hash": hash_value(payload.new_password)}}
    )
    return {"message": "Password reset successful. You can now log in."}
