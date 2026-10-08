from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.don_dat_phong import DonDatPhong
from app.models.chi_tiet_dp import ChiTietDatPhong
from app.models.phong import Phong
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def cancel_unpaid_bookings():
    """Quét và tự động hủy các đơn đặt phòng chưa thanh toán quá 10 phút"""
    db = SessionLocal()
    try:
        # Thời điểm 10 phút trước
        cutoff_time = datetime.now() - timedelta(minutes=10)
        
        # Tìm các đơn đặt phòng "Chờ xác nhận" và quá hạn 10 phút
        expired_bookings = db.query(DonDatPhong).filter(
            DonDatPhong.TinhTrangDon == "Chờ xác nhận",
            DonDatPhong.NgayDat < cutoff_time
        ).all()
        
        if not expired_bookings:
            return
            
        logger.info(f"Phát hiện {len(expired_bookings)} đơn đặt phòng quá hạn thanh toán. Đang tiến hành hủy tự động...")
        
        for don in expired_bookings:
            don.TinhTrangDon = "Đã hủy"
            
            # Giải phóng phòng liên quan về trạng thái "Còn trống"
            chi_tiet_list = db.query(ChiTietDatPhong).filter(ChiTietDatPhong.MaDonDatPhong == don.MaDonDatPhong).all()
            for chi_tiet in chi_tiet_list:
                phong = db.query(Phong).filter(Phong.MaPhong == chi_tiet.MaPhong).first()
                if phong:
                    phong.TinhTrang = "Còn trống"
        
        db.commit()
        logger.info("Đã hủy và giải phóng phòng thành công.")
    except Exception as e:
        db.rollback()
        logger.error(f"Lỗi khi quét hủy đơn quá hạn: {str(e)}")
    finally:
        db.close()

# Khởi tạo Scheduler
scheduler = BackgroundScheduler()

def start_scheduler():
    if not scheduler.running:
        # Chạy mỗi 1 phút
        scheduler.add_job(
            cancel_unpaid_bookings,
            trigger=IntervalTrigger(minutes=1),
            id="cancel_unpaid_bookings_job",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Background Scheduler đã khởi động.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Background Scheduler đã dừng.")
