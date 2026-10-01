"""
Schemas: Guest (Khách hàng)
"""
from pydantic import BaseModel
from typing import Optional


class GuestCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    idCardNumber: str
    nationality: Optional[str] = "Việt Nam"
    notes: Optional[str] = None


class GuestResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    idCardNumber: Optional[str] = None
    nationality: Optional[str] = None
    totalSpent: float = 0
    totalStays: int = 0
    lastStay: Optional[str] = None

    class Config:
        from_attributes = True
