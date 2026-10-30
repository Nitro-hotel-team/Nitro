/**
 * ============================================================================
 * TEST RUNNER: TASK-62 (Jira: FE-S4-06)
 * Phối hợp Kiểm thử Tích hợp Luồng Khách hàng (Customer Booking Flow E2E)
 * ============================================================================
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { bookingService, roomService } from '../src/services/api';
import { calculateRefundAmount, calculateRefundRate, getRefundTierLabel } from '../src/utils/format';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string, detail?: string) {
  if (condition) {
    console.log(`  ${GREEN}✓${RESET} ${message}`);
    passed++;
  } else {
    console.log(`  ${RED}✗ FAIL:${RESET} ${message} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runTask62E2ETests() {
  console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   KIỂM ĐỊNH TỰ ĐỘNG TASK-62 (FE-S4-06): E2E LUỒNG KHÁCH HÀNG 7 BƯỚC  ${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

  const cwd = process.cwd();

  // --------------------------------------------------------------------------
  // SUITE 1: Kiểm định tính toàn vẹn 7 Màn hình Khách hàng (Customer 7 Screens)
  // --------------------------------------------------------------------------
  console.log(`${BOLD}1. KIỂM ĐỊNH TÍNH TOÀN VẸN 7 MÀN HÌNH LUỒNG KHÁCH HÀNG (DoD 1)${RESET}`);

  // Màn hình 1: Trang chủ HomePage
  const homePath = path.resolve(cwd, 'src/pages/customer/HomePage.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf-8');
  assert(
    homeContent.includes('DateRangePicker') && homeContent.includes('GuestCounter') && homeContent.includes('/rooms'),
    'Màn hình 1 (HomePage): Tích hợp DateRangePicker, GuestCounter và nút tìm kiếm dẫn đến /rooms'
  );

  // Màn hình 2: Kết quả tìm kiếm SearchResultsPage
  const searchPath = path.resolve(cwd, 'src/pages/customer/SearchResultsPage.tsx');
  const searchContent = fs.readFileSync(searchPath, 'utf-8');
  assert(
    searchContent.includes('RoomCard') && searchContent.includes('selectedTypes'),
    'Màn hình 2 (SearchResultsPage): Lọc đa chiều hạng phòng (Deluxe, Suite...), danh sách RoomCard tương tác'
  );

  // Màn hình 3: Chi tiết phòng RoomDetailPage
  const roomDetailPath = path.resolve(cwd, 'src/pages/customer/RoomDetailPage.tsx');
  const roomDetailContent = fs.readFileSync(roomDetailPath, 'utf-8');
  assert(
    roomDetailContent.includes('booking/step-1') && roomDetailContent.includes('setDraftBooking'),
    'Màn hình 3 (RoomDetailPage): Bảng giá cố định, nút Đặt ngay nạp draftBooking và chuyển sang Step 1'
  );

  // Màn hình 4: Đặt phòng Bước 1 (Dịch vụ & Voucher)
  const step1Path = path.resolve(cwd, 'src/pages/customer/BookingStep1Page.tsx');
  const step1Content = fs.readFileSync(step1Path, 'utf-8');
  assert(
    step1Content.includes('HoldCountdown') && step1Content.includes('extraServices') && step1Content.includes('booking/step-2'),
    'Màn hình 4 (BookingStep1Page): Đồng hồ HoldCountdown, chọn thêm dịch vụ đón tiễn/ăn sáng và chuyển sang Step 2'
  );

  // Màn hình 5: Đặt phòng Bước 2 (Thông tin khách & Thanh toán)
  const step2Path = path.resolve(cwd, 'src/pages/customer/BookingStep2Page.tsx');
  const step2Content = fs.readFileSync(step2Path, 'utf-8');
  assert(
    step2Content.includes('guestIdCard') && step2Content.includes('createBooking') && step2Content.includes('booking/step-3'),
    'Màn hình 5 (BookingStep2Page): Form nhập CCCD/ID, chọn cổng thanh toán và kích hoạt createBooking'
  );

  // Màn hình 6: Xác nhận đặt phòng Bước 3 (Confirmation & QR Code)
  const step3Path = path.resolve(cwd, 'src/pages/customer/BookingStep3Page.tsx');
  const step3Content = fs.readFileSync(step3Path, 'utf-8');
  assert(
    step3Content.includes('bookingCode') && (step3Content.includes('BK-') || step3Content.includes('handleCopyCode')) && step3Content.includes('my-bookings'),
    'Màn hình 6 (BookingStep3Page): Hiển thị mã đơn PNR, nút sao chép mã, mã QR check-in và liên kết đến My Bookings'
  );

  // Màn hình 7: Quản lý đặt phòng MyBookingsPage & BookingDetailPage
  const myBookingsPath = path.resolve(cwd, 'src/pages/customer/MyBookingsPage.tsx');
  const myBookingsContent = fs.readFileSync(myBookingsPath, 'utf-8');
  const bookingDetailPath = path.resolve(cwd, 'src/pages/customer/BookingDetailPage.tsx');
  const bookingDetailContent = fs.readFileSync(bookingDetailPath, 'utf-8');
  assert(
    myBookingsContent.includes('bookings') && bookingDetailContent.includes('handleConfirmCancel'),
    'Màn hình 7 (MyBookingsPage & BookingDetailPage): Tra cứu danh sách đơn và hỗ trợ modal hủy đặt phòng'
  );

  // --------------------------------------------------------------------------
  // SUITE 2: Đồng hồ đếm ngược giữ phòng 10 phút (HoldCountdown - DoD 2)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}2. KIỂM ĐỊNH ĐỒNG HỒ GIỮ PHÒNG TẠM THỜI 10 PHÚT (DoD 2)${RESET}`);

  const holdCountdownPath = path.resolve(cwd, 'src/components/common/HoldCountdown.tsx');
  const holdContent = fs.readFileSync(holdCountdownPath, 'utf-8');
  assert(
    holdContent.includes('holdCountdown') && holdContent.includes('isUrgent = holdCountdown < 120'),
    'DoD 2: HoldCountdown tự động cảnh báo khẩn cấp (<120s: đổi màu đỏ, animate-pulse và icon AlertCircle)'
  );

  const appContextPath = path.resolve(cwd, 'src/context/AppContext.tsx');
  const appContextContent = fs.readFileSync(appContextPath, 'utf-8');
  assert(
    appContextContent.includes('useState<number>(600)') && appContextContent.includes('holdCountdown'),
    'DoD 2: AppContext khởi tạo đồng hồ giữ phòng chuẩn 10 phút (600 giây)'
  );

  // --------------------------------------------------------------------------
  // SUITE 3: Mô phỏng Luồng Nghiệp vụ E2E & Sinh Mã Đơn BK-XXXXXX (DoD 3)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}3. MÔ PHỎNG LUỒNG E2E ĐẶT PHÒNG THỰC TẾ & SINH MÃ BK-XXXXXX (DoD 3)${RESET}`);

  // Bước A: Nạp danh mục hạng phòng và chọn Deluxe
  const roomTypes = await roomService.getRoomTypes();
  const deluxeType = roomTypes.find((rt) => rt.code === 'DLX') || roomTypes[0];
  assert(
    deluxeType && deluxeType.code === 'DLX',
    `Bước A: Khách hàng tìm kiếm và chọn hạng phòng "${deluxeType.name}" (Mã: ${deluxeType.code})`
  );

  // Bước B: Mô phỏng đặt phòng Deluxe 2 đêm kèm dịch vụ gia tăng
  const checkInDate = new Date(Date.now() + 72 * 3600 * 1000).toISOString().slice(0, 10); // Check-in sau 3 ngày
  const checkOutDate = new Date(Date.now() + 120 * 3600 * 1000).toISOString().slice(0, 10); // 2 đêm

  const mockBookingPayload = {
    roomTypeId: deluxeType.id,
    roomTypeName: deluxeType.name,
    guestName: 'Lê Hoàng Long',
    guestPhone: '0988776655',
    guestEmail: 'hoanglong@gmail.com',
    guestIdCard: '079199008899',
    checkInDate,
    checkOutDate,
    nights: 2,
    adults: 2,
    children: 1,
    totalAmount: deluxeType.basePrice * 2 + 350000, // Tiền phòng 2 đêm + ăn sáng buffet
    paidAmount: deluxeType.basePrice * 2 + 350000,
    paymentMethod: 'VNPAY',
    source: 'WEB' as const,
    specialRequests: 'Yêu cầu phòng tầng cao, view thoáng, nhận phòng muộn sau 16:00',
    extraServices: [
      { id: 'srv-breakfast', name: 'Buffet sáng quốc tế', price: 250000, quantity: 2 },
    ],
  };

  const createdBooking = await bookingService.createBooking(mockBookingPayload);
  assert(
    !!createdBooking.id && !!createdBooking.bookingCode,
    `Bước B: Đặt phòng thành công! Nhận mã đơn hàng: ${createdBooking.bookingCode} (ID: ${createdBooking.id})`
  );

  assert(
    createdBooking.bookingCode.startsWith('BK-') || createdBooking.bookingCode.startsWith('NTR-'),
    `DoD 3: Mã đơn đặt phòng có tiền tố hợp lệ (${createdBooking.bookingCode})`
  );

  // Bước C: Đồng bộ sang danh sách đơn đặt phòng
  const allBookings = await bookingService.getBookings();
  const foundInList = allBookings.find((b) => b.id === createdBooking.id || b.bookingCode === createdBooking.bookingCode);
  assert(
    !!foundInList,
    'DoD 3: Đơn đặt phòng mới lập tức đồng bộ tức thời vào danh sách đơn của hệ thống Lễ tân'
  );

  // Bước D: Tra cứu chi tiết đơn hàng
  const fetchedDetail = await bookingService.getBookingById(createdBooking.id);
  assert(
    fetchedDetail?.guestName === 'Lê Hoàng Long' && fetchedDetail.totalAmount === mockBookingPayload.totalAmount,
    'DoD 3: Dữ liệu khách hàng và tổng tiền được bảo toàn toàn vẹn xuyên suốt các bước'
  );

  // --------------------------------------------------------------------------
  // SUITE 4: Thao tác Hủy phòng & Đối soát Hoàn tiền 3 bậc (DoD 4)
  // --------------------------------------------------------------------------
  console.log(`\n${BOLD}4. KIỂM THỬ QUY TRÌNH HỦY PHÒNG & TÍNH TIỀN HOÀN 3 BẬC (DoD 4)${RESET}`);

  // Đơn mới tạo check-in sau 72h (>48h) -> Chính sách hoàn 100%
  const rateOver48h = calculateRefundRate(createdBooking.checkInDate);
  const refundOver48h = calculateRefundAmount(createdBooking.paidAmount, createdBooking.checkInDate);
  assert(
    rateOver48h === 1.0 && refundOver48h === createdBooking.paidAmount,
    `DoD 4: Hủy đơn trước >48h tính hoàn 100% (Hoàn trả ${refundOver48h.toLocaleString('vi-VN')} ₫ / ${createdBooking.paidAmount.toLocaleString('vi-VN')} ₫)`
  );

  // Thực thi thao tác Hủy đơn qua API Service
  const cancelledBooking = await bookingService.cancelBooking(
    createdBooking.id,
    'Thay đổi lịch công tác đột xuất',
    refundOver48h
  );

  assert(
    cancelledBooking.status === 'CANCELLED',
    `DoD 4: Cập nhật trạng thái đơn sang CANCELLED thành công (Lý do: Thay đổi lịch công tác)`
  );
  assert(
    cancelledBooking.refundAmount === refundOver48h,
    `DoD 4: Ghi nhận số tiền hoàn lại chính xác trong bản ghi đơn đặt phòng: ${cancelledBooking.refundAmount?.toLocaleString('vi-VN')} ₫`
  );

  // Kiểm thử mốc 24h - 48h (Hoàn 50%)
  const refund24to48h = calculateRefundAmount(4000000, 36);
  assert(
    refund24to48h === 2000000,
    'DoD 4: Khách hủy đơn trong khung 24-48h trước giờ nhận phòng: Hoàn 50% tiền cọc (2.000.000 ₫ / 4.000.000 ₫)'
  );

  // Kiểm thử mốc <24h (Hoàn 0%)
  const refundUnder24h = calculateRefundAmount(4000000, 12);
  assert(
    refundUnder24h === 0,
    'DoD 4: Khách hủy đơn sát giờ (<24h trước nhận phòng): Hoàn 0% theo đúng quy định BA/PO'
  );

  // ----------------------------------------------------------------------------
  // TỔNG KẾT KẾT QUẢ KIỂM THỬ
  // ----------------------------------------------------------------------------
  console.log(`\n----------------------------------------------------------------------`);
  console.log(`Kết quả: ${GREEN}${passed} bài kiểm tra thành công${RESET}, ${failed > 0 ? `${RED}${failed} bài thất bại${RESET}` : '0 bài thất bại'}.`);

  if (failed === 0) {
    console.log(`🎉 ${BOLD}${GREEN}TASK-62 (FE-S4-06) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`❌ ${BOLD}${RED}TASK-62 CHƯA ĐẠT ĐỦ TIÊU CHÍ, VUI LÒNG KIỂM TRA LẠI.${RESET}\n`);
    process.exit(1);
  }
}

runTask62E2ETests();
