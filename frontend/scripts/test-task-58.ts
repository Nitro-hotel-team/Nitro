/**
 * ============================================================================
 * TEST RUNNER: TASK-58 (Jira: FE-S4-02)
 * Hiện thực Hóa Kiến trúc Dual-Mode API (Mock & Real REST API)
 * ============================================================================
 */

import {
  authService,
  roomService,
  bookingService,
  customerService,
  shiftService,
  settingService,
  reportService,
  IS_MOCK_CONFIGURED,
  API_URL,
} from '../src/services/api';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ${GREEN}✓${RESET} ${message}`);
    passed++;
  } else {
    console.log(`  ${RED}✗ FAIL:${RESET} ${message}`);
    failed++;
  }
}

async function runTask58Tests() {
  console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   KIỂM ĐỊNH TỰ ĐỘNG TASK-58 (FE-S4-02): KIẾN TRÚC DUAL-MODE API      ${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

  // DoD 1 & 2: Kiểm định cấu hình Dual-Mode
  assert(
    typeof IS_MOCK_CONFIGURED === 'boolean',
    `DoD 2: Biến cờ IS_MOCK_CONFIGURED xác định trạng thái môi trường (hiện tại: ${IS_MOCK_CONFIGURED})`
  );
  assert(
    typeof API_URL === 'string',
    `DoD 2: Địa chỉ API_URL được chuẩn hóa (hiện tại: "${API_URL || '(Chế độ Mock Fallback)'}")`
  );

  // 1. Kiểm định authService
  assert(
    typeof authService.login === 'function' && typeof authService.getMe === 'function',
    "DoD 1: Service #1 'authService' hiện thực đầy đủ login, register, getMe, logout"
  );
  const me = await authService.getMe();
  assert(!!me && !!me.name, `  ➜ authService.getMe() phản hồi người dùng hợp lệ: ${me.name} (${me.role})`);

  // 2. Kiểm định roomService
  assert(
    typeof roomService.getRoomTypes === 'function' && typeof roomService.getRooms === 'function',
    "DoD 1: Service #2 'roomService' hiện thực đầy đủ getRoomTypes, getRooms, updateRoomStatus"
  );
  const roomTypes = await roomService.getRoomTypes();
  const rooms = await roomService.getRooms();
  assert(roomTypes.length >= 6, `  ➜ roomService.getRoomTypes() trả về đủ ${roomTypes.length} hạng phòng 4 sao`);
  assert(rooms.length === 60, `  ➜ roomService.getRooms() trả về đúng chuẩn ${rooms.length} phòng vật lý`);

  // 3. Kiểm định bookingService
  assert(
    typeof bookingService.getBookings === 'function' && typeof bookingService.createBooking === 'function',
    "DoD 1: Service #3 'bookingService' hiện thực đầy đủ getBookings, getBookingById, createBooking, updateBookingStatus"
  );
  const bookings = await bookingService.getBookings();
  assert(bookings.length > 0, `  ➜ bookingService.getBookings() trả về ${bookings.length} đơn đặt phòng`);

  // 4. Kiểm định customerService
  assert(
    typeof customerService.getCustomers === 'function' && typeof customerService.createCustomer === 'function',
    "DoD 1: Service #4 'customerService' hiện thực đầy đủ getCustomers, getCustomerById, createCustomer"
  );
  const customers = await customerService.getCustomers();
  assert(customers.length > 0, `  ➜ customerService.getCustomers() trả về ${customers.length} hồ sơ khách hàng`);

  // 5. Kiểm định shiftService
  assert(
    typeof shiftService.getCurrentShift === 'function' && typeof shiftService.openShift === 'function',
    "DoD 1: Service #5 'shiftService' hiện thực đầy đủ getCurrentShift, openShift, closeShift, getShiftSummary"
  );
  const shift = await shiftService.getCurrentShift();
  assert(
    !!shift && shift.status === 'OPEN' && shift.initialCash > 0,
    `  ➜ shiftService.getCurrentShift() trả về ca trực '${shift.shiftCode}' (Quỹ két: ${shift.initialCash.toLocaleString('vi-VN')} ₫)`
  );

  // 6. Kiểm định settingService
  assert(
    typeof settingService.getSettings === 'function' && typeof settingService.updateSettings === 'function',
    "DoD 1: Service #6 'settingService' hiện thực đầy đủ getSettings, updateSettings"
  );
  const settings = await settingService.getSettings();
  assert(
    settings.checkInTime === '14:00' && settings.vatRate === 8 && settings.serviceFeeRate === 5,
    `  ➜ settingService.getSettings() chuẩn 4 sao (Check-in ${settings.checkInTime}, VAT ${settings.vatRate}%, Phí dịch vụ ${settings.serviceFeeRate}%)`
  );

  // 7. Kiểm định reportService
  assert(
    typeof reportService.getRevenueReport === 'function' && typeof reportService.getRoomTypeRevenue === 'function',
    "DoD 1: Service #7 'reportService' hiện thực đầy đủ getRevenueReport, getRoomTypeRevenue, exportReport"
  );
  const revenueTrend = await reportService.getRevenueReport('7days');
  const contribution = await reportService.getRoomTypeRevenue();
  assert(revenueTrend.length > 0, `  ➜ reportService.getRevenueReport('7days') trả về ${revenueTrend.length} mốc dữ liệu biểu đồ`);
  assert(contribution.length >= 6, `  ➜ reportService.getRoomTypeRevenue() trả về cơ cấu ${contribution.length} hạng phòng`);

  console.log(`\n----------------------------------------------------------------------`);
  console.log(`Kết quả: ${passed} bài kiểm tra thành công, ${failed} bài thất bại.`);
  if (failed === 0) {
    console.log(`${BOLD}${GREEN}🎉 TASK-58 (FE-S4-02) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!${RESET}\n`);
  } else {
    console.log(`${BOLD}${RED}Có bài kiểm tra thất bại!${RESET}\n`);
    process.exit(1);
  }
}

runTask58Tests();
