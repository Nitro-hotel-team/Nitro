"""
API Router: Users (Quản lý tài khoản)
Endpoints: GET/POST /api/users, PATCH role/status
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.core.security import hash_password
from app.core.status_mapping import role_to_en, role_to_vi
from app.models.nguoi_dung import NguoiDung
from app.models.vai_tro import VaiTro
from app.models.khach_hang import KhachHang
from app.schemas.user import UserCreate, RoleUpdate, StatusUpdate
from app.middleware.auth import require_roles

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("")
def get_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN")),
):
    """Lấy danh sách tài khoản."""
    nguoi_dungs = db.query(NguoiDung).all()
    result = []
    for nd in nguoi_dungs:
        vai_tro = db.query(VaiTro).filter(VaiTro.MaVT == nd.MaVT).first()
        kh = db.query(KhachHang).filter(KhachHang.MaNguoiDung == nd.MaNguoiDung).first()
        result.append({
            "id": str(nd.MaNguoiDung),
            "name": kh.HoTen if kh else nd.TaiKhoan,
            "email": nd.Email,
            "phone": kh.SDT if kh else "",
            "role": role_to_en(vai_tro.TenVaiTro) if vai_tro else "CUSTOMER",
            "status": "ACTIVE" if nd.TrangThai else "LOCKED",
        })
    return result


@router.post("")
def create_user(
    body: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN")),
):
    """Tạo tài khoản nhân viên mới."""
    existing = db.query(NguoiDung).filter(NguoiDung.Email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    vai_tro_name = role_to_vi(body.role)
    vai_tro = db.query(VaiTro).filter(VaiTro.TenVaiTro == vai_tro_name).first()
    if not vai_tro:
        raise HTTPException(status_code=400, detail=f"Vai trò {body.role} không tồn tại")

    nguoi_dung = NguoiDung(
        MaVT=vai_tro.MaVT,
        TaiKhoan=body.email,
        Email=body.email,
        MatKhauHash=hash_password(body.password),
        TrangThai=True,
        NgayTao=date.today(),
    )
    db.add(nguoi_dung)
    db.commit()
    db.refresh(nguoi_dung)

    return {
        "id": str(nguoi_dung.MaNguoiDung),
        "name": body.name,
        "email": nguoi_dung.Email,
        "phone": body.phone,
        "role": body.role,
        "status": "ACTIVE",
    }


@router.patch("/{user_id}/role")
def update_role(
    user_id: str,
    body: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN")),
):
    """Cập nhật vai trò tài khoản."""
    nd = db.query(NguoiDung).filter(NguoiDung.MaNguoiDung == int(user_id)).first()
    if not nd:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    vai_tro_name = role_to_vi(body.role)
    vai_tro = db.query(VaiTro).filter(VaiTro.TenVaiTro == vai_tro_name).first()
    if not vai_tro:
        raise HTTPException(status_code=400, detail=f"Vai trò {body.role} không tồn tại")

    nd.MaVT = vai_tro.MaVT
    db.commit()
    return {
        "id": str(nd.MaNguoiDung),
        "name": nd.TaiKhoan,
        "email": nd.Email,
        "role": body.role,
        "status": "ACTIVE" if nd.TrangThai else "LOCKED"
    }


@router.patch("/{user_id}/status")
def update_status(
    user_id: str,
    body: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("ADMIN")),
):
    """Khóa hoặc kích hoạt tài khoản."""
    nd = db.query(NguoiDung).filter(NguoiDung.MaNguoiDung == int(user_id)).first()
    if not nd:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    nd.TrangThai = (body.status == "ACTIVE")
    db.commit()
    vai_tro = db.query(VaiTro).filter(VaiTro.MaVT == nd.MaVT).first()
    return {
        "id": str(nd.MaNguoiDung),
        "name": nd.TaiKhoan,
        "email": nd.Email,
        "role": role_to_en(vai_tro.TenVaiTro) if vai_tro else "CUSTOMER",
        "status": body.status
    }
