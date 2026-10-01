"""
Schemas: Booking
"""
from pydantic import BaseModel
from typing import Optional, List


class ExtraServiceCreate(BaseModel):
    serviceId: str
    name: str
    price: float
    quantity: int = 1


class BookingCreate(BaseModel):
    roomTypeId: str
    roomNumber: Optional[str] = None
    checkInDate: str  # YYYY-MM-DD
    checkOutDate: str
    nights: int
    adults: int = 1
    children: int = 0
    guestName: str
    guestPhone: str
    guestEmail: Optional[str] = None
    guestIdCard: Optional[str] = None
    totalAmount: float
    paidAmount: float = 0
    paymentMethod: Optional[str] = None
    paymentStatus: Optional[str] = None
    status: Optional[str] = None
    source: str = "WEB"
    specialRequests: Optional[str] = None
    extraServices: List[ExtraServiceCreate] = []

    model_config = {"extra": "ignore"}


class BookingStatusUpdate(BaseModel):
    status: str  # CONFIRMED | CHECKED_IN | CHECKED_OUT


class BookingCancelRequest(BaseModel):
    reason: Optional[str] = None
    refundAmount: Optional[float] = 0


class BookingResponse(BaseModel):
    id: str
    bookingCode: str
    guestName: str
    guestPhone: str
    guestEmail: Optional[str] = None
    guestIdCard: Optional[str] = None
    roomNumber: Optional[str] = None
    roomTypeId: str
    roomTypeName: str
    checkInDate: str
    checkOutDate: str
    nights: int
    adults: int
    children: int
    totalAmount: float
    paidAmount: float
    paymentStatus: Optional[str] = "UNPAID"
    status: str
    source: str
    createdAt: str
    specialRequests: Optional[str] = None
    paymentMethod: Optional[str] = None
    extraServices: List[dict] = []

    class Config:
        from_attributes = True
