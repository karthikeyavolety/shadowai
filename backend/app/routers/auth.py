from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.core.responses import success
from app.core.security import create_access_token, decode_token
from app.models.user import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserLogin,
    UserProfileUpdate,
    UserSettings,
    UserSignup,
)
from app.services import auth_service
from app.repositories import user_repo

router = APIRouter(prefix="/auth", tags=["auth"])


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh")
async def refresh(payload: RefreshRequest):
    from fastapi import HTTPException, status
    import jwt as pyjwt

    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token type")
    except pyjwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token")

    user = await user_repo.get_user_by_id(decoded["sub"])
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    new_access = create_access_token(user["id"], user["role"])
    return success({"access_token": new_access}, "Token refreshed")


@router.post("/signup")
async def signup(payload: UserSignup):
    tokens = await auth_service.signup(payload)
    return success(tokens.model_dump(), "Account created")


@router.post("/login")
async def login(payload: UserLogin):
    tokens = await auth_service.login(payload)
    return success(tokens.model_dump(), "Logged in")


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    token = await auth_service.forgot_password(payload.email)
    # NOTE: token is included in the demo response only because no email
    # provider is wired up yet. In production this must be emailed, not returned.
    return success({"demo_reset_token": token or None}, "If that email exists, a reset link has been sent")


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    await auth_service.reset_password(payload.token, payload.new_password)
    return success(None, "Password reset successful")


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return success(user, "Current user")


@router.patch("/me")
async def update_me(payload: UserProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = await user_repo.update_profile(user["id"], updates) if updates else user
    return success(updated, "Profile updated")


@router.patch("/settings")
async def update_settings(payload: UserSettings, user: dict = Depends(get_current_user)):
    updated = await user_repo.update_profile(user["id"], {"settings": payload.model_dump()})
    return success(updated, "Settings updated")
