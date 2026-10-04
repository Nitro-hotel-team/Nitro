"""
API Router: Bookings
Endpoints: GET/POST /api/bookings, PATCH status, POST cancel
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from datetime import datetime
import random
from app.core.database import get_db
from app.core.status_mapping import booking_status_to_en, booking_status_to_vi, payment_status_to_en
from app.models.don_dat_phong import DonDatPhong
from app.models.chi_tiet_dp import ChiTietDatPhong
from app.models.khach_hang import KhachHang
from app.models.nguoi_dung import NguoiDung
from app.models.vai_tro import VaiTro
from app.models.phong import Phong
from app.models.loai_phong import LoaiPhong
from app.models.thanh_toan import ThanhToan
from app.models.su_dung_dv import SuDungDV
from app.models.dich_vu import DichVu
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingCancelRequest
from app.middleware.auth import get_current_user, require_roles, decode_token

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def _generate_booking_code() -> str:
    """Sinh mã đặt phòng: NTR-YYYYMMDD-XXXX"""
    today = datetime.now().strftime("%Y%m%d")
    code = random.randint(1000, 9999)
    return f"NTR-{today}-{code}"


def _build_booking_response(db: Session, ddp: DonDatPhong) -> dict:
    """Xây dựng response cho 1 đơn đặt phòng."""
    khach_hang = db.query(KhachHang).filter(KhachHang.MaKH == ddp.MaKH).first()

    # Lấy chi tiết phòng
    chi_tiets = db.query(ChiTietDatPhong).filter(
        ChiTietDatPhong.MaDonDatPhong == ddp.MaDonDatPhong
    ).all()

    room_number = None
    room_type_name = ""
    room_type_id = ""
    if chi_tiets:
        phong = db.query(Phong).filter(Phong.MaPhong == chi_tiets[0].MaPhong).first()
        if phong:
            room_number = phong.SoPhong
            loai_phong = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == phong.MaLoaiPhong).first()
            room_type_name = loai_phong.TenLoaiPhong if loai_phong else ""
            room_type_id = str(phong.MaLoaiPhong)

    # Lấy thanh toán
    thanh_toan = db.query(ThanhToan).filter(
        ThanhToan.MaDonDatPhong == ddp.MaDonDatPhong
    ).first()

    payment_status = "UNPAID"
    paid_amount = 0.0
    payment_method = None
    if thanh_toan:
        payment_status = payment_status_to_en(thanh_toan.TinhTrang) if thanh_toan.TinhTrang else "UNPAID"
        paid_amount = float(thanh_toan.TongTien) if thanh_toan.TongTien else 0.0
        pm = thanh_toan.PhuongThucThanhToan
        if pm in ("Tiền mặt", "Ti?n m?t", "CASH"):
            payment_method = "Tiền mặt tại quầy"
        elif pm in ("Chuyển khoản", "Chuy?n kho?n", "BANK_TRANSFER"):
            payment_method = "Chuyển khoản ngân hàng"
        elif pm == "CREDIT_CARD":
            payment_method = "Thẻ quốc tế"
        elif pm == "VNPAY":
            payment_method = "Cổng VNPay"
        elif pm == "MOMO":
            payment_method = "Ví MoMo"
        elif pm == "ZALOPAY":
            payment_method = "Ví ZaloPay"
        else:
            payment_method = pm

    # Lấy dịch vụ
    su_dung_dvs = db.query(SuDungDV).filter(SuDungDV.MaDonDatPhong == ddp.MaDonDatPhong).all()
    extra_services = []
    for sddv in su_dung_dvs:
        dv = db.query(DichVu).filter(DichVu.MaDV == sddv.MaDV).first()
        extra_services.append({
            "id": str(sddv.MaDV),
            "name": dv.TenDV if dv else "",
            "price": float(sddv.DonGia),
            "quantity": sddv.SoLuong or 1,
        })

    nights = (ddp.NgayTraPhong - ddp.NgayNhanPhong).days if ddp.NgayTraPhong and ddp.NgayNhanPhong else 0

    return {
        "id": str(ddp.MaDonDatPhong),
        "bookingCode": f"NTR-{ddp.NgayDat.strftime('%Y%m%d') if ddp.NgayDat else '00000000'}-{ddp.MaDonDatPhong:04d}",
        "guestName": khach_hang.HoTen if khach_hang else "",
        "guestPhone": khach_hang.SDT if khach_hang else "",
        "guestEmail": "",
        "guestIdCard": khach_hang.CCCD if khach_hang else None,
        "roomNumber": room_number,
        "roomTypeId": room_type_id,
        "roomTypeName": room_type_name,
        "checkInDate": ddp.NgayNhanPhong.strftime("%Y-%m-%d") if ddp.NgayNhanPhong else "",
        "checkOutDate": ddp.NgayTraPhong.strftime("%Y-%m-%d") if ddp.NgayTraPhong else "",
        "nights": nights,
        "adults": 1,
        "children": 0,
        "totalAmount": float(ddp.TongTien) if ddp.TongTien else 0.0,
        "paidAmount": paid_amount,
        "paymentStatus": payment_status,
        "status": booking_status_to_en(ddp.TinhTrangDon),
        "source": getattr(ddp, "KenhDat", "WEB") or "WEB",
        "createdAt": ddp.NgayDat.isoformat() if ddp.NgayDat else "",
        "specialRequests": None,
        "paymentMethod": payment_method,
        "extraServices": extra_services,
    }


@router.get("")
def get_bookings(
    search: str = Query(None),
    status: str = Query(None),
    source: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Lấy danh sách đơn đặt phòng."""
    query = db.query(DonDatPhong)

    # Nếu là CUSTOMER, chỉ xem đơn của mình
    if current_user["role"] == "CUSTOMER":
        khach_hang = db.query(KhachHang).filter(
            KhachHang.MaNguoiDung == current_user["userId"]
        ).first()
        if khach_hang:
            query = query.filter(DonDatPhong.MaKH == khach_hang.MaKH)
        else:
            return []

    # Filter theo status
    if status:
        vi_status = booking_status_to_vi(status)
        query = query.filter(DonDatPhong.TinhTrangDon == vi_status)

    if source:
        query = query.filter(DonDatPhong.KenhDat == source)

    # Filter theo search
    if search:
        khach_ids = db.query(KhachHang.MaKH).filter(
            KhachHang.HoTen.contains(search) | KhachHang.SDT.contains(search)
        ).all()
        khach_id_list = [k[0] for k in khach_ids]
        query = query.filter(DonDatPhong.MaKH.in_(khach_id_list))

    don_dat_phongs = query.order_by(DonDatPhong.NgayDat.desc()).all()
    return [_build_booking_response(db, ddp) for ddp in don_dat_phongs]


