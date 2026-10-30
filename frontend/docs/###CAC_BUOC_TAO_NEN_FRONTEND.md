# 📋 CÁC BƯỚC TẠO NÊN FRONTEND - DỰ ÁN NITRO GRAND HOTEL
## TIẾN TRÌNH THỰC HIỆN TỪ CON SỐ 0 ĐẾN SẢN PHẨM HOÀN THIỆN (67 TASK / 4 SPRINT - SPRINT 3: 26 TASK & SPRINT 4: 11 TASK KÈM MINH CHỨNG CHI TIẾT)

> **Môn học:** Quản Lý Dự Án Công Nghệ Thông Tin  
> **Cơ cấu tổ chức nhóm:** Nhóm gồm đúng **5 Sinh viên** đảm nhận **5 Vai trò chính & nhiệm vụ phụ** khép kín toàn bộ vòng đời dự án (hoàn toàn không có bộ phận bên ngoài nào khác):
> 1. **Vai trò 1:** PM / Scrum Master kiêm Integration
> 2. **Vai trò 2:** BA / PO (Business Analyst / Product Owner)
> 3. **Vai trò 3:** UI-UX + Frontend *(Người thiết kế Figma, lập tài liệu `DESIGNSYSTEM COLOR TYPOGRAPHY.docx` và trực tiếp lập trình toàn bộ Frontend)*
> 4. **Vai trò 4:** Backend / API + DevOps
> 5. **Vai trò 5:** Database + QA / Tester  
>
> **Tiền đề phát triển Frontend:** Lộ trình này mô tả quá trình thành viên đảm nhiệm **UI-UX + Frontend** xây dựng mã nguồn từ thư mục trắng (zero code), bám sát các đầu vào đã chốt từ các thành viên trong nhóm: tài liệu nghiệp vụ SRS từ **BA/PO**, đặc tả REST API từ **Backend/API + DevOps**, thiết kế cơ sở dữ liệu từ **Database + QA/Tester**, cùng với bản thiết kế giao diện Figma và tài liệu [`DESIGNSYSTEM COLOR TYPOGRAPHY.docx`](./DESIGNSYSTEM%20COLOR%20TYPOGRAPHY.docx) do chính vai trò **UI-UX** chuẩn bị.

---

## 🧭 TỔNG QUAN LỘ TRÌNH 4 SPRINT CỦA VAI TRÒ UI-UX + FRONTEND

```
[ ĐẦU VÀO TỪ NHÓM: SRS (BA/PO) | FIGMA & DESIGN SYSTEM (UI-UX) | API SPEC (BACKEND) | ERD (DATABASE) ]
                                                │
                                                ▼  (PM/Scrum Master điều phối)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 1: THIẾT KẾ UI-UX, THIẾT LẬP KIẾN TRÚC & XÂY DỰNG NỀN TẢNG FRONTEND             │
│ (15 Task: Bóc tách SRS/API/ERD, Chuẩn hóa Design System tokens, Setup Tech Stack, Base)│
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 2: PHÁT TRIỂN PHÂN HỆ KHÁCH HÀNG (CUSTOMER PORTAL)                              │
│ (15 Task: Trang chủ, Lọc phòng, Chi tiết, Đặt phòng 3 bước, Giữ phòng, Hủy đơn, i18n)  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 3: PHÁT TRIỂN PHÂN HỆ QUẢN TRỊ & VẬN HÀNH KHÁCH SẠN (STAFF & PMS)               │
│ (26 Task Phân rã Jira: RBAC, Sơ đồ phòng, Walk-in, Timeline, Giao ca, CRM, KPI, Admin) │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 4: TÍCH HỢP DUAL-MODE API, TỐI ƯU HÓA, TEST TOÀN DIỆN, ĐÓNG GÓI & QUAY VIDEO    │
│ (11 Task Phân rã: Dual-Mode, Responsive, Unit/E2E Test, Lighthouse, Build, Demo Video) │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
[ SẢN PHẨM FRONTEND HOÀN THIỆN ĐẠT 100% TIÊU CHÍ NGHIỆM THU ĐỒ ÁN ]
```

---

## 🚀 SPRINT 1: THIẾT KẾ UI-UX, THIẾT LẬP KIẾN TRÚC & NỀN TẢNG FRONTEND
* **Mục tiêu:** Thành viên UI-UX + Frontend hoàn thiện tài liệu Design System, bóc tách yêu cầu từ BA/PO, Backend và Database; khởi tạo dự án trắng, cấu hình Tech Stack, dựng Base UI và Layouts.
* **Thời lượng giả định:** 2 tuần.

| Mã Task | Tên Công Việc | Phối Hợp Nội Bộ | Nội Dung Thực Hiện Chính (Ngắn gọn) | Kết Quả Đầu Ra (Deliverables) |
| :--- | :--- | :---: | :--- | :--- |
| **TASK-01** | Bóc tách yêu cầu từ Tài liệu BA/SRS | Với **BA/PO** | Đọc hiểu tài liệu nghiệp vụ (`Product_Backlog_Table.md`, User Stories) do BA/PO bàn giao; lập danh mục 27 màn hình và các trạng thái dữ liệu trên Frontend. | [Tài liệu Bóc tách Yêu cầu BA cho Frontend (TASK-01)](./PHAN_TICH_BOC_TACH_YEU_CAU_BA.md). |
| **TASK-02** | Khảo sát Đặc tả REST API | Với **Backend + DevOps** | Phân tích tài liệu `BACKEND_API_SPEC.md` do Backend cung cấp: khảo sát Endpoint, HTTP Methods, Params, Request Body và Response JSON. | [Bảng Ánh xạ API Contract Frontend - Backend (TASK-02)](./KHAO_SAT_DAC_TA_REST_API.md). |
| **TASK-03** | Chuẩn hóa Design System & Bảng màu | Vai trò **UI-UX** chủ trì | Hoàn thiện tài liệu [`DESIGNSYSTEM COLOR TYPOGRAPHY.docx`](./DESIGNSYSTEM%20COLOR%20TYPOGRAPHY.docx) và Figma: chốt bảng màu 4 sao (Navy, Gold, Slate), typography Inter, hệ thống lưới Grid. | File tài liệu `DESIGNSYSTEM COLOR TYPOGRAPHY.docx` & Figma. |
| **TASK-04** | Thống nhất Ngăn xếp Công nghệ | Với **PM** & **Backend** | Chốt Tech Stack: React 18/19, Vite (bundler siêu tốc), TypeScript (chặt chẽ kiểu dữ liệu), Tailwind CSS, React Router v6, Lucide Icons. | [Báo cáo Ngăn xếp Công nghệ Frontend (TASK-04)](./BAO_CAO_NGAN_XEP_CONG_NGHE_FRONTEND.md). |
| **TASK-05** | Khởi tạo Mã nguồn & Cấu trúc Thư mục | Với **PM/Scrum Master** | Dựng dự án Vite + TS; tổ chức thư mục module hóa: `/components`, `/pages`, `/layouts`, `/context`, `/services`, `/types`, `/utils`. | Repository Git ban đầu sạch chuẩn structure. |
| **TASK-06** | Cấu hình Môi trường & Quy chuẩn Code | Với **Backend + DevOps** | Cấu hình `tsconfig.json` chế độ strict, thiết lập ESLint kiểm tra lỗi, cấu hình biến môi trường mẫu trong `.env.example`. | [Tài liệu Quy chuẩn Code Frontend](./QUY_CHUAN_CODE_FRONTEND.md) & [Báo cáo Môi trường (TASK-06)](./QUY_CHUAN_CODE_VA_CAU_HINH_MOI_TRUONG.md). |
| **TASK-07** | Khởi tạo Tailwind CSS & Style Tokens | Vai trò **UI-UX** chủ trì | Ánh xạ toàn bộ mã màu, font chữ, box-shadow từ tài liệu `DESIGNSYSTEM COLOR TYPOGRAPHY.docx` vào cấu hình Tailwind và `src/index.css`. | Hệ thống CSS toàn cục `src/index.css` sẵn sàng sử dụng. |
| **TASK-08** | Định nghĩa Kiểu dữ liệu tĩnh (Types) | Với **Database + QA** | Viết TypeScript DTOs ánh xạ 100% từ Database Schema: `Room`, `RoomType`, `Booking`, `Customer`, `StaffUser`, `Shift`, `SystemSetting`. | [Báo cáo Định nghĩa Kiểu Dữ liệu Tĩnh (TASK-08)](./DINH_NGHIA_KIEU_DU_LIEU_TINH.md) & [src/types/index.ts](../../Nitro_Hotel/frontend/src/types/index.ts). |
| **TASK-09** | Xây dựng Khung API Service & Mock Data | Với **Database + QA** | Tạo bộ khung API client (`src/services/api.ts`) và nạp tập dữ liệu mẫu ban đầu từ thành viên Database vào `src/mocks/data.ts`. | [Báo cáo Khung API Service & Mock Data (TASK-09)](./KHUNG_API_SERVICE_VA_MOCK_DATA.md) & [`src/services/api.ts`](../../Nitro_Hotel/frontend/src/services/api.ts). |
| **TASK-10** | Cấu hình Bộ khung Điều hướng Routing | Với **PM/Integration** | Cài đặt `react-router-dom`, tạo bộ khung routes ban đầu cho Customer (`/`, `/rooms`), Auth (`/login`), Staff (`/staff/board`, `/staff/overview`). | [Báo cáo Cấu hình Bộ khung Routing (TASK-10)](./CAU_HINH_BO_KHUNG_ROUTING.md) & [`src/App.tsx`](../../Nitro_Hotel/frontend/src/App.tsx). |
| **TASK-11** | Xây dựng Thư viện Thành phần Cơ sở | Tự thực hiện | Lập trình các thành phần nguyên tử theo Design System: `Button.tsx`, `Modal.tsx`, `Drawer.tsx`, `StatusBadge.tsx`, `StatCard.tsx`, `StateViews.tsx`. | [Báo cáo Thư viện Thành phần Cơ sở (TASK-11)](./THU_VIEN_THANH_PHAN_CO_SO_BASE_UI.md) & [`src/components/common/`](../../Nitro_Hotel/frontend/src/components/common/). |
| **TASK-12** | Xây dựng Bố cục Khung Khách hàng | Tự thực hiện | Hiện thực `src/layouts/CustomerLayout.tsx`: Header với thanh điều hướng, nút chuyển đổi ngôn ngữ, giỏ phòng và Footer thương hiệu. | [Báo cáo Bố cục Khung Khách hàng (TASK-12)](./BO_CUC_KHUNG_KHACH_HANG_CUSTOMER_LAYOUT.md) & [`src/layouts/CustomerLayout.tsx`](../../Nitro_Hotel/frontend/src/layouts/CustomerLayout.tsx). |
| **TASK-13** | Xây dựng Bố cục Khung Quản trị Staff | Tự thực hiện | Hiện thực `src/layouts/StaffLayout.tsx`: Sidebar điều hướng 15 chức năng nghiệp vụ, Topbar hiển thị ca trực, trạng thái kết nối & nhân sự. | [Báo cáo Bố cục Khung Quản trị Staff (TASK-13)](./BO_CUC_KHUNG_QUAN_TRI_STAFF_LAYOUT.md) & [`src/layouts/StaffLayout.tsx`](../../Nitro_Hotel/frontend/src/layouts/StaffLayout.tsx). |
| **TASK-14** | Thiết lập Hệ thống Đa ngôn ngữ (i18n) | Với **BA/PO** | Cài đặt `i18next`, `react-i18next`; tạo file từ điển mẫu song ngữ Tiếng Việt và Tiếng Anh trong `src/i18n/index.ts` theo thuật ngữ BA/PO duyệt. | File `src/i18n/index.ts` hỗ trợ chuyển ngữ mượt mà. |
| **TASK-15** | Kiểm định Tính toàn vẹn Bản dựng (Compile/Build) & Kiểm thử Khói Khung Giao diện (Smoke Test) | Với **Database + QA** | Chạy kiểm tra biên dịch tĩnh `tsc --noEmit` (0 lỗi type); chạy thử nghiệm đóng gói `npm run build` (kiểm tra pipeline Vite); cùng thành viên QA kiểm thử khói (Smoke Test) render các Base UI và 2 khung Layouts trên trình duyệt, bảo đảm Console sạch 100%. | Biên bản kiểm thử khói (Smoke Test Report) & Chứng nhận bản dựng hợp lệ (Zero Compile Errors). |

---

## 🛎️ SPRINT 2: PHÁT TRIỂN PHÂN HỆ KHÁCH HÀNG (CUSTOMER PORTAL)
* **Mục tiêu:** Hiện thực trọn vẹn trải nghiệm khách lưu trú dựa trên bản vẽ Figma/Design System của chính mình, bám sát nghiệp vụ của BA/PO và dữ liệu mẫu của Database/QA.
* **Thời lượng giả định:** 2 tuần.

| Mã Task | Tên Công Việc | Phối Hợp Nội Bộ | Nội Dung Thực Hiện Chính (Ngắn gọn) | Kết Quả Đầu Ra (Deliverables) |
| :--- | :--- | :---: | :--- | :--- |
| **TASK-16** | Xây dựng Trang chủ Khách hàng | Tự thực hiện | Hiện thực `src/pages/customer/HomePage.tsx`: Hero Banner sang trọng, thanh tìm kiếm nhanh, khối phòng tiêu biểu, tiện ích khách sạn (bể bơi, spa). | Màn hình `HomePage.tsx` trực quan, thẩm mỹ cao. |
| **TASK-17** | Phát triển Bộ Chọn Ngày & Đếm Khách | Tự thực hiện | Xây dựng `DateRangePicker.tsx` chọn khoảng ngày nhận/trả và `GuestCounter.tsx` chọn số lượng người lớn, trẻ em, em bé. | [Báo cáo Bộ Chọn Ngày & Đếm Khách (TASK-17)](./PHAT_TRIEN_BO_CHON_NGAY_VA_DEM_KHACH_TASK_17.md) & [`src/components/common/`](../../Nitro_Hotel/frontend/src/components/common/). |
| **TASK-18** | Trang Kết quả Tìm kiếm & Thẻ Phòng | Tự thực hiện | Hiện thực `SearchResultsPage.tsx` và `RoomCard.tsx` hiển thị giá, sức chứa, tag tiện ích; logic sắp xếp giá thấp/cao và đánh giá sao. | [Báo cáo Trang Kết quả Tìm kiếm & Thẻ Phòng (TASK-18)](./TRANG_KET_QUA_TIM_KIEM_VA_THE_PHONG_TASK_18.md) & [`src/pages/customer/SearchResultsPage.tsx`](../../Nitro_Hotel/frontend/src/pages/customer/SearchResultsPage.tsx). |
| **TASK-19** | Xây dựng Trang Chi tiết Hạng phòng | Tự thực hiện | Hiện thực `src/pages/customer/RoomDetailPage.tsx`: Slider ảnh phòng, diện tích, tiện nghi đầy đủ, quy định nhận/trả và chính sách hủy. | Màn hình `RoomDetailPage.tsx` thông tin chi tiết. |
| **TASK-20** | Bước 1 Đặt phòng: Dịch vụ Cộng thêm | Với **BA/PO** | Hiện thực `src/pages/customer/BookingStep1Page.tsx`: Xác nhận lưu trú, chọn dịch vụ đưa đón, ăn sáng, spa; áp dụng đúng công thức phụ phí từ BA/PO. | Màn hình `BookingStep1Page.tsx` tính toán chính xác. |
| **TASK-21** | Bộ Đếm Giữ Phòng & Modal Xung Đột | Với **BA/PO** | Lập trình `HoldCountdown.tsx` đếm ngược 10 phút giữ phòng và `ConflictModal.tsx` cảnh báo khi phòng hết hạn giữ hoặc bị trùng lặp theo quy định BA/PO. | Cơ chế đếm ngược chống xung đột đặt phòng. |
| **TASK-22** | Bước 2 Đặt phòng: Thông tin Người đặt | Tự thực hiện | Hiện thực `src/pages/customer/BookingStep2Page.tsx`: Form nhập Họ tên, SĐT, Email, Yêu cầu đặc biệt; validate dữ liệu chặt chẽ. | Màn hình `BookingStep2Page.tsx` validate form chuẩn xác. |
| **TASK-23** | Bước 3 Đặt phòng: Thanh toán Giả lập | Tự thực hiện | Hiện thực `src/pages/customer/BookingStep3Page.tsx`: Giao diện thanh toán mô phỏng Thẻ tín dụng quốc tế, Chuyển khoản QR ngân hàng, Ví MoMo/VNPay. | Màn hình `BookingStep3Page.tsx` xử lý thanh toán trực quan. |
| **TASK-24** | Trang Xác nhận Đặt phòng Thành công | Tự thực hiện | Hiện thực `src/pages/customer/BookingDetailPage.tsx`: Cấp Mã đặt phòng duy nhất (`BK-XXXX`), mã QR check-in, hóa đơn chi phí và nút in/tải hóa đơn. | Màn hình `BookingDetailPage.tsx` phía khách hàng. |
| **TASK-25** | Trang Lịch sử Đặt phòng (My Bookings) | Tự thực hiện | Hiện thực `src/pages/customer/MyBookingsPage.tsx`: Tra cứu danh sách các đơn đã đặt theo trạng thái (Chờ xác nhận, Đã xác nhận, Đã hủy). | Màn hình `MyBookingsPage.tsx` tra cứu tiện lợi. |
| **TASK-26** | Chức năng Hủy phòng & Hoàn tiền | Với **BA/PO** | Xây dựng Modal xác nhận hủy phòng; áp dụng đúng công thức hoàn tiền từ BA/PO (>48h hoàn 100%, 24-48h hoàn 50%, <24h không hoàn tiền). | Modal hủy đơn hiển thị số tiền hoàn trả rõ ràng. |
| **TASK-27** | Trang Hồ sơ Khách hàng (Profile) | Tự thực hiện | Hiện thực `src/pages/customer/AccountProfilePage.tsx`: Xem và chỉnh sửa thông tin liên hệ cá nhân, cập nhật số điện thoại định danh và đổi mật khẩu. | Màn hình `AccountProfilePage.tsx` quản lý thông tin. |
| **TASK-28** | Đa ngôn ngữ (i18n) Phân hệ Khách hàng | Với **BA/PO** | Ánh xạ 100% từ ngữ Tiếng Việt và Tiếng Anh (`src/i18n/index.ts`) cho toàn bộ nhãn, nút bấm, thông báo đặt phòng của phân hệ khách hàng. | Chuyển đổi ngôn ngữ VI/EN tức thời trên Portal. |
| **TASK-29** | Chuẩn hóa Mock Data Khách hàng | Với **Database + QA** | Tiếp nhận bộ dữ liệu mẫu 4 sao từ thành viên Database: 12 hạng phòng phong phú ảnh thực tế, tiện ích, giá tiền để nạp vào `src/mocks/data.ts`. | Dữ liệu mô phỏng `src/mocks/data.ts` chuẩn xác. |
| **TASK-30** | Kiểm thử Chức năng Phân hệ Khách hàng | Với **Database + QA** | Phối hợp với thành viên QA/Tester kiểm thử toàn diện: Luồng tìm kiếm -> Lọc phòng -> Đặt 3 bước -> Giữ phòng hết giờ -> Hủy đơn kiểm tra phí. | [Báo cáo Kiểm thử Phân hệ Khách hàng (TASK-30)](./BAO_CAO_KIEM_THU_PHAN_HE_KHACH_HANG_TASK_30.md) & [Bộ Test Script](../../Nitro_Hotel/frontend/scripts/smoke-test.ts). |

