from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_value(raw: str) -> str:
    """Used for both passwords and OTP codes — never store either in plaintext."""
    return pwd_context.hash(raw)


def verify_value(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)


def create_token(subject: str, role: str, gender: str, expires_delta: timedelta, token_type: str) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {
        "sub": subject,
        "role": role,
        "gender": gender,
        "type": token_type,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str, role: str, gender: str) -> str:
    return create_token(
        user_id, role, gender,
        timedelta(minutes=settings.access_token_expire_minutes),
        "access",
    )


def create_refresh_token(user_id: str, role: str, gender: str) -> str:
    return create_token(
        user_id, role, gender,
        timedelta(days=settings.refresh_token_expire_days),
        "refresh",
    )


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
