"""
Model: SU_DUNG_DV (Sử dụng dịch vụ)
"""
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, Computed
from sqlalchemy.orm import relationship
from app.core.database import Base


class SuDungDV(Base):
    __tablename__ = "SU_DUNG_DV"
    __table_args__ = {"implicit_returning": False}

    MaSDDV = Column(Integer, primary_key=True, autoincrement=True)
    MaDonDatPhong = Column(Integer, ForeignKey("DON_DAT_PHONG.MaDonDatPhong", ondelete="CASCADE"), nullable=False)
    MaDV = Column(Integer, ForeignKey("DICH_VU.MaDV"), nullable=False)
    SoLuong = Column(Integer, nullable=True)
    DonGia = Column(Numeric(12, 2), nullable=False)
    ThanhTien = Column(Numeric(24, 4), Computed("SoLuong * DonGia"))
    NgaySuDung = Column(DateTime, nullable=True)

    # Relationships
    don_dat_phong = relationship("DonDatPhong", back_populates="su_dung_dvs")
    dich_vu = relationship("DichVu", back_populates="su_dung_dvs")