---

## 📊 SPRINT 3: PHÁT TRIỂN PHÂN HỆ QUẢN TRỊ & VẬN HÀNH (STAFF & PMS) - 26 TASK PHÂN RÃ JIRA
* **Mục tiêu:** Xây dựng toàn diện công cụ cho Lễ tân (`FRONT_DESK`), Quản lý (`MANAGER`) và Quản trị viên (`ADMIN`) điều hành khách sạn theo đúng đặc tả phân quyền RBAC của BA/PO và API của Backend: Sơ đồ buồng phòng, Đặt tại quầy, Timeline, Giao ca, Cài đặt và Báo cáo KPI.
* **Thời lượng giả định:** 2 tuần.
* **Quy chuẩn thực hiện trên Jira:** Sprint 3 được phân rã chi tiết thành đúng **26 Task** độc lập (`FE-S3-01` đến `FE-S3-26`, tương ứng thứ tự `TASK-31` đến `TASK-56` của phân hệ Staff). Mỗi task đều có **Tiêu Chí Hoàn Thành (Acceptance Criteria / Definition of Done)** và **Chỉ Dẫn Chụp Minh Chứng (Evidence & Screenshot Guide)** cụ thể để thành viên Frontend dễ dàng thực hiện, chụp ảnh nghiệm thu và cập nhật trạng thái `Done` trên Jira cho cả nhóm đối soát.

### 📋 BẢNG TỔNG QUAN 26 TASK SPRINT 3 TRÊN JIRA

| Mã Task | Mã Jira | Tên Công Việc (Jira Summary) | Phối Hợp Nội Bộ | Nội Dung Thực Hiện Chính (Ngắn gọn) | Kết Quả Đầu Ra (Deliverables) |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **TASK-31** | `FE-S3-01` | Thiết lập Ma trận Phân quyền Vai trò RBAC Core | Với **BA/PO** & **Backend** | Khởi tạo kiểu dữ liệu `UserRole` (`CUSTOMER`, `FRONT_DESK`, `MANAGER`, `ADMIN`), logic lưu trữ phiên làm việc `localStorage` và `AppContext`. | State phân quyền toàn cục nhất quán. |
| **TASK-32** | `FE-S3-02` | Xây dựng Bộ Bảo vệ Định tuyến & Màn hình 403 | Tự thực hiện | Lập trình component bảo vệ route nội bộ `/staff/*`; chặn vai trò không hợp lệ và hiển thị giao diện từ chối truy cập 403 Forbidden. | Tuyến đường `/staff/*` được bảo vệ an toàn. |
| **TASK-33** | `FE-S3-03` | Xây dựng Khung Sidebar Quản trị & Menu Động | Tự thực hiện | Hiện thực Sidebar trong `StaffLayout.tsx`: Hỗ trợ Collapse/Expand, Drawer trên Mobile/Tablet và lọc danh mục menu tự động theo vai trò. | Sidebar quản trị chuyên nghiệp chuẩn 4 sao. |
| **TASK-34** | `FE-S3-04` | Xây dựng Thanh Topbar & Tra cứu Nhanh PNR | Tự thực hiện | Thanh Topbar hiển thị ca trực, avatar nhân sự, ô tìm kiếm nhanh mã PNR/khách, chuông thông báo ca và shortcut nút CTA "+ Walk-in". | Thanh điều khiển Topbar hoạt động trực quan. |
| **TASK-35** | `FE-S3-05` | Thiết kế Thẻ Buồng phòng & Thanh Thống kê PMS | Với **Database + QA** | Xây dựng thanh StatCard tổng quan buồng phòng (Tổng 60, Trống, Đang ở, Chờ dọn, Bảo trì) kèm bộ lọc bấm 1 chạm theo trạng thái. | Thanh thống kê và màu sắc buồng phòng chuẩn. |
| **TASK-36** | `FE-S3-06` | Xây dựng Ma trận Sơ đồ Phòng theo Tầng | Tự thực hiện | Hiện thực lưới buồng phòng trong `RoomBoardPage.tsx` chia theo Tầng 1 đến Tầng 10; hiển thị số phòng, loại phòng, tên khách đang lưu trú. | Màn hình ma trận phòng phân tầng trực quan. |
| **TASK-37** | `FE-S3-07` | Xây dựng Popover Thao tác & Đổi Trạng thái Dọn phòng | Với **BA/PO** | Menu popover khi click vào thẻ phòng: Chuyển nhanh phòng Chờ dọn (`CLEANING`) sang Sạch sẵn sàng đón khách (`AVAILABLE`) hoặc Bảo trì. | Menu thao tác 1 chạm cập nhật trạng thái phòng. |
| **TASK-38** | `FE-S3-08` | Xây dựng Thao tác Check-in & Check-out từ Sơ đồ Phòng | Với **BA/PO** & **Database** | Tích hợp modal Nhận phòng (đối với phòng `RESERVED`) và Trả phòng thanh toán (đối với phòng `OCCUPIED`) trực tiếp từ thẻ phòng. | Thao tác đón/trả khách nhanh cho Lễ tân. |
| **TASK-39** | `FE-S3-09` | Giao diện Chọn Phòng & Ngày Lưu trú Walk-in | Tự thực hiện | Hiện thực bước 1 đặt phòng tại quầy (`WalkInBookingPage.tsx`): Chọn ngày check-in/out, số đêm và chọn nhanh phòng trống sẵn có. | Giao diện chọn phòng vãng lai tại quầy. |
| **TASK-40** | `FE-S3-10` | Biểu mẫu Hồ sơ Khách & Tạm ứng Tiền cọc Walk-in | Với **BA/PO** | Form nhập Họ tên, số CCCD/Hộ chiếu, SĐT, Email; bộ tính toán tổng chi phí lưu trú, tiền cọc và phương thức thanh toán tại quầy. | Form tiếp nhận khách và tính cọc chuẩn xác. |
| **TASK-41** | `FE-S3-11` | Cấp Mã Đặt phòng & Check-in Tức thì tại Quầy | Với **Database + QA** | Xử lý sinh mã `WK-XXXXXX`, cập nhật phòng sang `OCCUPIED`, lưu đơn vào hệ thống và hiển thị phiếu xác nhận nhận phòng thành công. | Luồng Walk-in khép kín chuyển đổi trạng thái phòng. |
| **TASK-42** | `FE-S3-12` | Xây dựng Biểu đồ Dòng thời gian Đặt phòng (Timeline) | Tự thực hiện | Hiện thực `BookingTimelinePage.tsx`: Biểu đồ Gantt theo dõi tình trạng kín phòng của 60 phòng theo trục thời gian các ngày trong tuần. | Màn hình Timeline trực quan hóa công suất phòng. |
| **TASK-43** | `FE-S3-13` | Bảng Danh sách Đơn Đặt phòng & Bộ lọc Nâng cao | Tự thực hiện | Hiện thực `BookingsListPage.tsx`: Bảng quản lý đơn hàng nội bộ, phân trang, lọc theo trạng thái đơn và tìm kiếm mã đơn PNR / khách. | Màn hình quản lý danh sách đặt phòng toàn diện. |
| **TASK-44** | `FE-S3-14` | Màn hình Chi tiết Đơn Đặt phòng Phía Nhân viên | Với **BA/PO** | Hiện thực `BookingDetailStaffPage.tsx`: Xem chi tiết hồ sơ lưu trú, nguồn đặt (Web/Mobile/OTA/Quầy), bảng kê chi phí phòng và lịch sử. | Màn hình chi tiết Folio đặt phòng nội bộ. |
| **TASK-45** | `FE-S3-15` | Chức năng Cộng thêm Dịch vụ & In Biên lai Hóa đơn | Với **BA/PO** | Modal thêm dịch vụ (F&B, Minibar, Giặt là, Spa) vào hóa đơn phòng; nút kích hoạt lệnh in (`window.print()`) biên lai chuyên nghiệp. | Tính năng thêm phụ phí và in hóa đơn hoàn chỉnh. |
| **TASK-46** | `FE-S3-16` | Bảng Thống kê & Doanh thu Trong ca Trực Lễ tân | Với **BA/PO** | Hiện thực `ShiftOverviewPage.tsx`: Theo dõi doanh thu tiền mặt, chuyển khoản QR, số lượng phòng check-in/out thực tế trong ca trực. | Bảng theo dõi số liệu ca trực minh bạch. |
| **TASK-47** | `FE-S3-17` | Sổ Giao ban Lễ tân & Modal Kết thúc Ca trực | Với **BA/PO** | Khu vực ghi chú bàn giao công việc ca sau và Modal đóng ca trực: Kiểm đếm tiền mặt thực tế trong két, đối soát chênh lệch với hệ thống. | Quy trình kết thúc ca và giao ban chặt chẽ. |
| **TASK-48** | `FE-S3-18` | Phân hệ Quản lý Khách hàng CRM & Hồ sơ Lưu trú | Tự thực hiện | Hiện thực `CustomersListPage.tsx`: Quản lý danh sách khách hàng, tổng chi tiêu, số lần lưu trú, gắn nhãn hội viên VIP và xem sở thích. | Màn hình CRM khách lưu trú khách sạn 4 sao. |
| **TASK-49** | `FE-S3-19` | Phân hệ Quản lý Danh mục Hạng phòng (Room Types) | Với **Database + QA** | Hiện thực `RoomTypesManagePage.tsx`: Bảng danh mục 6 hạng phòng, modal chỉnh sửa tên, giá niêm yết, diện tích, sức chứa và ảnh. | Màn hình CRUD danh mục hạng phòng khách sạn. |
| **TASK-50** | `FE-S3-20` | Phân hệ Quản trị Danh sách Phòng Vật lý | Với **Database + QA** | Hiện thực `RoomsManagePage.tsx`: Quản lý 60 phòng vật lý theo tầng, lọc theo hạng phòng, modal thêm phòng mới và chuyển trạng thái bảo trì. | Màn hình quản lý kho phòng vật lý của khách sạn. |
| **TASK-51** | `FE-S3-21` | Phân hệ Quản lý Menu & Bảng giá Dịch vụ | Tự thực hiện | Hiện thực `ServicesManagePage.tsx`: Bảng danh mục dịch vụ F&B, Minibar, Spa; công tắc kích hoạt/tạm dừng và modal cập nhật đơn giá. | Màn hình quản lý bảng giá dịch vụ gia tăng. |
| **TASK-52** | `FE-S3-22` | Bảng Điều khiển KPI Quản trị Khách sạn (Dashboard) | Với **BA/PO** | Hiện thực `DashboardPage.tsx`: Thống kê công suất phòng hôm nay, doanh thu tích lũy, danh sách khách đến (Arrivals) và đi (Departures). | Dashboard tổng quan dành riêng cho Quản lý. |
| **TASK-53** | `FE-S3-23` | Báo cáo Doanh thu & Phân tích Biểu đồ Recharts | Với **BA/PO** | Hiện thực `ReportsPage.tsx`: Tích hợp Recharts biểu diễn xu hướng doanh thu theo ngày, cơ cấu thu theo hạng phòng và bộ lọc ngày. | Màn hình báo cáo phân tích tài chính trực quan. |
| **TASK-54** | `FE-S3-24` | Phân hệ Quản lý Tài khoản & Phân quyền Nhân sự | Với **BA/PO** & **Backend** | Hiện thực `UsersPermissionsPage.tsx`: Danh sách nhân viên, modal tạo tài khoản mới, phân vai trò (`FRONT_DESK`/`MANAGER`/`ADMIN`), khóa tài khoản. | Màn hình bảo mật quản trị nhân sự nội bộ. |
| **TASK-55** | `FE-S3-25` | Cài đặt Cấu hình Khách sạn & Nhật ký Audit Logs | Với **Backend + DevOps** | Hiện thực `SystemSettingsPage.tsx` (giờ check-in/out, thuế VAT) và `AuditLogsPage.tsx` (nhật ký ghi vết thao tác sửa giá, đổi phòng). | Bộ đôi màn hình cấu hình và giám sát hệ thống. |
| **TASK-56** | `FE-S3-26` | Kiểm thử Tích hợp E2E Nghiệp vụ Vận hành Sprint 3 | Với **Database + QA** & **PM** | Phối hợp QA chạy kịch bản liên hoàn: Mở ca -> Sơ đồ phòng -> Walk-in -> Check-in/out -> Đóng ca -> Kiểm tra Dashboard & Audit Log. | Biên bản nghiệm thu luồng nghiệp vụ Sprint 3 đạt chuẩn. |

---

### 📑 HƯỚNG DẪN CHI TIẾT 26 TASK SPRINT 3: TIÊU CHÍ HOÀN THÀNH & LẤY MINH CHỨNG JIRA

---

#### 🔹 TASK-31 (Mã Jira: `FE-S3-01`) — Thiết lập Ma trận Phân quyền Vai trò RBAC Core
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** (duyệt ma trận quyền hạn) và **Backend** (khớp chuẩn định danh vai trò).
* **Mô tả công việc:** Cấu hình hệ thống kiểm soát truy cập dựa trên vai trò (RBAC) tại tầng giao diện Frontend. Khởi tạo kiểu dữ liệu `UserRole` với 4 vai trò độc lập: `CUSTOMER` (Khách đặt phòng), `FRONT_DESK` (Nhân viên lễ tân), `MANAGER` (Quản lý khách sạn), `ADMIN` (Quản trị viên hệ thống); xây dựng cơ chế lưu trữ phiên làm việc bền vững qua `localStorage` trong `AppContext.tsx`.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Trong file `src/types/index.ts` có định nghĩa enum/type `UserRole` gồm đúng 4 giá trị: `'CUSTOMER' | 'FRONT_DESK' | 'MANAGER' | 'ADMIN'`.
  2. `src/context/AppContext.tsx` quản lý state `role` và `currentUser`, tự động đọc/ghi `nitro_user_role` từ `localStorage`.
  3. Cung cấp hàm chuyển đổi vai trò `setRole()` hoạt động trơn tru không gây crash ứng dụng.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** Bất kỳ trang nào (ví dụ `http://localhost:5173/`).
  * **Các bước thao tác:** Mở trình duyệt -> Nhấn `F12` -> Chọn tab **Console** -> Gõ lệnh `localStorage.getItem('nitro_user_role')` để kiểm tra giá trị vai trò hiện tại. Hoặc mở tab **Application** -> **Local Storage** -> chọn `http://localhost:5173`.
  * **Vùng chụp ảnh màn hình:** Chụp rõ màn hình chứa đoạn mã định nghĩa `UserRole` trong `src/types/index.ts` và cửa sổ Console/Application của DevTools đang hiển thị key `nitro_user_role`.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-01: Định nghĩa chuẩn 4 vai trò RBAC trong `src/types/index.ts`, tích hợp lưu trữ phiên `localStorage` qua `AppContext.tsx`. Dữ liệu role được duy trì chính xác khi F5 tải lại trang."*

---

