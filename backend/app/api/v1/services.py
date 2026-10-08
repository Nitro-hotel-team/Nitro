"""
API Router: Services (Dịch vụ khách sạn)
Endpoints: GET /api/services, PATCH /api/services/:id/toggle
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.dich_vu import DichVu
from app.middleware.auth import require_roles
from app.schemas.service import ServiceCreate, ServiceUpdate

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("")
def get_services(include_deleted: bool = False, db: Session = Depends(get_db)):
    """Danh mục dịch vụ (Public)."""
    if include_deleted:
        dich_vus = db.query(DichVu).all()
    else:
        dich_vus = db.query(DichVu).filter(DichVu.IsDeleted == False).all()
    return [
        {
            "id": str(dv.MaDV),
            "name": dv.TenDV,
            "price": float(dv.GiaThanh),
            "unit": dv.DonViTinh or "lượt/món",
            "category": dv.DanhMuc or "Khác",
            "description": dv.MoTa,
            "status": "ACTIVE" if dv.TrangThai else "INACTIVE",
            "isDeleted": dv.IsDeleted,
            "icon": "Package"
        }
        for dv in dich_vus
    ]


@router.patch("/{service_id}/toggle")
def toggle_service(
    service_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Bật/Tắt dịch vụ."""
    dv = db.query(DichVu).filter(DichVu.MaDV == int(service_id)).first()
    if not dv:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    dv.TrangThai = not dv.TrangThai
    db.commit()
    return {
        "id": str(dv.MaDV),
        "name": dv.TenDV,
        "status": "ACTIVE" if dv.TrangThai else "INACTIVE",
    }


@router.post("")
def create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Thêm dịch vụ mới."""
    dv = DichVu(
        TenDV=data.name,
        GiaThanh=data.price,
        MoTa=data.description or "",
        DonViTinh=data.unit or "lượt/món",
        DanhMuc=data.category or "Khác",
        TrangThai=True
    )
    db.add(dv)
    db.commit()
    db.refresh(dv)
    return {
        "id": str(dv.MaDV),
        "name": dv.TenDV,
        "price": float(dv.GiaThanh),
        "unit": dv.DonViTinh,
        "category": dv.DanhMuc,
        "description": dv.MoTa,
        "status": "ACTIVE",
        "icon": "Package"
    }


@router.put("/{service_id}")
def update_service(
    service_id: str,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Cập nhật dịch vụ."""
    dv = db.query(DichVu).filter(DichVu.MaDV == int(service_id)).first()
    if not dv:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    if data.name is not None:
        dv.TenDV = data.name
    if data.price is not None:
        dv.GiaThanh = data.price
    if data.description is not None:
        dv.MoTa = data.description
    if data.unit is not None:
        dv.DonViTinh = data.unit
    if data.category is not None:
        dv.DanhMuc = data.category

    db.commit()
    db.refresh(dv)
    return {
        "id": str(dv.MaDV),
        "name": dv.TenDV,
        "price": float(dv.GiaThanh),
        "unit": dv.DonViTinh,
        "category": dv.DanhMuc,
        "description": dv.MoTa,
        "status": "ACTIVE" if dv.TrangThai else "INACTIVE",
        "icon": "Package"
    }


@router.delete("/{service_id}")
def delete_service(
    service_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Ẩn (xóa mềm) dịch vụ."""
    dv = db.query(DichVu).filter(DichVu.MaDV == int(service_id)).first()
    if not dv:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    dv.IsDeleted = True
    db.commit()
    return {"message": "Đã ẩn dịch vụ thành công"}


@router.patch("/{service_id}/restore")
def restore_service(
    service_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("MANAGER", "ADMIN")),
):
    """Khôi phục dịch vụ đã ẩn."""
    dv = db.query(DichVu).filter(DichVu.MaDV == int(service_id)).first()
    if not dv:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")

    dv.IsDeleted = False
    db.commit()
    return {"message": "Đã khôi phục dịch vụ thành công"}
