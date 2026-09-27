# NITRO GRAND HOTEL — FRONTEND WEB APPLICATION

Phân hệ Frontend độc lập của hệ thống khách sạn 4 sao **Nitro Grand Hotel** (Nhóm 7 — Đồ án Quản lý Dự án CNTT).

---

## 📋 DANH SÁCH NHIỆM VỤ ĐÃ HOÀN THÀNH

### SPRINT 1: NỀN TẢNG KIẾN TRÚC FRONTEND & THÀNH PHẦN CƠ BẢN
- **TASK-01:** Khởi tạo Project & Cấu hình Toolchain (Vite + React 19 + TypeScript + Tailwind CSS).
- **TASK-02:** Thiết lập Design System & Color Palette (Deep Navy `#0B1F3A`, Royal Blue `#1F5AA6`, Luxury Gold `#C9A227`).
- **TASK-03:** Xây dựng Layout Cổng Khách Hàng (`CustomerLayout.tsx`).
- **TASK-04:** Xây dựng Layout Cổng Nhân Viên & Quản Trị (`StaffLayout.tsx`).
- **TASK-05:** Hệ thống Router & Guards phân quyền (`AppRouter.tsx`, `RoleRoute.tsx`).
- **TASK-06:** Thành phần UI cơ bản (`Button`, `Input`, `Badge`, `StatusBadge`, `Tooltip`).
- **TASK-07:** Thành phần UI phản hồi (`Toast`, `Modal`, `Drawer`, `StateViews`).
- **TASK-08:** Thành phần dữ liệu (`StatCard`, `DataTable`).
- **TASK-09:** Tầng Type Definitions chuẩn hóa (`types/index.ts`).
- **TASK-10:** Tầng Mock Data & Fake API Engine (`mocks/data.ts`).
- **TASK-11:** Tầng API Client & Service Modules (`services/api.ts`).
- **TASK-12:** Quản lý State toàn cục (`context/AppContext.tsx`).
- **TASK-13:** Tiện ích tính toán & định dạng chuẩn hóa (`utils/format.ts`).
- **TASK-14:** Bộ máy Đa ngôn ngữ Quốc tế i18n (`i18n/index.ts` - 100% VI/EN).
- **TASK-15:** Kiểm thử khói & Tích hợp liên tục (`SmokeTestPage.tsx`).

### SPRINT 2: CỔNG KHÁCH HÀNG & QUY TRÌNH ĐẶT PHÒNG
- **TASK-16:** Trang chủ Khách hàng (`HomePage.tsx`).
- **TASK-17:** Widget tìm kiếm phòng (`DateRangePicker.tsx`, `GuestCounter.tsx`).
- **TASK-18:** Trang kết quả tìm kiếm phòng (`SearchResultsPage.tsx`).
- **TASK-19:** Thẻ phòng lưu trú tương tác (`RoomCard.tsx`).
- **TASK-20:** Trang chi tiết phòng (`RoomDetailPage.tsx`).
- **TASK-21:** Bộ đếm thời gian giữ phòng 10 phút (`HoldCountdown.tsx` - PB-03).
- **TASK-22:** Xử lý xung đột đặt phòng trùng (`ConflictModal.tsx` - PB-04).
- **TASK-23:** Đặt phòng Bước 1 - Thông tin khách & Dịch vụ (`BookingStep1Page.tsx`).
- **TASK-24:** Đặt phòng Bước 2 - Thanh toán & Cổng thanh toán (`BookingStep2Page.tsx`).
- **TASK-25:** Đặt phòng Bước 3 - Xác nhận & Mã QR (`BookingStep3Page.tsx`).
- **TASK-26:** Lịch sử đặt phòng của tôi (`MyBookingsPage.tsx`).
- **TASK-27:** Chi tiết đơn đặt phòng & Hủy phòng (`BookingDetailPage.tsx`).
- **TASK-28:** Hồ sơ cá nhân khách hàng (`AccountProfilePage.tsx`).
- **TASK-29:** Đăng nhập & Đăng ký tài khoản (`LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`).
- **TASK-30:** Kiểm thử tích hợp luồng đặt phòng trọn vẹn E2E.

---

## 🚀 LỆNH ĐIỀU HÀNH DỰ ÁN

```bash
# Cài đặt thư viện phụ thuộc
npm install

# Khởi chạy môi trường Dev
npm run dev

# Kiểm tra cú pháp & Type Check
npm run lint

# Tạo bản dựng Production
npm run build
```
