"""
Schemas: Room Types
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class RoomTypeResponse(BaseModel):
    id: str
    name: str
    nameEn: Optional[str] = None
    basePrice: float
    maxGuests: int
    area: Optional[int] = None
    bedType: Optional[str] = None
    amenities: List[str] = []
    images: List[str] = []
    description: Optional[str] = None

    class Config:
        from_attributes = True

class RoomTypeCreate(BaseModel):
    name: str
    basePrice: float = Field(..., ge=0)
    capacityAdults: int = Field(..., ge=1)
    capacityChildren: int = Field(..., ge=0)
    area: int = Field(..., ge=1)
    description: Optional[str] = None
    image: Optional[str] = None
    images: List[str] = []

class RoomTypeUpdate(BaseModel):
    name: str
    basePrice: float = Field(..., ge=0)
    capacityAdults: int = Field(..., ge=1)
    capacityChildren: int = Field(..., ge=0)
    area: int = Field(..., ge=1)
    description: Optional[str] = None
    image: Optional[str] = None
    images: List[str] = []
