# NITRO GRAND HOTEL — HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN 4 SAO TÍCH HỢP DASHBOARD DỮ LIỆU

> **Đồ Án Môn Học:** Quản Lý Dự Án CNTT  
> **Nhóm thực hiện:** Nhóm 7  
> **Sản phẩm:** Cổng thông tin khách hàng, Quy trình đặt phòng trực tuyến & Hệ thống quản trị khách sạn 4 sao Nitro Grand Hotel (24 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh).

---

## 📌 BÁO CÁO TIẾN ĐỘ THỰC HIỆN SPRINT 1 & SPRINT 2

Dự án đã hoàn thành **100% các tiêu chí và nhiệm vụ** trong **Sprint 1 (TASK-01 đến TASK-15)** và **Sprint 2 (TASK-16 đến TASK-30)** theo đúng tài liệu chuẩn `###CAC_BUOC_TAO_NEN_FRONTEND.md`.

### 🌟 SPRINT 1: NỀN TẢNG KIẾẾN TRÚC FRONTEND & HỆ THỐNG GIAO DIỆN CƠ BẢN (15/15 TASKS)
- [x] **TASK-01:** Khởi tạo dự án độc lập với Vite, React 19, TypeScript, Tailwind CSS, Lucide Icons, React Router v7.
- [x] **TASK-02:** Xây dựng Design System chuẩn 4 sao: Bảng màu sang trọng (Deep Navy `#0B1F3A`, Royal Blue `#1F5AA6`, Luxury Gold `#C9A227`, Slate Gray).
- [x] **TASK-03:** Khung giao diện Cổng Khách hàng (`CustomerLayout`): Topbar thông tin, Header Sticky mượt mà, Mobile Drawer vuốt chạm, Footer chuẩn nhận diện 4 sao.
- [x] **TASK-04:** Khung giao diện Cổng Quản trị & Nhân viên (`StaffLayout`): Sidebar đa cấp (Lễ tân, Quản lý, Admin), Header thông tin ca làm việc, Breadcrumbs động.
- [x] **TASK-05:** Cấu hình hệ thống Router & Kiểm soát phân quyền (`AppRouter`, `RoleRoute`, `ProtectedRoute`) cho 4 vai trò: `CUSTOMER`, `FRONT_DESK`, `MANAGER`, `ADMIN`.
- [x] **TASK-06:** Bộ thư viện thành phần nguyên tử Base UI (`Button`, `Input`, `Badge`, `StatusBadge`, `Tooltip`).
- [x] **TASK-07:** Bộ thư viện thành phần phản hồi & tương tác (`Toast`, `Modal`, `Drawer`, `StateViews`).
- [x] **TASK-08:** Bộ thư viện hiển thị dữ liệu (`StatCard`, `DataTable`).
- [x] **TASK-09:** Hệ thống định kiểu dữ liệu TypeScript chuẩn hóa (`types/index.ts`).
- [x] **TASK-10:** Tầng Mock Data & Fake API Engine mô phỏng nghiệp vụ thực tế (`mocks/data.ts`).
- [x] **TASK-11:** Tầng API Client & Service Modules (`services/api.ts`).
- [x] **TASK-12:** Quản lý State toàn cục ứng dụng (`context/AppContext.tsx`).
- [x] **TASK-13:** Tiện ích định dạng tiền tệ VND/USD, ngày tháng theo chuẩn quốc tế (`utils/format.ts`).
- [x] **TASK-14:** Động cơ Quốc tế hóa song ngữ hoàn chỉnh Tiếng Việt / Tiếng Anh (`i18n/index.ts`).
- [x] **TASK-15:** Màn hình kiểm định trực quan & Smoke Test liên tục (`SmokeTestPage.tsx`), xác nhận 0 lỗi biên dịch.

---