#### 🔹 TASK-32 (Mã Jira: `FE-S3-02`) — Xây dựng Bộ Bảo vệ Định tuyến & Màn hình 403 Forbidden
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Xây dựng cơ chế bảo vệ định tuyến (Route Guard) nhằm ngăn chặn truy cập trái phép vào các tuyến đường quản trị `/staff/*`. Khi người dùng chưa đăng nhập hoặc không đủ thẩm quyền (ví dụ vai trò `CUSTOMER` cố tình gõ URL nội bộ của khách sạn), hệ thống phải chặn lại và hiển thị giao diện thông báo lỗi 403 Forbidden trang nhã.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Khi đang ở vai trò `CUSTOMER`, nếu người dùng truy cập bất kỳ đường dẫn `/staff/*`, hệ thống ngăn không cho hiển thị nội dung trang quản trị.
  2. Hiển thị màn hình từ chối quyền truy cập (403 Forbidden) có biểu tượng cảnh báo bảo mật, thông báo giải thích rõ ràng và nút bấm CTA *"Về Trang Chủ"* hoặc *"Đăng nhập tài khoản quản trị"*.
  3. Nếu có quyền hợp lệ (`FRONT_DESK`, `MANAGER`, `ADMIN`), trang đích được kết xuất bình thường.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/room-board`
  * **Tài khoản / Vai trò:** Thiết lập vai trò là `CUSTOMER` (hoặc tài khoản khách hàng).
  * **Các bước thao tác:** Nhập trực tiếp đường dẫn `http://localhost:5173/staff/room-board` lên thanh địa chỉ trình duyệt rồi nhấn Enter.
  * **Vùng chụp ảnh màn hình:** Chụp toàn màn hình bao gồm cả thanh URL trình duyệt và giao diện thông báo lỗi 403 Forbidden từ chối truy cập.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-02: Cơ chế Route Guard hoạt động chính xác. Đã kiểm thử chặn thành công người dùng vai trò CUSTOMER truy cập URL quản trị `/staff/room-board`, giao diện 403 hiển thị đầy đủ thông tin hướng dẫn."*

---

#### 🔹 TASK-33 (Mã Jira: `FE-S3-03`) — Xây dựng Khung Sidebar Quản trị & Menu Động theo Vai trò
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Thiết kế và lập trình thanh điều hướng Sidebar bên trái trong `src/layouts/StaffLayout.tsx`. Tích hợp logic lọc danh mục menu tự động dựa theo thẩm quyền (Dynamic RBAC Menu Filtering), hỗ trợ tính năng Thu gọn (Collapse) / Mở rộng (Expand) và hiển thị dưới dạng ngăn kéo (Drawer) khi người dùng thao tác trên thiết bị di động / máy tính bảng.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Sidebar hiển thị logo khách sạn "Nitro Grand Hotel" và danh mục tính năng được nhóm logic theo vai trò.
  2. Lễ tân (`FRONT_DESK`): Chỉ hiển thị 5 menu nghiệp vụ (Ca trực, Sơ đồ phòng, Timeline, Đặt phòng, Khách hàng).
  3. Quản lý (`MANAGER`): Hiển thị thêm Dashboard KPI, Hạng phòng, Phòng vật lý, Dịch vụ và Báo cáo.
  4. Quản trị viên (`ADMIN`): Hiển thị đủ toàn bộ 13 menu bao gồm Quản lý nhân sự, Cài đặt và Audit logs.
  5. Nút bấm thu gọn Sidebar (Collapse) co giãn mượt mà sang chế độ icon-only tooltip.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/overview`
  * **Các bước thao tác:** Lần lượt đăng nhập hoặc chuyển đổi giữa các vai trò `FRONT_DESK` và `ADMIN`. Nhấn nút mũi tên ở chân Sidebar để kiểm tra hiệu ứng thu gọn thanh điều hướng.
  * **Vùng chụp ảnh màn hình:** Chụp 2 ảnh đối chiếu: (1) Sidebar khi ở vai trò Lễ tân (chỉ có 5 menu); (2) Sidebar khi ở vai trò Quản trị viên (đầy đủ 13 menu).
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-03: Sidebar quản trị đáp ứng đúng ma trận phân quyền BA. Menu tự động co giãn theo vai trò người dùng, tính năng Collapse/Expand hoạt động êm ái."*

---

#### 🔹 TASK-34 (Mã Jira: `FE-S3-04`) — Xây dựng Thanh Topbar & Tra cứu Nhanh PNR / Khách
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Hiện thực thanh điều khiển phía trên (Topbar) của phân hệ quản trị. Tích hợp thanh tìm kiếm nhanh mã đơn đặt phòng (PNR) hoặc tên khách hàng, chuông thông báo ca trực kèm số lượng chưa đọc, avatar nhân sự đang đăng nhập và nút bấm CTA nổi bật `"+ Walk-in"` để lễ tân tạo nhanh đơn đặt tại quầy.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Topbar hiển thị cố định phía trên màn hình làm việc của nhân viên.
  2. Ô tìm kiếm nhanh (Quick Search): Cho phép gõ mã PNR (ví dụ `NTR-`) hoặc tên khách, có phím tắt hoặc nút tìm kiếm phản hồi nhanh.
  3. Biểu tượng chuông thông báo (Bell Icon) có chấm badge đỏ hiển thị số lượng thông báo; click vào hiển thị danh sách popover thông báo mới trong ca.
  4. Nút bấm CTA `"+ Walk-in"` màu vàng Gold sang trọng, khi click chuyển hướng tức thời tới trang `/staff/walk-in`.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/room-board`
  * **Các bước thao tác:** Click vào ô tìm kiếm nhanh nhập mã đơn; click vào icon chuông để mở popover danh sách thông báo ca trực.
  * **Vùng chụp ảnh màn hình:** Chụp thanh Topbar với ô tìm kiếm đang có nội dung, popover thông báo đang mở và nút CTA `"+ Walk-in"`.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-04: Topbar nhân viên hoàn thiện đầy đủ các tiện ích vận hành nhanh: tra cứu mã PNR, trung tâm thông báo và nút tạo nhanh đơn Walk-in."*

---

#### 🔹 TASK-35 (Mã Jira: `FE-S3-05`) — Thiết kế Thẻ Buồng phòng & Thanh Thống kê Trạng thái PMS
* **Phối hợp nội bộ:** Phối hợp cùng **Database + QA** (đối soát khớp số lượng 60 phòng với dữ liệu mẫu ban đầu).
* **Mô tả công việc:** Xây dựng thanh công cụ thống kê chỉ số trạng thái buồng phòng trên đầu trang `src/pages/staff/RoomBoardPage.tsx`. Thiết kế hệ thống thẻ chỉ số (StatCard) đại diện cho 5 trạng thái phòng cốt lõi theo quy chuẩn khách sạn: Sẵn sàng (Available - Xanh lá), Đang có khách (Occupied - Xanh dương), Chờ dọn dẹp (Cleaning - Vàng cam), Đã giữ chỗ (Reserved - Tím) và Tạm khóa bảo trì (Maintenance - Xám/Đỏ).
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Hiển thị đúng tổng số lượng 60 phòng và số lượng chi tiết cho từng trạng thái ăn khớp với Mock Database.
  2. Màu sắc và icon của từng trạng thái tuân thủ chính xác quy chuẩn tài liệu `DESIGNSYSTEM COLOR TYPOGRAPHY.docx`.
  3. Cho phép người dùng click trực tiếp vào từng thẻ StatCard để lọc nhanh danh sách phòng bên dưới theo trạng thái tương ứng.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/room-board`
  * **Các bước thao tác:** Truy cập trang Sơ đồ buồng phòng; quan sát thanh 5 thẻ chỉ số thống kê trên cùng; click vào thẻ "Phòng Trống (Available)" để thấy bộ lọc kích hoạt.
  * **Vùng chụp ảnh màn hình:** Chụp cận cảnh dải thẻ thống kê số lượng phòng trên đầu trang `RoomBoardPage.tsx` kèm hiệu ứng kích hoạt bộ lọc.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-05: Thanh thống kê trạng thái phòng hiển thị chuẩn xác số liệu 60 phòng mẫu. Tính năng nhấp chuột lọc nhanh theo trạng thái hoạt động tốt."*

---

#### 🔹 TASK-36 (Mã Jira: `FE-S3-06`) — Xây dựng Ma trận Sơ đồ Buồng phòng Phân tầng
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Hiện thực giao diện lưới buồng phòng trung tâm (Room Matrix Grid) trong `src/pages/staff/RoomBoardPage.tsx`. Bố cục hiển thị các phòng được phân nhóm trực quan theo từng tầng lầu từ Tầng 1 đến Tầng 10; mỗi ô thẻ phòng thể hiện đầy đủ thông tin nhận diện nghiệp vụ phục vụ thao tác của lễ tân.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Các phòng được gom cụm theo từng tầng rõ ràng (Tầng 1, Tầng 2,... Tầng 10) có tiêu đề tầng và tổng số phòng của tầng đó.
  2. Thẻ phòng (Room Card) hiển thị: Số phòng (VD: 101, 304), Ký hiệu hạng phòng (STD, SUP, DLX...), Màu nền/viền tương ứng trạng thái phòng.
  3. Với phòng đang có khách (`OCCUPIED`), hiển thị tên khách lưu trú và giờ trả phòng dự kiến.
  4. Bố cục lưới linh hoạt tự căn chỉnh (Responsive CSS Grid), không bị tràn vỡ giao diện.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/room-board`
  * **Các bước thao tác:** Mở trang Sơ đồ buồng phòng, cuộn màn hình xem danh sách các tầng 1, 2, 3 và kiểm tra thông tin hiển thị trên các thẻ phòng.
  * **Vùng chụp ảnh màn hình:** Chụp toàn cảnh lưới ma trận buồng phòng hiển thị các tầng lầu với đầy đủ màu sắc trạng thái đa dạng.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-06: Ma trận sơ đồ buồng phòng phân tầng đã hoàn thiện, hiển thị đầy đủ thông tin phòng, tên khách đang ở và trạng thái theo đúng bản vẽ thiết kế."*

---

#### 🔹 TASK-37 (Mã Jira: `FE-S3-07`) — Xây dựng Popover Thao tác & Đổi Trạng thái Dọn phòng
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** (duyệt luồng chuyển đổi trạng thái vệ sinh buồng phòng).
* **Mô tả công việc:** Lập trình menu ngữ cảnh thao tác 1 chạm (Popover Action Menu) khi người dùng nhấp chuột vào bất kỳ ô phòng nào trên sơ đồ buồng phòng. Hiện thực chức năng chuyển đổi nhanh trạng thái buồng phòng dành cho bộ phận Housekeeping/Lễ tân: chuyển phòng từ `CLEANING` (Chờ dọn) sang `AVAILABLE` (Đã dọn sạch sẵn sàng đón khách) hoặc chuyển sang `MAINTENANCE` (Bảo trì).
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Nhấp chuột vào bất kỳ ô phòng nào đều mở ra Popover menu thao tác nhanh tại vị trí phòng đó.
  2. Đối với phòng đang ở trạng thái `CLEANING`: Cung cấp nút bấm *"Đã dọn sạch (Mark Clean)"*. Khi bấm, trạng thái phòng lập tức chuyển sang `AVAILABLE` (màu xanh lá) và số lượng trên thanh thống kê được cập nhật tự động.
  3. Cung cấp tùy chọn *"Báo hỏng / Bảo trì"* để tạm khóa phòng khi có sự cố kỹ thuật.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/room-board`
  * **Các bước thao tác:** Click vào ô phòng 105 (đang màu vàng cam Cleaning) -> Menu popover hiện lên -> Nhấp nút "Đã dọn sạch" -> Quan sát phòng 105 chuyển thành màu xanh lá Available.
  * **Vùng chụp ảnh màn hình:** Chụp 2 ảnh: (1) Menu popover thao tác mở ra tại phòng 105; (2) Trạng thái phòng 105 sau khi đã chuyển sang màu xanh lá thành công.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-07: Menu popover thao tác buồng phòng 1 chạm hoạt động mượt mà. Tính năng chuyển trạng thái phòng dọn sạch (Clean -> Ready) phản hồi tức thời."*

---

#### 🔹 TASK-38 (Mã Jira: `FE-S3-08`) — Xây dựng Thao tác Check-in & Check-out Nhanh từ Sơ đồ Phòng
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** và **Database + QA** (kiểm tra nghiệp vụ đổi trạng thái đơn và phòng).
* **Mô tả công việc:** Tích hợp trực tiếp quy trình đón khách và trả khách nhanh vào menu ngữ cảnh của sơ đồ buồng phòng. Đối với phòng đã có khách đặt trước (`RESERVED`), lễ tân có thể mở modal nhận phòng ngay; đối với phòng đang có khách (`OCCUPIED`), lễ tân có thể mở modal trả phòng và thanh toán hóa đơn chỉ với một thao tác nhấp chuột.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Khi click vào phòng có trạng thái `RESERVED` (VD: phòng 106), menu popover cung cấp tùy chọn *"Nhận phòng (Check-in)"*; bấm vào mở modal xác nhận thông tin khách và chuyển phòng sang `OCCUPIED`.
  2. Khi click vào phòng có trạng thái `OCCUPIED` (VD: phòng 102), hiển thị thông tin khách đang ở và nút *"Trả phòng (Check-out)"*; khi xác nhận trả phòng, phòng tự động chuyển sang trạng thái `CLEANING` chờ buồng phòng dọn dẹp.
  3. Hiển thị thông báo Toast thành công sau mỗi thao tác.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/room-board`
  * **Các bước thao tác:** Click vào ô phòng 106 (màu tím Reserved) -> Bấm "Nhận phòng (Check-in)" -> Xác nhận trong modal -> Kiểm tra phòng 106 chuyển sang màu xanh dương Occupied.
  * **Vùng chụp ảnh màn hình:** Chụp modal xác nhận Nhận phòng / Trả phòng đang hiển thị trực tiếp trên nền Sơ đồ buồng phòng.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-08: Thao tác Check-in và Check-out nhanh từ Sơ đồ phòng đã hoàn thiện. Phòng tự động chuyển trạng thái đúng theo quy trình lễ tân khách sạn."*

---

#### 🔹 TASK-39 (Mã Jira: `FE-S3-09`) — Xây dựng Giao diện Chọn Phòng & Ngày Lưu trú Walk-in
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Hiện thực màn hình tiếp nhận khách vãng lai đặt phòng trực tiếp tại quầy lễ tân (`src/pages/staff/WalkInBookingPage.tsx`). Xây dựng khối thiết lập thời gian lưu trú (chọn ngày nhận phòng, ngày trả phòng, tính tự động số đêm) và khối lựa chọn phòng trống trực quan theo từng hạng phòng có sẵn.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Mặc định ngày check-in là ngày hiện tại; cho phép lễ tân chọn ngày trả phòng hoặc nhập số đêm lưu trú.
  2. Hiển thị danh sách các phòng đang có trạng thái `AVAILABLE` phân theo từng hạng phòng để lễ tân nhấp chọn nhanh 1 phòng cụ thể cho khách.
  3. Giá phòng cơ bản và tổng tiền tạm tính tự động tính toán chính xác theo số đêm đã chọn.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/walk-in`
  * **Các bước thao tác:** Chọn khoảng thời gian lưu trú 2 đêm; nhấp chọn phòng 101 (Standard Double) trong danh sách phòng trống; quan sát hệ thống gán phòng và tính giá tạm tính.
  * **Vùng chụp ảnh màn hình:** Chụp khu vực chọn ngày lưu trú và khối danh sách phòng trống kèm thẻ phòng được chọn nổi bật viền màu vàng/xanh.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-09: Khối chọn ngày lưu trú và danh sách phòng trống phục vụ khách Walk-in tại quầy hoạt động trơn tru, tính toán số đêm và giá phòng chuẩn xác."*

---

#### 🔹 TASK-40 (Mã Jira: `FE-S3-10`) — Biểu mẫu Tiếp nhận Hồ sơ Khách & Tạm ứng Tiền cọc Walk-in
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** (duyệt quy định bắt buộc về giấy tờ định danh CCCD và tỷ lệ thu cọc).
* **Mô tả công việc:** Xây dựng biểu mẫu nhập liệu thông tin khách lưu trú trực tiếp tại quầy theo đúng quy định lưu trú khách sạn: Họ tên, Số CCCD/Hộ chiếu, Số điện thoại, Email. Xây dựng khối kê khai tài chính: tính tổng chi phí lưu trú, nhập số tiền cọc (Deposit), lựa chọn phương thức thanh toán tại quầy (Tiền mặt, Chuyển khoản QR, Quẹt thẻ).
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Biểu mẫu có đầy đủ các trường thông tin khách hàng với kiểm tra ràng buộc (Validation): Bắt buộc nhập Họ tên và Số CCCD/Hộ chiếu.
  2. Cho phép lễ tân nhập số tiền cọc tạm thu; hệ thống tự tính số tiền còn lại khách phải thanh toán khi trả phòng.
  3. Hỗ trợ chọn phương thức thanh toán: Tiền mặt (Cash), Chuyển khoản ngân hàng (Bank Transfer / QR), Thẻ tín dụng/ghi nợ (POS Card).
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/walk-in`
  * **Các bước thao tác:** Nhập dữ liệu khách mẫu: Họ tên "Nguyễn Văn B", CCCD "079123456789", SĐT "0988776655"; nhập tiền cọc 500,000 VND; chọn phương thức "Tiền mặt".
  * **Vùng chụp ảnh màn hình:** Chụp toàn bộ biểu mẫu thông tin khách hàng và bảng tổng kết tài chính đã được điền dữ liệu hoàn chỉnh.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-10: Biểu mẫu tiếp nhận khách tại quầy và bộ tính tiền cọc Walk-in đã hoàn thiện, validation trường CCCD/Họ tên chuẩn xác theo quy định lưu trú."*

---

