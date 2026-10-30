# 🏨 NITRO GRAND HOTEL — PHÂN HỆ FRONTEND WEB APPLICATION

Phân hệ Frontend độc lập của hệ thống quản lý và đặt phòng khách sạn 4 sao **Nitro Grand Hotel** (Nhóm 7 — Đồ án Quản lý Dự án Công nghệ Thông tin).

---

## 🌟 TỔNG QUAN HỆ THỐNG & KIẾN TRÚC KỸ THUẬT

Website Nitro Grand Hotel được thiết kế theo tiêu chuẩn khách sạn 4 sao quốc tế, phục vụ hai đối tượng người dùng chính:
1. **Cổng Khách Hàng (Customer Portal):** Trải nghiệm tìm kiếm, tham quan buồng phòng qua Bento Grid ảnh, quy trình đặt phòng 3 bước liền mạch (giữ phòng tạm thời 10 phút, chống xung đột phòng ảo, thanh toán đa cổng và chính sách hoàn tiền 3 bậc minh bạch).
2. **Cổng Quản Trị & Nghiệp Vụ Nhân Viên (Staff / PMS Portal):** Hệ thống quản lý khách sạn chuyên sâu (Sơ đồ buồng phòng phân tầng thời gian thực, Gantt Timeline, tiếp nhận khách vãng lai Walk-in, sổ giao ca, CRM khách hàng, Dashboard KPI tài chính và cấu hình hệ thống).