### 🚀 SPRINT 2: CỔNG KHÁCH HÀNG & QUY TRÌNH ĐẶT PHÒNG TRỰC TUYẾN (15/15 TASKS)
- [x] **TASK-16:** Trang chủ khách hàng cao cấp (`HomePage.tsx`): Hero banner tráng lệ, 4 giá trị cốt lõi, tiện ích đẳng cấp và đánh giá khách hàng thực tế.
- [x] **TASK-17:** Widget tìm kiếm phòng thông minh: `DateRangePicker` (chọn khoảng ngày, tính số đêm tự động) & `GuestCounter` (người lớn, trẻ em, số phòng).
- [x] **TASK-18:** Trang kết quả tìm kiếm phòng (`SearchResultsPage.tsx`): Bộ lọc đa tiêu chí (khoảng giá, hạng phòng, loại giường, tiện nghi, đánh giá sao, hủy miễn phí) và sắp xếp linh hoạt.
- [x] **TASK-19:** Thẻ phòng lưu trú tương tác (`RoomCard.tsx`): Carousel chuyển ảnh mượt mà, thông số kỹ thuật, huy hiệu ưu đãi, bóc tách giá đã gồm thuế phí.
- [x] **TASK-20:** Trang chi tiết phòng (`RoomDetailPage.tsx`): Thư viện ảnh Lightbox toàn màn hình, thông số, danh mục tiện nghi nhóm theo khu vực, chính sách nhận/trả phòng, sidebar giữ giá và phòng tương tự.
- [x] **TASK-21:** Bộ đếm thời gian giữ phòng 10 phút (`HoldCountdown.tsx` - PB-03): Đếm ngược thời gian thực, cảnh báo khẩn cấp khi dưới 2 phút, nút gia hạn +5 phút và QA Tool mô phỏng đếm 10 giây.
- [x] **TASK-22:** Xử lý xung đột đặt trùng phòng (`ConflictModal.tsx` - PB-04): Bắt mã lỗi 409 Conflict, tự động đề xuất 3 phòng thay thế tương đương còn trống.
- [x] **TASK-23:** Đặt phòng Bước 1 (`BookingStep1Page.tsx`): Nhập thông tin khách, gợi ý yêu cầu đặc biệt 1 chạm, áp dụng mã giảm giá voucher (`NITRO10`, `VIP4STAR`), chọn dịch vụ cộng thêm và bảng tóm tắt giá chi tiết.
- [x] **TASK-24:** Đặt phòng Bước 2 (`BookingStep2Page.tsx`): Cổng thanh toán trực tuyến (VNPay-QR, Thẻ quốc tế Visa/MasterCard 3D Secure, Ví MoMo, Ví ZaloPay), mã hóa SSL 256-bit.
- [x] **TASK-25:** Đặt phòng Bước 3 (`BookingStep3Page.tsx`): Biên nhận thành công, mã PNR chính thức, nút sao chép mã, mã QR Check-in siêu tốc tại sảnh và nút in xác nhận.
- [x] **TASK-26:** Lịch sử đặt phòng cá nhân (`MyBookingsPage.tsx`): 4 tab trạng thái (Sắp tới, Đang lưu trú, Đã hoàn thành, Đã hủy), tìm kiếm mã đơn và xem chi tiết.
- [x] **TASK-27:** Chi tiết đơn đặt phòng & Hủy phòng (`BookingDetailPage.tsx`): Tiến trình lưu trú 3 bước trực quan, bóc tách hóa đơn, in biên nhận và Modal hủy phòng tự động áp dụng bậc hoàn tiền (>48h: 100%, 24-48h: 50%, <24h: 0%).
- [x] **TASK-28:** Hồ sơ cá nhân khách hàng (`AccountProfilePage.tsx`): Cập nhật họ tên, email, số điện thoại, đổi mật khẩu bảo mật và theo dõi hạng thành viên VIP Silver.
- [x] **TASK-29:** Phân hệ xác thực (`LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`): Đăng nhập nhanh 4 vai trò kiểm thử, đăng ký tài khoản mới và quên mật khẩu.
- [x] **TASK-30:** Kiểm thử tích hợp luồng đặt phòng trọn vẹn E2E: Kết nối mạch lạc từ Tìm kiếm -> Chọn phòng -> Giữ phòng 10 phút -> Điền thông tin -> Thanh toán -> Nhận vé QR -> Quản lý trong Đơn đặt phòng của tôi.

---

## 🌐 HỆ THỐNG ĐA NGÔN NGỮ HOÀN HẢO (100% BILINGUAL VI / EN)
- Hỗ trợ chuyển đổi tức thì giữa **Tiếng Việt** và **Tiếng Anh** trên toàn bộ ứng dụng mà không cần tải lại trang.
- Đã được dịch hoàn thiện 100% cho mọi nhãn giao diện, thông báo lỗi, trạng thái thanh toán, mô tả dịch vụ và tên hạng phòng.
- Bộ từ điển cấu trúc hóa chặt chẽ tại `src/i18n/index.ts`.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG
- **Core Framework:** React 19, TypeScript 5.8
- **Build Tool:** Vite 8.3
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Internationalization:** i18next, react-i18next
- **Code Quality:** ESLint, TypeScript Strict Checking (`tsc --noEmit`)

---

## 💻 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các gói phụ thuộc (nếu chưa cài)
npm install

# 3. Khởi chạy máy chủ phát triển (Dev Server)
npm run dev

# 4. Kiểm tra lỗi kiểu dữ liệu TypeScript (0 lỗi)
npm run lint

# 5. Đóng gói sản phẩm môi trường Production
npm run build
```

---

## 🔑 TÀI KHOẢN MẪU KIỂM THỬ (Mật khẩu: `password123`)
| Vai trò | Email đăng nhập | Mô tả & Quyền hạn |
| :--- | :--- | :--- |
| **Khách hàng** | `khachhang@nitrohotel.vn` | Đặt phòng, quản lý đơn, xem mã QR, hủy phòng |
| **Lễ tân** | `letan@nitrohotel.vn` | Sơ đồ phòng, nhận/trả phòng, đặt phòng Walk-in |
| **Quản lý** | `quanly@nitrohotel.vn` | Báo cáo doanh thu, công suất phòng, quản lý dịch vụ |
| **Quản trị viên** | `admin@nitrohotel.vn` | Cấu hình hệ thống, phân quyền, xem nhật ký hoạt động |
