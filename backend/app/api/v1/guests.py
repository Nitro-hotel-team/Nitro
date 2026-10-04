"""
API Router: Guests (Khách hàng)
Endpoints: GET/POST /api/guests
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.khach_hang import KhachHang
from app.models.don_dat_phong import DonDatPhong
from app.schemas.guest import GuestCreate, GuestUpdate
from app.middleware.auth import require_roles

router = APIRouter(prefix="/guests", tags=["Guests"])


@router.get("")
def get_guests(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("FRONT_DESK", "MANAGER", "ADMIN")),
):
    """Lấy danh bạ khách hàng."""
    khach_hangs = db.query(KhachHang).all()
    result = []
    for kh in khach_hangs:
        # Tính tổng chi tiêu và số lần ở
        stats = db.query(
            func.count(DonDatPhong.MaDonDatPhong).label("total_stays"),
            func.sum(DonDatPhong.TongTien).label("total_spent"),
        ).filter(
            DonDatPhong.MaKH == kh.MaKH,
            DonDatPhong.TinhTrangDon != "Đã hủy",
        ).first()

        result.append({
            "id": str(kh.MaKH),
            "name": kh.HoTen,
            "fullName": kh.HoTen,
            "phone": kh.SDT,
            "email": "",
            "idCardNumber": kh.CCCD,
            "identityNumber": kh.CCCD,
            "nationality": kh.QuocTich,
            "totalSpent": float(stats.total_spent) if stats.total_spent else 0,
            "totalStays": stats.total_stays if stats.total_stays else 0,
            "totalBookings": stats.total_stays if stats.total_stays else 0,
        })
    return result


@router.get("/{guest_id}")
def get_guest(
    guest_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("FRONT_DESK", "MANAGER", "ADMIN")),
):
    """Lấy chi tiết 1 khách hàng."""
    kh = db.query(KhachHang).filter(KhachHang.MaKH == int(guest_id)).first()
    if not kh:
        raise HTTPException(status_code=404, detail="Khách hàng không tồn tại")

    stats = db.query(
        func.count(DonDatPhong.MaDonDatPhong).label("total_stays"),
        func.sum(DonDatPhong.TongTien).label("total_spent"),
    ).filter(
        DonDatPhong.MaKH == kh.MaKH,
        DonDatPhong.TinhTrangDon != "Đã hủy",
    ).first()

    return {
        "id": str(kh.MaKH),
        "name": kh.HoTen,
        "fullName": kh.HoTen,
        "phone": kh.SDT,
        "email": "",
        "idCardNumber": kh.CCCD,
        "identityNumber": kh.CCCD,
        "nationality": kh.QuocTich,
        "totalSpent": float(stats.total_spent) if stats.total_spent else 0,
        "totalStays": stats.total_stays if stats.total_stays else 0,
        "totalBookings": stats.total_stays if stats.total_stays else 0,
    }


@router.post("")
def create_guest(
    body: GuestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("FRONT_DESK", "MANAGER", "ADMIN")),
):
    """Tạo hồ sơ khách hàng mới."""
    # Kiểm tra trùng
    existing = db.query(KhachHang).filter(
        (KhachHang.SDT == body.phone) | (KhachHang.CCCD == body.idCardNumber)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="SĐT hoặc CCCD đã tồn tại")

    khach_hang = KhachHang(
        HoTen=body.name,
        SDT=body.phone,
        CCCD=body.idCardNumber,
        QuocTich=body.nationality,
    )
    db.add(khach_hang)
    db.commit()
    db.refresh(khach_hang)

    return {
        "id": str(khach_hang.MaKH),
        "name": khach_hang.HoTen,
        "fullName": khach_hang.HoTen,
        "phone": khach_hang.SDT,
        "idCardNumber": khach_hang.CCCD,
        "identityNumber": khach_hang.CCCD,
        "nationality": khach_hang.QuocTich,
        "totalSpent": 0,
        "totalStays": 0,
        "totalBookings": 0,
    }

@router.put("/{guest_id}")
def update_guest(
    guest_id: str,
    body: GuestUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("FRONT_DESK", "MANAGER", "ADMIN")),
):
    """Cập nhật hồ sơ khách hàng."""
    kh = db.query(KhachHang).filter(KhachHang.MaKH == int(guest_id)).first()
    if not kh:
        raise HTTPException(status_code=404, detail="Khách hàng không tồn tại")

    if body.phone and body.phone != kh.SDT:
        existing_phone = db.query(KhachHang).filter(KhachHang.SDT == body.phone).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="SĐT đã tồn tại")
            
    if body.idCardNumber and body.idCardNumber != kh.CCCD:
        existing_cccd = db.query(KhachHang).filter(KhachHang.CCCD == body.idCardNumber).first()
        if existing_cccd:
            raise HTTPException(status_code=400, detail="CCCD đã tồn tại")

    if body.name is not None:
        kh.HoTen = body.name
    if body.phone is not None:
        kh.SDT = body.phone
    if body.idCardNumber is not None:
        kh.CCCD = body.idCardNumber
    if body.nationality is not None:
        kh.QuocTich = body.nationality
        
    db.commit()
    db.refresh(kh)

    stats = db.query(
        func.count(DonDatPhong.MaDonDatPhong).label("total_stays"),
        func.sum(DonDatPhong.TongTien).label("total_spent"),
    ).filter(
        DonDatPhong.MaKH == kh.MaKH,
        DonDatPhong.TinhTrangDon != "Đã hủy",
    ).first()

    return {
        "id": str(kh.MaKH),
        "name": kh.HoTen,
        "fullName": kh.HoTen,
        "phone": kh.SDT,
        "email": body.email or "", # Note: No email in DB so fallback
        "idCardNumber": kh.CCCD,
        "identityNumber": kh.CCCD,
        "nationality": kh.QuocTich,
        "notes": body.notes or "", # Note: No notes in DB so fallback
        "totalSpent": float(stats.total_spent) if stats.total_spent else 0,
        "totalStays": stats.total_stays if stats.total_stays else 0,
        "totalBookings": stats.total_stays if stats.total_stays else 0,
    }