#### 🔹 TASK-41 (Mã Jira: `FE-S3-11`) — Cấp Mã Đặt phòng & Check-in Tức thì tại Quầy
* **Phối hợp nội bộ:** Phối hợp cùng **Database + QA** (kiểm tra cập nhật danh sách đơn hàng và trạng thái phòng).
* **Mô tả công việc:** Hoàn thiện quy trình khép kín của đơn đặt phòng Walk-in. Tích hợp tùy chọn *"Nhận phòng ngay (Instant Check-in)"*; khi lễ tân nhấn nút xác nhận, hệ thống tự động sinh mã định danh đơn hàng (`WK-XXXXXX`), cập nhật trạng thái phòng vừa chọn sang `OCCUPIED`, lưu đơn vào hệ thống và hiển thị phiếu xác nhận bàn giao chìa khóa phòng.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Khi nhấn nút *"Tạo đơn & Check-in ngay"*, hệ thống tạo mã đơn mới bắt đầu bằng tiền tố `WK-` kèm dấu thời gian duy nhất.
  2. Phòng được chọn lập tức đổi từ `AVAILABLE` sang `OCCUPIED` trên toàn hệ thống (đồng bộ với Sơ đồ phòng).
  3. Hiển thị thông báo hoàn tất và phiếu xác nhận nhận phòng có nút in biên nhận hoặc quay lại Sơ đồ buồng phòng.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/walk-in`
  * **Các bước thao tác:** Hoàn tất form Walk-in -> Bấm nút "Tạo đơn & Check-in ngay" -> Màn hình hiển thị thông báo thành công có mã đơn `WK-...` -> Chuyển sang `/staff/room-board` kiểm tra phòng đó đã đổi màu xanh dương.
  * **Vùng chụp ảnh màn hình:** Chụp thông báo kết quả tạo đơn Walk-in thành công hiển thị mã PNR và ảnh phòng đã đổi trạng thái trên sơ đồ phòng.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-11: Luồng đặt phòng và nhận phòng tức thì tại quầy (Walk-in) hoạt động hoàn hảo. Mã đơn được sinh tự động, phòng đổi trạng thái Occupied ngay lập tức."*

---

#### 🔹 TASK-42 (Mã Jira: `FE-S3-12`) — Xây dựng Biểu đồ Dòng thời gian Đặt phòng (Timeline)
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Hiện thực màn hình lịch công suất buồng phòng (`src/pages/staff/BookingTimelinePage.tsx`). Xây dựng biểu đồ dạng Gantt trực quan hóa tình trạng lấp đầy phòng: trục tung là danh sách 60 phòng khách sạn theo tầng, trục hoành là chuỗi các ngày trong tuần/tháng với các thanh dải màu thể hiện khoảng thời gian lưu trú của từng đơn đặt.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Biểu đồ hiển thị lưới tọa độ: Trục dọc là danh sách phòng vật lý, trục ngang là các ngày kèm thứ trong tuần.
  2. Các đơn đặt phòng được hiển thị dưới dạng thanh dải ngang (Booking bars) kéo dài từ ngày nhận phòng đến ngày trả phòng; trên dải hiển thị tên khách và mã đơn.
  3. Có bộ nút bấm điều hướng thời gian: *"Tuần trước"*, *"Hôm nay"*, *"Tuần tới"* và bộ lọc theo tầng lầu.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/timeline`
  * **Các bước thao tác:** Mở trang Timeline, bấm chuyển tuần để xem các thanh dải biểu diễn đơn đặt phòng của khách qua các ngày; thử lọc theo "Tầng 1".
  * **Vùng chụp ảnh màn hình:** Chụp toàn cảnh biểu đồ Gantt Timeline hiển thị các dải booking màu sắc trên lưới ngày làm việc.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-12: Màn hình Booking Timeline Gantt Chart trực quan hóa công suất buồng phòng hoàn thiện, điều hướng tuần/ngày êm ái."*

---

#### 🔹 TASK-43 (Mã Jira: `FE-S3-13`) — Bảng Danh sách Đơn Đặt phòng & Bộ lọc Nâng cao
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Hiện thực màn hình danh sách toàn bộ đơn đặt phòng nội bộ (`src/pages/staff/BookingsListPage.tsx`). Xây dựng bảng dữ liệu (Data Table) chuyên nghiệp, hỗ trợ phân trang (Pagination), thanh tìm kiếm nhanh theo mã PNR / tên khách hàng và bộ lọc trạng thái đơn hàng đa năng.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Bảng dữ liệu thể hiện rõ ràng các cột: Mã đơn (Booking Code), Tên khách lưu trú, SĐT liên hệ, Số phòng, Ngày nhận/trả phòng, Tổng chi phí, Trạng thái đơn (Badge màu: Chờ check-in, Đang ở, Đã trả phòng, Đã hủy).
  2. Thanh tìm kiếm hỗ trợ lọc tức thì khi nhập mã PNR hoặc tên khách hàng.
  3. Bộ lọc trạng thái (Tabs/Dropdown) cho phép xem theo từng nhóm: Tất cả, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/bookings`
  * **Các bước thao tác:** Mở trang Bookings List, nhập tìm kiếm từ khóa "An" vào thanh tìm kiếm; click chuyển đổi giữa các tab trạng thái "Đang ở" và "Đã trả phòng".
  * **Vùng chụp ảnh màn hình:** Chụp bảng danh sách đơn đặt phòng với kết quả tìm kiếm và bộ lọc trạng thái đang hoạt động.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-13: Bảng danh sách đơn đặt phòng nội bộ đã hoàn thiện với đầy đủ thông tin lưu trú, bộ lọc trạng thái và tìm kiếm thời gian thực."*

---

#### 🔹 TASK-44 (Mã Jira: `FE-S3-14`) — Màn hình Chi tiết Đơn Đặt phòng Phía Nhân viên
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** (duyệt cấu trúc Folio chi tiết đơn hàng khách sạn).
* **Mô tả công việc:** Hiện thực màn hình xem chi tiết hồ sơ đặt phòng dành riêng cho nhân viên (`src/pages/staff/BookingDetailStaffPage.tsx`). Hiển thị toàn diện thông tin đặt phòng: Hồ sơ cá nhân khách lưu trú, thông tin phòng nghỉ, thời gian nhận/trả thực tế, nguồn đặt phòng (Web, Mobile, OTA, Quầy) và bảng kê chi phí lưu trú (Folio charges).
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Màn hình chi tiết hiển thị đầy đủ thông tin: Mã PNR, thông tin khách (Họ tên, SĐT, Email, CCCD), chi tiết hạng phòng và số phòng gán kèm.
  2. Bảng kê tài chính chi tiết: Tiền phòng theo đêm, phụ thu thêm khách (nếu có), số tiền khách đã thanh toán, tiền cọc và số dư còn lại cần thu.
  3. Cung cấp các nút bấm tác vụ nghiệp vụ: Đổi phòng, Check-in, Check-out, Hủy đơn theo quy định.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/bookings/bk-006` (hoặc nhấn nút "Xem chi tiết" tại bất kỳ đơn nào).
  * **Các bước thao tác:** Mở chi tiết đơn hàng bk-006, cuộn xem thông tin khách, chi tiết phòng và bảng kê tài chính của đơn đặt.
  * **Vùng chụp ảnh màn hình:** Chụp toàn cảnh màn hình BookingDetailStaffPage hiển thị thông tin khách và bảng kê tài chính chi tiết.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-14: Màn hình chi tiết đơn đặt phòng phía nhân viên hiển thị đầy đủ hồ sơ lưu trú, nguồn đặt và bảng kê chi phí theo chuẩn Folio khách sạn."*

---

#### 🔹 TASK-45 (Mã Jira: `FE-S3-15`) — Chức năng Cộng thêm Dịch vụ & In Biên lai Hóa đơn
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** (duyệt quy định thêm dịch vụ phụ trội vào Folio phòng).
* **Mô tả công việc:** Phát triển tính năng thêm dịch vụ gia tăng (Minibar, Giặt là, Ăn uống F&B, Spa) trực tiếp vào hóa đơn của phòng đang lưu trú trong `BookingDetailStaffPage.tsx`. Hiện thực chức năng In biên lai / Hóa đơn thanh toán (`window.print()`) với định dạng hóa đơn khách sạn 4 sao chuẩn mực, tự động ẩn thanh điều hướng và các nút bấm khi in.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Modal *"Thêm dịch vụ vào hóa đơn"*: Chọn loại dịch vụ từ danh mục, nhập số lượng; tự động tính thành tiền và cộng dồn vào tổng công nợ của phòng.
  2. Nút bấm *"In hóa đơn / Xuất biên lai"*: Kích hoạt lệnh in trình duyệt với template hóa đơn chuyên nghiệp (Logo khách sạn, thông tin khách, chi tiết tiền phòng + dịch vụ, chữ ký thu ngân/khách hàng).
  3. Giao diện in sạch sẽ (CSS `@media print`), ẩn hoàn toàn Sidebar, Topbar và các nút điều khiển.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/bookings/bk-006`
  * **Các bước thao tác:** Nhấn nút "+ Thêm dịch vụ" -> chọn Giặt ủi số lượng 2 -> Bấm Xác nhận thêm; sau đó nhấn nút "In hóa đơn" để mở hộp thoại in của trình duyệt.
  * **Vùng chụp ảnh màn hình:** Chụp 2 ảnh: (1) Modal thêm dịch vụ vào hóa đơn; (2) Bản xem trước in hóa đơn (Print Preview) hiển thị biên lai thanh toán khách sạn.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-15: Chức năng cộng dịch vụ vào Folio phòng và module in biên lai thanh toán qua lệnh in trình duyệt hoạt động chuẩn xác."*

---

#### 🔹 TASK-46 (Mã Jira: `FE-S3-16`) — Bảng Thống kê & Doanh thu Trong ca Trực Lễ tân
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** (duyệt công thức đối soát tiền mặt và ca trực).
* **Mô tả công việc:** Hiện thực màn hình điều hành ca trực của lễ tân (`src/pages/staff/ShiftOverviewPage.tsx`). Xây dựng bảng theo dõi số liệu tài chính và hoạt động vận hành diễn ra trong ca làm việc hiện tại: tên ca, nhân viên trực ca, tổng tiền mặt thu được, tổng tiền chuyển khoản ngân hàng/thẻ, số lượt khách đã check-in và số lượt đã check-out trong ca.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Hiển thị thông tin phiên ca trực: Ca hiện tại (Ca Sáng / Ca Chiều / Ca Đêm), tên nhân viên đang trực ca, thời gian mở ca.
  2. Thống kê số tiền thực thu trong ca phân chia rành mạch: Tiền mặt trong két (Cash in Drawer) và Tiền chuyển khoản / Thẻ ngân hàng (Electronic).
  3. Thống kê số lượt buồng phòng đã xử lý: Số phòng đã check-in và số phòng đã hoàn tất check-out trong ca.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/overview`
  * **Các bước thao tác:** Mở trang Tổng quan ca trực; quan sát các thẻ thống kê tài chính và số lượt phòng đã check-in/out trong ca làm việc.
  * **Vùng chụp ảnh màn hình:** Chụp khu vực các thẻ chỉ số tài chính và hoạt động của ca trực trên màn hình `ShiftOverviewPage.tsx`.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-16: Bảng thống kê tài chính và lưu lượng khách trong ca trực lễ tân hiển thị trực quan, phân tách rõ tiền mặt két và chuyển khoản."*

---

#### 🔹 TASK-47 (Mã Jira: `FE-S3-17`) — Sổ Giao ban Lễ tân & Modal Kết thúc Ca trực
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** (duyệt quy trình bàn giao giữa 2 ca trực).
* **Mô tả công việc:** Xây dựng sổ nhật ký giao ban ca trực (Handover Logbook) và quy trình kết thúc ca làm việc trong `ShiftOverviewPage.tsx`. Cho phép nhân viên trực ca ghi lại các lưu ý quan trọng cho ca kế tiếp; phát triển Modal Đóng ca trực hỗ trợ kiểm kê số tiền mặt thực tế trong két tiền và đối soát với số liệu trên phần mềm để phát hiện chênh lệch thừa/thiếu.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Khu vực *"Nhật ký bàn giao ca"*: Ô nhập ghi chú nhiều dòng (Textarea) để lưu lại các việc cần bàn giao (khách gọi thức giấc, đồ thất lạc, tiền cọc...).
  2. Nút bấm *"Đóng ca & Bàn giao"*: Mở modal kiểm đếm tiền mặt két; cho phép nhập số tiền thực đếm, hệ thống tự động tính toán khoản chênh lệch (Difference = Thực tế - Lý thuyết).
  3. Xác nhận đóng ca thành công, lưu lại nhật ký bàn giao vào lịch sử.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/overview`
  * **Các bước thao tác:** Nhập ghi chú bàn giao vào ô sổ giao ban -> Nhấn nút "Đóng ca & Bàn giao" -> Nhập số tiền thực tế vào ô kiểm đếm tiền két -> Xem hệ thống tính chênh lệch -> Bấm Xác nhận.
  * **Vùng chụp ảnh màn hình:** Chụp Modal đóng ca trực đang hiển thị ô nhập kiểm kê tiền két kèm ô ghi chú bàn giao giao ban.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-17: Module sổ giao ban và quy trình đóng ca trực lễ tân hoàn thiện, hỗ trợ kiểm đếm tiền két và phát hiện chênh lệch tự động."*

---

#### 🔹 TASK-48 (Mã Jira: `FE-S3-18`) — Phân hệ Quản lý Khách hàng CRM & Hồ sơ Lưu trú
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Hiện thực màn hình quản lý quan hệ khách hàng CRM (`src/pages/staff/CustomersListPage.tsx`). Xây dựng bảng tra cứu hồ sơ khách lưu trú, hiển thị lịch sử các lần ở, tổng doanh số chi tiêu của từng khách, phân hạng hội viên (VIP Gold, Thân thiết, Thường) và xem các ghi chú sở thích cá nhân phục vụ chăm sóc khách hàng 4 sao.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Bảng dữ liệu khách hàng thể hiện: Mã khách, Họ tên, SĐT, Email, Số CCCD/Hộ chiếu, Tổng số đêm đã ở, Tổng chi tiêu tích lũy, Phân hạng thành viên (Badge VIP nổi bật).
  2. Ô tìm kiếm nhanh theo tên hoặc số điện thoại của khách hàng.
  3. Modal xem chi tiết hồ sơ khách: Hiển thị danh sách các đơn đặt phòng trong quá khứ và các ghi chú đặc biệt (Thích tầng cao, dị ứng lông vũ, ăn chay...).
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/customers`
  * **Các bước thao tác:** Truy cập trang Khách hàng, thử tìm kiếm tên "Nguyễn", click vào một khách hàng có badge VIP để mở modal xem chi tiết lịch sử và sở thích.
  * **Vùng chụp ảnh màn hình:** Chụp bảng danh sách khách hàng CRM với các badge phân hạng hội viên và modal chi tiết thông tin sở thích khách hàng.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-18: Phân hệ CRM khách lưu trú hoàn thiện, hỗ trợ tra cứu lịch sử ở, tổng doanh số chi tiêu và ghi chú sở thích phục vụ cá nhân hóa dịch vụ."*

---

#### 🔹 TASK-49 (Mã Jira: `FE-S3-19`) — Phân hệ Quản lý Danh mục Hạng phòng (Room Types)
* **Phối hợp nội bộ:** Phối hợp cùng **Database + QA** (đối chiếu bảng thực thể `RoomType` trong Database).
* **Mô tả công việc:** Hiện thực màn hình quản lý danh mục các hạng phòng kinh doanh của khách sạn (`src/pages/staff/RoomTypesManagePage.tsx`). Xây dựng bảng hiển thị 6 hạng phòng (Standard, Superior, Deluxe, Family Suite, Executive Suite, Presidential Suite) và Modal chỉnh sửa thông số kỹ thuật hạng phòng: giá niêm yết theo đêm, diện tích, sức chứa người lớn/trẻ em, danh mục tiện nghi và thư viện hình ảnh.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Bảng danh mục hiển thị đầy đủ 6 hạng phòng với các cột: Mã hạng (STD, DLX...), Tên hạng phòng, Giá niêm yết (VND/đêm), Diện tích (m²), Sức chứa tối đa, Tổng số phòng thực tế.
  2. Nút bấm *"Chỉnh sửa"* mở Modal cho phép cập nhật: Giá phòng, mô tả chi tiết, tiện ích đi kèm và URL ảnh đại diện.
  3. Lưu thay đổi thành công và cập nhật lại bảng dữ liệu trên giao diện tức thời.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/room-types` (Đăng nhập vai trò Quản lý hoặc Admin).
  * **Các bước thao tác:** Xem bảng danh mục hạng phòng, click nút "Chỉnh sửa" tại hạng Deluxe City View để mở modal form cập nhật giá và tiện nghi.
  * **Vùng chụp ảnh màn hình:** Chụp bảng danh mục 6 hạng phòng và modal form chỉnh sửa thông tin giá niêm yết của hạng phòng.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-19: Phân hệ quản lý danh mục hạng phòng (Room Types) hoàn thiện, hỗ trợ xem và cập nhật giá niêm yết, tiện ích phòng linh hoạt."*

---

#### 🔹 TASK-50 (Mã Jira: `FE-S3-20`) — Phân hệ Quản trị Danh sách Phòng Vật lý
* **Phối hợp nội bộ:** Phối hợp cùng **Database + QA** (đối chiếu danh sách 60 phòng vật lý theo tầng trong DB).
* **Mô tả công việc:** Hiện thực màn hình quản lý kho phòng vật lý của khách sạn (`src/pages/staff/RoomsManagePage.tsx`). Xây dựng bảng danh sách 60 phòng trải đều từ Tầng 1 đến Tầng 10; hỗ trợ bộ lọc phòng theo tầng lầu và theo hạng phòng; Modal thêm phòng mới vào danh mục và thao tác chuyển đổi trạng thái phòng sang chế độ bảo trì kỹ thuật.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Bảng danh sách phòng chi tiết: Số phòng (Room Number), Vị trí tầng, Hạng phòng gắn kèm, Trạng thái vận hành hiện tại (Sẵn sàng / Đang sử dụng / Bảo trì).
  2. Bộ lọc theo số tầng và theo hạng phòng lọc dữ liệu mượt mà.
  3. Modal *"Thêm phòng mới"*: Cho phép chọn số phòng, tầng lầu và gán loại phòng kinh doanh; nút kích hoạt nhanh chế độ bảo trì phòng.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/rooms` (Vai trò Quản lý hoặc Admin).
  * **Các bước thao tác:** Mở bảng danh sách phòng, chọn lọc "Tầng 4", click nút "Thêm phòng mới" để mở modal nhập thông số phòng vật lý.
  * **Vùng chụp ảnh màn hình:** Chụp bảng danh sách phòng vật lý đã được lọc theo tầng kèm modal tạo phòng mới.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-20: Màn hình quản lý kho phòng vật lý đã hoàn thiện, hỗ trợ lọc theo tầng/loại phòng và tạo mới phòng nhanh chóng."*

