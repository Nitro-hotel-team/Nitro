# 🏨 NITRO GRAND HOTEL — DANH MỤC 27 ĐƯỜNG DẪN URL NGHIỆP VỤ & MA TRẬN PHÂN QUYỀN RBAC

Tài liệu chuẩn hóa toàn bộ 27 đường dẫn URL nghiệp vụ (Routes) trong hệ thống Frontend Nitro Grand Hotel, phân chia theo 3 phân hệ cốt lõi kèm ma trận kiểm soát truy cập phân quyền theo vai trò (Role-Based Access Control).

---

## 📊 BẢNG TỔNG HỢP MA TRẬN PHÂN QUYỀN (RBAC MATRIX)

| Ký hiệu | Tên vai trò | Quyền hạn & Phạm vi | Tài khoản thử nghiệm mẫu |
| :---: | :--- | :--- | :--- |
| **CUST / CUSTOMER** | **Customer (Khách hàng)** | Đặt phòng trực tuyến, quản lý lịch sử đơn đặt, hồ sơ cá nhân | `khachhang@nitrohotel.vn` / `password123` |
| **FD / FRONT_DESK** | **Front Desk (Lễ tân)** | Sơ đồ phòng, nhận/trả phòng nhanh, đặt phòng walk-in, giao ca | `letan@nitrohotel.vn` / `password123` |
| **MGR / MANAGER** | **Hotel Manager (Quản lý)** | Toàn quyền Lễ tân + Báo cáo doanh thu, quản lý danh mục phòng/dịch vụ, KPI | `quanly@nitrohotel.vn` / `password123` |
| **ADM / ADMIN** | **System Admin (Quản trị)** | Toàn quyền hệ thống + Quản lý phân quyền tài khoản, cấu hình tham số | `admin@nitrohotel.vn` / `password123` |

---

## 1. 🌐 PHÂN HỆ KHÁCH HÀNG (CUSTOMER PORTAL — 10 MÀN HÌNH)

