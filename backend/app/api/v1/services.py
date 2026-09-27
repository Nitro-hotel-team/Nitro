"""
API Router: Services (Dịch vụ khách sạn)
Endpoints: GET /api/services, PATCH /api/services/:id/toggle
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.dich_vu import DichVu
from app.middleware.auth import require_roles

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("")
def get_services(db: Session = Depends(get_db)):
    """Danh mục dịch vụ (Public)."""
    dich_vus = db.query(DichVu).all()
    return [
        {
            "id": str(dv.MaDV),
            "name": dv.TenDV,
            "price": float(dv.GiaThanh),
            "unit": "lượt/món",
            "category": "Khác",
            "description": dv.MoTa,
            "status": "ACTIVE" if dv.TrangThai else "INACTIVE",
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