---

#### 🔹 TASK-51 (Mã Jira: `FE-S3-21`) — Phân hệ Quản lý Menu & Bảng giá Dịch vụ
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Hiện thực màn hình quản trị danh mục dịch vụ gia tăng của khách sạn (`src/pages/staff/ServicesManagePage.tsx`). Xây dựng bảng quản lý bảng giá niêm yết cho các nhóm dịch vụ: F&B ẩm thực, Minibar, Giặt là nhanh, Spa & Massage, Đưa đón sân bay; hỗ trợ công tắc bật/tắt trạng thái kinh doanh của dịch vụ và Modal cập nhật đơn giá.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Bảng danh mục dịch vụ hiển thị rõ: Tên dịch vụ, Nhóm danh mục (F&B, Wellness, Transport, Laundry), Đơn vị tính (Lượt, Set, Chai, Giờ), Đơn giá niêm yết, Trạng thái (Hoạt động / Tạm ngưng).
  2. Nút chuyển đổi (Toggle Switch) cho phép bật hoặc tạm dừng kinh doanh dịch vụ ngay lập tức.
  3. Modal thêm mới hoặc chỉnh sửa dịch vụ cho phép cập nhật tên, đơn giá và mô tả dịch vụ.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/services` (Vai trò Quản lý hoặc Admin).
  * **Các bước thao tác:** Xem danh sách dịch vụ; gạt công tắc chuyển trạng thái của một dịch vụ; click nút "Sửa" tại dịch vụ Spa để mở modal cập nhật giá.
  * **Vùng chụp ảnh màn hình:** Chụp bảng danh mục dịch vụ khách sạn có các công tắc trạng thái hoạt động và modal chỉnh sửa đơn giá.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-21: Phân hệ quản lý dịch vụ và bảng giá gia tăng hoàn tất, hỗ trợ bật/tắt khả dụng và điều chỉnh giá niêm yết linh hoạt."*

---

#### 🔹 TASK-52 (Mã Jira: `FE-S3-22`) — Bảng Điều khiển KPI Quản trị Khách sạn (Dashboard)
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** (duyệt các chỉ số KPI vận hành khách sạn: ADR, RevPAR, Occupancy Rate).
* **Mô tả công việc:** Hiện thực màn hình Dashboard tổng quan dành cho cấp Quản lý khách sạn (`src/pages/staff/DashboardPage.tsx`). Hiển thị hệ thống thẻ chỉ số hiệu suất trọng yếu (KPI StatCards), danh sách các tác vụ cần giải quyết ngay trong ngày (Lượt khách đến dự kiến, lượt khách đi dự kiến) và biểu đồ phân bổ nguồn khách đặt phòng (Web, Mobile, Quầy).
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Thẻ KPI thể hiện rõ: Tỷ lệ lấp đầy phòng hôm nay (% Occupancy), Tổng doanh thu lũy kế tháng, Tổng số lượt đặt phòng, Tỷ lệ hủy phòng kèm tỷ lệ tăng giảm so với kỳ trước.
  2. Danh sách khách đến hôm nay (Expected Arrivals) và khách trả phòng hôm nay (Expected Departures) hiển thị đầy đủ giờ dự kiến và số phòng.
  3. Biểu đồ tròn/cột phân rã nguồn khách (Source Breakdown: Web 46%, Mobile 31%, Counter 23%).
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/dashboard` (Vai trò Quản lý hoặc Admin).
  * **Các bước thao tác:** Mở trang Dashboard Quản lý; kiểm tra các chỉ số thẻ KPI trên cùng và bảng danh sách khách đến/đi cần xử lý trong ngày.
  * **Vùng chụp ảnh màn hình:** Chụp toàn cảnh màn hình Dashboard KPI Quản lý với đầy đủ các thẻ chỉ số và danh sách vận hành ngày.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-22: Dashboard Quản trị hoàn thiện với đầy đủ hệ thống chỉ số KPI vận hành, tỷ lệ kín phòng và danh sách khách đến/đi trong ngày."*

---

#### 🔹 TASK-53 (Mã Jira: `FE-S3-23`) — Báo cáo Doanh thu & Phân tích Biểu đồ Recharts
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** (duyệt logic tính doanh thu theo kỳ và cơ cấu nguồn thu hạng phòng).
* **Mô tả công việc:** Hiện thực màn hình báo cáo tài chính và phân tích doanh thu chuyên sâu (`src/pages/staff/ReportsPage.tsx`). Tích hợp thư viện biểu đồ trực quan Recharts: Biểu đồ đường (Line Chart) xu hướng doanh thu biến động qua các ngày, Biểu đồ cột (Bar Chart) so sánh doanh thu đóng góp của từng hạng phòng; hỗ trợ bộ chọn khoảng ngày báo cáo và nút xuất file báo cáo.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Tích hợp Recharts mượt mà, hỗ trợ rê chuột (Hover Tooltip) hiển thị giá trị doanh thu chi tiết tại từng mốc thời gian.
  2. Biểu đồ cơ cấu doanh thu theo từng hạng phòng (Deluxe, Suite, Standard...) hiển thị số liệu tỷ lệ phần trăm và tổng tiền chính xác.
  3. Bộ lọc thời gian: Xem theo Hôm nay, 7 ngày gần nhất, Tháng này; nút *"Xuất báo cáo (Export)"* mô phỏng trích xuất dữ liệu.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/reports` (Vai trò Quản lý hoặc Admin).
  * **Các bước thao tác:** Mở trang Báo cáo, hover chuột lên các điểm trên biểu đồ đường để hiện tooltip giá trị tiền tệ VND; thử bấm nút chọn khoảng thời gian.
  * **Vùng chụp ảnh màn hình:** Chụp biểu đồ Recharts đang hiển thị tooltip chi tiết khi hover chuột kèm nút xuất báo cáo.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-23: Màn hình Báo cáo doanh thu tích hợp biểu đồ Recharts tương tác trực quan hoàn tất, hiển thị chính xác cơ cấu doanh thu theo hạng phòng."*

---

#### 🔹 TASK-54 (Mã Jira: `FE-S3-24`) — Phân hệ Quản lý Tài khoản & Phân quyền Nhân sự
* **Phối hợp nội bộ:** Phối hợp cùng **BA/PO** và **Backend** (kiểm tra chuẩn Token phân quyền và thông tin user).
* **Mô tả công việc:** Hiện thực màn hình bảo mật quản trị tài khoản nội bộ (`src/pages/staff/UsersPermissionsPage.tsx`) chỉ dành riêng cho vai trò Quản trị viên (`ADMIN`). Hiển thị danh sách nhân viên khách sạn; Modal tạo tài khoản mới và gán vai trò (`FRONT_DESK`, `MANAGER`, `ADMIN`); tính năng Khóa / Mở khóa tài khoản nhân sự tức thời.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Bảng nhân sự hiển thị: Mã nhân viên, Họ tên, Email, Số điện thoại, Vai trò phân quyền (Badge màu tương ứng), Trạng thái tài khoản (ACTIVE / LOCKED), Lần đăng nhập cuối.
  2. Modal *"Thêm nhân viên mới"*: Điền họ tên, email, mật khẩu khởi tạo và chọn vai trò quyền hạn từ danh sách thả xuống.
  3. Nút bấm Khóa tài khoản (Lock) / Mở khóa tài khoản cập nhật ngay trạng thái hoạt động của nhân viên.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/users` (Đăng nhập tài khoản `admin@nitrohotel.vn`).
  * **Các bước thao tác:** Mở trang Quản lý nhân sự; bấm nút "Thêm nhân viên mới" để mở modal phân quyền; thử bấm nút Khóa tài khoản của 1 nhân viên mẫu.
  * **Vùng chụp ảnh màn hình:** Chụp bảng danh sách nhân sự nội bộ và modal form tạo mới nhân viên/gán vai trò phân quyền.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-24: Phân hệ quản trị nhân sự và phân quyền tài khoản (RBAC) hoàn thiện, hỗ trợ tạo nhân viên mới và khóa/mở tài khoản an toàn."*

---

#### 🔹 TASK-55 (Mã Jira: `FE-S3-25`) — Cài đặt Cấu hình Khách sạn & Nhật ký Audit Logs
* **Phối hợp nội bộ:** Phối hợp cùng **Backend + DevOps** (chuẩn hóa schema nhật ký audit vết hệ thống).
* **Mô tả công việc:** Hiện thực bộ đôi màn hình cấu hình vận hành và giám sát hệ thống dành cho Admin: `src/pages/staff/SystemSettingsPage.tsx` (cấu hình giờ nhận phòng chuẩn 14:00, giờ trả phòng 12:00, thuế VAT, phí dịch vụ, chính sách phụ thu quá giờ) và `src/pages/staff/AuditLogsPage.tsx` (bảng ghi vết nhật ký các hành động nhạy cảm trong hệ thống).
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Màn hình Cài đặt: Cho phép điều chỉnh giờ Check-in/Check-out tiêu chuẩn, % thuế GTGT (VAT), % phí phục vụ, nút *"Lưu cài đặt"* có thông báo Toast thành công.
  2. Màn hình Nhật ký Audit: Hiển thị thời gian thao tác, nhân viên thực hiện, hành động chi tiết (Đổi giá phòng, Sửa hóa đơn, Hủy phòng, Đổi ca), địa chỉ IP giả lập.
  3. Hỗ trợ lọc nhật ký audit theo loại hành động và tìm kiếm theo tên nhân viên.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/settings` và `http://localhost:5173/staff/logs` (Vai trò Admin).
  * **Các bước thao tác:** Mở trang Cài đặt chỉnh sửa thông số -> bấm Lưu; sau đó mở trang Nhật ký Audit xem các bản ghi lịch sử hoạt động.
  * **Vùng chụp ảnh màn hình:** Chụp 2 ảnh: (1) Trang Cài đặt thông số khách sạn; (2) Trang Bảng nhật ký Audit Logs ghi vết hệ thống.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-25: Bộ đôi màn hình Cấu hình thông số khách sạn và Nhật ký vết Audit Logs đã hoàn thiện, đáp ứng tiêu chuẩn quản trị an toàn thông tin."*

---

#### 🔹 TASK-56 (Mã Jira: `FE-S3-26`) — Kiểm thử Tích hợp E2E Nghiệp vụ Vận hành Sprint 3
* **Phối hợp nội bộ:** Phối hợp cùng **Database + QA** (chạy kịch bản kiểm thử) và **PM/Scrum Master** (nghiệm thu kết quả).
* **Mô tả công việc:** Phối hợp cùng QA thực hiện kiểm thử tích hợp toàn diện luồng nghiệp vụ quản trị và vận hành khách sạn (E2E Operational Flow) khép kín xuyên suốt 25 task trước đó: từ lúc Lễ tân mở ca trực, quản lý sơ đồ buồng phòng, tạo đơn Walk-in tại quầy, check-in, thêm dịch vụ minibar, in hóa đơn trả phòng, đóng ca trực, đến việc Quản lý xem Dashboard KPI và Admin rà soát nhật ký Audit Log.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Kịch bản liên hoàn 7 bước vận hành thực tế được thực thi thông suốt 100%, không bị lỗi logic ngắt quãng.
  2. Phòng được chọn Walk-in đổi màu chính xác từ Xanh lá (Available) sang Xanh dương (Occupied) và sang Vàng cam (Cleaning) sau khi trả phòng.
  3. Báo cáo doanh thu ca trực và Dashboard KPI tự động cập nhật số tiền của đơn mới tạo.
  4. Mở cửa sổ Console trình duyệt (F12) không có bất kỳ thông báo lỗi đỏ (Zero Console Errors).
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Jira:**
  * **URL kiểm thử:** Quy trình liên hoàn các màn hình `/staff/overview` -> `/staff/room-board` -> `/staff/walk-in` -> `/staff/bookings` -> `/staff/dashboard`.
  * **Các bước thao tác:** Thực hiện đúng quy trình mở ca -> tạo đơn Walk-in phòng 101 -> kiểm tra phòng 101 đổi màu trên sơ đồ -> mở tab F12 Console.
  * **Vùng chụp ảnh màn hình:** Chụp màn hình sơ đồ phòng đã đổi trạng thái thành công kèm cửa sổ F12 Console sạch sẽ không có lỗi đỏ (0 errors).
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S3-26: Kiểm thử tích hợp toàn diện phân hệ Quản trị & Vận hành Sprint 3 đạt 100% tiêu chí nghiệm thu. Luồng vận hành khách sạn thông suốt, Console sạch không có lỗi."*

---

## 🛡️ SPRINT 4: TÍCH HỢP DUAL-MODE API, TỐI ƯU HÓA, TEST TOÀN DIỆN, ĐÓNG GÓI & QUAY VIDEO DEMO (11 TASK PHÂN RÃ JIRA)
* **Mục tiêu:** Hoàn thiện tầng State/API, hiện thực hóa kiến trúc Dual-Mode (linh hoạt giữa Mock và Backend REST API), tối ưu hóa trải nghiệm Responsive đa thiết bị, phối hợp kiểm thử tự động & thủ công đa cấp độ, đóng gói bản dựng Production và quay video toàn diện toàn bộ giao diện trang web phục vụ nghiệm thu đồ án.
* **Thời lượng giả định:** 2 tuần.
* **Quy chuẩn thực hiện trên Jira:** Sprint 4 được phân rã chi tiết thành đúng **11 Task** độc lập (`FE-S4-01` đến `FE-S4-11`, tương ứng thứ tự `TASK-57` đến `TASK-67`). Mỗi task đều có **Tiêu Chí Hoàn Thành (Acceptance Criteria / Definition of Done)** và **Chỉ Dẫn Chụp Minh Chứng / Video (Evidence & Screenshot/Video Guide)** cụ thể để thành viên Frontend dễ dàng thực hiện, chụp ảnh/quay video nghiệm thu và cập nhật trạng thái `Done` trên Jira cho cả nhóm đối soát.

### 📋 BẢNG TỔNG QUAN 11 TASK SPRINT 4 TRÊN JIRA

| Mã Task | Mã Jira | Tên Công Việc (Jira Summary) | Phối Hợp Nội Bộ | Nội Dung Thực Hiện Chính (Ngắn gọn) | Kết Quả Đầu Ra (Deliverables) |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **TASK-57** | `FE-S4-01` | Hoàn thiện State Toàn cục (AppContext) & Bộ Demo Switcher | Với **PM/Scrum Master** & **Backend** | Hoàn thiện `AppContext.tsx`, quản lý phiên bền vững `localStorage`, đồng bộ giỏ phòng `draftBooking` và tích hợp bộ Demo Switcher chuyển vai trò 1-click. | State toàn cục và tiện ích Demo Switcher. |
| **TASK-58** | `FE-S4-02` | Hiện thực Hóa Kiến trúc Dual-Mode API (Mock & Real REST API) | Với **Backend + DevOps** & **QA** | Hoàn thiện `src/services/api.ts`; cơ chế chuyển đổi thông minh qua `VITE_USE_MOCK` trong `.env`; tự động fallback in-memory mock khi backend offline. | Tầng API Dual-Mode không phụ thuộc cứng Backend. |
| **TASK-59** | `FE-S4-03` | Tối ưu Responsive Đa Thiết bị (Mobile, Tablet & Desktop) | Tự thực hiện | Tinh chỉnh hiển thị trên Mobile: Sidebar chuyển thành Drawer vuốt cạnh, Header chuyển Hamburger menu, Sơ đồ phòng PMS co giãn không vỡ layout. | Trải nghiệm hoàn hảo trên Mobile, Tablet & Desktop. |
| **TASK-60** | `FE-S4-04` | Vi hoạt ảnh Motion, Trạng thái Tải & Phản hồi Trực quan | Tự thực hiện | Tích hợp Motion transition cho Modal/Drawer, Toast thông báo thời gian thực tự ẩn sau 3s, Skeleton Loading và màn hình Empty State tinh tế. | Giao diện tương tác 4 sao, phản hồi mượt mà. |
| **TASK-61** | `FE-S4-05` | Kiểm thử Đơn vị (Unit Test) Hàm Tiện ích & Tính toán Tài chính | Với **Database + QA** | Xây dựng và thực thi bộ Unit Test cho `src/utils/format.ts`: `formatCurrency`, `formatDate`, `maskPhone`, công thức tính phụ phí và % hoàn tiền hủy phòng. | Bộ Unit Test đạt độ chính xác 100% (Zero Failure). |
| **TASK-62** | `FE-S4-06` | Phối hợp Kiểm thử Tích hợp Luồng Khách hàng (Customer E2E) | Với **Database + QA** & **BA/PO** | Cùng QA chạy kịch bản E2E: Tìm kiếm phòng -> Lọc Deluxe -> Đặt phòng 3 bước -> Nhận mã đặt chỗ PNR -> Tra cứu và thử nghiệm hủy đơn đối soát tiền hoàn. | Luồng khách hàng hoàn chỉnh, dữ liệu đồng bộ. |
| **TASK-63** | `FE-S4-07` | Kiểm thử Tương thích Đa Trình duyệt & Rà soát Bảo mật Frontend | Với **Backend + DevOps** & **QA** | Kiểm thử hiển thị trên Chrome, Edge, Firefox, Safari; rà soát an toàn thông tin: chống XSS trong form, bảo vệ Token/Session, dọn sạch `console.log`. | Báo cáo kiểm thử đa trình duyệt & bảo mật. |
| **TASK-64** | `FE-S4-08` | Đo lường & Tối ưu Hiệu năng Web (Google Lighthouse Audit) | Với **Backend + DevOps** | Đo lường và tối ưu bằng Google Lighthouse: nén ảnh, lazy loading, kiểm soát Core Web Vitals (LCP < 2.5s, CLS < 0.1), đạt điểm số Xanh > 90. | Báo cáo Lighthouse đạt chuẩn Xanh (> 90 điểm). |
| **TASK-65** | `FE-S4-09` | Kiểm định Bản dựng Đóng gói Production (Zero-Error Build) | Với **Backend + DevOps** & **QA** | Chạy kiểm tra tĩnh `tsc --noEmit` (0 lỗi type), đóng gói `npm run build` tạo `dist/`, kiểm thử preview cổng 4173 xác nhận không có lỗi console. | Bản build `dist/` sẵn sàng triển khai hosting. |
| **TASK-66** | `FE-S4-10` | Hoàn thiện Bộ Hồ sơ Tài liệu Kỹ thuật & Bàn giao Triển khai | Với **PM/Scrum Master** & **DevOps** | Chuẩn hóa `README.md`, `FRONTEND_OVERVIEW.md`, `SYSTEM_URLS.md`, hướng dẫn cấu hình `.env` và bàn giao mã nguồn cho DevOps deploy lên cloud. | Bộ tài liệu hoàn chỉnh sẵn sàng nộp Giảng viên. |
| **TASK-67** | `FE-S4-11` | Ghi hình Video Demo Toàn diện Giao diện Website & Tất cả Luồng Nghiệp vụ | Với **Cả nhóm 5 SV** (Hội đồng nghiệm thu) | Quay video chất lượng cao (Full HD 1080p) trình diễn toàn bộ giao diện và thao tác thực tế: Cổng Khách hàng (đặt phòng 3 bước) và Cổng Quản trị Staff/PMS (sơ đồ phòng, walk-in, timeline, giao ca, dashboard KPI, responsive mobile). | File video MP4 hoàn chỉnh kèm link lưu trữ nộp báo cáo. |

