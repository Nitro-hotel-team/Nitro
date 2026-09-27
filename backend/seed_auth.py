from app.core.database import SessionLocal
from app.models.vai_tro import VaiTro
from app.models.nguoi_dung import NguoiDung
from app.core.security import hash_password
from datetime import date

def seed():
    db = SessionLocal()
    roles = [
        {"name": "Admin", "desc": "Quản trị viên hệ thống"},
        {"name": "QuanLy", "desc": "Quản lý khách sạn"},
        {"name": "LeTan", "desc": "Nhân viên lễ tân"},
        {"name": "KhachHang", "desc": "Khách hàng"}
    ]
    
    print("Seeding Roles...")
    for r in roles:
        existing_role = db.query(VaiTro).filter(VaiTro.TenVaiTro == r["name"]).first()
        if not existing_role:
            db.add(VaiTro(TenVaiTro=r["name"], Mota=r["desc"]))
            print(f"- Đã thêm role: {r['name']}")
    
    db.commit()
    
    admin_role = db.query(VaiTro).filter(VaiTro.TenVaiTro == "Admin").first()
    if admin_role:
        existing_admin = db.query(NguoiDung).filter(NguoiDung.Email == "admin@nitrohotel.vn").first()
        if not existing_admin:
            admin_user = NguoiDung(
                MaVT=admin_role.MaVT,
                TaiKhoan="admin@nitrohotel.vn",
                Email="admin@nitrohotel.vn",
                MatKhauHash=hash_password("admin123"),
                TrangThai=True,
                NgayTao=date.today()
            )
            db.add(admin_user)
            db.commit()
            print("Đã tạo tài khoản: admin@nitrohotel.vn / admin123")
        else:
            print("Tài khoản admin đã tồn tại.")
            
    db.close()
    print("Seed hoàn tất!")

if __name__ == "__main__":
    seed()
