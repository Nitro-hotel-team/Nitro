import pytest

class BookingStatus:
    CONFIRMED = "Đã xác nhận"
    IN_HOUSE = "Đang lưu trú"
    CHECKED_OUT = "Đã trả phòng"
    CANCELLED = "Đã hủy"

class RoomStatus:
    VACANT_CLEAN = "Trống - Sạch"
    OCCUPIED = "Đang có khách"
    VACANT_DIRTY = "Trống - Bẩn"

class BookingService:
    def __init__(self, booking_id, room_number):
        self.booking_id = booking_id
        self.room_number = room_number
        self.booking_status = BookingStatus.CONFIRMED
        self.room_status = RoomStatus.VACANT_CLEAN

    def check_in(self):
        if self.booking_status != BookingStatus.CONFIRMED:
            raise ValueError("Chỉ có thể Check-in khi phòng ở trạng thái 'Đã xác nhận'!")
        
        self.booking_status = BookingStatus.IN_HOUSE
        self.room_status = RoomStatus.OCCUPIED
        return True

    def check_out(self):
        if self.booking_status != BookingStatus.IN_HOUSE:
            raise ValueError("Chỉ có thể Check-out khi phòng ở trạng thái 'Đang lưu trú'!")
        
        self.booking_status = BookingStatus.CHECKED_OUT
        self.room_status = RoomStatus.VACANT_DIRTY
        return True


# ==============================================================================
# PYTEST TEST CASES
# ==============================================================================

def test_full_room_lifecycle():
    """Test vòng đời chuẩn: Đã xác nhận -> Đang lưu trú -> Đã trả phòng"""
    booking = BookingService(booking_id="NTR-260921-0042", room_number="302")
    
    # 1. Trạng thái ban đầu
    assert booking.booking_status == BookingStatus.CONFIRMED
    
    # 2. Thực hiện Check-in
    assert booking.check_in() is True
    assert booking.booking_status == BookingStatus.IN_HOUSE
    assert booking.room_status == RoomStatus.OCCUPIED
    
    # 3. Thực hiện Check-out
    assert booking.check_out() is True
    assert booking.booking_status == BookingStatus.CHECKED_OUT
    assert booking.room_status == RoomStatus.VACANT_DIRTY

def test_invalid_check_out_before_check_in():
    """Test lỗi: Không thể Check-out khi chưa Check-in"""
    booking = BookingService(booking_id="NTR-260921-0042", room_number="302")
    
    with pytest.raises(ValueError, match="Chỉ có thể Check-out khi phòng ở trạng thái 'Đang lưu trú'!"):
        booking.check_out()