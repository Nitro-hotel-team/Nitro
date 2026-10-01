"""
Cấu hình ứng dụng - Đọc biến môi trường từ file .env
"""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # --- Database (SQL Server) ---
    DB_SERVER: str = r"LAPTOP-RKE9NM0K\SQLEXPRESS"
    DB_NAME: str = "QLKhachSan"
    DB_DRIVER: str = "ODBC Driver 17 for SQL Server"

    # --- JWT Authentication ---
    JWT_SECRET_KEY: str = "nitro-grand-hotel-secret-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 giờ

    # --- CORS ---
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'

    # --- Server ---
    HOST: str = "0.0.0.0"
    PORT: int = 5000

    # --- Google OAuth ---
    GOOGLE_CLIENT_ID: str = ""

    # --- VNPay Config ---
    VNPAY_TMN_CODE: str = "TW3QQHOB" # Default sandbox values
    VNPAY_HASH_SECRET: str = "QMAZYAICPYDZLGKHYMFKSCNNANZLRLLK"
    VNPAY_URL: str = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    VNPAY_RETURN_URL: str = "http://localhost:3000/booking/payment-result"

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    @property
    def database_url(self) -> str:
        """Connection string cho SQL Server với Windows Authentication"""
        return (
            f"mssql+pyodbc://@{self.DB_SERVER}/{self.DB_NAME}"
            f"?driver={self.DB_DRIVER.replace(' ', '+')}"
            f"&Trusted_Connection=yes"
            f"&TrustServerCertificate=yes"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