Toàn bộ các trang thuộc phân hệ Khách hàng sử dụng chung khung bố cục [`CustomerLayout.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/layouts/CustomerLayout.tsx) tích hợp Header 4 sao, Mega Menu, Drawer di động và Footer chân trang.

| STT | Đường dẫn (URL) | Tên màn hình nghiệp vụ | Tệp Component nguồn | Quyền truy cập | Mô tả chức năng chính |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `/` | Trang chủ Khách sạn (Home) | [`HomePage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/HomePage.tsx) | Tất cả | Hero banner, DateRangePicker, GuestCounter, tiện ích 4 sao, ưu đãi nổi bật. |
| 2 | `/rooms` | Kết quả Tìm kiếm & Danh mục Phòng | [`SearchResultsPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/SearchResultsPage.tsx) | Tất cả | Bộ lọc đa chiều (giá, hạng phòng, tiện ích, loại giường), sắp xếp 5 tiêu chí. |
| 3 | `/rooms/:id` | Chi tiết Hạng phòng lưu trú | [`RoomDetailPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/RoomDetailPage.tsx) | Tất cả | Bento Grid ảnh, Lightbox, tiện nghi 4 nhóm, đánh giá 4.9★, bảng giá sticky. |
| 4 | `/booking/step-1` | Đặt phòng Bước 1: Thông tin & Dịch vụ | [`BookingStep1Page.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/BookingStep1Page.tsx) | CUST, FD, MGR, ADM | Đồng hồ giữ phòng 10p, dịch vụ gia tăng (+/-), voucher ưu đãi (NITRO10). |
| 5 | `/booking/step-2` | Đặt phòng Bước 2: Thanh toán & Xác thực | [`BookingStep2Page.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/BookingStep2Page.tsx) | CUST, FD, MGR, ADM | Form CCCD/ID, chọn 4 cổng (VNPay, MoMo, Card, ZaloPay), tạo đơn createBooking. |
| 6 | `/booking/payment-result`| Kết quả Giao dịch Cổng Thanh toán | [`PaymentResultPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/PaymentResultPage.tsx) | CUST, FD, MGR, ADM | Tiếp nhận phản hồi IPN/ReturnURL từ VNPay/MoMo, đối soát mã đơn. |
| 7 | `/booking/step-3` | Đặt phòng Bước 3: Hoàn tất & Mã PNR | [`BookingStep3Page.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/BookingStep3Page.tsx) | CUST, FD, MGR, ADM | Mã PNR duy nhất (BK-XXXXXX), sao chép 1 chạm, mã QR check-in, in xác nhận. |
| 8 | `/my-bookings` | Lịch sử Đơn đặt phòng | [`MyBookingsPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/MyBookingsPage.tsx) | CUST, FD, MGR, ADM | 4 tab trạng thái (Upcoming, In-House, Completed, Cancelled), tìm kiếm mã đơn. |
| 9 | `/my-bookings/:id` | Chi tiết Đơn đặt & Hủy phòng | [`BookingDetailPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/BookingDetailPage.tsx) | CUST, FD, MGR, ADM | Hóa đơn chi tiết, chính sách hoàn tiền 3 bậc (>48h: 100%, 24-48h: 50%, <24h: 0%). |
| 10 | `/profile` | Hồ sơ Cá nhân Khách hàng | [`AccountProfilePage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/customer/AccountProfilePage.tsx) | CUST, FD, MGR, ADM | Cập nhật thông tin định danh, đổi mật khẩu, thẻ hạng thành viên VIP Silver. |

---

## 2. 🔐 PHÂN HỆ XÁC THỰC & BẢO MẬT (AUTH PORTAL — 3 MÀN HÌNH)

| STT | Đường dẫn (URL) | Tên màn hình nghiệp vụ | Tệp Component nguồn | Quyền truy cập | Mô tả chức năng chính |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 11 | `/login` | Đăng nhập Hệ thống & Google OAuth | [`LoginPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/auth/LoginPage.tsx) | Tất cả | Đăng nhập Email/SĐT, Google Login, nút chọn nhanh 4 tài khoản demo, chống Open Redirect. |
| 12 | `/register` | Đăng ký Tài khoản Khách hàng mới | [`RegisterPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/auth/RegisterPage.tsx) | Tất cả | Kiểm tra mật khẩu an toàn, tự động tạo hồ sơ khách hàng mới hạng Bronze. |
| 13 | `/forgot-password` | Khôi phục & Cấp lại Mật khẩu | [`ForgotPasswordPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/auth/ForgotPasswordPage.tsx) | Tất cả | Gửi mã OTP xác thực qua email đăng ký, đặt lại mật khẩu an toàn. |

---

## 3. 🏢 PHÂN HỆ QUẢN TRỊ & NHÂN VIÊN (STAFF / PMS PORTAL — 14 MÀN HÌNH + QA HUB)

