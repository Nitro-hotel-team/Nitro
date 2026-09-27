/**
 * ============================================================================
 * TÊN FILE: App.tsx
 * VỊ TRÍ: src/App.tsx
 * PHÂN HỆ: Trung tâm Định tuyến Ứng dụng (Root Router & State Provider)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Khởi tạo `AppProvider` (Context toàn cục quản lý Auth, Role, Giỏ đặt phòng).
 * - Cấu hình định tuyến `react-router-dom` chia làm 3 phân hệ độc lập:
 *     1. Phân hệ Khách hàng (`CustomerLayout`): Trang chủ, Tìm kiếm, Đặt phòng 3 bước, Lịch sử đặt.
 *     2. Phân hệ Xác thực (`/login`, `/register`, `/forgot-password`).
 *     3. Phân hệ Nhân viên & Quản trị (`StaffLayout`): 15 trang nghiệp vụ chuyên sâu với
 *        hệ thống kiểm soát phân quyền RBAC (Role-Based Access Control) chống truy cập trái phép.
 * - Gắn công cụ cảnh báo tranh chấp phòng `ConflictModal`.
 * ============================================================================
 */

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConflictModal } from './components/common/ConflictModal';
import { AppProvider } from './context/AppContext';
import { CustomerLayout } from './layouts/CustomerLayout';
import { StaffLayout } from './layouts/StaffLayout';

// Auth Pages
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Customer Pages
import { AccountProfilePage } from './pages/customer/AccountProfilePage';
import { BookingDetailPage } from './pages/customer/BookingDetailPage';
import { BookingStep1Page } from './pages/customer/BookingStep1Page';
import { BookingStep2Page } from './pages/customer/BookingStep2Page';
import { BookingStep3Page } from './pages/customer/BookingStep3Page';
import { HomePage } from './pages/customer/HomePage';
import { MyBookingsPage } from './pages/customer/MyBookingsPage';
import { RoomDetailPage } from './pages/customer/RoomDetailPage';
import { SearchResultsPage } from './pages/customer/SearchResultsPage';
import { PaymentResultPage } from './pages/customer/PaymentResultPage';

// Staff Pages
import { AuditLogsPage } from './pages/staff/AuditLogsPage';
import { BookingDetailStaffPage } from './pages/staff/BookingDetailStaffPage';
import { BookingTimelinePage } from './pages/staff/BookingTimelinePage';
import { BookingsListPage } from './pages/staff/BookingsListPage';
import { CustomersListPage } from './pages/staff/CustomersListPage';
import { DashboardPage } from './pages/staff/DashboardPage';
import { ReportsPage } from './pages/staff/ReportsPage';
import { RoomBoardPage } from './pages/staff/RoomBoardPage';
import { RoomsManagePage } from './pages/staff/RoomsManagePage';
import { RoomTypesManagePage } from './pages/staff/RoomTypesManagePage';
import { ServicesManagePage } from './pages/staff/ServicesManagePage';
import { ShiftOverviewPage } from './pages/staff/ShiftOverviewPage';
import { SystemSettingsPage } from './pages/staff/SystemSettingsPage';
import { UsersPermissionsPage } from './pages/staff/UsersPermissionsPage';
import { WalkInBookingPage } from './pages/staff/WalkInBookingPage';
import { SmokeTestPage } from './pages/SmokeTestPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer Facing Routes */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="rooms" element={<SearchResultsPage />} />
            <Route path="rooms/:id" element={<RoomDetailPage />} />
            <Route path="booking/step-1" element={<BookingStep1Page />} />
            <Route path="booking/step-2" element={<BookingStep2Page />} />
            <Route path="booking/payment-result" element={<PaymentResultPage />} />
            <Route path="booking/step-3" element={<BookingStep3Page />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="my-bookings/:id" element={<BookingDetailPage />} />
            <Route path="profile" element={<AccountProfilePage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* QA & Smoke Testing Hub (TASK-15) */}
          <Route path="/smoke-test" element={<SmokeTestPage />} />

          {/* Staff Facing Routes */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="/staff/overview" replace />} />
            <Route path="overview" element={<ShiftOverviewPage />} />
            <Route path="room-board" element={<RoomBoardPage />} />
            <Route path="timeline" element={<BookingTimelinePage />} />
            <Route path="bookings" element={<BookingsListPage />} />
            <Route path="bookings/:id" element={<BookingDetailStaffPage />} />
            <Route path="walk-in" element={<WalkInBookingPage />} />
            <Route path="customers" element={<CustomersListPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="room-types" element={<RoomTypesManagePage />} />
            <Route path="rooms" element={<RoomsManagePage />} />
            <Route path="services" element={<ServicesManagePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UsersPermissionsPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="logs" element={<AuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Utilities */}
        <ConflictModal />
      </BrowserRouter>
    </AppProvider>
  );
}