---

### 📑 HƯỚNG DẪN CHI TIẾT 11 TASK SPRINT 4: TIÊU CHÍ HOÀN THÀNH & LẤY MINH CHỨNG BÁO CÁO / JIRA

---

#### 🔹 TASK-57 (Mã Jira: `FE-S4-01`) — Hoàn thiện State Toàn cục (AppContext) & Bộ Demo Switcher Chuyển Vai trò
* **Phối hợp nội bộ:** Phối hợp cùng **PM/Scrum Master** (thống nhất kịch bản demo chấm điểm) và **Backend** (đồng bộ định dạng JWT Token).
* **Mô tả công việc:** Hoàn thiện kho lưu trữ trạng thái toàn cục `src/context/AppContext.tsx`. Quản lý tập trung các biến trạng thái: người dùng hiện tại (`currentUser`), vai trò phân quyền (`role`), token xác thực (`token`), ngôn ngữ (`language`), trạng thái giữ phòng tạm thời (`holdCountdown`), đơn đặt phòng nháp đa bước (`draftBooking`) và modal cảnh báo tranh chấp phòng (`ConflictModal`). Đặc biệt, tích hợp tiện ích **Demo Switcher** (cho phép người dùng hoặc Giảng viên nhấp chọn chuyển đổi tức thời giữa 4 vai trò: `CUSTOMER`, `FRONT_DESK`, `MANAGER`, `ADMIN` để kiểm thử phân quyền ngay trên giao diện mà không cần đăng xuất đăng nhập thủ công nhiều lần).
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. `AppContext.tsx` quản lý phiên làm việc bền vững qua `localStorage` cho các khóa: `auth_token`, `nitro_user_role`, `nitro_user_info`, `nitro_language`.
  2. Dữ liệu đơn đặt phòng nháp `draftBooking` được bảo toàn xuyên suốt các màn hình `BookingStep1Page` -> `BookingStep2Page` -> `BookingStep3Page`.
  3. Tiện ích Demo Switcher (tại góc dưới Sidebar quản trị hoặc Header) cho phép chuyển đổi 1 chạm qua lại giữa các vai trò `FRONT_DESK`, `MANAGER`, `ADMIN` mượt mà, giao diện tự động cập nhật danh mục menu tương ứng.
  4. Cung cấp hook `useApp()` tiện dụng cho toàn bộ các trang con truy xuất state dễ dàng.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/overview` hoặc `http://localhost:5173/`
  * **Tài khoản / Vai trò:** Bất kỳ vai trò nào.
  * **Các bước thao tác:** Mở trang quản trị `/staff/overview` -> Nhấp vào khối hồ sơ người dùng ở chân Sidebar bên trái -> Menu popover *"Chuyển đổi Vai trò (Demo RBAC)"* hiện lên -> Lần lượt bấm chọn *"Lễ tân"*, *"Quản lý"*, *"Quản trị viên"* -> Quan sát danh mục menu trên Sidebar tự động co giãn theo vai trò.
  * **Vùng chụp ảnh màn hình:** Chụp cửa sổ trình duyệt hiển thị menu popover Demo Switcher đang mở kèm Sidebar thay đổi danh mục chức năng theo vai trò được chọn; mở thêm tab `F12` -> `Application` -> `Local Storage` làm nổi bật key `nitro_user_role`.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-01: Hoàn thiện AppContext toàn cục và bộ Demo Switcher RBAC. Cơ chế lưu phiên bền vững qua localStorage hoạt động ổn định, chuyển đổi vai trò 1-click phản hồi tức thời phục vụ demo đồ án."*

---

#### 🔹 TASK-58 (Mã Jira: `FE-S4-02`) — Hiện thực Hóa Kiến trúc Dual-Mode API (Mock & Real REST API)
* **Phối hợp nội bộ:** Phối hợp cùng **Backend/API + DevOps** (kiểm tra kết nối REST API) và **Database + QA** (đối soát tập dữ liệu).
* **Mô tả công việc:** Hoàn thiện tầng giao tiếp dữ liệu `src/services/api.ts` với kiến trúc Dual-Mode thông minh: Đọc biến môi trường `VITE_USE_MOCK` và `VITE_API_URL` từ file `.env`. Nếu `VITE_USE_MOCK=true` (hoặc Backend offline), hệ thống kích hoạt cơ chế In-memory Mock Data fallback giúp toàn bộ 27 màn hình vẫn hoạt động 100% trơn tru, không bị lỗi mạng; khi `VITE_USE_MOCK=false`, hệ thống tự động gửi HTTP Request thật (Fetch API) đến server Backend kèm header xác thực `Authorization: Bearer <token>`.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. File `src/services/api.ts` hiện thực đầy đủ các services: `authService`, `roomService`, `bookingService`, `customerService`, `shiftService`, `settingService`, `reportService`.
  2. Mỗi phương thức API đều có 2 nhánh xử lý: Nhánh gọi REST API thật và Nhánh In-Memory Mock fallback độc lập.
  3. Khi Backend chưa bật hoặc gặp lỗi kết nối (Network Error / HTTP 500), hệ thống xử lý ngoại lệ thanh lịch (Graceful Degradation), hiển thị thông báo lỗi thân thiện thay vì làm trắng màn hình.
  4. Chuyển đổi linh hoạt giữa 2 chế độ chỉ bằng cách sửa giá trị biến môi trường trong file `.env`.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **URL kiểm thử:** `http://localhost:5173/rooms` hoặc `http://localhost:5173/staff/bookings`
  * **Các bước thao tác:** Mở file `.env` kiểm tra cấu hình `VITE_USE_MOCK=true` và `VITE_API_URL`; mở trình duyệt nhấn `F12` -> Chọn tab **Network** -> Tải lại trang (F5) -> Quan sát danh sách phòng và đơn đặt phòng hiển thị đầy đủ; kiểm tra mã nguồn `api.ts` đoạn logic kiểm tra `IS_MOCK_CONFIGURED`.
  * **Vùng chụp ảnh màn hình:** Chụp 2 cửa sổ cạnh nhau: (1) Trình soạn thảo VS Code hiển thị file `.env` và đoạn mã điều hướng `IS_MOCK_CONFIGURED` trong `src/services/api.ts`; (2) Trình duyệt hiển thị danh sách phòng hoạt động mượt mà kèm tab DevTools Network.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-02: Hoàn thiện kiến trúc Dual-Mode API trong `src/services/api.ts`. Đã kiểm thử chuyển mạch trơn tru giữa Local Mock In-memory và Backend REST API, bảo đảm ứng dụng không bao giờ bị gián đoạn khi demo."*

---

#### 🔹 TASK-59 (Mã Jira: `FE-S4-03`) — Tối ưu Giao diện Tương thích Đa Thiết bị (Responsive Mobile & Tablet)
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Tối ưu hóa giao diện hiển thị thích ứng (Responsive Web Design) toàn diện trên các kích thước màn hình: Mobile (375px - 430px như iPhone SE/14/15), Tablet (768px - 1024px như iPad Air/Mini) và Desktop (1280px - 1920px). Tinh chỉnh thanh Header khách hàng chuyển thành Hamburger Menu kèm ngăn kéo vuốt (Mobile Drawer), Sidebar nhân viên hỗ trợ nút Drawer mở rộng từ cạnh trái, bảng ma trận Sơ đồ phòng PMS co giãn linh hoạt hoặc cho phép cuộn ngang nội bộ mà không làm vỡ bố cục tổng thể.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Giao diện Cổng Khách hàng (`CustomerLayout`): Trên màn hình < 1024px, thanh điều hướng tự động chuyển thành icon Hamburger; click vào mở ngăn kéo Mobile Drawer hiển thị đầy đủ các liên kết điều hướng và nút đổi ngôn ngữ.
  2. Giao diện Cổng Quản trị (`StaffLayout`): Trên Mobile/Tablet, Sidebar thu thành Drawer ẩn; Topbar hiển thị icon mở menu, thanh tìm kiếm nhanh tự co giãn tỷ lệ vừa vặn.
  3. Màn hình Sơ đồ buồng phòng (`RoomBoardPage`) và Timeline (`BookingTimelinePage`) trên điện thoại di động hiển thị dạng thẻ danh sách gọn gàng hoặc cuộn mượt mà, không xuất hiện thanh cuộn ngang ngoài ý muốn (No Horizontal Page Overflow).
  4. 100% các nút bấm và ô nhập liệu trên điện thoại đạt chuẩn kích thước vùng chạm tối thiểu 44x44px theo Apple Human Interface Guidelines.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **URL kiểm thử:** `http://localhost:5173/` (Trang chủ) và `http://localhost:5173/staff/room-board` (Sơ đồ phòng).
  * **Các bước thao tác:** Mở trình duyệt Google Chrome -> Nhấn `F12` -> Bật chế độ giả lập thiết bị di động (Toggle Device Toolbar, phím tắt `Ctrl + Shift + M`) -> Chọn cấu hình **iPhone 14 Pro Max** (430 x 932) -> Thử bấm mở menu Drawer; sau đó đổi sang **iPad Air** (820 x 1180) -> Kiểm tra hiển thị sơ đồ phòng.
  * **Vùng chụp ảnh màn hình:** Chụp 2 ảnh màn hình: (1) Trang chủ khách hàng trên khung mô phỏng iPhone kèm menu Drawer đang mở; (2) Trang Sơ đồ phòng PMS trên khung mô phỏng iPad/Tablet hiển thị lưới phòng sắc nét và cân đối.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-03: Giao diện đạt chuẩn Responsive 100% trên các thiết bị Mobile, Tablet và Desktop. Drawer navigation và ma trận sơ đồ phòng hoạt động trơn tru, không có hiện tượng vỡ layout hay tràn màn hình."*

---

#### 🔹 TASK-60 (Mã Jira: `FE-S4-04`) — Tinh chỉnh Vi hoạt ảnh (Micro-animations) & Trạng thái Trực quan (State Views)
* **Phối hợp nội bộ:** Tự thực hiện bởi vai trò **UI-UX + Frontend**.
* **Mô tả công việc:** Nâng cấp độ hoàn thiện trải nghiệm người dùng với các hiệu ứng vi hoạt ảnh (Micro-animations) mượt mà sử dụng CSS transitions và thư viện Motion: hiệu ứng trượt êm ái khi mở Modal/Drawer, hiệu ứng phóng to nhẹ (Hover Zoom) trên các thẻ phòng tiêu biểu chuẩn 4 sao, hệ thống thông báo Toast nổi góc màn hình tự động biến mất sau 3 giây; hoàn thiện bộ thành phần trạng thái dữ liệu `src/components/common/StateViews.tsx` bao gồm khung xương chờ tải (Skeleton Loading), thông báo danh sách rỗng (Empty State) và màn hình báo lỗi (Error State).
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Toàn bộ các hộp thoại Modal (nhận phòng, trả phòng, thêm dịch vụ, sửa giá...) đều có hiệu ứng xuất hiện mở rộng nhẹ nhàng (fade-in & zoom-in), nền tối làm mờ phía sau (Backdrop blur).
  2. Thông báo Toast nổi xuất hiện ở góc phải màn hình phản hồi tức thì các thao tác của người dùng: Thông báo thành công màu xanh lá, Cảnh báo màu vàng hổ phách, Thất bại màu đỏ.
  3. Màn hình hiển thị khung xương Skeleton Loader dạng sóng nhấp nháy (Shimmer Animation) trong thời gian chờ nạp dữ liệu danh sách phòng hoặc báo cáo KPI, loại bỏ hiện tượng giật cục bố cục (Cumulative Layout Shift - CLS).
  4. Hiển thị hình minh họa đồ họa và thông điệp trang nhã khi danh sách đơn đặt phòng hoặc kết quả tìm kiếm rỗng (Empty State).
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **URL kiểm thử:** `http://localhost:5173/staff/settings` (thao tác lưu cấu hình) hoặc `http://localhost:5173/rooms?guests=20` (tìm kiếm không có phòng).
  * **Các bước thao tác:** Tại trang Cài đặt hệ thống, nhấn nút *"Lưu cài đặt"* để kích hoạt Toast thông báo thành công; hoặc lọc phòng với số khách quá lớn để kích hoạt màn hình Empty State "Không tìm thấy phòng phù hợp".
  * **Vùng chụp ảnh màn hình:** Chụp thông báo Toast màu xanh lá nổi bật góc trên bên phải màn hình và giao diện Empty State hiển thị hình minh họa tinh tế kèm nút bấm "Đặt lại bộ lọc".
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-04: Tích hợp hoàn thiện hệ thống vi hoạt ảnh Motion, thông báo Toast thời gian thực và các trạng thái Skeleton Loading / Empty State sang trọng chuẩn khách sạn 4 sao."*

---

#### 🔹 TASK-61 (Mã Jira: `FE-S4-05`) — Kiểm thử Đơn vị (Unit Test) Hàm Tiện ích & Tính toán Tài chính
* **Phối hợp nội bộ:** Phối hợp cùng **Database + QA / Tester** (kiểm định độ bao phủ test case).
* **Mô tả công việc:** Xây dựng và thực thi bộ kiểm thử đơn vị tự động (Unit Tests) cho toàn bộ các hàm tiện ích và thuật toán tính toán trong `src/utils/format.ts`: hàm định dạng tiền tệ Việt Nam Đồng (`formatCurrency`), chuẩn hóa định dạng ngày tháng (`formatDate`), ẩn danh dữ liệu nhạy cảm của khách hàng (`maskPhone`, `maskIdCard`), thuật toán tính số đêm lưu trú, công thức tính phụ phí dịch vụ và đặc biệt là logic tính tỷ lệ tiền hoàn hủy phòng theo thời gian quy định của BA/PO.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. 100% các hàm nghiệp vụ trong `src/utils/format.ts` được bao phủ kịch bản kiểm thử: Kiểm tra định dạng tiền VND (VD: `1500000` -> `"1.500.000 ₫"`), định dạng ngày (`"2026-10-30"` -> `"30/10/2026"`), che số điện thoại (`"0901234567"` -> `"090****567"`).
  2. Kịch bản tính hoàn tiền hủy phòng được kiểm thử đạt độ chính xác tuyệt đối: Hủy trước > 48h (hoàn 100%), hủy trong 24h - 48h (hoàn 50%), hủy dưới 24h (hoàn 0%).
  3. Kiểm thử xử lý an toàn các dữ liệu ngoại lệ (Edge Cases): Giá trị 0, chuỗi rỗng `""`, dữ liệu `undefined`, số âm.
  4. Script kiểm thử thực thi thông qua lệnh tự động trong Terminal và trả về kết quả 100% Pass (Zero Failure).
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **Môi trường thực hiện:** Cửa sổ Terminal (PowerShell / Command Prompt).
  * **Các bước thao tác:** Mở Terminal tại thư mục `frontend` -> Gõ lệnh thực thi kịch bản kiểm thử: `npm run test:smoke` (hoặc test runner tương ứng) -> Quan sát các nhóm kiểm thử (Test Suites) chạy tự động.
  * **Vùng chụp ảnh màn hình:** Chụp toàn bộ cửa sổ dòng lệnh Terminal hiển thị danh sách các bài test chạy thành công với dấu tích xanh `✓`, thời gian thực thi mili-giây và dòng tổng kết kết quả đạt 100% Pass.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-05: Bộ Unit Test cho các hàm tiện ích định dạng và tính toán tài chính thực thi thành công 100% (Zero Errors). Toàn bộ các quy tắc hoàn tiền hủy phòng và định dạng tiền tệ đều vượt qua kiểm định."*

