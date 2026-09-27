"""
Schemas: User Management
"""
from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: str = "FRONT_DESK"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
    status: str = "ACTIVE"
    lastLogin: Optional[str] = None

    class Config:
        from_attributes = True


class RoleUpdate(BaseModel):
    role: str  # FRONT_DESK | MANAGER | ADMIN


class StatusUpdate(BaseModel):
    status: str  # ACTIVE | LOCKED
