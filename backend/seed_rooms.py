from app.core.database import SessionLocal
from app.models.loai_phong import LoaiPhong
from app.models.phong import Phong

def seed_rooms():
    db = SessionLocal()
    
    # Dữ liệu loại phòng (Mock data)
    room_types_data = [
        {
            "TenLoaiPhong": "Deluxe City View",
            "GiaThanh": 1200000,
            "MoTa": "Phòng đôi tiêu chuẩn với view thành phố tuyệt đẹp.",
            "SucChua": 2
        },
        {
            "TenLoaiPhong": "Executive Suite",
            "GiaThanh": 2800000,
            "MoTa": "Nâng tầm kỳ nghỉ với phòng khách tiếp khách thanh lịch.",
            "SucChua": 3
        },
        {
            "TenLoaiPhong": "Presidential Suite",
            "GiaThanh": 5500000,
            "MoTa": "Tuyệt phẩm xa hoa tại tầng cao với góc nhìn 270 độ ôm trọn thành phố.",
            "SucChua": 4
        }
    ]

    print("Seeding Room Types...")
    inserted_types = []
    for rt in room_types_data:
        existing_rt = db.query(LoaiPhong).filter(LoaiPhong.TenLoaiPhong == rt["TenLoaiPhong"]).first()
        if not existing_rt:
            new_rt = LoaiPhong(
                TenLoaiPhong=rt["TenLoaiPhong"],
                GiaThanh=rt["GiaThanh"],
                MoTa=rt["MoTa"],
                SucChua=rt["SucChua"]
            )
            db.add(new_rt)
            db.flush() # Để lấy ID
            inserted_types.append(new_rt)
            print(f"- Added room type: {rt['TenLoaiPhong']}")
        else:
            inserted_types.append(existing_rt)

    print("Seeding Rooms...")
    if inserted_types:
        for i in range(1, 4):
            so_phong = f"10{i}"
            existing_room = db.query(Phong).filter(Phong.SoPhong == so_phong).first()
            if not existing_room:
                # Gán loại phòng ngẫu nhiên cho 3 phòng này
                loai_phong_id = inserted_types[i - 1].MaLoaiPhong
                new_room = Phong(
                    MaLoaiPhong=loai_phong_id,
                    SoPhong=so_phong,
                    Tang=1,
                    TinhTrang="Còn trống"
                )
                db.add(new_room)
                print(f"- Added room: {so_phong}")
                
    db.commit()
    db.close()
    print("Room Seed completed!")

if __name__ == "__main__":
    seed_rooms()
