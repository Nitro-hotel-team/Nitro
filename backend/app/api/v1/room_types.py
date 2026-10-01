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
            
        if lp.HinhAnh:
            primary_image = lp.HinhAnh
            if lp.HinhAnh not in images:
                images.insert(0, lp.HinhAnh)

        result.append({
            "id": str(lp.MaLoaiPhong),
            "code": get_room_code(lp.TenLoaiPhong),
            "name": lp.TenLoaiPhong,
            "nameEn": lp.TenLoaiPhong,
            "area": lp.DienTich or 25,
            "bedType": "1 giường đôi",
            "capacityAdults": lp.SucChua or 2,
            "capacityChildren": lp.SucChuaTreEm if lp.SucChuaTreEm is not None else 1,
            "basePrice": float(lp.GiaThanh),
            "maxGuests": lp.SucChua,
            "description": lp.MoTa,
            "descriptionEn": lp.MoTa,
            "image": primary_image if primary_image else "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
            "images": images,
            "amenities": ["Wifi", "TV", "Điều hòa", "Máy sấy tóc", "Mini bar"],
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

    if lp.HinhAnh:
        primary_image = lp.HinhAnh
        if lp.HinhAnh not in images:
            images.insert(0, lp.HinhAnh)

    return {
        "id": str(lp.MaLoaiPhong),
        "code": get_room_code(lp.TenLoaiPhong),
        "name": lp.TenLoaiPhong,
        "nameEn": lp.TenLoaiPhong,
        "area": lp.DienTich or 25,
        "bedType": "1 giường đôi",
        "capacityAdults": lp.SucChua or 2,
        "capacityChildren": lp.SucChuaTreEm if lp.SucChuaTreEm is not None else 1,
        "basePrice": float(lp.GiaThanh),
        "maxGuests": lp.SucChua,
        "description": lp.MoTa,
        "descriptionEn": lp.MoTa,
        "image": primary_image if primary_image else "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
        "images": images,
        "amenities": ["Wifi", "TV", "Điều hòa", "Máy sấy tóc", "Mini bar"],
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
        HinhAnh=body.image
    )
    db.add(new_lp)
    db.commit()
    db.refresh(new_lp)

    return {
        "id": str(new_lp.MaLoaiPhong),
        "code": get_room_code(new_lp.TenLoaiPhong),
        "name": new_lp.TenLoaiPhong,
        "nameEn": new_lp.TenLoaiPhong,
        "area": body.area,
        "bedType": "1 giường đôi",
        "capacityAdults": new_lp.SucChua,
        "capacityChildren": body.capacityChildren,
        "basePrice": float(new_lp.GiaThanh),
        "maxGuests": new_lp.SucChua,
        "description": new_lp.MoTa,
        "descriptionEn": new_lp.MoTa,
        "image": new_lp.HinhAnh if new_lp.HinhAnh else "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
        "images": [new_lp.HinhAnh] if new_lp.HinhAnh else [],
        "amenities": ["Wifi", "TV", "Điều hòa", "Máy sấy tóc", "Mini bar"],
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
    lp.HinhAnh = body.image

    db.commit()
    db.refresh(lp)

    return {
        "id": str(lp.MaLoaiPhong),
        "code": get_room_code(lp.TenLoaiPhong),
        "name": lp.TenLoaiPhong,
        "nameEn": lp.TenLoaiPhong,
        "area": body.area,
        "bedType": "1 giường đôi",
        "capacityAdults": lp.SucChua,
        "capacityChildren": body.capacityChildren,
        "basePrice": float(lp.GiaThanh),
        "maxGuests": lp.SucChua,
        "description": lp.MoTa,
        "descriptionEn": lp.MoTa,
        "image": lp.HinhAnh if lp.HinhAnh else "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
        "images": [lp.HinhAnh] if lp.HinhAnh else [],
        "amenities": ["Wifi", "TV", "Điều hòa", "Máy sấy tóc", "Mini bar"],
        "totalRooms": 0,
    }


@router.delete("/{room_type_id}")
def delete_room_type(
    room_type_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN")),
):
    """Xóa loại phòng (Chỉ Admin)."""
    lp = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == int(room_type_id)).first()
    if not lp:
        raise HTTPException(status_code=404, detail="Loại phòng không tồn tại")

    # Check if there are rooms using this type
    total_rooms = db.query(Phong).filter(Phong.MaLoaiPhong == lp.MaLoaiPhong).count()
    if total_rooms > 0:
        raise HTTPException(status_code=400, detail="Không thể xóa loại phòng đang có phòng sử dụng")

    db.delete(lp)
    db.commit()
    return {"success": True, "message": "Đã xóa loại phòng"}
