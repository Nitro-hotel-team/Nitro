"""
Model: LOAI_PHONG (Loại phòng)
"""
from sqlalchemy import Column, Integer, String, Numeric, Text, NVARCHAR
from sqlalchemy.orm import relationship
from app.core.database import Base


class LoaiPhong(Base):
    __tablename__ = "LOAI_PHONG"
    __table_args__ = {"implicit_returning": False}

    MaLoaiPhong = Column(Integer, primary_key=True, autoincrement=True)
    TenLoaiPhong = Column(NVARCHAR(255), nullable=False)
    GiaThanh = Column(Numeric(12, 2), nullable=False)
    SucChua = Column(Integer, nullable=False)
    SucChuaTreEm = Column(Integer, default=0, nullable=True)
    DienTich = Column(Integer, default=25, nullable=True)
    MoTa = Column(NVARCHAR(None), nullable=True)
    HinhAnh = Column(NVARCHAR(None), nullable=True)

    # Relationships
    phongs = relationship("Phong", back_populates="loai_phong")