---

#### 🔹 TASK-62 (Mã Jira: `FE-S4-06`) — Phối hợp Kiểm thử Tích hợp Luồng Khách hàng (Customer Booking Flow E2E)
* **Phối hợp nội bộ:** Phối hợp cùng **Database + QA / Tester** (chạy kịch bản) và **BA/PO** (nghiệm thu nghiệp vụ).
* **Mô tả công việc:** Phối hợp cùng QA thực thi kịch bản kiểm thử tích hợp đầu-cuối (End-to-End Integration Test) trên toàn bộ phân hệ Khách hàng (Customer Portal): Bắt đầu từ Trang chủ -> Dùng bộ chọn ngày và đếm khách tìm kiếm phòng -> Xem danh sách phòng lọc theo hạng Deluxe -> Xem trang chi tiết tiện nghi phòng -> Trải nghiệm quy trình đặt phòng 3 bước (chọn dịch vụ đón tiễn/ăn sáng, điền form thông tin khách kèm số CCCD, chọn thanh toán mô phỏng chuyển khoản QR ngân hàng) -> Nhận trang xác nhận đặt phòng thành công với mã đơn PNR và mã QR check-in -> Vào trang "Đặt phòng của tôi" tra cứu và thử nghiệm quy trình hủy phòng kiểm tra công thức tính hoàn tiền.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Luồng trải nghiệm khách hàng diễn ra liền mạch xuyên suốt 7 màn hình, không gặp lỗi gián đoạn hoặc sai lệch dữ liệu giữa các bước.
  2. Đồng hồ giữ phòng (Hold Countdown) đếm ngược chính xác 10 phút, cảnh báo kịp thời nếu phòng bị hết hạn giữ chỗ.
  3. Mã đơn hàng duy nhất dạng `BK-XXXXXX` được sinh tự động, lưu vào danh sách đơn và đồng bộ tức thời sang phân hệ quản trị của Lễ tân.
  4. Thao tác hủy đơn tính đúng số tiền hoàn lại theo chính sách thời gian hủy của khách sạn.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **URL kiểm thử:** Quy trình liên hoàn từ `http://localhost:5173/` -> `/rooms` -> `/rooms/deluxe-city` -> `/booking/step-1` -> `/booking/step-2` -> `/booking/step-3` -> `/my-bookings`.
  * **Tài khoản / Vai trò:** Vai trò `CUSTOMER` (Khách hàng).
  * **Các bước thao tác:** Tiến hành đặt 1 phòng Deluxe 2 đêm -> Hoàn tất thanh toán tại Step 3 -> Màn hình xác nhận thành công xuất hiện mã đơn `BK-...` -> Vào trang "Đặt phòng của tôi" bấm xem chi tiết đơn vừa đặt.
  * **Vùng chụp ảnh màn hình:** Chụp màn hình Xác nhận đặt phòng thành công (`BookingDetailPage.tsx`) hiển thị mã QR check-in, mã đơn PNR và bảng kê chi phí; kèm ảnh chụp đơn này đã xuất hiện trong danh sách "Đặt phòng của tôi".
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-06: Phối hợp QA kiểm thử tích hợp luồng Khách hàng (Customer Booking Journey E2E) thành công 100%. Luồng đặt phòng 3 bước, sinh mã QR check-in và tính hoàn hủy phòng hoạt động chính xác."*

---

#### 🔹 TASK-63 (Mã Jira: `FE-S4-07`) — Kiểm thử Tương thích Đa Trình duyệt & Rà soát An toàn Thông tin Frontend
* **Phối hợp nội bộ:** Phối hợp cùng **Backend/API + DevOps** (rà soát an ninh) và **Database + QA** (kiểm thử trình duyệt).
* **Mô tả công việc:** Thực hiện kiểm thử tính tương thích giao diện và tính năng trên 4 trình duyệt web thị phần lớn nhất: Google Chrome, Microsoft Edge, Mozilla Firefox và Apple Safari (WebKit); cùng thành viên DevOps rà soát an toàn thông tin tại tầng giao diện: kiểm tra cơ chế phòng chống tấn công XSS (Cross-Site Scripting) trong các trường biểu mẫu, kiểm tra tính bảo mật của việc lưu trữ Token trong `localStorage`, và rà soát dọn sạch toàn bộ các câu lệnh `console.log` chứa dữ liệu nhạy cảm trước khi phát hành.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Giao diện hiển thị sắc nét, đồng nhất về font chữ, màu sắc và bố cục trên cả 4 trình duyệt (Chrome, Edge, Firefox, Safari).
  2. Biểu mẫu nhập liệu tự động mã hóa an toàn (HTML escaping): Thử nghiệm chèn các chuỗi mã độc `<script>alert('XSS')</script>` vào ô Họ tên, Ghi chú đều được hiển thị dưới dạng chuỗi văn bản thông thường, hoàn toàn không bị thực thi script lạ.
  3. Không có bất kỳ dữ liệu mật (như password, private token) bị ghi ra cửa sổ Console log của trình duyệt.
  4. Cơ chế bảo vệ đường dẫn (Route Guard) chặn an toàn các truy cập trái phép từ bên ngoài.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **URL kiểm thử:** `http://localhost:5173/login` và `http://localhost:5173/booking/step-2`.
  * **Các bước thao tác:** Mở website song song trên 2 trình duyệt khác nhau (Google Chrome và Microsoft Edge); tại trang nhập thông tin đặt phòng, nhập thử chuỗi mã độc `<script>` vào ô Ghi chú -> Nhấn Tiếp tục -> Mở tab `F12` Console quan sát.
  * **Vùng chụp ảnh màn hình:** Chụp 2 cửa sổ trình duyệt Chrome và Edge đặt cạnh nhau hiển thị website đồng bộ, kèm cửa sổ DevTools Console sạch sẽ không có cảnh báo bảo mật.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-07: Website hoạt động tương thích hoàn hảo trên đa trình duyệt (Chrome, Edge, Firefox, Safari). Đã rà soát bảo mật phòng chống XSS và dọn sạch Console log dữ liệu nhạy cảm."*

---

#### 🔹 TASK-64 (Mã Jira: `FE-S4-08`) — Đo lường & Tối ưu Hiệu năng Web (Google Lighthouse Performance Audit)
* **Phối hợp nội bộ:** Phối hợp cùng **Backend/API + DevOps** (tối ưu cấu hình nén và cache server).
* **Mô tả công việc:** Sử dụng công cụ kiểm thử tiêu chuẩn công nghiệp Google Lighthouse (tích hợp sẵn trong Chrome DevTools) để phân tích, đo lường và tối ưu hóa toàn diện hiệu năng của trang web: tối ưu hóa kích thước hình ảnh buồng phòng (áp dụng lazy loading `loading="lazy"`), kiểm soát chỉ số xê dịch bố cục (CLS < 0.1), tối ưu thời gian phản hồi tương tác (INP) và thời gian hiển thị nội dung lớn nhất (LCP < 2.5s) nhằm đem lại trải nghiệm mượt mà xứng tầm thương hiệu khách sạn 4 sao.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Báo cáo đánh giá Google Lighthouse đạt mức điểm Xanh (Green Score) trên cả 4 tiêu chí cốt lõi: **Performance >= 90**, **Accessibility >= 90**, **Best Practices >= 90**, **SEO >= 90**.
  2. Thời gian vẽ nội dung đầu tiên (First Contentful Paint - FCP) đạt dưới 1.2 giây.
  3. Toàn bộ hình ảnh buồng phòng có thuộc tính `alt` mô tả rõ ràng hỗ trợ trợ năng (Accessibility) và được cố định tỉ lệ khung hình để chống giật layout.
  4. Mã nguồn JavaScript và CSS được Vite tối ưu hóa, loại bỏ mã thừa (Tree-shaking).
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **URL kiểm thử:** `http://localhost:5173/` (Trang chủ khách hàng).
  * **Các bước thao tác:** Mở trình duyệt Google Chrome ở chế độ ẩn danh (Incognito) -> Truy cập trang chủ -> Nhấn `F12` -> Chọn tab **Lighthouse** -> Chọn chế độ thiết bị Desktop/Mobile -> Nhấn nút **Analyze page load** -> Chờ công cụ chạy kiểm định và xuất báo cáo.
  * **Vùng chụp ảnh màn hình:** Chụp toàn cảnh bảng điểm Google Lighthouse Audit với 4 vòng tròn điểm số màu xanh lá cây (> 90 điểm) kèm các chỉ số Core Web Vitals (FCP, LCP, CLS, TBT).
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-08: Tối ưu hiệu năng ứng dụng thành công. Báo cáo Google Lighthouse đạt 4 điểm Xanh tuyệt đối (Performance: 94, Accessibility: 98, Best Practices: 100, SEO: 100), tốc độ tải trang dưới 1.2s."*

---

#### 🔹 TASK-65 (Mã Jira: `FE-S4-09`) — Kiểm định Bản dựng Đóng gói Production (Zero-Error Build Verification)
* **Phối hợp nội bộ:** Phối hợp cùng **Backend/API + DevOps** (chuẩn bị hạ tầng deploy) và **Database + QA** (chứng nhận chất lượng).
* **Mô tả công việc:** Thực hiện quy trình kiểm định chất lượng bản dựng cuối cùng (Production Build Certification): Chạy kiểm tra tĩnh toàn bộ mã nguồn TypeScript bằng lệnh `npm run lint` (`tsc --noEmit`) nhằm bảo đảm mã nguồn sạch 100% không còn bất kỳ lỗi type hay cảnh báo nào; thực thi lệnh đóng gói hoàn chỉnh `npm run build` tạo thư mục `dist/` đóng gói nhẹ gọn; khởi chạy máy chủ xem trước `npm run preview` để kiểm thử độ tin cậy của sản phẩm đã đóng gói trước khi bàn giao đưa lên máy chủ sản xuất.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Lệnh kiểm tra kiểu `tsc --noEmit` hoàn thành với 0 lỗi cảnh báo (Zero TypeScript Compile Errors).
  2. Lệnh `npm run build` biên dịch thành công tạo thư mục `dist/` chứa mã HTML, CSS và các file JavaScript chunks đã được nén tối ưu (Minified & Gzipped).
  3. Khởi chạy máy chủ preview thành công tại cổng `http://localhost:4173/`; ứng dụng vận hành trơn tru, toàn bộ 27 màn hình đều hiển thị chuẩn xác, không gặp lỗi 404 khi tải lại trang (F5 Page Refresh).
  4. Mở tab Console trình duyệt trong chế độ preview không xuất hiện bất kỳ lỗi đỏ nào.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **Môi trường kiểm thử:** Cửa sổ Terminal tại thư mục `frontend` và trình duyệt web tại `http://localhost:4173/`.
  * **Các bước thao tác:** Trong Terminal chạy lần lượt các lệnh:
    1. `npm run lint` (hoặc `npx tsc --noEmit`) để xác nhận không có lỗi code.
    2. `npm run build` để đóng gói Vite production.
    3. `npm run preview` để khởi chạy máy chủ xem trước bản build.
    4. Mở trình duyệt truy cập `http://localhost:4173/` để kiểm tra.
  * **Vùng chụp ảnh màn hình:** Chụp cửa sổ Terminal hiển thị thông báo build thành công của Vite (thời gian build, danh sách file `.html`, `.js`, `.css` trong thư mục `dist/` với dung lượng gzip nhẹ) kèm giao diện trang web chạy trên cổng preview 4173.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-09: Đóng gói bản dựng Production thành công 100%. TypeScript biên dịch 0 lỗi, thư mục `dist/` được tối ưu gọn nhẹ, máy chủ preview cổng 4173 hoạt động ổn định và sẵn sàng bàn giao cho DevOps."*

---

#### 🔹 TASK-66 (Mã Jira: `FE-S4-10`) — Hoàn thiện Bộ Hồ sơ Tài liệu Kỹ thuật & Bàn giao Triển khai
* **Phối hợp nội bộ:** Phối hợp cùng **PM/Scrum Master** (duyệt tổng thể hồ sơ) và **Backend/DevOps** (tiếp nhận triển khai).
* **Mô tả công việc:** Tổng hợp, rà soát và hoàn thiện toàn bộ hệ sinh thái tài liệu kỹ thuật của phân hệ Frontend: cập nhật file `README.md` với đầy đủ các hướng dẫn cài đặt và khởi chạy ứng dụng từ zero code; chuẩn hóa tài liệu danh mục 27 đường dẫn URL nghiệp vụ (`SYSTEM_URLS.md`); cập nhật hướng dẫn thiết lập biến môi trường `.env.example`; đóng gói và bàn giao toàn bộ mã nguồn sạch cho thành viên Backend + DevOps để tiến hành triển khai lên môi trường hosting đám mây (Vercel / Netlify / Docker).
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. File `frontend/README.md` cung cấp đầy đủ: Ngăn xếp công nghệ, yêu cầu môi trường Node.js, lệnh cài đặt dependencies, lệnh chạy dev, lệnh build production và danh sách tài khoản demo các vai trò.
  2. Bảng danh mục 27 URL nghiệp vụ trong `SYSTEM_URLS.md` khớp chính xác 100% với cây định tuyến trong `src/App.tsx`.
  3. Bàn giao mã nguồn thành công trên Git Repository (commit gắn tag phiên bản phát hành `v1.0.0-release`), có biên bản nghiệm thu bàn giao giữa Frontend, PM và DevOps.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **URL kiểm thử / File tài liệu:** `frontend/README.md` và `frontend/docs/` trên trình soạn thảo VS Code hoặc giao diện GitHub Repository.
  * **Các bước thao tác:** Mở file `README.md` xem cấu trúc hướng dẫn cài đặt và tài liệu `SYSTEM_URLS.md`; kiểm tra lịch sử Git commit xác nhận tag bàn giao phát hành.
  * **Vùng chụp ảnh màn hình:** Chụp giao diện file `README.md` hiển thị hướng dẫn cài đặt và danh sách tài khoản mẫu, hoặc màn hình xác nhận bàn giao mã nguồn trên GitHub/Git commit sạch sẽ.
  * **Mẫu báo cáo nộp Jira:**  
    > *"Đã hoàn thành FE-S4-10: Hoàn tất bộ hồ sơ tài liệu kỹ thuật Frontend, cập nhật đầy đủ README và danh mục 27 URLs nghiệp vụ, bàn giao thành công mã nguồn release v1.0.0 cho DevOps triển khai."*

---

#### 🔹 TASK-67 (Mã Jira: `FE-S4-11`) — Ghi hình Video Demo Toàn diện Giao diện Website & Tất cả Luồng Nghiệp vụ (Walkthrough Video Recording)
* **Phối hợp nội bộ:** Phối hợp cùng **Cả nhóm 5 Sinh viên** (PM, BA, Frontend, Backend, QA) để cùng nghiệm thu và làm tư liệu bảo vệ đồ án.
* **Mô tả công việc:** **TASK CUỐI CÙNG ĐẶC BIỆT CỦA DỰ ÁN FRONTEND THEO YÊU CẦU NGHIỆM THU ĐỒ ÁN:** Thành viên đảm nhiệm vai trò UI-UX + Frontend thực hiện quay lại video màn hình (Screen Recording) chất lượng cao (độ phân giải Full HD 1080p, tối thiểu 30-60 fps, âm thanh thuyết minh rõ ràng hoặc có phụ đề chú thích từng bước) trình diễn toàn bộ giao diện và thao tác thực tế trên trang web Nitro Grand Hotel từ đầu đến cuối theo kịch bản chuẩn 5 phần:
  * **🎬 KỊCH BẢN QUAY VIDEO DEMO CHI TIẾT (THỜI LƯỢNG 8 - 12 PHÚT):**
    1. **Phần 1 - Khởi động & Nhận diện Thương hiệu (0:00 - 1:00):** Giới thiệu kiến trúc dự án, thanh Topbar địa chỉ/hotline, nút chuyển đổi đa ngôn ngữ Tiếng Việt / Tiếng Anh hoạt động tức thời, bố cục thiết kế 4 sao chuẩn theo tài liệu `DESIGNSYSTEM COLOR TYPOGRAPHY.docx`.
    2. **Phần 2 - Trải nghiệm Cổng Khách hàng / Customer Portal (1:00 - 4:00):**
       - Trình diễn Trang chủ (`HomePage`): Hero Banner sang trọng, khối phòng tiêu biểu, tiện ích hồ bơi/spa.
       - Thao tác bộ chọn ngày nhận/trả phòng (`DateRangePicker`) và bộ đếm số lượng khách (`GuestCounter`).
       - Trang tìm kiếm (`SearchResultsPage`): Lọc theo hạng phòng Deluxe, sắp xếp giá, xem thẻ phòng.
       - Trang chi tiết phòng (`RoomDetailPage`): Slider ảnh thực tế, tiện nghi phòng, chính sách nhận/trả.
       - Trải nghiệm quy trình đặt phòng 3 bước:
         + *Bước 1 (`BookingStep1Page`):* Chọn dịch vụ xe đưa đón sân bay, buffet sáng, kiểm tra đồng hồ giữ phòng 10 phút.
         + *Bước 2 (`BookingStep2Page`):* Điền form thông tin khách, số CCCD/Hộ chiếu, SĐT, email.
         + *Bước 3 (`BookingStep3Page`):* Chọn phương thức thanh toán mô phỏng chuyển khoản QR ngân hàng.
       - Trang xác nhận đặt phòng (`BookingDetailPage`): Cấp mã đơn PNR `BK-XXXXXX`, mã QR check-in, bảng kê chi phí.
       - Trang "Đặt phòng của tôi" (`MyBookingsPage`): Tra cứu danh sách đơn đã đặt, thử nghiệm bấm hủy đơn xem modal tính tiền hoàn lại theo quy định.
    3. **Phần 3 - Trải nghiệm Cổng Quản trị Vận hành / Staff & PMS Portal (4:00 - 8:30):**
       - Mở thanh Demo Switcher đổi vai trò sang Lễ tân (`FRONT_DESK`).
       - Màn hình Sơ đồ buồng phòng (`RoomBoardPage`): Trực quan hóa 60 phòng phân theo 10 tầng; thanh thống kê 5 trạng thái phòng; thao tác 1 chạm đổi phòng Chờ dọn sang Sạch sẵn sàng đón khách (`CLEANING` -> `AVAILABLE`).
       - Quy trình đón khách vãng lai tại quầy (`WalkInBookingPage`): Chọn phòng trống, nhập CCCD, thu tiền cọc và bấm nhận phòng tức thì (`Instant Check-in`) -> Quay lại Sơ đồ phòng kiểm tra phòng tự đổi sang màu xanh `OCCUPIED`.
       - Màn hình Timeline công suất buồng phòng (`BookingTimelinePage`): Biểu đồ Gantt trực quan hóa đơn đặt phòng theo trục thời gian các ngày trong tuần.
       - Danh sách đơn nội bộ (`BookingsListPage`) và Chi tiết đơn (`BookingDetailStaffPage`): Thao tác thêm dịch vụ minibar vào hóa đơn phòng và bấm lệnh in biên lai (`window.print()`).
       - Màn hình Tổng quan ca trực lễ tân (`ShiftOverviewPage`): Thống kê doanh thu tiền mặt két và chuyển khoản, ghi sổ giao ban và mở modal đóng ca trực kiểm kê tiền két phát hiện chênh lệch.
    4. **Phần 4 - Phân hệ Quản lý & Quản trị Cấp cao / Management & Admin (8:30 - 10:30):**
       - Đổi vai trò sang Quản lý (`MANAGER`) và Quản trị viên (`ADMIN`).
       - Màn hình Dashboard KPI (`DashboardPage`): Theo dõi tỷ lệ kín phòng hôm nay, doanh thu tích lũy tháng, danh sách khách đến và đi trong ngày.
       - Báo cáo tài chính (`ReportsPage`): Biểu đồ đường và cột Recharts trực quan tương tác rê chuột xem doanh thu từng hạng phòng.
       - Màn hình Quản lý danh mục 6 hạng phòng (`RoomTypesManagePage`) và Quản lý 60 phòng vật lý (`RoomsManagePage`).
       - Màn hình Quản lý nhân sự và phân quyền RBAC (`UsersPermissionsPage`): Thao tác tạo nhân viên mới, gán vai trò và bấm khóa/mở tài khoản.
       - Màn hình Cài đặt thông số khách sạn (`SystemSettingsPage`) và Nhật ký vết hệ thống (`AuditLogsPage`).
    5. **Phần 5 - Trình diễn Tương thích Responsive & Đóng máy (10:30 - 12:00):**
       - Nhấn `F12` chuyển sang chế độ giả lập thiết bị di động (iPhone / iPad).
       - Trình diễn thao tác vuốt menu Drawer trên di động và giao diện tự co giãn mượt mà.
       - Tóm tắt kết quả nghiệm thu và lời cảm ơn kết thúc video.
