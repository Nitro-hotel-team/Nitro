"""
╔══════════════════════════════════════════════════════╗
║        NITRO GRAND HOTEL - BACKEND API SERVER        ║
║        Python FastAPI + SQL Server (QLKhachSan)      ║
╚══════════════════════════════════════════════════════╝

Khởi chạy: uvicorn main:app --host 0.0.0.0 --port 5000 --reload
Swagger UI: http://localhost:5000/docs
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load .env
load_dotenv()

from app.core.config import settings
from app.core.database import test_connection
from app.api.router import api_router

# Import models để SQLAlchemy nhận diện
import app.models  # noqa: F401


# --- Khởi tạo FastAPI ---
app = FastAPI(
    title="Nitro Grand Hotel API",
    description="Hệ thống quản lý khách sạn Nitro Grand Hotel",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(api_router)

# --- Mount Static Files cho ảnh tải lên ---
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# --- Health Check ---
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "running",
        "app": "Nitro Grand Hotel API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    db_ok = test_connection()
    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database": "connected" if db_ok else "disconnected",
        "server": settings.DB_SERVER,
        "database_name": settings.DB_NAME,
    }


# --- Entry point ---
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
