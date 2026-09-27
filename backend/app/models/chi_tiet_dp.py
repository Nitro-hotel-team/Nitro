"""
Model: CHI_TIET_DAT_PHONG (Chi tiết đặt phòng)
"""
from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChiTietDatPhong(Base):
    __tablename__ = "CHI_TIET_DAT_PHONG"
    __table_args__ = {"implicit_returning": False}

    MaChiTietDP = Column(Integer, primary_key=True, autoincrement=True)
    MaDonDatPhong = Column(Integer, ForeignKey("DON_DAT_PHONG.MaDonDatPhong"), nullable=False)
    MaPhong = Column(Integer, ForeignKey("PHONG.MaPhong"), nullable=False)
    DonGia = Column(Numeric(12, 2), nullable=False)

    # Relationships
    don_dat_phong = relationship("DonDatPhong", back_populates="chi_tiet_dat_phongs")
    phong = relationship("Phong", back_populates="chi_tiet_dat_phongs")
