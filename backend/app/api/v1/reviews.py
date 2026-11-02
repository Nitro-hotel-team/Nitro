from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.danh_gia import DanhGia
from app.models.don_dat_phong import DonDatPhong
from app.models.khach_hang import KhachHang
from app.schemas.review import ReviewCreate, ReviewResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("", response_model=ReviewResponse)
def create_review(
    body: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Khách hàng tạo đánh giá mới sau khi trả phòng."""
    # Kiểm tra đơn đặt phòng
    don_dat = db.query(DonDatPhong).filter(DonDatPhong.MaDonDatPhong == body.bookingId).first()
    if not don_dat:
        raise HTTPException(status_code=404, detail="Đơn đặt phòng không tồn tại")
    
    # Kiểm tra xem đơn này có thuộc về khách hàng đang đăng nhập không
    khach_hang = db.query(KhachHang).filter(KhachHang.MaKH == don_dat.MaKH).first()
    if not khach_hang or khach_hang.MaNguoiDung != current_user["userId"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền đánh giá đơn đặt phòng này")

    # Kiểm tra trạng thái đơn (Phải là Đã trả phòng)
    if don_dat.TinhTrangDon != "Đã trả phòng":
        raise HTTPException(status_code=400, detail="Chỉ có thể đánh giá sau khi đã trả phòng")

    # Kiểm tra xem đã đánh giá chưa
    existing_review = db.query(DanhGia).filter(DanhGia.MaDonDatPhong == body.bookingId).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="Bạn đã đánh giá đơn đặt phòng này rồi")

    # Tạo đánh giá mới
    new_review = DanhGia(
        MaDonDatPhong=body.bookingId,
        MaKH=khach_hang.MaKH,
        Rating=body.rating,
        Comment=body.comment,
        NgayDanhGia=datetime.now()
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "id": new_review.MaDG,
        "bookingId": new_review.MaDonDatPhong,
        "guestName": khach_hang.HoTen,
        "avatar": None,
        "rating": new_review.Rating,
        "comment": new_review.Comment,
        "createdAt": new_review.NgayDanhGia.isoformat() if new_review.NgayDanhGia else ""
    }

@router.get("", response_model=List[ReviewResponse])
def get_reviews(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả các đánh giá (để hiển thị trên trang chủ hoặc phòng)."""
    reviews = db.query(DanhGia).order_by(DanhGia.NgayDanhGia.desc()).all()
    result = []
    for rv in reviews:
        khach = db.query(KhachHang).filter(KhachHang.MaKH == rv.MaKH).first()
        result.append({
            "id": rv.MaDG,
            "bookingId": rv.MaDonDatPhong,
            "guestName": khach.HoTen if khach else "Khách ẩn danh",
            "avatar": None,
            "rating": rv.Rating,
            "comment": rv.Comment,
            "createdAt": rv.NgayDanhGia.isoformat() if rv.NgayDanhGia else ""
        })
    return result
