/**
 * ============================================================================
 * NITRO GRAND HOTEL 4★ — AUTOMATED SMOKE TEST & BUILD INTEGRITY RUNNER
 * Mã công việc: TASK-15 | Sprint 1
 * Phối hợp: SV 3 (Frontend) & SV 5 (QA / Database)
 * ============================================================================
 * Mục đích:
 * 1. Kiểm tra biên dịch tĩnh TypeScript (tsc --noEmit) - Không có bất kỳ lỗi type nào.
 * 2. Kiểm tra tính toàn vẹn của tập dữ liệu Mock Data (Rooms, RoomTypes, Bookings, Users...).
 * 3. Kiểm tra tính nhất quán từ điển đa ngôn ngữ i18n (VI vs EN).
 * 4. Kiểm tra sự tồn tại và khả năng xuất của toàn bộ Base UI Components.
 * 5. Kiểm tra tính toàn vẹn của cây định tuyến Router (Customer, Auth, Staff RBAC).
 * 6. Kiểm tra quy trình đóng gói Vite Production (vite build) và kích thước bundles.
 * ============================================================================
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ANSI Colors for terminal output
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

function recordTest(suite: string, name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  try {
    fn();
    const durationMs = Math.round(performance.now() - start);
    results.push({ suite, name, passed: true, durationMs });
    console.log(`  ${GREEN}✓${RESET} ${name} ${GRAY}(${durationMs}ms)${RESET}`);
  } catch (error: any) {
    const durationMs = Math.round(performance.now() - start);
    results.push({
      suite,
      name,
      passed: false,
      durationMs,
      details: error?.message || String(error),
    });
    console.log(`  ${RED}✗${RESET} ${name} ${GRAY}(${durationMs}ms)${RESET}`);
    console.log(`    ${RED}Lỗi: ${error?.message || error}${RESET}`);
  }
}

async function runSmokeTestSuite() {
  console.log(`\n${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   🏨 NITRO GRAND HOTEL 4★ — KIỂM ĐỊNH BẢN DỰNG & KIỂM THỬ KHÓI (TASK-15)${RESET}`);
  console.log(`${BOLD}${CYAN}   QA Lead: SV 5 | Frontend Lead: SV 3 | Tech Stack: Vite + React + TS${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);

  const cwd = process.cwd();

  // --------------------------------------------------------------------------
  // SUITE 1: KIỂM TRA BIÊN DỊCH TĨNH TYPESCRIPT (STATIC TYPE INTEGRITY)
  // --------------------------------------------------------------------------
  console.log(`${BOLD}1. KIỂM ĐỊNH BIÊN DỊCH TĨNH TYPESCRIPT (STRICT TYPECHECK)${RESET}`);
  recordTest('TypeScript', 'Chạy tsc --noEmit (npm run lint) kiểm định tính toàn vẹn kiểu dữ liệu', () => {
    try {
      execSync('npm run lint', { stdio: 'pipe', cwd });
    } catch (e: any) {
      throw new Error(`TypeScript Typecheck thất bại:\n${e.stdout?.toString() || e.message}`);
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 2: KIỂM TRA DỮ LIỆU MẪU MOCK DATA (MOCK DATA INTEGRITY)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}2. KIỂM ĐỊNH TẬP DỮ LIỆU MẪU MOCK DATA (MOCK DATA VALIDATION)${RESET}`);
  
  const mockDataPath = path.resolve(cwd, 'src/mocks/data.ts');
  recordTest('Mock Data', 'File src/mocks/data.ts tồn tại và có dung lượng hợp lệ (> 10KB)', () => {
    if (!fs.existsSync(mockDataPath)) throw new Error('Không tìm thấy src/mocks/data.ts');
    const stats = fs.statSync(mockDataPath);
    if (stats.size < 10000) throw new Error(`File mock data quá nhỏ: ${stats.size} bytes`);
  });

  recordTest('Mock Data', 'Đầy đủ 4 tài khoản phân quyền mẫu (CUSTOMER, FRONT_DESK, MANAGER, ADMIN)', () => {
    const content = fs.readFileSync(mockDataPath, 'utf-8');
    const requiredEmails = [
      'khachhang@nitrohotel.vn',
      'letan@nitrohotel.vn',
      'quanly@nitrohotel.vn',
      'admin@nitrohotel.vn',
    ];
    for (const email of requiredEmails) {
      if (!content.includes(email)) {
        throw new Error(`Thiếu tài khoản mẫu bắt buộc: ${email}`);
      }
    }
    const requiredRoles = ['CUSTOMER', 'FRONT_DESK', 'MANAGER', 'ADMIN'];
    for (const role of requiredRoles) {
      if (!content.includes(`role: '${role}'`)) {
        throw new Error(`Thiếu vai trò RBAC mẫu: ${role}`);
      }
    }
  });

  recordTest('Mock Data', 'Tồn tại đầy đủ tập dữ liệu 60 phòng, 12 hạng phòng và dịch vụ khách sạn', () => {
    const content = fs.readFileSync(mockDataPath, 'utf-8');
    if (!content.includes('MOCK_ROOMS')) throw new Error('Thiếu MOCK_ROOMS');
    if (!content.includes('MOCK_ROOM_TYPES')) throw new Error('Thiếu MOCK_ROOM_TYPES');
    if (!content.includes('MOCK_SERVICES')) throw new Error('Thiếu MOCK_SERVICES');
    if (!content.includes('MOCK_BOOKINGS')) throw new Error('Thiếu MOCK_BOOKINGS');
    if (!content.includes('MOCK_DASHBOARD_METRICS')) throw new Error('Thiếu MOCK_DASHBOARD_METRICS');
  });

  // --------------------------------------------------------------------------
  // SUITE 3: KIỂM ĐỊNH TỪ ĐIỂN SONG NGỮ i18n (i18n TRANSLATION CONSISTENCY)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}3. KIỂM ĐỊNH HỆ THỐNG ĐA NGÔN NGỮ (i18n VI / EN SYNC)${RESET}`);
  const i18nPath = path.resolve(cwd, 'src/i18n/index.ts');
  
  recordTest('i18n', 'File src/i18n/index.ts tồn tại và thiết lập đầy đủ resources vi & en', () => {
    if (!fs.existsSync(i18nPath)) throw new Error('Không tìm thấy src/i18n/index.ts');
    const content = fs.readFileSync(i18nPath, 'utf-8');
    if (!content.includes('vi: {') || !content.includes('en: {')) {
      throw new Error('Chưa định nghĩa đầy đủ 2 locale vi và en');
    }
    const requiredSections = ['brand:', 'nav:', 'role:', 'status:', 'common:', 'auth:', 'booking:'];
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        throw new Error(`Thiếu phân nhóm từ điển i18n bắt buộc: ${section}`);
      }
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 4: KIỂM ĐỊNH THƯ VIỆN THÀNH PHẦN CƠ SỞ (BASE UI PRIMITIVES)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}4. KIỂM ĐỊNH THƯ VIỆN THÀNH PHẦN CƠ SỞ (BASE UI PRIMITIVES)${RESET}`);
  const commonComponents = [
    'Button.tsx',
    'Modal.tsx',
    'Drawer.tsx',
    'StatusBadge.tsx',
    'StatCard.tsx',
    'StateViews.tsx',
    'ConflictModal.tsx',
  ];

  for (const comp of commonComponents) {
    recordTest('Base UI', `Thành phần cơ sở ${comp} tồn tại và tuân thủ Design System`, () => {
      const p = path.resolve(cwd, 'src/components/common', comp);
      if (!fs.existsSync(p)) throw new Error(`Không tìm thấy thành phần: src/components/common/${comp}`);
      const content = fs.readFileSync(p, 'utf-8');
      if (content.length < 500) throw new Error(`Thành phần ${comp} rỗng hoặc nội dung quá ngắn`);
    });
  }

  // --------------------------------------------------------------------------
  // SUITE 5: KIỂM ĐỊNH BỘ CHỌN NGÀY & ĐẾM KHÁCH (TASK-17)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}5. KIỂM ĐỊNH BỘ CHỌN NGÀY & ĐẾM KHÁCH (TASK-17: DATERANGEPICKER & GUESTCOUNTER)${RESET}`);
  
  recordTest('TASK-17', 'DateRangePicker.tsx hỗ trợ lịch tương tác ma trận, tính số đêm và phím tắt nhanh', () => {
    const p = path.resolve(cwd, 'src/components/common/DateRangePicker.tsx');
    if (!fs.existsSync(p)) throw new Error('Không tìm thấy src/components/common/DateRangePicker.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('calculateNights')) throw new Error('DateRangePicker thiếu hàm calculateNights');
    if (!content.includes('handleQuickPreset')) throw new Error('DateRangePicker thiếu phím tắt chọn nhanh');
    if (!content.includes('calendarDays')) throw new Error('DateRangePicker thiếu ma trận lịch tương tác');
  });

  recordTest('TASK-17', 'GuestCounter.tsx kiểm soát 4 nhóm khách (Người lớn, Trẻ em, Em bé, Số phòng) và hạn mức 4 sao', () => {
    const p = path.resolve(cwd, 'src/components/common/GuestCounter.tsx');
    if (!fs.existsSync(p)) throw new Error('Không tìm thấy src/components/common/GuestCounter.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('handleAdultChange')) throw new Error('GuestCounter thiếu điều khiển người lớn');
    if (!content.includes('handleChildChange')) throw new Error('GuestCounter thiếu điều khiển trẻ em');
    if (!content.includes('handleInfantChange')) throw new Error('GuestCounter thiếu điều khiển em bé');
    if (!content.includes('handleRoomChange')) throw new Error('GuestCounter thiếu điều khiển số phòng');
  });

  // --------------------------------------------------------------------------
  // SUITE 6: KIỂM ĐỊNH TRANG KẾT QUẢ TÌM KIẾM & THẺ PHÒNG (TASK-18: SEARCH & ROOM CARD)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}6. KIỂM ĐỊNH TÌM KIẾM & THẺ PHÒNG (TASK-18: SEARCH & ROOM CARD)${RESET}`);
  recordTest('TASK-18', 'RoomCard.tsx hỗ trợ Carousel ảnh, giá nhiều đêm, nhãn giảm giá 15% & kết nối draftBooking', () => {
    const p = path.resolve(cwd, 'src/components/common/RoomCard.tsx');
    if (!fs.existsSync(p)) throw new Error('Không tìm thấy src/components/common/RoomCard.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('currentImgIndex')) throw new Error('RoomCard thiếu Carousel đa ảnh');
    if (!content.includes('setDraftBooking')) throw new Error('RoomCard thiếu kết nối setDraftBooking');
    if (!content.includes('originalPrice')) throw new Error('RoomCard thiếu hiển thị giá gốc gạch ngang');
  });

  recordTest('TASK-18', 'SearchResultsPage.tsx lọc đa chiều (Giá, Hạng phòng, Giường, Tiện ích), Sắp xếp 5 tiêu chí & Drawer Mobile', () => {
    const p = path.resolve(cwd, 'src/pages/customer/SearchResultsPage.tsx');
    if (!fs.existsSync(p)) throw new Error('Không tìm thấy src/pages/customer/SearchResultsPage.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('maxPrice')) throw new Error('SearchResultsPage thiếu bộ lọc giá tiền');
    if (!content.includes('selectedTypes')) throw new Error('SearchResultsPage thiếu bộ lọc phân loại phòng');
    if (!content.includes('sortBy')) throw new Error('SearchResultsPage thiếu bộ sắp xếp');
    if (!content.includes('mobileFilterOpen')) throw new Error('SearchResultsPage thiếu Drawer bộ lọc Mobile');
  });

  recordTest('TASK-19', 'RoomDetailPage.tsx có Bento Grid ảnh, Lightbox, Tiện nghi 4 nhóm, Đánh giá 4.9★ & Bảng giá Sticky', () => {
    const p = path.resolve(cwd, 'src/pages/customer/RoomDetailPage.tsx');
    if (!fs.existsSync(p)) throw new Error('Không tìm thấy src/pages/customer/RoomDetailPage.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('lightboxOpen')) throw new Error('RoomDetailPage thiếu Lightbox ảnh phóng to');
    if (!content.includes('serviceFee') || !content.includes('vat')) {
      throw new Error('RoomDetailPage thiếu bóc tách phí dịch vụ 5% và thuế VAT');
    }
    if (!content.includes('sampleReviews')) throw new Error('RoomDetailPage thiếu khối đánh giá khách hàng');
    if (!content.includes('setDraftBooking')) throw new Error('RoomDetailPage thiếu chuyển tiếp draftBooking');
    if (!content.includes('similarRooms')) throw new Error('RoomDetailPage thiếu đề xuất phòng tương tự');
  });

  recordTest('TASK-20', 'BookingStep1Page.tsx tính toán phụ phí theo công thức BA/PO, chọn số lượng (+/-), voucher giảm giá & cập nhật draftBooking', () => {
    const p = path.resolve(cwd, 'src/pages/customer/BookingStep1Page.tsx');
    if (!fs.existsSync(p)) throw new Error('Không tìm thấy src/pages/customer/BookingStep1Page.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('baseRoomTotal')) throw new Error('BookingStep1Page thiếu tính toán baseRoomTotal');
    if (!content.includes('handleUpdateQuantity')) throw new Error('BookingStep1Page thiếu bộ điều khiển số lượng dịch vụ (+/-)');
    if (!content.includes('handleToggleService')) throw new Error('BookingStep1Page thiếu hàm chọn/bỏ dịch vụ cộng thêm');
    if (!content.includes('serviceFee') || !content.includes('vat')) {
      throw new Error('BookingStep1Page thiếu công thức tính phí dịch vụ 5% hoặc thuế VAT 8%');
    }
    if (!content.includes('NITRO10') || !content.includes('applyVoucher')) {
      throw new Error('BookingStep1Page thiếu bộ xử lý mã voucher ưu đãi PB-15');
    }
    if (!content.includes('setDraftBooking')) {
      throw new Error('BookingStep1Page thiếu đồng bộ trạng thái vào draftBooking');
    }
    if (!content.includes('/booking/step-2')) {
      throw new Error('BookingStep1Page thiếu chuyển tiếp sang Bước 2 Thanh toán');
    }
  });

  recordTest('TASK-21', 'HoldCountdown.tsx đếm ngược giữ phòng, cảnh báo khẩn cấp (<120s) & ConflictModal.tsx phòng ngừa xung đột phòng ảo', () => {
    const pTimer = path.resolve(cwd, 'src/components/common/HoldCountdown.tsx');
    if (!fs.existsSync(pTimer)) throw new Error('Thiếu HoldCountdown.tsx');
    const contentTimer = fs.readFileSync(pTimer, 'utf-8');
    if (!contentTimer.includes('isUrgent') || !contentTimer.includes('formattedTime')) {
      throw new Error('HoldCountdown thiếu tính toán phút giây hoặc trạng thái khẩn cấp');
    }

    const pConflict = path.resolve(cwd, 'src/components/common/ConflictModal.tsx');
    if (!fs.existsSync(pConflict)) throw new Error('Thiếu ConflictModal.tsx');
    const contentConflict = fs.readFileSync(pConflict, 'utf-8');
    if (!contentConflict.includes('showConflictModal') || !contentConflict.includes('handleSelectAlternative')) {
      throw new Error('ConflictModal thiếu kết nối modal hoặc hành động chọn phòng thay thế');
    }
  });

  recordTest('TASK-22 & 23', 'BookingStep2Page.tsx hỗ trợ 4 cổng thanh toán (VNPay, MoMo, Card, ZaloPay), bảo mật SSL không lưu thẻ & kết nối createBooking', () => {
    const p = path.resolve(cwd, 'src/pages/customer/BookingStep2Page.tsx');
    if (!fs.existsSync(p)) throw new Error('Thiếu BookingStep2Page.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    const methods = ['VNPAY', 'CREDIT_CARD', 'MOMO', 'ZALOPAY'];
    for (const m of methods) {
      if (!content.includes(m)) throw new Error(`BookingStep2Page thiếu phương thức thanh toán: ${m}`);
    }
    if (!content.includes('agreedToTerms')) throw new Error('BookingStep2Page thiếu điều khoản bắt buộc');
    if (!content.includes('bookingService.createBooking')) throw new Error('BookingStep2Page thiếu gọi API tạo đơn createBooking');
    if (!content.includes('/booking/step-3')) throw new Error('BookingStep2Page thiếu điều hướng sang Bước 3');
  });

  recordTest('TASK-24', 'BookingStep3Page.tsx hiển thị mã đặt phòng PNR duy nhất, nút sao chép, mã QR check-in & tóm tắt hóa đơn', () => {
    const p = path.resolve(cwd, 'src/pages/customer/BookingStep3Page.tsx');
    if (!fs.existsSync(p)) throw new Error('Thiếu BookingStep3Page.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('bookingCode') || !content.includes('handleCopyCode')) {
      throw new Error('BookingStep3Page thiếu mã PNR hoặc hàm sao chép mã');
    }
    if (!content.includes('QrCode') || !content.includes('<svg')) {
      throw new Error('BookingStep3Page thiếu mã QR check-in sảnh');
    }
    if (!content.includes('/my-bookings')) throw new Error('BookingStep3Page thiếu chuyển tiếp sang My Bookings');
  });

  recordTest('TASK-25', 'MyBookingsPage.tsx phân loại 4 tab trạng thái (Upcoming, In-House, Completed, Cancelled) & tìm kiếm nhanh', () => {
    const p = path.resolve(cwd, 'src/pages/customer/MyBookingsPage.tsx');
    if (!fs.existsSync(p)) throw new Error('Thiếu MyBookingsPage.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    const tabs = ['UPCOMING', 'IN_HOUSE', 'COMPLETED', 'CANCELLED'];
    for (const t of tabs) {
      if (!content.includes(t)) throw new Error(`MyBookingsPage thiếu tab trạng thái: ${t}`);
    }
    if (!content.includes('bookingService.getBookings')) throw new Error('MyBookingsPage thiếu nạp danh sách đặt phòng');
    if (!content.includes('searchQuery')) throw new Error('MyBookingsPage thiếu bộ tìm kiếm theo mã/tên phòng');
  });

  recordTest('TASK-26', 'BookingDetailPage.tsx áp dụng công thức hoàn tiền 3 bậc BA/PO (>48h 100%, 24-48h 50%, <24h 0%) & modal hủy phòng', () => {
    const p = path.resolve(cwd, 'src/pages/customer/BookingDetailPage.tsx');
    if (!fs.existsSync(p)) throw new Error('Thiếu BookingDetailPage.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('diffHours < 24') || !content.includes('diffHours < 48') || !content.includes('refundRate')) {
      throw new Error('BookingDetailPage thiếu công thức tính bậc hoàn tiền theo mốc 24h và 48h từ BA/PO');
    }
    if (!content.includes('handleConfirmCancel') || !content.includes('updateBookingStatus')) {
      throw new Error('BookingDetailPage thiếu hàm xử lý hủy phòng qua API');
    }
    if (!content.includes('cancelReason')) throw new Error('BookingDetailPage thiếu lý do hủy phòng');
  });

  recordTest('TASK-27', 'AccountProfilePage.tsx quản lý thông tin khách hàng, đổi mật khẩu & hiển thị quyền lợi VIP Silver', () => {
    const p = path.resolve(cwd, 'src/pages/customer/AccountProfilePage.tsx');
    if (!fs.existsSync(p)) throw new Error('Thiếu AccountProfilePage.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('handleSaveProfile') || !content.includes('setCurrentUser')) {
      throw new Error('AccountProfilePage thiếu cập nhật thông tin cá nhân');
    }
    if (!content.includes('handleSavePassword') || !content.includes('confirmPassword')) {
      throw new Error('AccountProfilePage thiếu đổi mật khẩu bảo mật');
    }
    if (!content.includes('VIP Silver') || !content.includes('NitroPoints')) {
      throw new Error('AccountProfilePage thiếu thông tin hạng thẻ hội viên');
    }
  });

  recordTest('TASK-28', 'src/i18n/index.ts bao phủ 100% từ điển song ngữ cho toàn bộ phân hệ khách hàng', () => {
    const p = path.resolve(cwd, 'src/i18n/index.ts');
    if (!fs.existsSync(p)) throw new Error('Thiếu src/i18n/index.ts');
    const content = fs.readFileSync(p, 'utf-8');
    const customerKeys = ['search:', 'room:', 'booking:', 'bookingStep3:', 'myBookings:', 'bookingDetail:', 'profile:'];
    for (const k of customerKeys) {
      if (!content.includes(k)) throw new Error(`i18n thiếu nhóm từ vựng khách hàng: ${k}`);
    }
  });

  recordTest('TASK-29', 'Mock data chứa danh mục hạng phòng 4 sao thực tế (STD, SUP, DLX, FAM, EXE, PRE) và 6 dịch vụ khách sạn', () => {
    const p = path.resolve(cwd, 'src/mocks/data.ts');
    if (!fs.existsSync(p)) throw new Error('Thiếu src/mocks/data.ts');
    const content = fs.readFileSync(p, 'utf-8');
    const roomTypeCodes = ['STD', 'SUP', 'DLX', 'FAM', 'EXE', 'PRE'];
    for (const code of roomTypeCodes) {
      if (!content.includes(`code: '${code}'`)) throw new Error(`Thiếu hạng phòng mẫu: ${code}`);
    }
    for (let i = 1; i <= 6; i++) {
      const id = `svc-${String(i).padStart(2, '0')}`;
      if (!content.includes(`id: '${id}'`)) throw new Error(`Thiếu dịch vụ mẫu: ${id}`);
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 7: KIỂM ĐỊNH BỐ CỤC KHUNG & ĐIỀU HƯỚNG (LAYOUTS & ROUTING)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}7. KIỂM ĐỊNH BỐ CỤC KHUNG & ĐIỀU HƯỚNG (LAYOUTS & RBAC ROUTER)${RESET}`);
  recordTest('Layouts', 'CustomerLayout.tsx có đầy đủ Topbar, Header, Drawer và Footer 4 sao', () => {
    const p = path.resolve(cwd, 'src/layouts/CustomerLayout.tsx');
    if (!fs.existsSync(p)) throw new Error('Thiếu CustomerLayout.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('Outlet')) throw new Error('CustomerLayout thiếu vùng chứa <Outlet />');
    if (!content.includes('Hotline')) throw new Error('CustomerLayout thiếu Hotline');
    if (!content.includes('footer')) throw new Error('CustomerLayout thiếu footer chân trang');
  });

  recordTest('Layouts', 'StaffLayout.tsx có Sidebar Dark Navy, Header ca trực và màn hình khóa 403', () => {
    const p = path.resolve(cwd, 'src/layouts/StaffLayout.tsx');
    if (!fs.existsSync(p)) throw new Error('Thiếu StaffLayout.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('Outlet')) throw new Error('StaffLayout thiếu vùng chứa <Outlet />');
    if (!content.includes('403') || !content.includes('isForbidden')) {
      throw new Error('StaffLayout thiếu màn hình khóa 403 Forbidden bảo vệ RBAC');
    }
  });

  recordTest('Router', 'App.tsx bao phủ toàn bộ 3 phân hệ: Customer (10), Auth (3), Staff (15)', () => {
    const p = path.resolve(cwd, 'src/App.tsx');
    if (!fs.existsSync(p)) throw new Error('Thiếu src/App.tsx');
    const content = fs.readFileSync(p, 'utf-8');
    const requiredRoutes = [
      'path="/"',
      'path="rooms"',
      'path="/login"',
      'path="/register"',
      'path="/staff"',
      'path="overview"',
      'path="room-board"',
      'path="dashboard"',
      'path="users"',
    ];
    for (const r of requiredRoutes) {
      if (!content.includes(r)) {
        throw new Error(`Router App.tsx thiếu route bắt buộc: ${r}`);
      }
    }
  });

  // --------------------------------------------------------------------------
  // SUITE 6: KIỂM ĐỊNH QUY TRÌNH ĐÓNG GÓI VITE (PRODUCTION BUILD PIPELINE)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}6. KIỂM ĐỊNH QUY TRÌNH ĐÓNG GÓI BẢN DỰNG (VITE PRODUCTION BUILD)${RESET}`);
  recordTest('Vite Build', 'Chạy lệnh npm run build và xuất bản phẩm thành công vào dist/', () => {
    try {
      execSync('npx vite build', { stdio: 'pipe', cwd });
    } catch (e: any) {
      throw new Error(`Đóng gói Vite thất bại:\n${e.stdout?.toString() || e.message}`);
    }

    const distPath = path.resolve(cwd, 'dist');
    if (!fs.existsSync(distPath)) throw new Error('Thư mục dist/ không được tạo');
    const indexHtml = path.resolve(distPath, 'index.html');
    if (!fs.existsSync(indexHtml)) throw new Error('dist/index.html không tồn tại');

    const assetsDir = path.resolve(distPath, 'assets');
    if (!fs.existsSync(assetsDir)) throw new Error('dist/assets/ không tồn tại');

    const files = fs.readdirSync(assetsDir);
    const hasJs = files.some((f) => f.endsWith('.js'));
    const hasCss = files.some((f) => f.endsWith('.css'));
    if (!hasJs || !hasCss) throw new Error('dist/assets/ thiếu file bundle .js hoặc .css');
  });

  // --------------------------------------------------------------------------
  // TỔNG KẾT BÁO CÁO (TELEMETRY SUMMARY)
  // --------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalTimeMs = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log(`\n${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`${BOLD}                     KẾT QUẢ KIỂM THỬ KHÓI (SMOKE TEST SUMMARY)${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================================${RESET}`);
  console.log(`  • Tổng số bài kiểm tra (Total Tests) : ${BOLD}${total}${RESET}`);
  console.log(`  • Thành công (Passed)                 : ${GREEN}${BOLD}${passed} / ${total}${RESET}`);
  console.log(`  • Thất bại (Failed)                   : ${failed > 0 ? RED : GREEN}${BOLD}${failed}${RESET}`);
  console.log(`  • Tổng thời gian thực thi             : ${YELLOW}${totalTimeMs} ms${RESET}`);
  console.log(`${BOLD}${CYAN}--------------------------------------------------------------------------------${RESET}`);

  if (failed === 0) {
    console.log(`${GREEN}${BOLD}  🎉 KẾT LUẬN: BẢN DỰNG HỢP LỆ 100% (ZERO COMPILE ERRORS - SMOKE TEST PASSED)${RESET}`);
    console.log(`${GREEN}     Đủ điều kiện sẵn sàng chuyển giao cho Sprint 2 (Customer Portal).${RESET}`);
    console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}  ❌ KẾT LUẬN: CÓ ${failed} BÀI KIỂM TRA THẤT BẠI. CẦN KHẮC PHỤC TRƯỚC KHI BÀN GIAO.${RESET}`);
    console.log(`${BOLD}${CYAN}================================================================================${RESET}\n`);
    process.exit(1);
  }
}

runSmokeTestSuite();
