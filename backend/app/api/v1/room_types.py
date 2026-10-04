"""
API Router: Room Types
Endpoints: GET /api/room-types, GET /api/room-types/:id
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.loai_phong import LoaiPhong
from app.models.phong import Phong
from app.models.hinh_anh_phong import HinhAnhPhong
from app.schemas.room_type import RoomTypeCreate, RoomTypeUpdate
from app.middleware.auth import require_roles
import json

def parse_images(hinh_anh_str: str) -> list:
    if not hinh_anh_str:
        return []
    try:
        parsed = json.loads(hinh_anh_str)
        if isinstance(parsed, list):
            return parsed
    except Exception:
        pass
    return [hinh_anh_str]

def get_room_code(name: str) -> str:
    if not name: return "STD"
    n = name.upper()
    if "DELUXE" in n or "DLX" in n: return "DLX"
    if "SUPERIOR" in n or "SUP" in n or "SUPER" in n: return "SUP"
    if "FAMILY" in n or "FAM" in n: return "FAM"
    if "EXECUTIVE" in n or "EXE" in n: return "EXE"
    if "PRESIDENTIAL" in n or "PRE" in n: return "PRE"
    return "STD"

router = APIRouter(prefix="/room-types", tags=["Room Types"])


@router.get("")
def get_room_types(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả loại phòng (Public)."""
    loai_phongs = db.query(LoaiPhong).all()
    result = []
    for lp in loai_phongs:
        # Đếm tổng phòng
        total_rooms = db.query(Phong).filter(Phong.MaLoaiPhong == lp.MaLoaiPhong).count()
        # Lấy hình ảnh từ tất cả các phòng thuộc loại phòng này
        phong_ids = [p.MaPhong for p in db.query(Phong.MaPhong).filter(Phong.MaLoaiPhong == lp.MaLoaiPhong).all()]
        images = []
        primary_image = None
        
        if phong_ids:
            hinh_anhs = db.query(HinhAnhPhong).filter(
                HinhAnhPhong.MaPhong.in_(phong_ids)
            ).order_by(HinhAnhPhong.ThuTu).all()
            
            for ha in hinh_anhs:
                if ha.HinhAnhURL not in images:
                    images.append(ha.HinhAnhURL)
                if ha.IsPrimary and not primary_image:
                    primary_image = ha.HinhAnhURL
                    
        if not primary_image and images:
            primary_image = images[0]
            
        parsed = parse_images(lp.HinhAnh)
        if parsed:
            primary_image = parsed[0]
            for img in reversed(parsed):
                if img not in images:
                    images.insert(0, img)

        # Parse amenities
        amenities = []
        try:
            if lp.TienIch:
                amenities = json.loads(lp.TienIch)
        except Exception:
            pass
        if not amenities:
            amenities = ["Wifi", "TV", "Điều hòa", "Máy sấy tóc", "Mini bar"]

        result.append({
            "id": str(lp.MaLoaiPhong),
            "isActive": lp.TrangThai == "Hoạt động" or lp.TrangThai is None,
            "code": get_room_code(lp.TenLoaiPhong),
            "name": lp.TenLoaiPhong,
            "nameEn": lp.TenLoaiPhong,
            "area": lp.DienTich or 25,
            "bedType": lp.SoGiuong if lp.SoGiuong else "1 giường đôi",
            "capacityAdults": lp.SucChua or 2,
            "capacityChildren": lp.SucChuaTreEm if lp.SucChuaTreEm is not None else 1,
            "basePrice": float(lp.GiaThanh),
            "maxGuests": lp.SucChua,
            "description": lp.MoTa,
            "descriptionEn": lp.MoTa,
            "image": primary_image if primary_image else "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
            "images": images,
            "amenities": amenities,
            "totalRooms": total_rooms,
        })
    return result


@router.get("/{room_type_id}")
def get_room_type(room_type_id: str, db: Session = Depends(get_db)):
    """Lấy chi tiết 1 loại phòng."""
    lp = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == int(room_type_id)).first()
    if not lp:
        raise HTTPException(status_code=404, detail="Loại phòng không tồn tại")

    total_rooms = db.query(Phong).filter(Phong.MaLoaiPhong == lp.MaLoaiPhong).count()
    phong_ids = [p.MaPhong for p in db.query(Phong.MaPhong).filter(Phong.MaLoaiPhong == lp.MaLoaiPhong).all()]
    images = []
    primary_image = None
    
    if phong_ids:
        hinh_anhs = db.query(HinhAnhPhong).filter(
            HinhAnhPhong.MaPhong.in_(phong_ids)
        ).order_by(HinhAnhPhong.ThuTu).all()
        
        for ha in hinh_anhs:
            if ha.HinhAnhURL not in images:
                images.append(ha.HinhAnhURL)
            if ha.IsPrimary and not primary_image:
                primary_image = ha.HinhAnhURL
                
    if not primary_image and images:
        primary_image = images[0]

    parsed = parse_images(lp.HinhAnh)
    if parsed:
        primary_image = parsed[0]
        for img in reversed(parsed):
            if img not in images:
                images.insert(0, img)

    # Parse amenities
    amenities = []
    try:
        if lp.TienIch:
            amenities = json.loads(lp.TienIch)
    except Exception:
        pass
    if not amenities:
        amenities = ["Wifi", "TV", "Điều hòa", "Máy sấy tóc", "Mini bar"]

    return {
        "id": str(lp.MaLoaiPhong),
        "isActive": lp.TrangThai == "Hoạt động" or lp.TrangThai is None,
        "code": get_room_code(lp.TenLoaiPhong),
        "name": lp.TenLoaiPhong,
        "nameEn": lp.TenLoaiPhong,
        "area": lp.DienTich or 25,
        "bedType": lp.SoGiuong if lp.SoGiuong else "1 giường đôi",
        "capacityAdults": lp.SucChua or 2,
        "capacityChildren": lp.SucChuaTreEm if lp.SucChuaTreEm is not None else 1,
        "basePrice": float(lp.GiaThanh),
        "maxGuests": lp.SucChua,
        "description": lp.MoTa,
        "descriptionEn": lp.MoTa,
        "image": primary_image if primary_image else "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
        "images": images,
        "amenities": amenities,
        "totalRooms": total_rooms,
    }


