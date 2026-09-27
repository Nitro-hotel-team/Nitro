"""
Model: VAI_TRO (Vai trò người dùng)
"""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class VaiTro(Base):
    __tablename__ = "VAI_TRO"
    __table_args__ = {"implicit_returning": False}

    MaVT = Column(Integer, primary_key=True, autoincrement=True)
    TenVaiTro = Column(String(100), nullable=False, unique=True)
    Mota = Column(String(255), nullable=True)

    # Relationships
    nguoi_dungs = relationship("NguoiDung", back_populates="vai_tro")
