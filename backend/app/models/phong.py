"""
Model: PHONG (Phòng khách sạn)
"""
from sqlalchemy import Column, Integer, String, ForeignKey, NVARCHAR
from sqlalchemy.orm import relationship
from app.core.database import Base


class Phong(Base):
    __tablename__ = "PHONG"
    __table_args__ = {"implicit_returning": False}

    MaPhong = Column(Integer, primary_key=True, autoincrement=True)
    MaLoaiPhong = Column(Integer, ForeignKey("LOAI_PHONG.MaLoaiPhong"), nullable=False)
    SoPhong = Column(String(20), nullable=False, unique=True)
    TinhTrang = Column(NVARCHAR(30), nullable=True)
    Tang = Column(Integer, nullable=False)

    # Relationships
    loai_phong = relationship("LoaiPhong", back_populates="phongs")
    hinh_anhs = relationship("HinhAnhPhong", back_populates="phong", cascade="all, delete-orphan")
    chi_tiet_dat_phongs = relationship("ChiTietDatPhong", back_populates="phong")
