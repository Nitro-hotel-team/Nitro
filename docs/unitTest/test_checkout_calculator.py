import pytest

def calculate_checkout_totals(
    room_price: float,
    nights: int,
    rooms_count: int,
    additional_services: list = None,
    voucher_percent: float = 0.0,
    voucher_fixed_amount: float = 0.0,
    service_fee_rate: float = 0.05,
    vat_rate: float = 0.08
):
    """
    Hàm tính toán chi tiết đơn đặt phòng & dịch vụ khách sạn.
    
    :param room_price: Giá 1 phòng / 1 đêm
    :param nights: Số đêm lưu trú
    :param rooms_count: Số lượng phòng đặt
    :param additional_services: Danh sách dict [{'name': str, 'price': float, 'quantity': int}]
    :param voucher_percent: Phần trăm giảm giá (VD: 10 cho 10%)
    :param voucher_fixed_amount: Số tiền giảm giá cố định (VD: 200000)
    :param service_fee_rate: Tỷ lệ phí dịch vụ (Mặc định 5%)
    :param vat_rate: Tỷ lệ thuế VAT (Mặc định 8%)
    """
    # 1. Tính tổng tiền phòng
    total_room = room_price * nights * rooms_count

    # 2. Tính tổng tiền dịch vụ cộng thêm
    total_service = 0.0
    if additional_services:
        for service in additional_services:
            total_service += service["price"] * service["quantity"]

    # 3. Tính tiền giảm giá (Voucher)
    subtotal = total_room + total_service
    discount = 0.0
    if voucher_percent > 0:
        # Giảm theo phần trăm tiền phòng (hoặc tổng tiền tùy nghiệp vụ, ở đây tính trên tổng phụ)
        discount = subtotal * (voucher_percent / 100.0)
    elif voucher_fixed_amount > 0:
        discount = voucher_fixed_amount

    # Giới hạn giảm giá không vượt quá tổng phụ
    discount = min(discount, subtotal)
    net_subtotal = subtotal - discount

    # 4. Tính Phí dịch vụ (5%) và Thuế VAT (8%)
    service_fee = round(net_subtotal * service_fee_rate)
    vat_fee = round(net_subtotal * vat_rate)

    # 5. Tổng tiền thanh toán
    grand_total = net_subtotal + service_fee + vat_fee

    return {
        "total_room": total_room,
        "total_service": total_service,
        "discount": discount,
        "net_subtotal": net_subtotal,
        "service_fee": service_fee,
        "vat_fee": vat_fee,
        "grand_total": grand_total
    }


# ==============================================================================
# KIỂM THỬ TỰ ĐỘNG (PYTEST TEST CASES)
# ==============================================================================

class TestCheckoutCalculationIntegrity:

    def test_default_booking_without_services(self):
        """
        Test Case 1: Đặt phòng cơ bản (Không chọn dịch vụ, không mã giảm giá)
        Standard Double: 850.000đ x 2 đêm x 1 phòng = 1.700.000đ
        """
        res = calculate_checkout_totals(
            room_price=850000,
            nights=2,
            rooms_count=1
        )
        assert res["total_room"] == 1700000
        assert res["total_service"] == 0
        assert res["service_fee"] == 85000   # 1.700.000 * 5%
        assert res["vat_fee"] == 136000      # 1.700.000 * 8%
        assert res["grand_total"] == 1921000 # 1.700.000 + 85.000 + 136.000

    def test_booking_with_airport_transfer_service(self):
        """
        Test Case 2: Đặt phòng + 1 Dịch vụ Đưa đón sân bay (450.000đ)
        (Dữ liệu thực tế đối soát từ giao diện ảnh)
        """
        services = [
            {"name": "Đưa đón sân bay Tân Sơn Nhất", "price": 450000, "quantity": 1}
        ]
        res = calculate_checkout_totals(
            room_price=850000,
            nights=2,
            rooms_count=1,
            additional_services=services
        )
        assert res["total_room"] == 1700000
        assert res["total_service"] == 450000
        assert res["net_subtotal"] == 2150000
        assert res["service_fee"] == 107500  # 2.150.000 * 5%
        assert res["vat_fee"] == 172000      # 2.150.000 * 8%
        assert res["grand_total"] == 2429500 # Tổng khớp 100% giao diện

    def test_booking_with_multiple_services(self):
        """
        Test Case 3: Đặt phòng + Đưa đón sân bay (450k) + 4 suất Buffet (250k x 4 = 1tr)
        """
        services = [
            {"name": "Đưa đón sân bay Tân Sơn Nhất", "price": 450000, "quantity": 1},
            {"name": "Bữa sáng buffet quốc tế", "price": 250000, "quantity": 4}
        ]
        res = calculate_checkout_totals(
            room_price=850000,
            nights=2,
            rooms_count=1,
            additional_services=services
        )
        assert res["total_service"] == 1450000 # 450k + 1tr
        assert res["net_subtotal"] == 3150000  # 1.7tr + 1.45tr
        assert res["service_fee"] == 157500   # 3.150.000 * 5%
        assert res["vat_fee"] == 252000       # 3.150.000 * 8%
        assert res["grand_total"] == 3559500

    def test_booking_with_percentage_voucher(self):
        """
        Test Case 4: Áp dụng mã NITRO10 (Giảm 10% tổng tiền phòng + dịch vụ)
        """
        services = [
            {"name": "Đưa đón sân bay Tân Sơn Nhất", "price": 450000, "quantity": 1}
        ]
        res = calculate_checkout_totals(
            room_price=850000,
            nights=2,
            rooms_count=1,
            additional_services=services,
            voucher_percent=10
        )
        # Tổng gốc: 2.150.000đ -> Giảm 10% = 215.000đ -> Còn lại: 1.935.000đ
        assert res["discount"] == 215000
        assert res["net_subtotal"] == 1935000
        assert res["service_fee"] == 96750    # 1.935.000 * 5%
        assert res["vat_fee"] == 154800       # 1.935.000 * 8%
        assert res["grand_total"] == 2186550

    def test_booking_with_fixed_voucher(self):
        """
        Test Case 5: Áp dụng mã SUMMER200 (Giảm trực tiếp 200.000đ)
        """
        services = [
            {"name": "Đưa đón sân bay Tân Sơn Nhất", "price": 450000, "quantity": 1}
        ]
        res = calculate_checkout_totals(
            room_price=850000,
            nights=2,
            rooms_count=1,
            additional_services=services,
            voucher_fixed_amount=200000
        )
        # Tổng gốc: 2.150.000đ -> Giảm 200.000đ -> Còn lại: 1.950.000đ
        assert res["discount"] == 200000
        assert res["net_subtotal"] == 1950000
        assert res["service_fee"] == 97500    # 1.950.000 * 5%
        assert res["vat_fee"] == 156000       # 1.950.000 * 8%
        assert res["grand_total"] == 2203500