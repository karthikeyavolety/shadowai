import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import TokenPair, UserInDB, UserLogin, UserSignup
from app.repositories import user_repo


def _to_user_out(user_doc: dict) -> dict:
    return {
        "id": user_doc["id"],
        "name": user_doc["name"],
        "email": user_doc["email"],
        "role": user_doc["role"],
        "is_verified": user_doc["is_verified"],
        "is_suspended": user_doc["is_suspended"],
        "settings": user_doc["settings"],
        "created_at": user_doc["created_at"],
        "last_login": user_doc.get("last_login"),
    }


async def signup(payload: UserSignup) -> TokenPair:
    existing = await user_repo.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    user = UserInDB(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    created = await user_repo.create_user(user)
    await user_repo.update_last_login(created["id"])

    access = create_access_token(created["id"], created["role"])
    refresh = create_refresh_token(created["id"])
    return TokenPair(access_token=access, refresh_token=refresh, user=_to_user_out(created))


async def login(payload: UserLogin) -> TokenPair:
    user = await user_repo.get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if user["is_suspended"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been suspended")

    await user_repo.update_last_login(user["id"])
    access = create_access_token(user["id"], user["role"])
    refresh = create_refresh_token(user["id"])
    return TokenPair(access_token=access, refresh_token=refresh, user=_to_user_out(user))


async def forgot_password(email: str) -> str:
    """Returns the reset token. In production this is emailed, never returned
    to the client — for this hackathon demo (no email service wired up yet)
    the API response includes it directly so the reset flow is testable end
    to end. Swap this out once an email provider (e.g. SES/SendGrid) is added."""
    user = await user_repo.get_user_by_email(email)
    if not user:
        # Do not reveal whether the email exists
        return ""
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    await user_repo.set_reset_token(email, token, expires)
    return token


async def reset_password(token: str, new_password: str) -> None:
    user = await user_repo.get_user_by_reset_token(token)
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token")

    expires = user.get("reset_token_expires")
    if expires and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if not expires or expires < datetime.now(timezone.utc):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token")

    await user_repo.set_new_password(user["id"], hash_password(new_password))
