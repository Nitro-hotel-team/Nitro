"""
API Router: Authentication
Endpoints: POST /api/auth/login, /register, GET /me, POST /logout
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, GoogleLoginRequest, RefreshRequest, ChangePasswordRequest
from app.services.auth_service import authenticate_user, register_user, get_user_by_id, _build_user_response, change_user_password
from app.middleware.auth import get_current_user
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import uuid
from app.models.nguoi_dung import NguoiDung
from app.models.vai_tro import VaiTro
from datetime import date
from app.core.security import hash_password, decode_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Đăng nhập hệ thống."""
    result = authenticate_user(db, request.emailOrPhone, request.password)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/SĐT hoặc mật khẩu không đúng",
        )
    return result


@router.post("/google")
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Đăng nhập bằng Google."""
    google_client_id = settings.GOOGLE_CLIENT_ID
    if not google_client_id:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GOOGLE_CLIENT_ID")
    
    try:
        # Verify token with Google (allow 10 minutes of clock skew)
        idinfo = id_token.verify_oauth2_token(
            request.credential,
            requests.Request(),
            google_client_id,
            clock_skew_in_seconds=600
        )
        email = idinfo.get("email")
        name = idinfo.get("name")
        
        if not email:
            raise HTTPException(status_code=400, detail="Không thể lấy email từ Google")
            
        # Check if user exists
        nguoi_dung = db.query(NguoiDung).filter(NguoiDung.Email == email).first()
        
        if not nguoi_dung:
            # Auto register
            vai_tro = db.query(VaiTro).filter(VaiTro.TenVaiTro == "KhachHang").first()
            if not vai_tro:
                raise HTTPException(status_code=500, detail="Lỗi hệ thống: Chưa có vai trò KhachHang")
                
            random_suffix = uuid.uuid4().hex[:8]
            tai_khoan = f"{email.split('@')[0]}_{random_suffix}"
            mat_khau_ngau_nhien = uuid.uuid4().hex
            
            nguoi_dung = NguoiDung(
                MaVT=vai_tro.MaVT,
                TaiKhoan=tai_khoan,
                Email=email,
                MatKhauHash=hash_password(mat_khau_ngau_nhien),
                TrangThai=True,
                NgayTao=date.today()
            )
            db.add(nguoi_dung)
            db.flush()
            
            # NOTE: We do not create KHACH_HANG record here because CCCD and SDT are NOT NULL.
            # The user will have to update their profile later.
            
            db.commit()
            db.refresh(nguoi_dung)
            
        # Generate token
        return _build_user_response(db, nguoi_dung)
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Token không hợp lệ: {str(e)}")


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Đăng ký tài khoản khách hàng mới."""
    try:
        result = register_user(db, request.name, request.email, request.phone, request.password)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/refresh")
def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)):
    """Cấp lại access token mới bằng refresh token."""
    payload = decode_token(request.refreshToken)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token không hợp lệ hoặc đã hết hạn",
        )
    
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token không hợp lệ",
        )
        
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID không hợp lệ",
        )
        
    user_info = get_user_by_id(db, user_id)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Người dùng không tồn tại",
        )
        
    return user_info


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lấy thông tin tài khoản hiện tại từ JWT token."""
    user_info = get_user_by_id(db, current_user["userId"])
    if user_info is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Người dùng không tồn tại",
        )
    return user_info["user"]


@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    """Đăng xuất (client xóa token, server có thể blacklist nếu cần)."""
    return {"success": True, "message": "Đã đăng xuất thành công"}

@router.post("/change-password")
def change_password(request: ChangePasswordRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Đổi mật khẩu người dùng."""
    try:
        user_id = int(current_user["userId"])
        change_user_password(db, user_id, request.oldPassword, request.newPassword)
        return {"success": True, "message": "Đổi mật khẩu thành công"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
