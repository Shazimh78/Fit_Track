from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token

bearer_scheme = HTTPBearer()


class CurrentUser:
    def __init__(self, user_id: str, role: str, gender: str):
        self.user_id = user_id
        self.role = role
        self.gender = gender


def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> CurrentUser:
    payload = decode_token(creds.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return CurrentUser(user_id=payload["sub"], role=payload["role"], gender=payload["gender"])


def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
