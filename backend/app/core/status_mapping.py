"""
Chuyển đổi trạng thái 2 chiều: Tiếng Việt (SQL Server) ↔ Tiếng Anh (Frontend)
"""

# --- Trạng thái Phòng ---
ROOM_STATUS_VI_TO_EN = {
    "Còn trống": "AVAILABLE",
    "Trống": "AVAILABLE",
    "Đã đặt": "RESERVED",
    "Đang sử dụng": "OCCUPIED",
    "Đang dọn dẹp": "CLEANING",
    "Bảo trì": "MAINTENANCE",
    "Xóa mềm": "DELETED",
}
ROOM_STATUS_EN_TO_VI = {v: k for k, v in ROOM_STATUS_VI_TO_EN.items()}
# Bắt buộc EN_TO_VI phải map "AVAILABLE" thành "Trống" thay vì "Còn trống" vì key "Còn trống" bị override.
# Let's fix EN_TO_VI properly:
ROOM_STATUS_EN_TO_VI = {
    "AVAILABLE": "Còn trống",
    "RESERVED": "Đã đặt",
    "OCCUPIED": "Đang sử dụng",
    "CLEANING": "Đang dọn dẹp",
    "MAINTENANCE": "Bảo trì",
    "DELETED": "Xóa mềm",
}

# --- Trạng thái Đơn đặt phòng ---
BOOKING_STATUS_VI_TO_EN = {
    "Chờ xác nhận": "PENDING",
    "Đã xác nhận": "CONFIRMED",
    "Đã nhận phòng": "CHECKED_IN",
    "Đã trả phòng": "CHECKED_OUT",
    "Đã hủy": "CANCELLED",
}
BOOKING_STATUS_EN_TO_VI = {v: k for k, v in BOOKING_STATUS_VI_TO_EN.items()}

# --- Trạng thái Thanh toán ---
PAYMENT_STATUS_VI_TO_EN = {
    "Chưa thanh toán": "UNPAID",
    "Đã thanh toán": "PAID",
    "Hoàn tiền": "REFUNDED",
}
PAYMENT_STATUS_EN_TO_VI = {v: k for k, v in PAYMENT_STATUS_VI_TO_EN.items()}

# --- Vai trò ---
ROLE_VI_TO_EN = {
    "KhachHang": "CUSTOMER",
    "LeTan": "FRONT_DESK",
    "QuanLy": "MANAGER",
    "Admin": "ADMIN",
}
ROLE_EN_TO_VI = {v: k for k, v in ROLE_VI_TO_EN.items()}


def room_status_to_en(vi: str) -> str:
    return ROOM_STATUS_VI_TO_EN.get(vi, vi)

def room_status_to_vi(en: str) -> str:
    return ROOM_STATUS_EN_TO_VI.get(en, en)

def booking_status_to_en(vi: str) -> str:
    return BOOKING_STATUS_VI_TO_EN.get(vi, vi)

def booking_status_to_vi(en: str) -> str:
    return BOOKING_STATUS_EN_TO_VI.get(en, en)

def payment_status_to_en(vi: str) -> str:
    return PAYMENT_STATUS_VI_TO_EN.get(vi, vi)

def payment_status_to_vi(en: str) -> str:
    return PAYMENT_STATUS_EN_TO_VI.get(en, en)

def role_to_en(vi: str) -> str:
    return ROLE_VI_TO_EN.get(vi, vi)

def role_to_vi(en: str) -> str:
    return ROLE_EN_TO_VI.get(en, en)
