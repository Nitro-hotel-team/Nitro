USE `hotel_db`


INSERT INTO `LOAI_PHONG` (`MaLoaiPhong`, `TenLoaiPhong`, `GiaThanh`, `SucChua`, `MoTa`) VALUES
(1, 'Standard Single', 500000.00, 1, 'Phòng tiêu chuẩn 1 giường đơn, đầy đủ tiện nghi cơ bản, view thành phố.'),
(2, 'Deluxe Double', 900000.00, 2, 'Phòng cao cấp 1 giường đôi lớn, ban công thoáng mát, miễn phí bữa sáng.'),
(3, 'VIP Family Suite', 1800000.00, 4, 'Phòng VIP gia đình rộng 60m2, 2 giường đôi, phòng khách riêng, bồn tắm nằm.');

INSERT INTO `PHONG` (`MaPhong`, `MaLoaiPhong`, `SoPhong`, `TinhTrang`, `Tang`) VALUES
-- Tầng 1 (Phòng Standard)
(1, 1, 'P101', 'Còn trống', 1),
(2, 1, 'P102', 'Còn trống', 1),
(3, 1, 'P103', 'Đang sử dụng', 1),
-- Tầng 2 (Phòng Deluxe)
(4, 2, 'P201', 'Còn trống', 2),
(5, 2, 'P202', 'Đã đặt', 2),
(6, 2, 'P203', 'Đang sử dụng', 2),
(7, 2, 'P204', 'Còn trống', 2),
-- Tầng 3 (Phòng VIP Suite)
(8, 3, 'P301', 'Còn trống', 3),
(9, 3, 'P302', 'Bảo trì', 3),
(10, 3, 'P303', 'Còn trống', 3);

INSERT INTO `DICH_VU` (`MaDV`, `TenDV`, `GiaThanh`, `MoTa`, `TrangThai`) VALUES
(1, 'Ăn sáng Buffet', 150000.00, 'Suất ăn sáng tự chọn hơn 40 món Âu - Á tại nhà hàng tầng 1', 1),
(2, 'Giặt ủi cao cấp', 50000.00, 'Dịch vụ giặt sấy và ủi phẳng tính theo kg/bộ quần áo', 1),
(3, 'Đưa đón sân bay', 350000.00, 'Xe xe 7 chỗ riêng đưa đón 2 chiều sân bay - khách sạn', 1),
(4, 'Massage & Spa', 500000.00, 'Liệu trình massage thư giãn toàn thân 60 phút', 1),
(5, 'Thuê xe máy tự lái', 120000.00, 'Cho thuê xe tay ga/xe số 24h (chưa bao gồm xăng)', 1);


SELECT * FROM `LOAI_PHONG`

SELECT * FROM `PHONG`

SELECT * FROM `DICH_VU`

-- Stored Procedure về kiểm tra trùng lịch cơ bản theo khoảng thời gian

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_KiemTraTrungLich`$$

CREATE PROCEDURE `sp_KiemTraTrungLich`(
    IN p_MaPhong INT,
    IN p_NgayNhanPhong DATETIME,
    IN p_NgayTraPhong DATETIME,
    IN p_MaDonDatPhongExcluding INT -- Truyền NULL nếu là đơn mới, truyền MaDonDatPhong nếu là cập nhật đơn cũ
)
BEGIN
    DECLARE v_SoLuongTrung INT DEFAULT 0;

    -- Kiểm tra điều kiện thời gian nhận/trả hợp lệ
    IF p_NgayNhanPhong >= p_NgayTraPhong THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Ngày nhận phòng phải nhỏ hơn ngày trả phòng!';
    END IF;

    -- Đếm số lượng đơn đặt có khoảng thời gian giao thoa (overlap) với khoảng thời gian đầu vào
    SELECT COUNT(*) INTO v_SoLuongTrung
    FROM `CHI_TIET_DAT_PHONG` ctdp
    JOIN `DON_DAT_PHONG` ddp ON ctdp.MaDonDatPhong = ddp.MaDonDatPhong
    WHERE ctdp.MaPhong = p_MaPhong
      AND ddp.TinhTrangDon NOT IN ('Đã hủy')
      -- Bỏ qua chính đơn đặt này nếu đang thực hiện Update đơn
      AND (p_MaDonDatPhongExcluding IS NULL OR ddp.MaDonDatPhong <> p_MaDonDatPhongExcluding)
      -- Điều kiện trùng khoảng thời gian (Overlap Condition)
      AND (p_NgayNhanPhong < ddp.NgayTraPhong AND p_NgayTraPhong > ddp.NgayNhanPhong);

    -- Trả về kết quả kiểm tra
    IF v_SoLuongTrung > 0 THEN
        SELECT 
            FALSE AS `IsAvailable`, 
            v_SoLuongTrung AS `ConflictCount`, 
            'Phòng đã bị đặt trong khoảng thời gian này!' AS `Message`;
    ELSE
        SELECT 
            TRUE AS `IsAvailable`, 
            0 AS `ConflictCount`, 
            'Phòng còn trống, có thể đặt!' AS `Message`;
    END IF;

END$$

DELIMITER ;

CREATE INDEX idx_don_dat_phong_ngay 
ON DON_DAT_PHONG (NgayNhanPhong, NgayTraPhong);

CREATE INDEX idx_don_dat_phong_status_ngay 
ON DON_DAT_PHONG (TinhTrangDon, NgayNhanPhong, NgayTraPhong);

CREATE INDEX idx_don_dat_phong_thong_ke 
ON DON_DAT_PHONG (NgayNhanPhong, NgayTraPhong, TinhTrangDon, TongTien, TienCoc);