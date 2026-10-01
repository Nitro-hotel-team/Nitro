"""
Models package - Import tất cả ORM models để SQLAlchemy nhận diện
"""
from app.models.vai_tro import VaiTro
from app.models.nguoi_dung import NguoiDung
from app.models.khach_hang import KhachHang
from app.models.loai_phong import LoaiPhong
from app.models.phong import Phong
from app.models.hinh_anh_phong import HinhAnhPhong
from app.models.dich_vu import DichVu
from app.models.don_dat_phong import DonDatPhong
from app.models.chi_tiet_dp import ChiTietDatPhong
from app.models.su_dung_dv import SuDungDV
from app.models.thanh_toan import ThanhToan
from app.models.danh_gia import DanhGia

__all__ = [
    "VaiTro",
    "NguoiDung",
    "KhachHang",
    "LoaiPhong",
    "Phong",
    "HinhAnhPhong",
    "DichVu",
    "DonDatPhong",
    "ChiTietDatPhong",
    "SuDungDV",
    "ThanhToan",
    "DanhGia",
]
