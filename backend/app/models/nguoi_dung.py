"""
Model: NGUOI_DUNG (Tài khoản người dùng)
"""
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class NguoiDung(Base):
    __tablename__ = "NGUOI_DUNG"
    __table_args__ = {"implicit_returning": False}

    MaNguoiDung = Column(Integer, primary_key=True, autoincrement=True)
    MaVT = Column(Integer, ForeignKey("VAI_TRO.MaVT"), nullable=False)
    TaiKhoan = Column(String(255), nullable=False, unique=True)
    Email = Column(String(100), nullable=False, unique=True)
    MatKhauHash = Column(String(255), nullable=False)
    TrangThai = Column(Boolean, nullable=True, default=True)
    NgayTao = Column(Date, nullable=True)

    # Relationships
    vai_tro = relationship("VaiTro", back_populates="nguoi_dungs")
    khach_hang = relationship("KhachHang", back_populates="nguoi_dung", uselist=False)