@router.post("")
def create_room_type(
    body: RoomTypeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Tạo loại phòng mới (Chỉ Manager/Admin)."""
    existing_lp = db.query(LoaiPhong).filter(LoaiPhong.TenLoaiPhong == body.name).first()
    if existing_lp:
        raise HTTPException(status_code=400, detail="Tên hạng phòng đã tồn tại")

    new_lp = LoaiPhong(
        TenLoaiPhong=body.name,
        GiaThanh=body.basePrice,
        SucChua=body.capacityAdults,
        SucChuaTreEm=body.capacityChildren,
        DienTich=body.area,
        MoTa=body.description,
        HinhAnh=json.dumps(body.images, ensure_ascii=False) if body.images else (body.image or None),
        SoGiuong=body.bedType,
        TienIch=json.dumps(body.amenities, ensure_ascii=False) if body.amenities else None
    )
    db.add(new_lp)
    db.commit()
    db.refresh(new_lp)

    return {
        "id": str(new_lp.MaLoaiPhong),
        "isActive": True,
        "code": get_room_code(new_lp.TenLoaiPhong),
        "name": new_lp.TenLoaiPhong,
        "nameEn": new_lp.TenLoaiPhong,
        "area": body.area,
        "bedType": body.bedType or "1 giường đôi",
        "capacityAdults": new_lp.SucChua,
        "capacityChildren": body.capacityChildren,
        "basePrice": float(new_lp.GiaThanh),
        "maxGuests": new_lp.SucChua,
        "description": new_lp.MoTa,
        "descriptionEn": new_lp.MoTa,
        "image": body.images[0] if body.images else (new_lp.HinhAnh if new_lp.HinhAnh else "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"),
        "images": body.images if body.images else ([new_lp.HinhAnh] if new_lp.HinhAnh else []),
        "amenities": body.amenities if body.amenities else ["Wifi", "TV", "Điều hòa", "Máy sấy tóc", "Mini bar"],
        "totalRooms": 0,
    }


@router.put("/{room_type_id}")
def update_room_type(
    room_type_id: str,
    body: RoomTypeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Cập nhật loại phòng (Chỉ Manager/Admin)."""
    lp = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == int(room_type_id)).first()
    if not lp:
        raise HTTPException(status_code=404, detail="Loại phòng không tồn tại")

    existing_lp = db.query(LoaiPhong).filter(LoaiPhong.TenLoaiPhong == body.name).first()
    if existing_lp and existing_lp.MaLoaiPhong != lp.MaLoaiPhong:
        raise HTTPException(status_code=400, detail="Tên hạng phòng đã tồn tại")

    lp.TenLoaiPhong = body.name
    lp.GiaThanh = body.basePrice
    lp.SucChua = body.capacityAdults
    lp.SucChuaTreEm = body.capacityChildren
    lp.DienTich = body.area
    lp.MoTa = body.description
    lp.HinhAnh = json.dumps(body.images, ensure_ascii=False) if body.images else (body.image or None)
    lp.SoGiuong = body.bedType
    lp.TienIch = json.dumps(body.amenities, ensure_ascii=False) if body.amenities else None

    db.commit()
    db.refresh(lp)

    return {
        "id": str(lp.MaLoaiPhong),
        "isActive": lp.TrangThai == "Hoạt động" or lp.TrangThai is None,
        "code": get_room_code(lp.TenLoaiPhong),
        "name": lp.TenLoaiPhong,
        "nameEn": lp.TenLoaiPhong,
        "area": body.area,
        "bedType": body.bedType or "1 giường đôi",
        "capacityAdults": lp.SucChua,
        "capacityChildren": body.capacityChildren,
        "basePrice": float(lp.GiaThanh),
        "maxGuests": lp.SucChua,
        "description": lp.MoTa,
        "descriptionEn": lp.MoTa,
        "image": body.images[0] if body.images else (lp.HinhAnh if lp.HinhAnh else "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"),
        "images": body.images if body.images else ([lp.HinhAnh] if lp.HinhAnh else []),
        "amenities": body.amenities if body.amenities else ["Wifi", "TV", "Điều hòa", "Máy sấy tóc", "Mini bar"],
        "totalRooms": 0,
    }


@router.delete("/{room_type_id}")
def delete_room_type(
    room_type_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Xóa mềm loại phòng (Chỉ Manager/Admin)."""
    lp = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == int(room_type_id)).first()
    if not lp:
        raise HTTPException(status_code=404, detail="Loại phòng không tồn tại")

    lp.TrangThai = "Đã ẩn"
    db.commit()
    return {"success": True, "message": "Đã ẩn loại phòng"}


@router.patch("/{room_type_id}/restore")
def restore_room_type(
    room_type_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Khôi phục loại phòng (Chỉ Manager/Admin)."""
    lp = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == int(room_type_id)).first()
    if not lp:
        raise HTTPException(status_code=404, detail="Loại phòng không tồn tại")

    lp.TrangThai = "Hoạt động"
    db.commit()
    return {"success": True, "message": "Đã khôi phục loại phòng"}
