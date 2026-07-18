from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    user = "user"
    admin = "admin"


class UserSignup(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=72)


class UserSettings(BaseModel):
    theme: str = "dark"
    email_notifications: bool = True


class UserProfileUpdate(BaseModel):
    name: str | None = None


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole
    is_verified: bool
    is_suspended: bool
    settings: UserSettings
    created_at: datetime
    last_login: datetime | None = None


class UserInDB(BaseModel):
    name: str
    email: EmailStr
    password_hash: str
    role: UserRole = UserRole.user
    is_verified: bool = True  # auto-verified for hackathon demo; email verification can be layered on later
    is_suspended: bool = False
    reset_token: str | None = None
    reset_token_expires: datetime | None = None
    settings: UserSettings = Field(default_factory=UserSettings)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: datetime | None = None


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
