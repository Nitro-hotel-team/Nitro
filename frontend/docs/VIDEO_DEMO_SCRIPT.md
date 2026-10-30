# 🎬 KỊCH BẢN QUAY VIDEO DEMO TOÀN DIỆN WEBSITE NITRO GRAND HOTEL 4★
## Mã Jira: `FE-S4-11` (TASK-67) — Walkthrough Video Recording Script

- **Dự án:** Nitro Grand Hotel Web Application (Nhóm 7 — Đồ án Quản lý Dự án CNTT).
- **Mục tiêu:** Ghi hình video màn hình chất lượng cao Full HD 1080p (thời lượng 8 - 12 phút) chứng minh 100% tính năng đã hoàn thiện và hoạt động trơn tru trước Giảng viên và Hội đồng chấm điểm.
- **Tên tệp xuất xưởng quy chuẩn:** `Nitro_Grand_Hotel_Frontend_Full_Demo_Walkthrough.mp4`.
- **Thông số kỹ thuật:** 1920x1080 (Full HD), 60 FPS, Âm thanh thuyết minh Tiếng Việt rõ ràng, phụ đề chú thích từng bước.

---

## ⏱️ PHÂN BỔ DÒNG THỜI GIAN TỔNG THỂ (TIMELINE OVERVIEW)

| Phân đoạn | Thời lượng | Nội dung trọng tâm | Vai trò trình diễn |
| :---: | :---: | :--- | :---: |
| **Phần 1** | `00:00 - 01:00` | Khởi động & Nhận diện Thương hiệu 4 Sao Quốc tế | Khách / Chưa đăng nhập |
| **Phần 2** | `01:00 - 04:15` | Trải nghiệm Cổng Khách hàng & Quy trình Đặt phòng 3 Bước E2E | `CUSTOMER` |
| **Phần 3** | `04:15 - 08:30` | Vận hành Lễ tân PMS (Sơ đồ phòng, Walk-in, Timeline, Giao ca) | `FRONT_DESK` |
| **Phần 4** | `08:30 - 10:30` | Báo cáo Quản lý & Cấu hình Quản trị viên Tối cao (Dashboard, CRM, RBAC) | `MANAGER` & `ADMIN` |
| **Phần 5** | `10:30 - 11:30` | Thử nghiệm Responsive Mobile/Tablet & Tổng kết Nghiệm thu | Đa thiết bị |

---

## 📝 KỊCH BẢN CHI TIẾT TỪNG PHÂN ĐOẠN (SCENE-BY-SCENE WALKTHROUGH)

### PHẦN 1: KHỞI ĐỘNG & NHẬN DIỆN THƯƠNG HIỆU (00:00 - 01:00)
* **URL:** `http://localhost:3000/`
* **Mục tiêu:** Giới thiệu định vị thương hiệu khách sạn 4 sao Nitro Grand Hotel tại 24 Nguyễn Huệ, Quận 1, TP.HCM.
* **Thao tác thực tế:**
  1. Trình chiếu thanh Topbar sang trọng: Hotline `1900 6868`, địa chỉ, giờ nhận/trả phòng tiêu chuẩn.
  2. Bấm nút chuyển đổi ngôn ngữ trên Header: Chuyển đổi qua lại giữa **Tiếng Việt ➔ English ➔ Tiếng Việt**. Thuyết minh về hệ thống i18n phản hồi tức thời 0ms.
  3. Thuyết minh nhanh về hệ thống nhận diện màu sắc theo Design System: Deep Navy `#0B1F3A`, Royal Blue `#1F5AA6`, Luxury Gold `#C9A227`.
* **Lời thuyết minh gợi ý:**
  > *"Kính chào Thầy Cô và Hội đồng nghiệm thu đồ án. Hôm nay nhóm 7 xin trình diễn bản demo hoàn thiện của hệ thống website Nitro Grand Hotel tiêu chuẩn 4 sao. Giao diện được phát triển trên nền tảng React 19 và Tailwind CSS v4, hỗ trợ đầy đủ song ngữ Tiếng Việt và Tiếng Anh."*

---

