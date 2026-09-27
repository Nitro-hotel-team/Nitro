"""
Model: DICH_VU (Dịch vụ khách sạn)
"""
from sqlalchemy import Column, Integer, String, Numeric, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class DichVu(Base):
    __tablename__ = "DICH_VU"
    __table_args__ = {"implicit_returning": False}

    MaDV = Column(Integer, primary_key=True, autoincrement=True)
    TenDV = Column(String(255), nullable=False)
    GiaThanh = Column(Numeric(12, 2), nullable=False)
    MoTa = Column(String(255), nullable=False)
    TrangThai = Column(Boolean, nullable=True, default=True)

    # Relationships
    su_dung_dvs = relationship("SuDungDV", back_populates="dich_vu")
