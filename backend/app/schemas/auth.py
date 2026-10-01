"""
Schemas: Authentication (Login, Register, Token, User response)
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


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


class TokenResponse(BaseModel):
    token: str
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