* **🎯 Tiêu Chí Hoàn Thành (Definition of Done):**
  1. Video được quay hoàn chỉnh với thời lượng từ **8 đến 12 phút**, độ phân giải chuẩn **Full HD (1920x1080)**, tốc độ khung hình 30-60 fps, hình ảnh rõ nét, không bị giật lag hay mờ chữ.
  2. Video thể hiện đầy đủ và liền mạch 100% các phân hệ (Customer Portal, Staff PMS, Management & Admin Dashboard, Responsive Mobile).
  3. Video được xuất thành định dạng file MP4 tiêu chuẩn, đặt tên đúng quy chuẩn: `Nitro_Grand_Hotel_Frontend_Full_Demo_Walkthrough.mp4`.
  4. File video được lưu trữ an toàn trong thư mục tài liệu dự án và được tải lên Google Drive / YouTube (chế độ Không công khai - Unlisted) kèm đường link công khai trong tài liệu báo cáo để Giảng viên và Hội đồng dễ dàng xem lại bất cứ lúc nào.
* **📸 Hướng dẫn Lấy Minh Chứng Nộp Báo Cáo / Jira:**
  * **Công cụ sử dụng để quay:** Sử dụng phần mềm OBS Studio, Xbox Game Bar (phím tắt `Windows + G` trên Windows) hoặc tiện ích mở rộng trình duyệt (Loom / Screenity).
  * **Các bước thao tác:**
    1. Khởi chạy ứng dụng Frontend trên máy tính (`npm run dev`).
    2. Bật công cụ quay màn hình ở chế độ ghi hình toàn màn hình hoặc ghi hình cửa sổ trình duyệt Google Chrome.
    3. Thực hiện lần lượt kịch bản 5 phần từ Cổng Khách hàng đến Cổng Quản trị như hướng dẫn chi tiết ở trên.
    4. Dừng quay, lưu file video MP4 vào thư mục `docs/demo-video/` hoặc upload lên Google Drive của nhóm.
  * **Vùng chụp ảnh màn hình làm báo cáo:**
    1. Chụp ảnh màn hình cửa sổ phần mềm quay video (hoặc video player như VLC / Windows Media Player / YouTube) đang phát video demo tại phân đoạn Trang chủ Khách hàng.
    2. Chụp ảnh màn hình video đang phát tại phân đoạn Sơ đồ buồng phòng PMS của Lễ tân.
    3. Chụp ảnh bảng thuộc tính file video (Properties: định dạng `.mp4`, độ phân giải 1920x1080, thời lượng, dung lượng file) và đường link Google Drive lưu trữ video demo.
  * **Mẫu báo cáo nộp Báo cáo / Jira:**  
    > *"Đã hoàn thành xuất sắc FE-S4-11: Ghi hình hoàn tất Video Demo toàn diện giao diện website Nitro Grand Hotel (thời lượng 10 phút 45 giây, Full HD 1080p). Video trình diễn trọn vẹn 100% các luồng nghiệp vụ khách hàng và vận hành khách sạn 4 sao. File video `Nitro_Grand_Hotel_Frontend_Full_Demo_Walkthrough.mp4` đã được lưu trữ và đính kèm liên kết xem trực tuyến cho Hội đồng chấm đồ án."*

---

## 🔍 MA TRẬN ÁNH XẠ 100% GIỮA CÁC TASK VÀ MÃ NGUỒN THỰC TẾ (TRACEABILITY MATRIX)

| Thành phần Mã nguồn Hiện tại | Đường dẫn File trong Project | Được Tạo & Hoàn Thiện Tại Task |
| :--- | :--- | :---: |
| **Root & Router Configuration** | `src/App.tsx`, `src/main.tsx` | **TASK-10, FE-S3-02 (TASK-32), FE-S4-01 (TASK-57)** |
| **Global Styling & Tailwind** | `src/index.css`, `vite.config.ts` | **TASK-07, TASK-10** |
| **TypeScript Entities & DTOs** | `src/types/index.ts` | **TASK-08, FE-S3-01 (TASK-31)** |
| **API Client & Dual-Mode Service** | `src/services/api.ts` | **TASK-09, FE-S4-02 (TASK-58)** |
| **Bộ Dữ liệu Mẫu 4 Sao (Mock)** | `src/mocks/data.ts` | **TASK-09, TASK-29, FE-S3-05 (TASK-35)** |
| **State Toàn cục (Global State)** | `src/context/AppContext.tsx` | **FE-S3-01 (TASK-31), FE-S4-01 (TASK-57)** |
| **Đa ngôn ngữ VI / EN (i18n)** | `src/i18n/index.ts` | **TASK-14, TASK-28** |
| **Hàm Tiện ích Định dạng & Xử lý** | `src/utils/format.ts` | **FE-S4-05 (TASK-61)** |
| **Khung Bố cục Khách hàng** | `src/layouts/CustomerLayout.tsx` | **TASK-12, FE-S4-03 (TASK-59)** |
| **Khung Bố cục Nhân viên & RBAC** | `src/layouts/StaffLayout.tsx` | **TASK-13, FE-S3-02..04 (TASK-32..34), FE-S4-01 (TASK-57)** |
| **Thành phần Cơ sở (Base UI)** | `src/components/common/Button.tsx`, `Modal.tsx`, `Drawer.tsx`, `StatusBadge.tsx`, `StatCard.tsx` | **TASK-11, FE-S3-05 (TASK-35)** |
| **Thành phần Bộ chọn Khách & Ngày**| `src/components/common/DateRangePicker.tsx`, `GuestCounter.tsx` | **TASK-17, FE-S3-09 (TASK-39)** |
| **Thành phần Thẻ Phòng Khách sạn**| `src/components/common/RoomCard.tsx` | **TASK-18, FE-S3-06 (TASK-36)** |
| **Thành phần Giữ Phòng & Xung Đột**| `src/components/common/HoldCountdown.tsx`, `ConflictModal.tsx` | **TASK-21** |
| **Thành phần Trạng thái (Loading/Empty)**| `src/components/common/StateViews.tsx` | **FE-S4-04 (TASK-60)** |
| **Phân hệ Xác thực (3 trang)** | `src/pages/auth/LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx` | **TASK-10, FE-S4-01 (TASK-57)** |
| **Trang chủ Khách hàng** | `src/pages/customer/HomePage.tsx` | **TASK-16** |
| **Trang Kết quả Tìm kiếm Phòng** | `src/pages/customer/SearchResultsPage.tsx` | **TASK-18** |
| **Trang Chi tiết Hạng phòng** | `src/pages/customer/RoomDetailPage.tsx` | **TASK-19** |
| **Quy trình Đặt phòng Bước 1, 2, 3**| `BookingStep1Page.tsx`, `BookingStep2Page.tsx`, `BookingStep3Page.tsx` | **TASK-20, TASK-22, TASK-23** |
| **Trang Xác nhận & Chi tiết Đơn** | `src/pages/customer/BookingDetailPage.tsx` | **TASK-24** |
| **Trang Lịch sử Đơn & Hồ sơ Khách**| `MyBookingsPage.tsx`, `AccountProfilePage.tsx` | **TASK-25, TASK-27** |
| **Trang Sơ đồ Buồng phòng (PMS)** | `src/pages/staff/RoomBoardPage.tsx` | **FE-S3-05..08 (TASK-35..38)** |
| **Trang Đặt phòng tại quầy (Walk-in)**| `src/pages/staff/WalkInBookingPage.tsx` | **FE-S3-09..11 (TASK-39..41)** |
| **Trang Timeline Lịch đặt phòng** | `src/pages/staff/BookingTimelinePage.tsx` | **FE-S3-12 (TASK-42)** |
| **Trang Danh sách & Chi tiết Đơn Nội bộ**| `BookingsListPage.tsx`, `BookingDetailStaffPage.tsx` | **FE-S3-13..15 (TASK-43..45)** |
| **Trang Quản lý Ca trực Lễ tân** | `src/pages/staff/ShiftOverviewPage.tsx` | **FE-S3-16, FE-S3-17 (TASK-46..47)** |
| **Trang CRM Khách lưu trú** | `src/pages/staff/CustomersListPage.tsx` | **FE-S3-18 (TASK-48)** |
| **Trang Dashboard KPI & Báo cáo** | `src/pages/staff/DashboardPage.tsx`, `ReportsPage.tsx` | **FE-S3-22, FE-S3-23 (TASK-52..53)** |
| **Trang Quản lý Phòng & Hạng phòng**| `RoomsManagePage.tsx`, `RoomTypesManagePage.tsx` | **FE-S3-19, FE-S3-20 (TASK-49..50)** |
| **Trang Quản lý Dịch vụ Khách sạn**| `src/pages/staff/ServicesManagePage.tsx` | **FE-S3-21 (TASK-51)** |
| **Trang Phân quyền Nhân sự** | `src/pages/staff/UsersPermissionsPage.tsx` | **FE-S3-24 (TASK-54)** |
| **Trang Cài đặt & Nhật ký Hệ thống**| `SystemSettingsPage.tsx`, `AuditLogsPage.tsx` | **FE-S3-25 (TASK-55)** |
| **Kiểm thử Tích hợp Vận hành Sprint 3**| Toàn bộ phân hệ Staff (`/staff/*`) | **FE-S3-26 (TASK-56)** |
| **Tối ưu Responsive & Micro-animations**| Toàn bộ ứng dụng (Mobile Drawer, Motion, Toast) | **FE-S4-03 (TASK-59), FE-S4-04 (TASK-60)** |
| **Kiểm thử Đơn vị, E2E & Đa trình duyệt**| Bộ Unit Test format, Luồng Khách E2E, Cross-browser | **FE-S4-05..07 (TASK-61..63)** |
| **Đo lường Hiệu năng & Đóng gói Build**| Google Lighthouse Report, `dist/` bundle production | **FE-S4-08 (TASK-64), FE-S4-09 (TASK-65)** |
| **Hồ sơ Tài liệu Kỹ thuật & Bàn giao**| `README.md`, `SYSTEM_URLS.md`, release tag Git | **FE-S4-10 (TASK-66)** |
| **Ghi hình Video Demo Toàn diện Website**| File video `Nitro_Grand_Hotel_Frontend_Full_Demo_Walkthrough.mp4` | **FE-S4-11 (TASK-67)** |

---

## 📌 TÓM TẮT TỔNG QUÁT 4 SPRINT (BỨC TRANH TOÀN CẢNH DỰ ÁN)

Bản chất công việc của toàn bộ dự án Frontend được tóm gọn qua 4 giai đoạn phát triển chính:

* **SPRINT 1 — Dựng Móng & Khung Kiến Trúc (Foundation):**  
  Thiết kế hệ thống giao diện cơ sở (Design System, bảng màu, typography), cấu hình môi trường công nghệ (React + TypeScript + Tailwind), định nghĩa mô hình dữ liệu và dựng sẵn bộ khung điều hướng cùng các thành phần giao diện nền tảng.

* **SPRINT 2 — Xây Dựng Cổng Khách Hàng (Customer Portal):**  
  Tập trung toàn lực phát triển toàn bộ trải nghiệm cho khách lưu trú: từ tra cứu, tìm kiếm, xem chi tiết phòng đến quy trình đặt phòng nhiều bước, thanh toán mô phỏng và quản lý/hủy đơn đặt phòng cá nhân.

* **SPRINT 3 — Xây Dựng Cổng Vận Hành Nội Bộ (Staff & PMS Portal):**  
  Tập trung toàn lực phát triển hệ thống phần mềm quản lý khách sạn cho nhân viên: phân quyền người dùng, sơ đồ buồng phòng trực quan, nhận khách tại quầy (Walk-in), lịch timeline công suất, quản trị ca trực lễ tân và báo cáo doanh thu (26 Task phân rã Jira kèm minh chứng chi tiết).

* **SPRINT 4 — Tích Hợp Hệ Thống, Tối Ưu, Đóng Gói Hoàn Thiện & Ghi Hình Video Demo (Final Delivery):**  
  Ráp nối hoàn chỉnh tầng dữ liệu (Dual-Mode API), tối ưu hóa hiển thị trên thiết bị di động, thực hiện kiểm thử toàn diện trên toàn hệ thống, đóng gói bản dựng hoàn chỉnh và thực hiện quay video demo chất lượng cao toàn bộ giao diện trang web phục vụ báo cáo hội đồng (11 Task phân rã Jira kèm minh chứng chi tiết).

---

## 🎯 GIÁ TRỊ THỰC TIỄN & ĐIỂM CỘNG KHI NỘP BÁO CÁO CHO THẦY CÔ
1. **Khớp 100% với cơ cấu nhóm 5 sinh viên:** Tài liệu thể hiện rõ ràng thành viên đảm nhiệm vai trò **UI-UX + Frontend** là người trực tiếp thiết kế (Figma, `DESIGNSYSTEM COLOR TYPOGRAPHY.docx`) và lập trình toàn bộ giao diện; các điểm giao thoa chỉ xoay quanh 4 thành viên còn lại trong nhóm (BA/PO, Backend+DevOps, Database+QA, PM/Integration), không có sự xuất hiện của bất kỳ bộ phận ngoài luồng nào.
2. **Khớp 100% với Code thực tế:** Mọi trang màn hình (27 trang), mọi thành phần giao diện (11 components) và các module state/service trong code đều được phản ánh chính xác trong Ma trận ánh xạ (Traceability Matrix).
3. **Chuẩn phương pháp luận Agile / Scrum:** Chia 4 Sprint cân đối, Sprint 3 (26 task) và Sprint 4 (11 task) đều có Tiêu chí hoàn thành (DoD) và Hướng dẫn chụp ảnh/quay video minh chứng chi tiết từng bước, giúp thầy cô nghiệm thu trực quan 100%.
4. **Chiến lược Dual-Mode thông minh:** Tách biệt độc lập giữa tầng giao diện và tầng dữ liệu Backend (có Mock Data dự phòng), giúp buổi thuyết trình đồ án không bao giờ bị gián đoạn dù mạng lag hay Backend gặp sự cố.
5. **Video Demo Walkthrough chất lượng cao (TASK-67 / FE-S4-11):** Cung cấp sẵn kịch bản và sản phẩm video ghi hình toàn bộ giao diện trang web (1080p Full HD), giúp Hội đồng chấm điểm có thể đánh giá toàn bộ kết quả đồ án một cách trực quan, sinh động nhất ngay cả khi không trực tiếp chạy code.

---
*Tài liệu được chuẩn hóa phục vụ đồ án môn Quản Lý Dự Án CNTT - Nhóm 5 Sinh Viên - Dự án Nitro Grand Hotel.*
