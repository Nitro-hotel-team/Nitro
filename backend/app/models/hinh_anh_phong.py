"""
Model: HINH_ANH_PHONG (Hình ảnh phòng)
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class HinhAnhPhong(Base):
    __tablename__ = "HINH_ANH_PHONG"
    __table_args__ = {"implicit_returning": False}

    MaHinhAnh = Column(Integer, primary_key=True, autoincrement=True)
    MaPhong = Column(Integer, ForeignKey("PHONG.MaPhong", ondelete="CASCADE"), nullable=False)
    HinhAnhURL = Column(String(500), nullable=False)
    IsPrimary = Column(Boolean, nullable=True, default=False)
    ThuTu = Column(Integer, nullable=True)

    # Relationships
    phong = relationship("Phong", back_populates="hinh_anhs")
