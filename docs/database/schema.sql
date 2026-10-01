USE `hotel_db`

CREATE TABLE `VAI_TRO` (
    `MaVT` INT AUTO_INCREMENT,
    `TenVaiTro` VARCHAR(100) NOT NULL,
    `Mota` VARCHAR(255) NULL,
    PRIMARY KEY (`MaVT`),
    CONSTRAINT `UQ_VAI_TRO_TenVaiTro` UNIQUE (`TenVaiTro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `VAI_TRO` (`TenVaiTro`, `Mota`) VALUES
('Admin', 'Quản trị viên toàn quyền hệ thống'),
('Staff', 'Nhân viên quản lý phòng và đơn đặt'),
('Customer', 'Khách hàng sử dụng dịch vụ');


CREATE TABLE `NGUOI_DUNG` (
    `MaNguoiDung` INT AUTO_INCREMENT,
    `MaVT` INT NOT NULL,
    `TaiKhoan` VARCHAR(255) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `MatKhauHash` VARCHAR(255) NOT NULL,
    `NgayTao` DATE DEFAULT (CURRENT_DATE),
    `TrangThai` VARCHAR(30) NOT NULL DEFAULT 'Hoạt động',
    PRIMARY KEY (`MaNguoiDung`),
    CONSTRAINT `UQ_NGUOI_DUNG_TaiKhoan` UNIQUE (`TaiKhoan`),
    CONSTRAINT `UQ_NGUOI_DUNG_Email` UNIQUE (`Email`),
    CONSTRAINT `FK_Users_Roles` FOREIGN KEY (`MaVT`) REFERENCES `VAI_TRO` (`MaVT`),
    CONSTRAINT `CHK_NGUOI_DUNG_TrangThai` CHECK (`TrangThai` IN ('Chờ kích hoạt', 'Tạm khóa', 'Hoạt động'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `KHACH_HANG` (
    `MaKH` INT AUTO_INCREMENT,
    `MaNguoiDung` INT NULL,
    `HoTen` VARCHAR(100) NOT NULL,
    `SDT` VARCHAR(11) NOT NULL,
    `CCCD` VARCHAR(20) NOT NULL,
    `NgaySinh` DATE NULL,
    `GioiTinh` VARCHAR(10) NULL,
    `DiaChi` VARCHAR(255) NULL,
    `QuocTich` VARCHAR(255) DEFAULT 'Việt Nam',
    PRIMARY KEY (`MaKH`),
    CONSTRAINT `UQ_KHACH_HANG_SDT` UNIQUE (`SDT`),
    CONSTRAINT `UQ_KHACH_HANG_CCCD` UNIQUE (`CCCD`),
    CONSTRAINT `UQ_KHACH_HANG_MaNguoiDung` UNIQUE (`MaNguoiDung`),
    CONSTRAINT `FK_Customers_Users` FOREIGN KEY (`MaNguoiDung`) REFERENCES `NGUOI_DUNG` (`MaNguoiDung`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `LOAI_PHONG` (
    `MaLoaiPhong` INT AUTO_INCREMENT,
    `TenLoaiPhong` VARCHAR(255) NOT NULL,
    `GiaThanh` DECIMAL(12, 2) NOT NULL,
    `SucChua` INT NOT NULL,
    `MoTa` TEXT NULL,
    PRIMARY KEY (`MaLoaiPhong`),
    CONSTRAINT `CHK_LOAI_PHONG_GiaThanh` CHECK (`GiaThanh` >= 0),
    CONSTRAINT `CHK_LOAI_PHONG_SucChua` CHECK (`SucChua` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `PHONG` (
    `MaPhong` INT AUTO_INCREMENT,
    `MaLoaiPhong` INT NOT NULL,
    `SoPhong` VARCHAR(20) NOT NULL,
    `TinhTrang` VARCHAR(30) DEFAULT 'Còn trống',
    `Tang` INT NOT NULL,
    PRIMARY KEY (`MaPhong`),
    CONSTRAINT `UQ_PHONG_SoPhong` UNIQUE (`SoPhong`),
    CONSTRAINT `FK_Rooms_RoomTypes` FOREIGN KEY (`MaLoaiPhong`) REFERENCES `LOAI_PHONG` (`MaLoaiPhong`),
    CONSTRAINT `CHK_PHONG_TinhTrang` CHECK (`TinhTrang` IN ('Còn trống', 'Đã đặt', 'Đang sử dụng', 'Bảo trì'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `IX_PHONG_MaLoaiPhong` 
ON `PHONG` (`MaLoaiPhong`);

CREATE INDEX `IX_PHONG_Tang_TinhTrang` 
ON `PHONG` (`Tang`, `TinhTrang`);


CREATE INDEX `IX_LOAI_PHONG_SucChua_GiaThanh` 
ON `LOAI_PHONG` (`SucChua`, `GiaThanh`);


CREATE TABLE `HINH_ANH_PHONG` (
    `MaHinhAnh` INT AUTO_INCREMENT,
    `MaPhong` INT NOT NULL,
    `HinhAnhURL` VARCHAR(500) NOT NULL,
    `IsPrimary` TINYINT(1) DEFAULT 0,
    `ThuTu` INT DEFAULT 0,
    PRIMARY KEY (`MaHinhAnh`),
    CONSTRAINT `FK_HINH_ANH_PHONG_PHONG` FOREIGN KEY (`MaPhong`) REFERENCES `PHONG` (`MaPhong`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `DICH_VU` (
    `MaDV` INT AUTO_INCREMENT,
    `TenDV` VARCHAR(255) NOT NULL,
    `GiaThanh` DECIMAL(12, 2) NOT NULL,
    `MoTa` VARCHAR(255) NOT NULL,
    `TrangThai` TINYINT(1) DEFAULT 1,
    PRIMARY KEY (`MaDV`),
    CONSTRAINT `CHK_DICH_VU_GiaThanh` CHECK (`GiaThanh` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `DON_DAT_PHONG` (
    `MaDonDatPhong` INT AUTO_INCREMENT,
    `MaKH` INT NOT NULL,
    `NgayDat` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `NgayNhanPhong` DATETIME NOT NULL,
    `NgayTraPhong` DATETIME NOT NULL,
    `TinhTrangDon` VARCHAR(100) NOT NULL DEFAULT 'Chờ xác nhận',
    `TongTien` DECIMAL(12, 2) DEFAULT 0.00,
    `TienCoc` DECIMAL(12, 2) DEFAULT 0.00,
    PRIMARY KEY (`MaDonDatPhong`),
    CONSTRAINT `FK_DAT_PHONG_KHACH_HANG` FOREIGN KEY (`MaKH`) REFERENCES `KHACH_HANG` (`MaKH`),
    CONSTRAINT `CHK_Ngay_Dat_Phong` CHECK (`NgayTraPhong` > `NgayNhanPhong`),
    CONSTRAINT `CHK_DON_DAT_PHONG_TongTien` CHECK (`TongTien` >= 0),
    CONSTRAINT `CHK_DON_DAT_PHONG_TienCoc` CHECK (`TienCoc` >= 0),
    CONSTRAINT `CHK_DON_DAT_PHONG_TinhTrang` CHECK (`TinhTrangDon` IN ('Chờ xác nhận', 'Đã xác nhận', 'Đã nhận phòng', 'Đã trả phòng', 'Đã hủy'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `CHI_TIET_DAT_PHONG` (
    `MaChiTietDP` INT AUTO_INCREMENT,
    `MaDonDatPhong` INT NOT NULL,
    `MaPhong` INT NOT NULL,
    `DonGia` DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (`MaChiTietDP`),
    CONSTRAINT `FK_CTDP_DAT_PHONG` FOREIGN KEY (`MaDonDatPhong`) REFERENCES `DON_DAT_PHONG` (`MaDonDatPhong`) ON DELETE CASCADE,
    CONSTRAINT `FK_CTDP_PHONG` FOREIGN KEY (`MaPhong`) REFERENCES `PHONG` (`MaPhong`),
    CONSTRAINT `CHK_CHI_TIET_DAT_PHONG_DonGia` CHECK (`DonGia` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `SU_DUNG_DV` (
    `MaSDDV` INT AUTO_INCREMENT,
    `MaDonDatPhong` INT NOT NULL,
    `MaDV` INT NOT NULL,
    `SoLuong` INT DEFAULT 1,
    `DonGia` DECIMAL(12, 2) NOT NULL,
    `NgaySuDung` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`MaSDDV`),
    CONSTRAINT `FK_SDDV_DAT_PHONG` FOREIGN KEY (`MaDonDatPhong`) REFERENCES `DON_DAT_PHONG` (`MaDonDatPhong`) ON DELETE CASCADE,
    CONSTRAINT `FK_SDDV_DICH_VU` FOREIGN KEY (`MaDV`) REFERENCES `DICH_VU` (`MaDV`),
    CONSTRAINT `CHK_SU_DUNG_DV_SoLuong` CHECK (`SoLuong` > 0),
    CONSTRAINT `CHK_SU_DUNG_DV_DonGia` CHECK (`DonGia` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `THANH_TOAN` (
    `MaThanhToan` INT AUTO_INCREMENT,
    `MaDonDatPhong` INT NOT NULL,
    `NgayThanhToan` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `PhuongThucThanhToan` VARCHAR(100) NOT NULL,
    `TongTien` DECIMAL(12, 2) NOT NULL,
    `TinhTrang` VARCHAR(30) DEFAULT 'Chưa thanh toán',
    PRIMARY KEY (`MaThanhToan`),
    CONSTRAINT `UQ_THANH_TOAN_MaDonDatPhong` UNIQUE (`MaDonDatPhong`),
    CONSTRAINT `FK_HOA_DON_DAT_PHONG` FOREIGN KEY (`MaDonDatPhong`) REFERENCES `DON_DAT_PHONG` (`MaDonDatPhong`),
    CONSTRAINT `CHK_THANH_TOAN_TongTien` CHECK (`TongTien` >= 0),
    CONSTRAINT `CHK_THANH_TOAN_TinhTrang` CHECK (`TinhTrang` IN ('Chưa thanh toán', 'Đã thanh toán', 'Hoàn tiền'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DANH_GIA` (
    `MaDG` INT AUTO_INCREMENT,
    `MaDonDatPhong` INT NOT NULL,
    `MaKH` INT NOT NULL,
    `Rating` TINYINT NOT NULL,
    `Comment` TEXT NULL,
    `NgayDanhGia` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`MaDG`),
    CONSTRAINT `UQ_DANH_GIA_MaDonDatPhong` UNIQUE (`MaDonDatPhong`),
    CONSTRAINT `FK_DANH_GIA_DAT_PHONG` FOREIGN KEY (`MaDonDatPhong`) REFERENCES `DON_DAT_PHONG` (`MaDonDatPhong`),
    CONSTRAINT `FK_DANH_GIA_KHACH_HANG` FOREIGN KEY (`MaKH`) REFERENCES `KHACH_HANG` (`MaKH`),
    CONSTRAINT `CHK_DANH_GIA_Rating` CHECK (`Rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- View 1: Danh sách phòng chi tiết
CREATE OR REPLACE VIEW `vw_DanhSachPhongChiTiet` AS
SELECT 
    p.MaPhong,
    p.SoPhong,
    p.Tang,
    p.TinhTrang,
    lp.MaLoaiPhong,
    lp.TenLoaiPhong,
    lp.GiaThanh AS GiaNiemYet,
    lp.SucChua,
    ha.HinhAnhURL AS AnhDaiDien
FROM PHONG p
JOIN LOAI_PHONG lp ON p.MaLoaiPhong = lp.MaLoaiPhong
LEFT JOIN HINH_ANH_PHONG ha ON p.MaPhong = ha.MaPhong AND ha.IsPrimary = 1;


-- View 2: Chi tiết đơn đặt phòng
CREATE OR REPLACE VIEW `vw_ChiTietDonDatPhong` AS
SELECT 
    ddp.MaDonDatPhong,
    kh.HoTen AS TenKhachHang,
    kh.SDT,
    kh.CCCD,
    ddp.NgayDat,
    ddp.NgayNhanPhong,
    ddp.NgayTraPhong,
    DATEDIFF(ddp.NgayTraPhong, ddp.NgayNhanPhong) AS SoDemO,
    ddp.TinhTrangDon,
    ddp.TienCoc,
    ddp.TongTien
FROM DON_DAT_PHONG ddp
JOIN KHACH_HANG kh ON ddp.MaKH = kh.MaKH;

-- View 3: Hóa đơn thanh toán
CREATE OR REPLACE VIEW `vw_HoaDonThanhToan` AS
SELECT 
    ddp.MaDonDatPhong,
    kh.HoTen AS TenKhachHang,
    kh.SDT,
    ddp.NgayNhanPhong,
    ddp.NgayTraPhong,
    IFNULL(TienPhong.TongTienPhong, 0) AS TongTienPhong,
    IFNULL(TienDV.TongTienDichVu, 0) AS TongTienDichVu,
    IFNULL(ddp.TienCoc, 0) AS TienDaCoc,
    (IFNULL(TienPhong.TongTienPhong, 0) + IFNULL(TienDV.TongTienDichVu, 0) - IFNULL(ddp.TienCoc, 0)) AS SoTienConLaiCanThanhToan,
    tt.PhuongThucThanhToan,
    IFNULL(tt.TinhTrang, 'Chưa thanh toán') AS TinhTrangThanhToan,
    tt.NgayThanhToan
FROM DON_DAT_PHONG ddp
JOIN KHACH_HANG kh ON ddp.MaKH = kh.MaKH
LEFT JOIN (
    SELECT 
        ctdp.MaDonDatPhong,
        SUM(ctdp.DonGia * DATEDIFF(d.NgayTraPhong, d.NgayNhanPhong)) AS TongTienPhong
    FROM CHI_TIET_DAT_PHONG ctdp
    JOIN DON_DAT_PHONG d ON ctdp.MaDonDatPhong = d.MaDonDatPhong
    GROUP BY ctdp.MaDonDatPhong
) TienPhong ON ddp.MaDonDatPhong = TienPhong.MaDonDatPhong
LEFT JOIN (
    SELECT 
        MaDonDatPhong,
        SUM(SoLuong * DonGia) AS TongTienDichVu
    FROM SU_DUNG_DV
    GROUP BY MaDonDatPhong
) TienDV ON ddp.MaDonDatPhong = TienDV.MaDonDatPhong
LEFT JOIN THANH_TOAN tt ON ddp.MaDonDatPhong = tt.MaDonDatPhong;


-- View 4: Báo cáo doanh thu tháng
CREATE OR REPLACE VIEW `vw_BaoCaoDoanhThuThang` AS
SELECT 
    YEAR(tt.NgayThanhToan) AS Nam,
    MONTH(tt.NgayThanhToan) AS Thang,
    COUNT(DISTINCT tt.MaDonDatPhong) AS SoLuongDonHoanThanh,
    SUM(tt.TongTien) AS TongDoanhThu
FROM THANH_TOAN tt
WHERE tt.TinhTrang = 'Đã thanh toán'
GROUP BY YEAR(tt.NgayThanhToan), MONTH(tt.NgayThanhToan);
