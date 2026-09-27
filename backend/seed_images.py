from app.core.database import SessionLocal
from app.models.phong import Phong
from app.models.hinh_anh_phong import HinhAnhPhong

def seed_images():
    db = SessionLocal()
    try:
        # Xóa hết ảnh cũ
        db.query(HinhAnhPhong).delete()
        
        phongs = db.query(Phong).all()
        for i, p in enumerate(phongs):
            # Mỗi phòng 2 ảnh ngẫu nhiên từ unsplash
            img1 = HinhAnhPhong(
                MaPhong=p.MaPhong,
                HinhAnhURL=f"https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                IsPrimary=True,
                ThuTu=1
            )
            img2 = HinhAnhPhong(
                MaPhong=p.MaPhong,
                HinhAnhURL=f"https://images.unsplash.com/photo-1595526114101-2292f7a63503?auto=format&fit=crop&w=800&q=80",
                IsPrimary=False,
                ThuTu=2
            )
            
            # Cho phòng đầu tiên của mỗi nhóm đổi ảnh cho dễ nhận biết
            if i % 3 == 0:
                img1.HinhAnhURL = "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
                
            db.add_all([img1, img2])
            
        db.commit()
        print(f"Seeded images for {len(phongs)} rooms!")
        
    except Exception as e:
        db.rollback()
        print(f"Lỗi: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_images()