### 🛠️ Bộ Công Nghệ Cốt Lõi (Tech Stack)
* **Core Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict Mode, 100% Type-Safe).
* **Build Tool:** [Vite 8](https://vite.dev/) với Rolldown Bundler & Tree-shaking tối ưu hóa gói xuất xưởng.
* **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) với hệ màu sang trọng (Deep Navy `#0B1F3A`, Royal Blue `#1F5AA6`, Luxury Gold `#C9A227`).
* **Icons & Animation:** [Lucide React](https://lucide.dev/) (Icon vector trực quan) + [Motion](https://motion.dev/) (Vi hoạt ảnh mượt mà 60fps).
* **Quốc tế hóa (i18n):** [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/) (Hỗ trợ 100% song ngữ Tiếng Việt & English).
* **Data Visualization:** [Recharts](https://recharts.org/) (Biểu đồ doanh thu và phân tích hiệu suất phòng).
* **Kiến trúc Dữ liệu Dual-Mode:** Tự động kết nối Backend REST API thực tế, đồng thời có cơ chế Graceful Fallback sang In-Memory Mock Data giúp vận hành độc lập khi bảo vệ đồ án.

---

## 🗺️ BẢN ĐỒ TIẾN TRÌNH 4 SPRINT HOÀN THIỆN

Hệ thống được phát triển và hoàn thiện qua 4 Sprint chuẩn mô hình Agile/Scrum:

### 🔹 SPRINT 1: NỀN TẢNG KIẾN TRÚC & THÀNH PHẦN CƠ SỞ (TASK-01 ➔ TASK-15)
- Khởi tạo kiến trúc dự án, Color Palette, Base UI Primitives (`Button`, `Modal`, `Drawer`, `StatusBadge`, `StatCard`, `StateViews`).
- Quản lý trạng thái toàn cục `AppContext`, thư viện tiện ích `format.ts`, engine đa ngôn ngữ i18n và Hub kiểm thử khói `SmokeTestPage.tsx`.

### 🔹 SPRINT 2: CỔNG KHÁCH HÀNG & QUY TRÌNH ĐẶT PHÒNG 3 BƯỚC (TASK-16 ➔ TASK-30)
- Màn hình Trang chủ `HomePage`, bộ chọn ngày `DateRangePicker`, bộ đếm khách `GuestCounter`, trang tìm kiếm `SearchResultsPage`.
- Bento Grid ảnh phòng `RoomDetailPage`, đồng hồ đếm ngược giữ phòng 10 phút `HoldCountdown`, giải quyết xung đột phòng ảo `ConflictModal`.
- Quy trình đặt phòng 3 bước (`BookingStep1Page` ➔ `BookingStep2Page` ➔ `BookingStep3Page`), Lịch sử đơn `MyBookingsPage` và modal hủy hoàn tiền 3 bậc `BookingDetailPage`.

### 🔹 SPRINT 3: HỆ THỐNG QUẢN TRỊ KHÁCH SẠN STAFF / PMS (TASK-31 ➔ TASK-56)
- Bố cục Sidebar Dark Navy `StaffLayout` với thanh trạng thái ca trực, khóa cuộn trang di động và cơ chế phân quyền RBAC 4 vai trò.
- Ma trận buồng phòng phân tầng `RoomBoardPage` kèm menu thao tác 1 chạm Popover (đổi trạng thái dọn dẹp, nhận/trả phòng nhanh).
- Lịch biểu Gantt `BookingTimelinePage`, tiếp nhận khách vãng lai `WalkInBookingPage`, Sổ đặt phòng `BookingsListPage`.
- Quản lý khách hàng CRM `CustomersListPage`, Dashboard KPI `DashboardPage`, Báo cáo doanh thu `ReportsPage`, Quản lý tài khoản `UsersPermissionsPage` và Cấu hình thông số `SystemSettingsPage`.

### 🔹 SPRINT 4: TÍCH HỢP DUAL-MODE API, TỐI ƯU HÓA & ĐÓNG GÓI BÀN GIAO (TASK-57 ➔ TASK-67)
- **TASK-57 (`FE-S4-01`):** Hoàn thiện State toàn cục `AppContext` lưu bền vững `localStorage` & Bộ chuyển đổi nhanh vai trò `DemoSwitcher`.
- **TASK-58 (`FE-S4-02`):** Hiện thực hóa kiến trúc Dual-Mode API với 7 service modules cốt lõi (`api.ts`).
- **TASK-59 (`FE-S4-03`):** Tối ưu hóa Responsive đa thiết bị (Mobile Drawer chuẩn Apple HIG, Touch target >= 44px, chống tràn ngang).
- **TASK-60 (`FE-S4-04`):** Vi hoạt ảnh Motion 60fps, hệ thống Toast thông báo 4 loại (tự ẩn sau 3s) và Skeleton loading shimmer wave.
- **TASK-61 (`FE-S4-05`):** Kiểm thử đơn vị (Unit Test) cho các hàm tiện ích định dạng và logic tài chính hủy hoàn tiền 3 bậc (47 test cases).
- **TASK-62 (`FE-S4-06`):** Kiểm thử tích hợp E2E luồng khách hàng 7 màn hình xuyên suốt, sinh mã PNR độc nhất `BK-XXXXXX`.
- **TASK-63 (`FE-S4-07`):** Kiểm thử tương thích đa trình duyệt (Chrome, Edge, Firefox, Safari) & Rà soát an toàn thông tin (chống XSS, dọn sạch Console log).
- **TASK-64 (`FE-S4-08`):** Đo lường và tối ưu hiệu năng Google Lighthouse (Core Web Vitals FCP < 1.2s, LCP < 2.5s, CLS < 0.1, 4 điểm Xanh > 90).
- **TASK-65 (`FE-S4-09`):** Kiểm định bản dựng đóng gói Production Zero-Error (`dist/` bundle) và kiểm tra máy chủ preview cổng 4173.
- **TASK-66 (`FE-S4-10`):** Hoàn thiện bộ hồ sơ tài liệu kỹ thuật (`README.md`, `SYSTEM_URLS.md`, `DEPLOYMENT.md`, `.env.example`).
- **TASK-67 (`FE-S4-11`):** Kịch bản và tư liệu ghi hình Video Demo toàn diện website (Walkthrough Video Recording).

---

## ⚡ HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (ZERO TO RUNNING)

### 1. Yêu cầu môi trường
* Node.js phiên bản `18.x` trở lên (Khuyến nghị Node.js `20.x` hoặc `22.x`).
* NPM phiên bản `9.x` trở lên.

### 2. Cài đặt thư viện phụ thuộc
```bash
cd frontend
npm install
```

### 3. Thiết lập biến môi trường
Sao chép tệp mẫu sang `.env`:
```bash
cp .env.example .env
```

### 4. Khởi chạy máy chủ phát triển (Development)
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

---

## 📜 DANH MỤC LỆNH ĐIỀU HÀNH (NPM SCRIPTS)

| Câu lệnh (Command) | Chức năng & Mục đích sử dụng |
| :--- | :--- |
| `npm run dev` | Khởi chạy máy chủ phát triển Vite với Hot Module Replacement (cổng 3000). |
| `npm run build` | Đóng gói sản xuất ra thư mục `dist/` (tách nhỏ chunk vendor, nén CSS/JS). |
| `npm run preview` | Khởi chạy máy chủ xem trước bản dựng sản phẩm tại cổng 4173 (`http://localhost:4173`). |
| `npm run lint` | Chạy kiểm tra tĩnh toàn bộ mã nguồn TypeScript (`tsc --noEmit`), đảm bảo 0 lỗi type. |
| `npm run build:verify` | Chạy chuỗi kiểm định khép kín: kiểm tra type và build sản phẩm. |
| `npm run test:smoke` | Chạy bộ kiểm thử khói 30 tiêu chí nghiệm thu toàn hệ thống. |
| `npm run test:task-57` | Kiểm tra tự động tính năng AppContext và Demo Switcher RBAC. |
| `npm run test:task-58` | Kiểm tra tự động kiến trúc Dual-Mode API và 7 service modules. |
| `npm run test:task-59` | Kiểm tra tự động tối ưu Responsive Mobile & Touch target 44px. |
| `npm run test:task-60` | Kiểm tra tự động Toast thông báo, Skeleton loading và Micro-animations. |
| `npm run test:task-61` | Chạy bộ Unit Test hàm tiện ích định dạng và công thức tài chính hoàn hủy phòng. |
| `npm run test:task-62` | Kiểm thử tích hợp E2E luồng khách hàng đặt phòng 3 bước và sinh mã PNR. |
| `npm run test:task-63` | Kiểm tra tương thích đa trình duyệt, chống XSS và rà soát an toàn console log. |
| `npm run test:task-64` | Kiểm tra các chỉ số Core Web Vitals và tiêu chuẩn Google Lighthouse Audit. |
| `npm run test:task-65` | Kiểm định bản dựng đóng gói xuất xưởng `dist/` và HTTP probe máy chủ preview. |

---

## 📑 HỒ SƠ TÀI LIỆU KỸ THUẬT BỔ TRỢ
* 📖 [Danh mục 27 Đường dẫn Nghiệp vụ & Ma trận Phân quyền (SYSTEM_URLS.md)](./SYSTEM_URLS.md)
* 🚀 [Hướng dẫn Triển khai Docker, Nginx & Cloud Hosting (DEPLOYMENT.md)](./DEPLOYMENT.md)
* ⚙️ [Cấu hình Biến Môi trường Chi tiết (.env.example)](./.env.example)

---

*Nitro Grand Hotel Frontend — Phát triển bởi Nhóm 7 (Đồ án Quản lý Dự án Công nghệ Thông tin).*
