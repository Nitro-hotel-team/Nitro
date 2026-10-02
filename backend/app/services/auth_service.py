"""
Service: Authentication (Đăng nhập, đăng ký, xác thực)
"""
from datetime import date
from sqlalchemy.orm import Session
from app.models.nguoi_dung import NguoiDung
from app.models.vai_tro import VaiTro
from app.models.khach_hang import KhachHang
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.status_mapping import role_to_en


def authenticate_user(db: Session, email_or_phone: str, password: str) -> dict | None:
    """
    Xác thực người dùng bằng email/SĐT và mật khẩu.
    Trả về dict user info hoặc None nếu thất bại.
    """
    # Tìm theo email trong NGUOI_DUNG
    nguoi_dung = db.query(NguoiDung).filter(
        (NguoiDung.Email == email_or_phone) | (NguoiDung.TaiKhoan == email_or_phone)
    ).first()

    # Nếu không tìm thấy, thử tìm theo SĐT trong KHACH_HANG
    if nguoi_dung is None:
        khach_hang = db.query(KhachHang).filter(KhachHang.SDT == email_or_phone).first()
        if khach_hang and khach_hang.MaNguoiDung:
            nguoi_dung = db.query(NguoiDung).filter(
                NguoiDung.MaNguoiDung == khach_hang.MaNguoiDung
            ).first()

    if nguoi_dung is None:
        return None

    # Kiểm tra mật khẩu
    if not verify_password(password, nguoi_dung.MatKhauHash):
        return None

    return _build_user_response(db, nguoi_dung)


def register_user(db: Session, name: str, email: str, phone: str, password: str) -> dict:
    """
    Đăng ký tài khoản khách hàng mới.
    Tạo bản ghi trong NGUOI_DUNG và KHACH_HANG.
    """
    # Kiểm tra trùng email
    existing = db.query(NguoiDung).filter(NguoiDung.Email == email).first()
    if existing:
        raise ValueError("Email đã được sử dụng")

    # Kiểm tra trùng SĐT
    existing_phone = db.query(KhachHang).filter(KhachHang.SDT == phone).first()
    if existing_phone:
        raise ValueError("Số điện thoại đã được sử dụng")

    # Lấy vai trò KhachHang
    vai_tro = db.query(VaiTro).filter(VaiTro.TenVaiTro == "KhachHang").first()
    if not vai_tro:
        raise ValueError("Vai trò KhachHang chưa được tạo trong database")

    # Tạo NGUOI_DUNG
    nguoi_dung = NguoiDung(
        MaVT=vai_tro.MaVT,
        TaiKhoan=email,
        Email=email,
        MatKhauHash=hash_password(password),
        TrangThai=True,
        NgayTao=date.today(),
    )
    db.add(nguoi_dung)
    db.flush()  # Lấy MaNguoiDung

    # Tạo KHACH_HANG
    khach_hang = KhachHang(
        MaNguoiDung=nguoi_dung.MaNguoiDung,
        HoTen=name,
        SDT=phone,
        CCCD=f"TEMP-{phone}",  # Tạm thời, khách cập nhật sau
        QuocTich="Việt Nam",
    )
    db.add(khach_hang)
    db.commit()
    db.refresh(nguoi_dung)

    return _build_user_response(db, nguoi_dung)


def get_user_by_id(db: Session, user_id: int) -> dict | None:
    """Lấy thông tin user theo ID."""
    nguoi_dung = db.query(NguoiDung).filter(NguoiDung.MaNguoiDung == user_id).first()
    if nguoi_dung is None:
        return None
    return _build_user_response(db, nguoi_dung)


def _build_user_response(db: Session, nguoi_dung: NguoiDung) -> dict:
    """Xây dựng dict response cho user (dùng nội bộ)."""
    vai_tro = db.query(VaiTro).filter(VaiTro.MaVT == nguoi_dung.MaVT).first()
    role_en = role_to_en(vai_tro.TenVaiTro) if vai_tro else "CUSTOMER"

    # Tìm thông tin khách hàng (nếu có)
    khach_hang = db.query(KhachHang).filter(KhachHang.MaNguoiDung == nguoi_dung.MaNguoiDung).first()

    name = khach_hang.HoTen if khach_hang else nguoi_dung.TaiKhoan
    phone = khach_hang.SDT if khach_hang else ""

    # Tạo JWT token
    token_data = {
        "sub": str(nguoi_dung.MaNguoiDung),
        "userId": str(nguoi_dung.MaNguoiDung),
        "email": nguoi_dung.Email,
        "role": role_en,
    }
    token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data={"sub": str(nguoi_dung.MaNguoiDung)})

    return {
        "token": token,
        "refreshToken": refresh_token,
        "user": {
            "id": str(nguoi_dung.MaNguoiDung),
            "name": name,
            "email": nguoi_dung.Email,
            "phone": phone,
            "role": role_en,
            "status": "ACTIVE" if nguoi_dung.TrangThai else "LOCKED",
            "lastLogin": None,
            "avatar": f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=random",
        },
    }

def change_user_password(db: Session, user_id: int, old_pw: str, new_pw: str) -> bool:
    """Thay đổi mật khẩu người dùng."""
    nguoi_dung = db.query(NguoiDung).filter(NguoiDung.MaNguoiDung == user_id).first()
    if nguoi_dung is None:
        raise ValueError("Người dùng không tồn tại")
        
    if not verify_password(old_pw, nguoi_dung.MatKhauHash):
        raise ValueError("Mật khẩu hiện tại không đúng")
        
    nguoi_dung.MatKhauHash = hash_password(new_pw)
    db.commit()
    return True
