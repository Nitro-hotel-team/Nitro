"""
Schemas: Room
"""
from pydantic import BaseModel, Field
from typing import Optional


class RoomResponse(BaseModel):
    id: str
    number: str
    floor: int
    roomTypeId: str
    roomTypeName: Optional[str] = None
    status: str  # AVAILABLE | RESERVED | OCCUPIED | MAINTENANCE
    currentGuestName: Optional[str] = None
    note: Optional[str] = None

    class Config:
        from_attributes = True


class RoomStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None

class RoomCreate(BaseModel):
    number: str
    floor: int = Field(..., ge=1, description="Số tầng phải lớn hơn hoặc bằng 1")
    roomTypeId: int

class RoomUpdate(BaseModel):
    number: str
    floor: int = Field(..., ge=1, description="Số tầng phải lớn hơn hoặc bằng 1")
    roomTypeId: int


class AvailabilityResponse(BaseModel):
    available: bool
    remainingCount: int
