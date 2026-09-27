"""
Model: DANH_GIA (Đánh giá)
"""
from sqlalchemy import Column, Integer, String, DateTime, SmallInteger, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class DanhGia(Base):
    __tablename__ = "DANH_GIA"
    __table_args__ = {"implicit_returning": False}

    MaDG = Column(Integer, primary_key=True, autoincrement=True)
    MaDonDatPhong = Column(Integer, ForeignKey("DON_DAT_PHONG.MaDonDatPhong"), nullable=False)
    MaKH = Column(Integer, ForeignKey("KHACH_HANG.MaKH"), nullable=False)
    Rating = Column(SmallInteger, nullable=False)
    Comment = Column(Text, nullable=True)
    NgayDanhGia = Column(DateTime, nullable=True)

    # Relationships
    don_dat_phong = relationship("DonDatPhong", back_populates="danh_gias")
    khach_hang = relationship("KhachHang", back_populates="danh_gias")
