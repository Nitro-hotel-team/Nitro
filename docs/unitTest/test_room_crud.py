import pytest
from unittest.mock import MagicMock
from app.services import LoaiPhongService, PhongService
from app.exceptions import ValidationError, ResourceNotFoundError, DependencyError


# ==============================================================================
# 1. UNIT TEST CHO PHÂN HỆ LOẠI PHÒNG (LOAI_PHONG)
# ==============================================================================

class TestLoaiPhongService:

    @pytest.fixture(autouse=True)
    def setup(self):
        """Khởi tạo Mock Database Session trước mỗi test case"""
        self.mock_db = MagicMock()
        self.service = LoaiPhongService(db=self.mock_db)

    # --- CREATE ---
    def test_create_loai_phong_success(self):
        """Test thêm loại phòng hợp lệ"""
        data = {
            "TenLoaiPhong": "Deluxe Ocean View",
            "GiaThanh": 1200000.0,
            "SucChua": 2,
            "MoTa": "Hướng biển"
        }
        
        # Act
        result = self.service.create_loai_phong(data)

        # Assert
        assert self.mock_db.add.called
        assert self.mock_db.commit.called

    def test_create_loai_phong_invalid_price(self):
        """Test thêm loại phòng với giá âm (< 0) -> Phải ném lỗi ValidationError"""
        invalid_data = {
            "TenLoaiPhong": "Standard",
            "GiaThanh": -500000.0,
            "SucChua": 2
        }

        with pytest.raises(ValidationError, match="Giá thành phòng phải lớn hơn hoặc bằng 0"):
            self.service.create_loai_phong(invalid_data)

    # --- READ ---
    def test_get_loai_phong_by_id_found(self):
        """Test lấy thông tin loại phòng theo ID tồn tại"""
        mock_obj = MagicMock(MaLoaiPhong=1, TenLoaiPhong="VIP")
        self.mock_db.query().filter().first.return_value = mock_obj

        result = self.service.get_by_id(1)

        assert result.MaLoaiPhong == 1
        assert result.TenLoaiPhong == "VIP"

    def test_get_loai_phong_by_id_not_found(self):
        """Test lấy loại phòng không tồn tại -> Trả về None hoặc ném lỗi"""
        self.mock_db.query().filter().first.return_value = None

        with pytest.raises(ResourceNotFoundError, match="Không tìm thấy loại phòng"):
            self.service.get_by_id(999)

    # --- UPDATE ---
    def test_update_loai_phong_success(self):
        """Test cập nhật giá thành loại phòng thành công"""
        existing_obj = MagicMock(MaLoaiPhong=1, GiaThanh=500000.0)
        self.mock_db.query().filter().first.return_value = existing_obj

        result = self.service.update_loai_phong(1, {"GiaThanh": 650000.0})

        assert existing_obj.GiaThanh == 650000.0
        assert self.mock_db.commit.called

    # --- DELETE ---
    def test_delete_loai_phong_has_rooms_restriction(self):
        """Test không cho xóa loại phòng đã có phòng thuộc về (Chặn lỗi FK)"""
        # Giả lập trong bảng PHONG có 2 bản ghi đang dùng MaLoaiPhong này
        self.mock_db.query().filter().count.return_value = 2

        with pytest.raises(DependencyError, match="Không thể xóa loại phòng đã có phòng đang hoạt động"):
            self.service.delete_loai_phong(1)


# ==============================================================================
# 2. UNIT TEST CHO PHÂN HỆ BUỒNG PHÒNG (PHONG)
# ==============================================================================

class TestPhongService:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.mock_db = MagicMock()
        self.service = PhongService(db=self.mock_db)

    # --- CREATE ---
    def test_create_phong_duplicate_so_phong(self):
        """Test thêm phòng mới nhưng trùng SoPhong đã có -> Báo lỗi"""
        # Giả lập tìm thấy SoPhong '101' đã có trong CSDL
        self.mock_db.query().filter().first.return_value = MagicMock(MaPhong=1, SoPhong="101")

        data = {"MaLoaiPhong": 1, "SoPhong": "101", "Tang": 1}

        with pytest.raises(ValidationError, match="Số phòng đã tồn tại trong hệ thống"):
            self.service.create_phong(data)

    # --- READ ---
    def test_get_phong_by_tang_and_status(self):
        """Test lọc danh sách phòng theo tầng và trạng thái"""
        mock_rooms = [
            MagicMock(SoPhong="101", Tang=1, TinhTrang="Còn trống"),
            MagicMock(SoPhong="102", Tang=1, TinhTrang="Còn trống")
        ]
        self.mock_db.query().filter().all.return_value = mock_rooms

        results = self.service.get_phong_by_filter(tang=1, tinh_trang="Còn trống")

        assert len(results) == 2
        assert results[0].SoPhong == "101"

    # --- UPDATE ---
    def test_update_tinh_trang_phong_to_bao_tri(self):
        """Test cập nhật trạng thái phòng sang 'Bảo trì'"""
        existing_phong = MagicMock(MaPhong=1, TinhTrang="Còn trống")
        self.mock_db.query().filter().first.return_value = existing_phong

        result = self.service.update_status(1, new_status="Bảo trì")

        assert existing_phong.TinhTrang == "Bảo trì"
        assert self.mock_db.commit.called

    # --- DELETE ---
    def test_delete_phong_with_booking_history_restriction(self):
        """Test không cho xóa phòng đã xuất hiện trong CHI_TIET_DAT_PHONG"""
        # Giả lập bảng CHI_TIET_DAT_PHONG trả về count > 0
        self.mock_db.query().filter().count.return_value = 1

        with pytest.raises(DependencyError, match="Không thể xóa phòng đã có lịch sử đặt phòng"):
            self.service.delete_phong(1)