### PHẦN 2: TRẢI NGHIỆM CỔNG KHÁCH HÀNG & ĐẶT PHÒNG 3 BƯỚC (01:00 - 04:15)
* **URL:** `http://localhost:3000/` ➔ `/rooms` ➔ `/rooms/rt-deluxe` ➔ `/booking/step-1` ➔ `/booking/step-2` ➔ `/booking/step-3` ➔ `/my-bookings`
* **Tài khoản:** `khachhang@nitrohotel.vn` / `password123` (Hạng VIP Silver).
* **Thao tác thực tế:**
  1. **Tìm kiếm phòng:** Mở widget chọn ngày `DateRangePicker`, chọn 2 đêm lưu trú; mở `GuestCounter` chọn 2 người lớn, 1 trẻ em -> Nhấn *"Tìm phòng ngay"*.
  2. **Bộ lọc đa chiều (`/rooms`):** Lọc theo hạng phòng *Deluxe*, chọn khoảng giá, xem thẻ phòng `RoomCard` với vi hoạt ảnh zoom ảnh mượt mà, nhãn ưu đãi giảm 15%.
  3. **Chi tiết phòng (`/rooms/rt-deluxe`):** Trình diễn Bento Grid ảnh, bấm mở Lightbox phóng to ảnh, kiểm tra 4 nhóm tiện nghi cao cấp. Bấm *"Đặt ngay"*.
  4. **Đặt phòng Bước 1 (`/booking/step-1`):**
     - Chỉ vào đồng hồ đếm ngược giữ phòng 10 phút (`HoldCountdown`).
     - Chọn thêm dịch vụ xe đưa đón sân bay và suất buffet sáng (bấm +/- số lượng).
     - Nhập mã ưu đãi `NITRO10` -> Hiển thị thông báo áp dụng thành công giảm 10% tiền phòng. Bấm Tiếp tục.
  5. **Đặt phòng Bước 2 (`/booking/step-2`):**
     - Nhập số CCCD/Passport `079199001234`.
     - Lựa chọn phương thức thanh toán: Chuyển khoản QR ngân hàng (VNPay). Bấm *"Xác nhận thanh toán"*.
  6. **Đặt phòng Bước 3 (`/booking/step-3`):**
     - Hiển thị mã đơn đặt phòng duy nhất chuẩn PNR `BK-XXXXXX`.
     - Nhấn nút sao chép mã 1 chạm (Toast xanh lá thông báo *"Đã sao chép mã đơn"*).
     - Hiển thị mã QR check-in tốc độ cao tại quầy và nút in xác nhận đặt phòng.
  7. **Quản lý đơn đặt phòng (`/my-bookings`):**
     - Vào trang danh sách đơn đã đặt, mở chi tiết đơn vừa tạo.
     - Bấm thử nút *"Hủy phòng"* -> Hiển thị Modal hủy đơn đối soát chính sách hoàn tiền 3 bậc theo quy định BA/PO (>48h hoàn 100%, 24-48h hoàn 50%, <24h hoàn 0%).

---

### PHẦN 3: VẬN HÀNH LỄ TÂN KHÁCH SẠN STAFF / PMS (04:15 - 08:30)
* **URL:** `http://localhost:3000/staff/overview`
* **Vai trò:** Nhấn nút Demo Switcher góc phải màn hình, chọn vai trò **Nhân viên Lễ tân (Front Desk)**.
* **Thao tác thực tế:**
  1. **Tổng quan ca trực (`/staff/overview`):** Xem số lượng phòng khách đang ở (In-House), số lượt dự kiến Check-in / Check-out trong ngày, quỹ tiền mặt đầu ca và ghi chú bàn giao ca.
  2. **Ma trận Sơ đồ buồng phòng (`/staff/room-board`):**
     - Trực quan hóa 60 phòng phân theo 10 tầng lầu với 5 màu sắc trạng thái.
     - Nhấp chuột vào một phòng đang ở trạng thái `CLEANING` (Chờ dọn) -> Menu ngữ cảnh Popover 1 chạm hiện ra -> Bấm *"Đã dọn sạch"* -> Phòng chuyển sang màu xanh lá `AVAILABLE` và số lượng thống kê cập nhật ngay lập tức.
  3. **Quy trình tiếp nhận khách vãng lai Walk-in (`/staff/walk-in`):**
     - Lễ tân chọn phòng trống 101 trong danh sách.
     - Nhập thông tin khách: Họ tên "Trần Thị Cẩm Tú", CCCD "079188005678", SĐT "0912345678".
     - Thu tiền cọc 1,000,000 VND tiền mặt -> Hệ thống tự động tính tiền thối lại cho khách.
     - Bật tùy chọn *"Check-in ngay tại quầy"* và nhấn Hoàn tất -> Quay lại Sơ đồ phòng thấy phòng 101 lập tức đổi sang màu xanh dương `OCCUPIED`.
  4. **Lịch biểu Gantt Timeline (`/staff/timeline`):** Trình diễn trục thời gian các đơn đặt phòng theo phòng và ngày, kéo cuộn mượt mà không vỡ giao diện.
  5. **Chi tiết đơn đặt phòng Lễ tân (`/staff/bookings/:id`):** Mở một đơn đang lưu trú, bấm thêm dịch vụ Minibar 150,000 VND vào hóa đơn và bấm nút in hóa đơn thanh toán (`window.print()`).