@router.get("/{booking_id}")
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Xem chi tiết 1 đơn đặt phòng."""
    ddp = db.query(DonDatPhong).filter(DonDatPhong.MaDonDatPhong == int(booking_id)).first()
    if not ddp:
        raise HTTPException(status_code=404, detail="Đơn đặt phòng không tồn tại")
    return _build_booking_response(db, ddp)


@router.post("")
def create_booking(
    request: Request,
    body: BookingCreate,
    db: Session = Depends(get_db)
):
    """Tạo đơn đặt phòng mới."""
    try:
        # Lấy thông tin user hiện tại nếu có truyền token
        current_user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if payload:
                uid = payload.get("sub") or payload.get("userId")
                if uid:
                    nguoi_dung = db.query(NguoiDung).filter(NguoiDung.MaNguoiDung == int(uid)).first()
                    if nguoi_dung:
                        vai_tro = db.query(VaiTro).filter(VaiTro.MaVT == nguoi_dung.MaVT).first()
                        if vai_tro and vai_tro.TenVaiTro == "KhachHang":
                            current_user_id = int(uid)

        # Nếu current_user_id có giá trị, kiểm tra xem user này đã liên kết với KhachHang nào chưa
        if current_user_id:
            existing_link = db.query(KhachHang).filter(KhachHang.MaNguoiDung == current_user_id).first()
            if existing_link and existing_link.SDT != body.guestPhone:
                current_user_id = None  # Đã có liên kết với SĐT khác, không gán cho khách mới nữa

        # Tìm hoặc tạo khách hàng
        khach_hang = db.query(KhachHang).filter(KhachHang.SDT == body.guestPhone).first()
        if not khach_hang:
            khach_hang = KhachHang(
                HoTen=body.guestName,
                SDT=body.guestPhone,
                CCCD=body.guestIdCard or f"TEMP-{body.guestPhone}",
                QuocTich="Việt Nam",
                MaNguoiDung=current_user_id
            )
            db.add(khach_hang)
            db.commit()
            # Lấy lại KhachHang vừa tạo để có MaKH (vì implicit_returning=False)
            khach_hang = db.query(KhachHang).filter(KhachHang.SDT == body.guestPhone).first()
        else:
            # Nếu khách hàng đã tồn tại nhưng chưa có MaNguoiDung và hiện tại user đang đăng nhập
            if khach_hang.MaNguoiDung is None and current_user_id:
                khach_hang.MaNguoiDung = current_user_id
                db.commit()

        # Tạo đơn đặt phòng
        check_in_dt = datetime.strptime(body.checkInDate, "%Y-%m-%d")
        check_out_dt = datetime.strptime(body.checkOutDate, "%Y-%m-%d")

        don_dat = DonDatPhong(
            MaKH=khach_hang.MaKH,
            NgayDat=datetime.now(),
            NgayNhanPhong=check_in_dt,
            NgayTraPhong=check_out_dt,
            TinhTrangDon="Chờ xác nhận",
            TongTien=body.totalAmount or 0,
            KenhDat=body.source,
        )
        db.add(don_dat)
        db.commit()
        # Lấy lại đơn đặt phòng vừa tạo để có MaDonDatPhong
        don_dat = db.query(DonDatPhong).filter(
            DonDatPhong.MaKH == khach_hang.MaKH
        ).order_by(DonDatPhong.MaDonDatPhong.desc()).first()

        # Tìm phòng để thêm chi tiết
        if body.roomNumber:
            phong = db.query(Phong).filter(Phong.SoPhong == body.roomNumber).first()
        else:
            # Tìm phòng trống thuộc loại phòng
            phong = db.query(Phong).filter(
                Phong.MaLoaiPhong == int(body.roomTypeId if body.roomTypeId else 0),
                Phong.TinhTrang == "Còn trống",
            ).first()

        if phong:
            loai_phong = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == phong.MaLoaiPhong).first()
            don_gia = float(loai_phong.GiaThanh) if loai_phong else body.totalAmount / max(body.nights, 1)

            chi_tiet = ChiTietDatPhong(
                MaDonDatPhong=don_dat.MaDonDatPhong,
                MaPhong=phong.MaPhong,
                DonGia=don_gia,
            )
            db.add(chi_tiet)
            
            # Cập nhật trạng thái phòng thành Đã đặt
            phong.TinhTrang = "Đã đặt"
            
            db.commit()

        # Thêm dịch vụ
        for svc in body.extraServices:
            su_dung = SuDungDV(
                MaDonDatPhong=don_dat.MaDonDatPhong,
                MaDV=int(svc.serviceId if svc.serviceId else 0),
                SoLuong=svc.quantity,
                DonGia=svc.price,
                NgaySuDung=datetime.now(),
            )
            db.add(su_dung)

        db.commit()
        db.refresh(don_dat)

        # Cập nhật phương thức thanh toán nếu chọn thủ công
        if body.paymentMethod in ("CASH", "BANK_TRANSFER"):
            thanh_toan = db.query(ThanhToan).filter(ThanhToan.MaDonDatPhong == don_dat.MaDonDatPhong).first()
            if thanh_toan:
                thanh_toan.PhuongThucThanhToan = body.paymentMethod
                db.commit()

        return _build_booking_response(db, don_dat)
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{booking_id}/status")
def update_booking_status(
    booking_id: str,
    body: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("FRONT_DESK", "MANAGER", "ADMIN")),
):
    """Thay đổi trạng thái đơn đặt phòng (Check-in, Check-out)."""
    ddp = db.query(DonDatPhong).filter(DonDatPhong.MaDonDatPhong == int(booking_id)).first()
    if not ddp:
        raise HTTPException(status_code=404, detail="Đơn đặt phòng không tồn tại")

    ddp.TinhTrangDon = booking_status_to_vi(body.status)
    
    # Update room status if a room is assigned
    chi_tiets = db.query(ChiTietDatPhong).filter(ChiTietDatPhong.MaDonDatPhong == ddp.MaDonDatPhong).all()
    if chi_tiets:
        for ct in chi_tiets:
            phong = db.query(Phong).filter(Phong.MaPhong == ct.MaPhong).first()
            if phong:
                if body.status == "CONFIRMED":
                    phong.TinhTrang = "Đã đặt"
                elif body.status == "CHECKED_IN":
                    phong.TinhTrang = "Đang sử dụng"
                elif body.status in ["CHECKED_OUT", "CANCELLED"]:
                    phong.TinhTrang = "Còn trống"
                    
    db.commit()
    return _build_booking_response(db, ddp)


@router.patch("/{booking_id}/assign-room")
def assign_room(
    booking_id: str,
    body: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("FRONT_DESK", "MANAGER", "ADMIN")),
):
    """Gán số phòng cho đặt phòng."""
    ddp = db.query(DonDatPhong).filter(DonDatPhong.MaDonDatPhong == int(booking_id)).first()
    if not ddp:
        raise HTTPException(status_code=404, detail="Đơn đặt phòng không tồn tại")

    room_id = body.get("roomId")
    if not room_id:
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp roomId")

    phong = db.query(Phong).filter(Phong.MaPhong == int(room_id)).first()
    if not phong:
        raise HTTPException(status_code=404, detail="Phòng không tồn tại")
    
    chi_tiet = db.query(ChiTietDatPhong).filter(ChiTietDatPhong.MaDonDatPhong == ddp.MaDonDatPhong).first()
    if chi_tiet:
        old_phong = db.query(Phong).filter(Phong.MaPhong == chi_tiet.MaPhong).first()
        if old_phong:
            old_phong.TinhTrang = "Còn trống"
        chi_tiet.MaPhong = phong.MaPhong
    else:
        loai_phong = db.query(LoaiPhong).filter(LoaiPhong.MaLoaiPhong == phong.MaLoaiPhong).first()
        nights = (ddp.NgayTraPhong - ddp.NgayNhanPhong).days
        nights = max(nights, 1)
        don_gia = float(loai_phong.GiaThanh) if loai_phong else float(ddp.TongTien or 0) / nights
        chi_tiet = ChiTietDatPhong(
            MaDonDatPhong=ddp.MaDonDatPhong,
            MaPhong=phong.MaPhong,
            DonGia=don_gia,
        )
        db.add(chi_tiet)

    phong.TinhTrang = "Đã đặt"
    db.commit()
    return _build_booking_response(db, ddp)


@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: str,
    body: BookingCancelRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Hủy đơn đặt phòng."""
    ddp = db.query(DonDatPhong).filter(DonDatPhong.MaDonDatPhong == int(booking_id)).first()
    if not ddp:
        raise HTTPException(status_code=404, detail="Đơn đặt phòng không tồn tại")

    ddp.TinhTrangDon = "Đã hủy"
    
    # Update room status back to available if a room is assigned
    chi_tiets = db.query(ChiTietDatPhong).filter(ChiTietDatPhong.MaDonDatPhong == ddp.MaDonDatPhong).all()
    if chi_tiets:
        for ct in chi_tiets:
            phong = db.query(Phong).filter(Phong.MaPhong == ct.MaPhong).first()
            if phong:
                phong.TinhTrang = "Còn trống"
                
    db.commit()
    return _build_booking_response(db, ddp)