Sử dụng khung bố cục [`StaffLayout.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/layouts/StaffLayout.tsx) với Sidebar Dark Navy (`#0B1F3A`), thanh trạng thái ca trực và Route Guard chặn 403 Forbidden.

| STT | Đường dẫn (URL) | Tên màn hình nghiệp vụ | Tệp Component nguồn | Vai trò cho phép | Mô tả chức năng chính |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 14 | `/staff/overview` | Tổng quan Bàn giao Ca trực | [`ShiftOverviewPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/ShiftOverviewPage.tsx) | FD, MGR, ADM | Đếm khách In-house, dự kiến Check-in/Check-out, quỹ tiền mặt, ghi chú giao ca. |
| 15 | `/staff/room-board` | Ma trận Sơ đồ Buồng phòng | [`RoomBoardPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/RoomBoardPage.tsx) | FD, MGR, ADM | Lưới phòng phân tầng, Popover 1 chạm, đổi trạng thái Dọn phòng/Bảo trì/Sẵn sàng. |
| 16 | `/staff/timeline` | Lịch biểu Trục thời gian Đặt phòng | [`BookingTimelinePage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/BookingTimelinePage.tsx) | FD, MGR, ADM | Biểu đồ Gantt 7-14-30 ngày, kéo thả thời gian, kiểm soát tỷ lệ lấp đầy. |
| 17 | `/staff/bookings` | Sổ Đặt phòng & Danh sách Đơn | [`BookingsListPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/BookingsListPage.tsx) | FD, MGR, ADM | Tra cứu nhanh, lọc theo trạng thái, ngày lưu trú, xuất file danh sách. |
| 18 | `/staff/bookings/:id`| Chi tiết Đơn đặt phòng Quản trị | [`BookingDetailStaffPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/BookingDetailStaffPage.tsx) | FD, MGR, ADM | Check-in, Check-out, thanh toán tiền còn thiếu, in hóa đơn đỏ VAT. |
| 19 | `/staff/walk-in` | Đặt phòng Trực tiếp tại Quầy | [`WalkInBookingPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/WalkInBookingPage.tsx) | FD, MGR, ADM | Tiếp nhận khách vãng lai 3 bước: chọn phòng, thông tin CCCD, thu cọc tiền mặt/POS/QR. |
| 20 | `/staff/customers` | Quản lý Hồ sơ Khách hàng (CRM) | [`CustomersListPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/CustomersListPage.tsx) | FD, MGR, ADM | Danh bạ khách, phân hạng VIP (Bronze, Silver, Gold, Platinum), lịch sử chi tiêu. |
| 21 | `/staff/dashboard` | Dashboard Báo cáo Quản trị (KPI) | [`DashboardPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/DashboardPage.tsx) | MGR, ADM | Doanh thu, RevPAR, ADR, Occupancy Rate %, biểu đồ cột doanh thu 7 ngày qua Recharts. |
| 22 | `/staff/room-types` | Danh mục Hạng phòng Khách sạn | [`RoomTypesManagePage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/RoomTypesManagePage.tsx) | MGR, ADM | Thêm, sửa, đóng/mở bán hạng phòng, cấu hình giá niêm yết và số khách tối đa. |
| 23 | `/staff/rooms` | Quản lý Danh sách Buồng phòng | [`RoomsManagePage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/RoomsManagePage.tsx) | MGR, ADM | Quản lý 60 phòng khách sạn theo tầng, cập nhật tình trạng vật lý từng phòng. |
| 24 | `/staff/services` | Quản lý Dịch vụ Khách sạn | [`ServicesManagePage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/ServicesManagePage.tsx) | MGR, ADM | Bảng giá buffet, đưa đón, spa, giặt là, bật/tắt kích hoạt dịch vụ gia tăng. |
| 25 | `/staff/reports` | Báo cáo Tài chính & Doanh thu | [`ReportsPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/ReportsPage.tsx) | MGR, ADM | Báo cáo tài chính theo nguồn đặt (WEB, COUNTER, OTA), xuất file đối soát. |
| 26 | `/staff/users` | Quản trị Tài khoản & Phân quyền | [`UsersPermissionsPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/UsersPermissionsPage.tsx) | ADM | Phân quyền vai trò (Role Assignment), khóa tài khoản, cấp lại mật khẩu. |
| 27 | `/staff/settings` | Cấu hình Thông số Khách sạn | [`SystemSettingsPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/staff/SystemSettingsPage.tsx) | ADM | Giờ Check-in/Check-out tiêu chuẩn, thuế VAT (8%), phí dịch vụ (5%), chính sách hủy. |
| * | `/smoke-test` | Hub Kiểm thử Khói Tự động (QA) | [`SmokeTestPage.tsx`](file:///c:/Users/ASUS/Desktop/Mon_Dang_Hoc/Quan_Ly_Du_An_CNTT/DoAnMonHoc/Nitro_Hotel_Project/Nitro_Hotel/frontend/src/pages/SmokeTestPage.tsx) | Tất cả | Trung tâm đối soát 30 bài kiểm thử khói bản dựng dành cho QA và Hội đồng nghiệm thu. |

---

*Tài liệu được cập nhật tự động phục vụ hồ sơ nghiệm thu Đồ án Quản lý Dự án CNTT — Nhóm 7.*
