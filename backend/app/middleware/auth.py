"""
Middleware xác thực JWT và phân quyền RBAC
"""
from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.core.status_mapping import role_to_en
from app.models.nguoi_dung import NguoiDung
from app.models.vai_tro import VaiTro

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> dict:
    """
    Dependency: Giải mã JWT token, truy vấn DB lấy thông tin user.
    Trả về dict user info dùng cho các endpoint.
    """
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn",
        )

    user_id = payload.get("sub") or payload.get("userId")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không chứa thông tin người dùng",
        )

    # Query user từ DB
    nguoi_dung = db.query(NguoiDung).filter(NguoiDung.MaNguoiDung == int(user_id)).first()
    if nguoi_dung is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Người dùng không tồn tại",
        )

    if not nguoi_dung.TrangThai:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa",
        )

    # Lấy vai trò
    vai_tro = db.query(VaiTro).filter(VaiTro.MaVT == nguoi_dung.MaVT).first()
    role_en = role_to_en(vai_tro.TenVaiTro) if vai_tro else "CUSTOMER"

    return {
        "userId": nguoi_dung.MaNguoiDung,
        "email": nguoi_dung.Email,
        "taiKhoan": nguoi_dung.TaiKhoan,
        "role": role_en,
        "maVT": nguoi_dung.MaVT,
    }


def require_roles(*allowed_roles: str):
    """
    Dependency factory: Kiểm tra user có đúng vai trò yêu cầu không.
    Sử dụng: Depends(require_roles("ADMIN", "MANAGER"))
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền thực hiện thao tác này",
            )
        return current_user
    return role_checker
