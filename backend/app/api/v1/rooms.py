"""
API Router: Rooms
Endpoints: GET /api/rooms, PATCH /api/rooms/:id/status, GET /api/rooms/availability
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.status_mapping import room_status_to_en, room_status_to_vi
from app.models.phong import Phong
from app.models.loai_phong import LoaiPhong
from app.models.hinh_anh_phong import HinhAnhPhong
from app.models.chi_tiet_dp import ChiTietDatPhong
from app.models.don_dat_phong import DonDatPhong
from app.models.khach_hang import KhachHang
from app.schemas.room import RoomStatusUpdate, RoomCreate, RoomUpdate
from app.middleware.auth import require_roles

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("/availability")
def check_availability(
    roomTypeId: str = Query(...),
    checkIn: str = Query(...),
    checkOut: str = Query(...),
    db: Session = Depends(get_db),
):
    """Kiểm tra số phòng còn trống trong khoảng ngày (Public)."""
    check_in_dt = datetime.strptime(checkIn, "%Y-%m-%d")
    check_out_dt = datetime.strptime(checkOut, "%Y-%m-%d")

    # Lấy tất cả phòng thuộc loại phòng (loại trừ phòng đã xóa mềm và bảo trì)
    all_rooms = db.query(Phong).filter(
        Phong.MaLoaiPhong == int(roomTypeId),
        Phong.TinhTrang.notin_(["Xóa mềm", "Bảo trì"])
    ).all()
    total = len(all_rooms)

    # Tìm phòng đã đặt trong khoảng thời gian
    booked_room_ids = (
        db.query(ChiTietDatPhong.MaPhong)
        .join(DonDatPhong, ChiTietDatPhong.MaDonDatPhong == DonDatPhong.MaDonDatPhong)
        .filter(
            ChiTietDatPhong.MaPhong.in_([p.MaPhong for p in all_rooms]),
            DonDatPhong.TinhTrangDon.notin_(["Đã hủy", "Đã trả phòng"]),
            DonDatPhong.NgayNhanPhong < check_out_dt,
            DonDatPhong.NgayTraPhong > check_in_dt,
        )
        .all()
    )
    booked_ids = {r[0] for r in booked_room_ids}
    remaining = total - len(booked_ids)

    available_rooms_list = [p for p in all_rooms if p.MaPhong not in booked_ids]
    return {
        "available": remaining > 0,
        "remainingCount": max(remaining, 0),
        "availableRooms": [
            {
                "id": str(p.MaPhong),
                "number": p.SoPhong,
                "floor": p.Tang,
                "roomTypeId": str(p.MaLoaiPhong),
                "status": "AVAILABLE"
            } for p in available_rooms_list
        ]
    }


@router.get("")
def get_rooms(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("FRONT_DESK", "MANAGER", "ADMIN")),
):
    """Lấy danh sách toàn bộ phòng (Staff only)."""
    phongs = db.query(Phong).filter(Phong.TinhTrang != "Xóa mềm").all()
    result = []
    for p in phongs:
        loai_phong = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == p.MaLoaiPhong).first()
        hinh_anhs = db.query(HinhAnhPhong).filter(HinhAnhPhong.MaPhong == p.MaPhong).order_by(HinhAnhPhong.ThuTu).all()
        images = [ha.HinhAnhURL for ha in hinh_anhs]
        primary_image = next((ha.HinhAnhURL for ha in hinh_anhs if ha.IsPrimary), images[0] if images else None)
        current_guest_name = None
        if p.TinhTrang == "Đang sử dụng":
            active_booking = (
                db.query(KhachHang.HoTen)
                .select_from(KhachHang)
                .join(DonDatPhong, KhachHang.MaKH == DonDatPhong.MaKH)
                .join(ChiTietDatPhong, DonDatPhong.MaDonDatPhong == ChiTietDatPhong.MaDonDatPhong)
                .filter(
                    ChiTietDatPhong.MaPhong == p.MaPhong,
                    DonDatPhong.TinhTrangDon.notin_(["Đã hủy", "Đã trả phòng"])
                )
                .order_by(DonDatPhong.MaDonDatPhong.desc())
                .first()
            )
            if active_booking:
                current_guest_name = active_booking[0]

        result.append({
            "id": str(p.MaPhong),
            "number": p.SoPhong,
            "floor": p.Tang,
            "roomTypeId": str(p.MaLoaiPhong),
            "roomTypeName": loai_phong.TenLoaiPhong if loai_phong else None,
            "status": room_status_to_en(p.TinhTrang) if p.TinhTrang else "AVAILABLE",
            "currentGuestName": current_guest_name,
            "note": None,
            "image": primary_image,
            "images": images,
        })
    return result


@router.patch("/{room_id}/status")
def update_room_status(
    room_id: str,
    body: RoomStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("FRONT_DESK", "MANAGER", "ADMIN")),
):
    """Cập nhật trạng thái phòng."""
    phong = db.query(Phong).filter(Phong.MaPhong == int(room_id)).first()
    if not phong:
        raise HTTPException(status_code=404, detail="Phòng không tồn tại")

    phong.TinhTrang = room_status_to_vi(body.status)
    db.commit()
    return {
        "id": str(phong.MaPhong),
        "number": phong.SoPhong,
        "floor": phong.Tang,
        "roomTypeId": str(phong.MaLoaiPhong),
        "status": body.status,
        "currentGuestName": None,
    }


@router.post("")
def create_room(
    body: RoomCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Tạo phòng mới (Chỉ Manager/Admin)."""
    # Check duplicate
    existing = db.query(Phong).filter(Phong.SoPhong == body.number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Số phòng đã tồn tại")
    
    # Check room type
    loai_phong = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == body.roomTypeId).first()
    if not loai_phong:
        raise HTTPException(status_code=400, detail="Loại phòng không tồn tại")

    new_room = Phong(
        SoPhong=body.number,
        Tang=body.floor,
        MaLoaiPhong=body.roomTypeId,
        TinhTrang="Còn trống"
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return {
        "id": str(new_room.MaPhong),
        "number": new_room.SoPhong,
        "floor": new_room.Tang,
        "roomTypeId": str(new_room.MaLoaiPhong),
        "roomTypeName": loai_phong.TenLoaiPhong,
        "status": "AVAILABLE",
        "currentGuestName": None,
    }


@router.put("/{room_id}")
def update_room(
    room_id: str,
    body: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Cập nhật thông tin phòng (Chỉ Manager/Admin)."""
    phong = db.query(Phong).filter(Phong.MaPhong == int(room_id)).first()
    if not phong or phong.TinhTrang == "Xóa mềm":
        raise HTTPException(status_code=404, detail="Phòng không tồn tại")

    # Check duplicate number if changed
    if phong.SoPhong != body.number:
        existing = db.query(Phong).filter(Phong.SoPhong == body.number).first()
        if existing:
            raise HTTPException(status_code=400, detail="Số phòng đã tồn tại")

    # Check room type
    loai_phong = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == body.roomTypeId).first()
    if not loai_phong:
        raise HTTPException(status_code=400, detail="Loại phòng không tồn tại")

    phong.SoPhong = body.number
    phong.Tang = body.floor
    phong.MaLoaiPhong = body.roomTypeId
    db.commit()
    db.refresh(phong)

    return {
        "id": str(phong.MaPhong),
        "number": phong.SoPhong,
        "floor": phong.Tang,
        "roomTypeId": str(phong.MaLoaiPhong),
        "roomTypeName": loai_phong.TenLoaiPhong,
        "status": room_status_to_en(phong.TinhTrang),
        "currentGuestName": None,
    }


@router.delete("/{room_id}")
def delete_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN")),
):
    """Xóa mềm phòng (Chỉ Admin)."""
    phong = db.query(Phong).filter(Phong.MaPhong == int(room_id)).first()
    if not phong or phong.TinhTrang == "Xóa mềm":
        raise HTTPException(status_code=404, detail="Phòng không tồn tại")

    if phong.TinhTrang in ["Đang sử dụng", "Đã đặt"]:
        raise HTTPException(status_code=400, detail="Không thể xóa phòng đang có khách hoặc đã đặt")

    phong.TinhTrang = "Xóa mềm"
    db.commit()
    return {"success": True, "message": "Đã xóa phòng thành công"}
