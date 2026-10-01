"""
Model: THANH_TOAN (Thanh toán)
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ThanhToan(Base):
    __tablename__ = "THANH_TOAN"
    __table_args__ = {"implicit_returning": False}

    MaThanhToan = Column(Integer, primary_key=True, autoincrement=True)
    MaDonDatPhong = Column(Integer, ForeignKey("DON_DAT_PHONG.MaDonDatPhong"), nullable=False)
    NgayThanhToan = Column(DateTime, nullable=True)
    PhuongThucThanhToan = Column(String(100), nullable=False)
    TongTien = Column(Numeric(12, 2), nullable=False)
    TinhTrang = Column(String(30), nullable=True)

    # Relationships
    don_dat_phong = relationship("DonDatPhong", back_populates="thanh_toans")
