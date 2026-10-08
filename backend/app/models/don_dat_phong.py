"""
Model: DON_DAT_PHONG (Đơn đặt phòng)
"""
from sqlalchemy import Column, Integer, String, Unicode, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class DonDatPhong(Base):
    __tablename__ = "DON_DAT_PHONG"
    __table_args__ = {"implicit_returning": False}

    MaDonDatPhong = Column(Integer, primary_key=True, autoincrement=True)
    MaKH = Column(Integer, ForeignKey("KHACH_HANG.MaKH"), nullable=False)
    NgayDat = Column(DateTime, nullable=True)
    NgayNhanPhong = Column(DateTime, nullable=False)
    NgayTraPhong = Column(DateTime, nullable=False)
    TinhTrangDon = Column(Unicode(100), nullable=False)
    TongTien = Column(Numeric(12, 2), nullable=True)
    TienCoc = Column(Numeric(12, 2), nullable=True, default=0)
    HinhThucThanhToan = Column(String(50), nullable=True) # DEPOSIT_30, FULL
    KenhDat = Column(Unicode(50), default="WEB")

    # Relationships
    khach_hang = relationship("KhachHang", back_populates="don_dat_phongs")
    chi_tiet_dat_phongs = relationship("ChiTietDatPhong", back_populates="don_dat_phong")
    su_dung_dvs = relationship("SuDungDV", back_populates="don_dat_phong", cascade="all, delete-orphan")
    thanh_toans = relationship("ThanhToan", back_populates="don_dat_phong")
    danh_gias = relationship("DanhGia", back_populates="don_dat_phong")
