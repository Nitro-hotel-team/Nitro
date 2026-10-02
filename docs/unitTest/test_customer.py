import pytest
from unittest.mock import MagicMock
from app.exceptions import ValidationError


class KhachHangService:
    def __init__(self, db):
        self.db = db

    def tao_hoac_lay_khach_vang_lai(self, ho_ten: str, sdt: str, cccd: str):
        """
        Nghiệp vụ: 
        1. Tìm xem CCCD hoặc SDT đã tồn tại trong CSDL chưa.
        2. Nếu ĐÃ TỒN TẠI: Trả về MaKH cũ (Tái sử dụng hồ sơ).
        3. Nếu CHƯA TỒN TẠI: Tạo mới khách hàng vãng lai.
        """
        # Validate định dạng cơ bản
        if len(cccd) != 12 or not cccd.isdigit():
            raise ValidationError("Số CCCD không hợp lệ (Phải đúng 12 chữ số).")

        # 1. Kiểm tra trùng CCCD hoặc SDT
        khach_cu = self.db.query("KHACH_HANG").filter(
            (self.db.KHACH_HANG.CCCD == cccd) | (self.db.KHACH_HANG.SDT == sdt)
        ).first()

        if khach_cu:
            # Trường hợp trùng dữ liệu: Không tạo mới, tái sử dụng khách cũ
            return {"status": "EXISTING", "data": khach_cu, "message": "Khách hàng đã tồn tại trong hệ thống."}

        # 2. Tạo mới nếu chưa có
        new_khach = {
            "HoTen": ho_ten,
            "SDT": sdt,
            "CCCD": cccd
        }
        created_obj = self.db.add("KHACH_HANG", new_khach)
        self.db.commit()
        return {"status": "CREATED", "data": created_obj, "message": "Tạo khách hàng vãng lai mới thành công."}


# ==============================================================================
# UNIT TEST CASES
# ==============================================================================

class TestKhachVangLaiDuplicate:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.mock_db = MagicMock()
        self.service = KhachHangService(db=self.mock_db)

    def test_tao_khach_moi_thanh_cong(self):
        """Test trường hợp CCCD và SĐT hoàn toàn mới -> Tạo thành công bản ghi mới"""
        self.mock_db.query().filter().first.return_value = None
        self.mock_db.add.return_value = MagicMock(MaKH=10, HoTen="Nguyen Van A", CCCD="035099000001", SDT="0901234567")

        result = self.service.tao_hoac_lay_khach_vang_lai(
            ho_ten="Nguyen Van A",
            sdt="0901234567",
            cccd="035099000001"
        )

        assert result["status"] == "CREATED"
        assert self.mock_db.add.called
        assert self.mock_db.commit.called

    def test_trung_cccd_tra_ve_khach_cu(self):
        """Test khách vãng lai đến đặt phòng có CCCD đã tồn tại -> Trả về MaKH cũ, không INSERT mới"""
        khach_cu_mock = MagicMock(MaKH=5, HoTen="Nguyen Van A (Cu)", CCCD="035099000001", SDT="0901234567")
        self.mock_db.query().filter().first.return_value = khach_cu_mock

        result = self.service.tao_hoac_lay_khach_vang_lai(
            ho_ten="Nguyen Van A",
            sdt="0901234567",
            cccd="035099000001"
        )

        assert result["status"] == "EXISTING"
        assert result["data"].MaKH == 5
        # Đảm bảo KHÔNG thực hiện thao tác INSERT thêm vào DB
        assert not self.mock_db.add.called

    def test_trung_sdt_nhung_khac_cccd_tra_ve_khach_cu(self):
        """Test trùng SĐT nhưng nhập khác CCCD -> Phát hiện trùng lặp và chặn duplicate"""
        khach_cu_mock = MagicMock(MaKH=8, HoTen="Tran Thi B", CCCD="035099000002", SDT="0988888888")
        self.mock_db.query().filter().first.return_value = khach_cu_mock

        result = self.service.tao_hoac_lay_khach_vang_lai(
            ho_ten="Tran Thi B",
            sdt="0988888888",
            cccd="035099999999" # CCCD khác nhưng SĐT trùng
        )

        assert result["status"] == "EXISTING"
        assert result["data"].MaKH == 8
        assert not self.mock_db.add.called

    def test_cccd_khong_hop_le_nem_loai_validation_error(self):
        """Test nhập CCCD sai định dạng (thiếu chữ số)"""
        with pytest.raises(ValidationError, match="Số CCCD không hợp lệ"):
            self.service.tao_hoac_lay_khach_vang_lai(
                ho_ten="Le Van C",
                sdt="0912345678",
                cccd="12345" # Sai định dạng
            )