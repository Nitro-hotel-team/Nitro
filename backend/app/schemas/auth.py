"""
Schemas: Authentication (Login, Register, Token, User response)
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class ChangePasswordRequest(BaseModel):
    oldPassword: str
    newPassword: str = Field(..., min_length=6, description="Mật khẩu mới phải có ít nhất 6 ký tự")


class LoginRequest(BaseModel):
    emailOrPhone: str
    password: str


class GoogleLoginRequest(BaseModel):
    credential: str
    clientId: Optional[str] = None
    select_by: Optional[str] = None

    class Config:
        extra = "ignore"


class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str


class RefreshRequest(BaseModel):
    refreshToken: str


class TokenResponse(BaseModel):
    token: str
    refreshToken: Optional[str] = None
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str  # CUSTOMER | FRONT_DESK | MANAGER | ADMIN
    status: Optional[str] = "ACTIVE"  # ACTIVE | LOCKED
    lastLogin: Optional[str] = None
    avatar: Optional[str] = None

    class Config:
        from_attributes = True
