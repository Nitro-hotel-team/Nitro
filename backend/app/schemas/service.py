"""
Schemas: Hotel Service (Dịch vụ)
"""
from pydantic import BaseModel
from typing import Optional


class ServiceResponse(BaseModel):
    id: str
    name: str
    nameEn: Optional[str] = None
    price: float
    unit: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: str = "ACTIVE"  # ACTIVE | INACTIVE
    icon: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceToggle(BaseModel):
    status: str  # ACTIVE | INACTIVE
