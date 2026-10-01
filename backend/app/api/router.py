"""
Router chính: Gộp tất cả API routers v1 với prefix /api
"""
from fastapi import APIRouter
from app.api.v1 import auth, room_types, rooms, bookings, guests, services, users, dashboard, upload, payments

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(room_types.router)
api_router.include_router(rooms.router)
api_router.include_router(bookings.router)
api_router.include_router(guests.router)
api_router.include_router(services.router)
api_router.include_router(users.router)
api_router.include_router(dashboard.router)
api_router.include_router(upload.router)
api_router.include_router(payments.router)
