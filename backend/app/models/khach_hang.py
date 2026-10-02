"""
Model: KHACH_HANG (Khách hàng)
"""
from sqlalchemy import Column, Integer, String, Unicode, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class KhachHang(Base):
    __tablename__ = "KHACH_HANG"
    __table_args__ = {"implicit_returning": False}

    MaKH = Column(Integer, primary_key=True, autoincrement=True)
    MaNguoiDung = Column(Integer, ForeignKey("NGUOI_DUNG.MaNguoiDung", ondelete="SET NULL"), nullable=True)
    HoTen = Column(Unicode(100), nullable=False)
    SDT = Column(String(11), nullable=False, unique=True)
    CCCD = Column(String(20), nullable=False, unique=True)
    NgaySinh = Column(Date, nullable=True)
    GioiTinh = Column(Unicode(10), nullable=True)
    DiaChi = Column(Unicode(255), nullable=True)
    QuocTich = Column(Unicode(255), nullable=True)

    # Relationships
    nguoi_dung = relationship("NguoiDung", back_populates="khach_hang")
    don_dat_phongs = relationship("DonDatPhong", back_populates="khach_hang")
    danh_gias = relationship("DanhGia", back_populates="khach_hang")
