from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime
import json
from app.core.database import get_db
from app.core.config import settings
from app.models.don_dat_phong import DonDatPhong
from app.models.thanh_toan import ThanhToan
from app.utils.vnpay import vnpay
from pydantic import BaseModel

router = APIRouter(prefix="/payments", tags=["Payments"])

class VNPayUrlRequest(BaseModel):
    booking_id: int
    amount: float

@router.post("/create_vnpay_url")
def create_vnpay_url(body: VNPayUrlRequest, db: Session = Depends(get_db)):
    # Lấy thông tin đơn
    don_dat = db.query(DonDatPhong).filter(DonDatPhong.MaDonDatPhong == body.booking_id).first()
    if not don_dat:
        raise HTTPException(status_code=404, detail="Đơn đặt phòng không tồn tại")

    vnp = vnpay()
    vnp.requestData['vnp_Version'] = '2.1.0'
    vnp.requestData['vnp_Command'] = 'pay'
    vnp.requestData['vnp_TmnCode'] = settings.VNPAY_TMN_CODE
    vnp.requestData['vnp_Amount'] = str(int(body.amount * 100))  # Nhân 100 theo VNPay
    vnp.requestData['vnp_CurrCode'] = 'VND'
    vnp.requestData['vnp_TxnRef'] = str(body.booking_id)
    vnp.requestData['vnp_OrderInfo'] = f"Thanh toan don dat phong {body.booking_id}"
    vnp.requestData['vnp_OrderType'] = 'billpayment'
    vnp.requestData['vnp_Locale'] = 'vn'
    
    vnp.requestData['vnp_CreateDate'] = datetime.now().strftime('%Y%m%d%H%M%S')
    vnp.requestData['vnp_IpAddr'] = "127.0.0.1"
    vnp.requestData['vnp_ReturnUrl'] = settings.VNPAY_RETURN_URL
    
    vnpay_payment_url = vnp.get_payment_url(settings.VNPAY_URL, settings.VNPAY_HASH_SECRET)
    return {"payment_url": vnpay_payment_url}


@router.get("/vnpay_return")
def vnpay_return(request: Request, db: Session = Depends(get_db)):
    vnp = vnpay()
    vnp.responseData = dict(request.query_params)
    
    order_id = vnp.responseData.get('vnp_TxnRef')
    amount = vnp.responseData.get('vnp_Amount')
    vnp_ResponseCode = vnp.responseData.get('vnp_ResponseCode')

    if vnp.validate_response(settings.VNPAY_HASH_SECRET):
        if vnp_ResponseCode == "00":
            # Giao dịch thành công
            actual_amount = int(amount) / 100
            
            # Cập nhật bảng THANH_TOAN (trigger tự sinh, ta chỉ UPDATE)
            thanh_toan = db.query(ThanhToan).filter(ThanhToan.MaDonDatPhong == int(order_id)).first()
            if thanh_toan:
                thanh_toan.TinhTrang = "Đã thanh toán"
                thanh_toan.PhuongThucThanhToan = "VNPAY"
                thanh_toan.TongTien = actual_amount
                thanh_toan.NgayThanhToan = datetime.now()
                
            # Cập nhật bảng DON_DAT_PHONG thành 'Đã xác nhận'
            don_dat = db.query(DonDatPhong).filter(DonDatPhong.MaDonDatPhong == int(order_id)).first()
            if don_dat:
                don_dat.TinhTrangDon = "Đã xác nhận"
            
            db.commit()
            # Dùng base URL từ VNPAY_RETURN_URL thay vì hardcode
            base_url = settings.VNPAY_RETURN_URL.rsplit('/', 1)[0]
            return RedirectResponse(url=f"{base_url}/payment-result?status=success&bookingId={order_id}")
        else:
            # Giao dịch thất bại / Khách hủy giao dịch
            base_url = settings.VNPAY_RETURN_URL.rsplit('/', 1)[0]
            return RedirectResponse(url=f"{base_url}/payment-result?status=error&bookingId={order_id}")
    else:
        # Lỗi bảo mật chữ ký
        base_url = settings.VNPAY_RETURN_URL.rsplit('/', 1)[0]
        return RedirectResponse(url=f"{base_url}/payment-result?status=invalid_signature")