---

### PHẦN 4: PHÂN HỆ QUẢN LÝ & QUẢN TRỊ VIÊN HỆ THỐNG (08:30 - 10:30)
* **URL:** `http://localhost:3000/staff/dashboard`
* **Vai trò:** Bấm Demo Switcher chuyển sang vai trò **Quản lý Khách sạn (Manager)** và **Quản trị viên (Admin)**.
* **Thao tác thực tế:**
  1. **Dashboard KPI Quản lý (`/staff/dashboard`):** Trình diễn 4 chỉ số tài chính cốt lõi: Doanh thu tháng, Công suất phòng (Occupancy Rate %), RevPAR và ADR. Rê chuột tương tác trên biểu đồ doanh thu Recharts.
  2. **Quản lý Hạng phòng & Buồng phòng (`/staff/room-types` & `/staff/rooms`):** Xem danh mục 6 hạng phòng thực tế (STD, SUP, DLX, FAM, EXE, PRE), thử mở modal chỉnh sửa giá niêm yết hoặc trạng thái bảo trì.
  3. **Quản lý Khách hàng CRM (`/staff/customers`):** Tìm kiếm khách VIP, xem tổng chi tiêu và lịch sử lưu trú.
  4. **Phân quyền RBAC (`/staff/users`):** (Chuyển sang ADMIN) Xem danh sách nhân sự, phân vai trò Lễ tân / Quản lý và thử nghiệm nút khóa/mở tài khoản.
  5. **Cấu hình Hệ thống (`/staff/settings`):** Cấu hình tỷ lệ thuế VAT (8%), phí phục vụ (5%), giờ nhận phòng 14:00 và giờ trả phòng 12:00. Bấm Lưu -> Hiển thị Toast thông báo xanh lá tự ẩn sau 3 giây.

---

### PHẦN 5: TƯƠNG THÍCH ĐA THIẾT BỊ RESPONSIVE & ĐÓNG MÁY (10:30 - 11:30)
* **URL:** `http://localhost:3000/` & `/staff/room-board`
* **Thao tác thực tế:**
  1. Nhấn `F12` trên trình duyệt Chrome chuyển sang chế độ giả lập màn hình di động (iPhone 14 Pro Max 430px và iPad Mini 768px).
  2. Trình diễn mở Mobile Drawer Menu trên Cổng Khách hàng: Vuốt chạm mượt mà, toàn bộ nút bấm đáp ứng chuẩn Apple HIG (touch target >= 44x44px), thanh cuộn trang nền tự động khóa chống trượt giật.
  3. Mở Sơ đồ buồng phòng trên máy tính bảng: Thẻ phòng tự căn chỉnh dạng lưới linh hoạt, không bị tràn viền ngang (`overflow-x: hidden`).
  4. Tóm tắt kết quả nghiệm thu: 4 Sprint hoàn thành 100%, 0 lỗi kiểm thử, sẵn sàng bàn giao sản phẩm.
* **Lời kết thúc video:**
  > *"Trên đây là toàn bộ video trình diễn hệ thống website khách sạn Nitro Grand Hotel. Toàn bộ mã nguồn đã được đóng gói và kiểm định chất lượng nghiêm ngặt. Xin chân thành cảm ơn Thầy Cô và Hội đồng đã theo dõi."*
