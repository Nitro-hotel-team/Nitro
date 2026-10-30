/**
 * ============================================================================
 * TEST RUNNER: TASK-61 (Jira: FE-S4-05)
 * Kiểm thử Đơn vị (Unit Test) Hàm Tiện ích & Tính toán Tài chính
 * ============================================================================
 */

import {
  BOOKING_SOURCE_MAP,
  BOOKING_STATUS_MAP,
  ROOM_STATUS_MAP,
  calculateNights,
  calculateRefundAmount,
  calculateRefundRate,
  calculateTaxesAndFees,
  formatCurrency,
  formatDate,
  formatDateTime,
  getRefundTierLabel,
  maskIdCard,
  maskPhone,
} from '../src/utils/format';

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

console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   KIỂM ĐỊNH TỰ ĐỘNG TASK-61 (FE-S4-05): UNIT TEST TIỆN ÍCH & TÀI CHÍNH   ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

// ----------------------------------------------------------------------------
// SUITE 1: Định dạng tiền tệ VND (formatCurrency)
// ----------------------------------------------------------------------------
console.log(`${BOLD}1. KIỂM THỬ ĐƠN VỊ ĐỊNH DẠNG TIỀN TỆ (formatCurrency)${RESET}`);

assert(
  formatCurrency(1500000, 'vi') === '1.500.000 ₫',
  'Định dạng số tiền 1.500.000 VND chuẩn tiếng Việt: "1.500.000 ₫"',
  `Nhận được: ${formatCurrency(1500000, 'vi')}`
);

assert(
  formatCurrency(1500000, 'en') === '₫1,500,000',
  'Định dạng số tiền 1.500.000 VND chuẩn quốc tế (en): "₫1,500,000"',
  `Nhận được: ${formatCurrency(1500000, 'en')}`
);

assert(
  formatCurrency(50000, 'vi') === '50.000 ₫',
  'Định dạng mệnh giá nhỏ (50.000 ₫)',
  `Nhận được: ${formatCurrency(50000, 'vi')}`
);

assert(
  formatCurrency(248600000, 'vi') === '248.600.000 ₫',
  'Định dạng doanh thu lớn khách sạn (248.600.000 ₫)',
  `Nhận được: ${formatCurrency(248600000, 'vi')}`
);

assert(
  formatCurrency(0, 'vi') === '0 ₫' && formatCurrency(0, 'en') === '₫0',
  'Xử lý an toàn giá trị 0 VND: "0 ₫" và "₫0"'
);

assert(
  formatCurrency(NaN, 'vi') === '0 ₫' && formatCurrency(undefined as any, 'vi') === '0 ₫',
  'Xử lý an toàn trường hợp biên (NaN / undefined) trả về "0 ₫"'
);

// ----------------------------------------------------------------------------
// SUITE 2: Định dạng Ngày tháng & Thời gian (formatDate, formatDateTime)
// ----------------------------------------------------------------------------
console.log(`\n${BOLD}2. KIỂM THỬ ĐƠN VỊ NGÀY THÁNG & THỜI GIAN (formatDate, formatDateTime)${RESET}`);

assert(
  formatDate('2026-10-30') === '30/10/2026',
  'Chuẩn hóa ngày chuỗi yyyy-MM-dd "2026-10-30" sang "30/10/2026"',
  `Nhận được: ${formatDate('2026-10-30')}`
);

assert(
  formatDate('2027-01-01') === '01/01/2027',
  'Chuẩn hóa ngày đầu năm mới "2027-01-01" sang "01/01/2027"',
  `Nhận được: ${formatDate('2027-01-01')}`
);

assert(
  formatDate('2026-10-30T14:30:00.000Z') === '30/10/2026',
  'Chuẩn hóa ngày từ chuỗi ISO 8601 sang "30/10/2026"',
  `Nhận được: ${formatDate('2026-10-30T14:30:00.000Z')}`
);

const dt = formatDateTime('2026-10-30T14:30:00');
assert(
  dt.includes('14:30') && dt.includes('30/10/2026'),
  'formatDateTime hiển thị đầy đủ giờ phút và ngày tháng ("14:30 30/10/2026")',
  `Nhận được: ${dt}`
);

assert(
  formatDate('') === '' && formatDate(null) === '' && formatDate(undefined) === '',
  'Xử lý an toàn chuỗi rỗng / null / undefined trong formatDate trả về chuỗi rỗng'
);

assert(
  formatDateTime('') === '' && formatDateTime(null) === '',
  'Xử lý an toàn chuỗi rỗng / null trong formatDateTime trả về chuỗi rỗng'
);

// ----------------------------------------------------------------------------
// SUITE 3: Ẩn thông tin nhạy cảm bảo mật PII (maskPhone, maskIdCard)
// ----------------------------------------------------------------------------
console.log(`\n${BOLD}3. KIỂM THỬ ẨN DANH DỮ LIỆU BẢO MẬT PII (maskPhone, maskIdCard)${RESET}`);

assert(
  maskPhone('0901234567') === '090****567',
  'Ẩn danh số điện thoại 10 số: "0901234567" -> "090****567"',
  `Nhận được: ${maskPhone('0901234567')}`
);

assert(
  maskPhone('084901234567') === '084****567',
  'Ẩn danh số điện thoại 12 số quốc tế: "084901234567" -> "084****567"',
  `Nhận được: ${maskPhone('084901234567')}`
);

assert(
  maskPhone('123456') === '123456',
  'Số điện thoại quá ngắn (<7 ký tự) được giữ nguyên không gây lỗi vỡ chuỗi'
);

assert(
  maskPhone('') === '' && maskPhone(null) === '',
  'Xử lý an toàn chuỗi rỗng / null trong maskPhone'
);

assert(
  maskIdCard('079199001234') === '079******234',
  'Ẩn danh số CCCD 12 chữ số: "079199001234" -> "079******234"',
  `Nhận được: ${maskIdCard('079199001234')}`
);

assert(
  maskIdCard('12345') === '12345',
  'Số CMND quá ngắn (<6 ký tự) được giữ nguyên'
);

assert(
  maskIdCard('') === '' && maskIdCard(null) === '',
  'Xử lý an toàn chuỗi rỗng / null trong maskIdCard'
);

// ----------------------------------------------------------------------------
// SUITE 4: Thuật toán tính số đêm lưu trú (calculateNights)
// ----------------------------------------------------------------------------
console.log(`\n${BOLD}4. KIỂM THỬ THUẬT TOÁN TÍNH SỐ ĐÊM LƯU TRÚ (calculateNights)${RESET}`);

assert(
  calculateNights('2026-11-01', '2026-11-04') === 3,
  'Tính chính xác khoảng cách 3 đêm (01/11 đến 04/11)'
);

assert(
  calculateNights('2026-11-01', '2026-11-02') === 1,
  'Tính chính xác khoảng cách 1 đêm (01/11 đến 02/11)'
);

assert(
  calculateNights('2026-11-01', '2026-11-01') === 1,
  'Trường hợp cùng ngày nhận và trả phòng trả về tối thiểu 1 đêm'
);

assert(
  calculateNights('2026-11-05', '2026-11-01') === 1,
  'Trường hợp ngày trả phòng trước ngày nhận phòng (lỗi đảo ngày) trả về tối thiểu 1 đêm'
);

assert(
  calculateNights('', '') === 1 && calculateNights(null, null) === 1,
  'Trường hợp dữ liệu rỗng trả về mặc định 1 đêm an toàn'
);

// ----------------------------------------------------------------------------
// SUITE 5: Tính toán Thuế VAT & Phí dịch vụ (calculateTaxesAndFees)
// ----------------------------------------------------------------------------
console.log(`\n${BOLD}5. KIỂM THỬ CÔNG THỨC THUẾ VAT & PHÍ DỊCH VỤ 4 SAO (calculateTaxesAndFees)${RESET}`);

const tax1 = calculateTaxesAndFees(10000000, 8, 5);
assert(
  tax1.serviceFee === 500000,
  'Phí dịch vụ 5% của 10.000.000 ₫ là 500.000 ₫',
  `Nhận được: ${tax1.serviceFee}`
);
assert(
  tax1.vat === 800000,
  'Thuế VAT 8% của 10.000.000 ₫ là 800.000 ₫',
  `Nhận được: ${tax1.vat}`
);
assert(
  tax1.totalTaxesAndFees === 1300000,
  'Tổng thuế và phí (8% + 5%) là 1.300.000 ₫',
  `Nhận được: ${tax1.totalTaxesAndFees}`
);
assert(
  tax1.grandTotal === 11300000,
  'Tổng thanh toán cuối cùng (Grand Total) là 11.300.000 ₫',
  `Nhận được: ${tax1.grandTotal}`
);

const taxZero = calculateTaxesAndFees(0);
assert(
  taxZero.grandTotal === 0 && taxZero.totalTaxesAndFees === 0,
  'Trường hợp subtotal = 0 tính thuế và phí bằng 0 an toàn'
);

const taxNegative = calculateTaxesAndFees(-500000);
assert(
  taxNegative.grandTotal === 0,
  'Trường hợp subtotal âm được chặn an toàn về 0'
);

// ----------------------------------------------------------------------------
// SUITE 6: Quy tắc Hoàn tiền Hủy phòng 3 Bậc (calculateRefundRate, calculateRefundAmount)
// ----------------------------------------------------------------------------
console.log(`\n${BOLD}6. KIỂM THỬ CHÍNH SÁCH HOÀN TIỀN HỦY PHÒNG 3 BẬC BA/PO${RESET}`);

// Bậc 1: Hủy trước > 48h (Hoàn 100%)
assert(
  calculateRefundRate(72) === 1.0,
  'Bậc 1 (>48h): Hủy trước 72 giờ được hoàn 100% (tỷ lệ 1.0)'
);
assert(
  calculateRefundAmount(5000000, 72) === 5000000,
  'Bậc 1 (>48h): Đã thanh toán 5.000.000 ₫ được hoàn đủ 5.000.000 ₫'
);
assert(
  getRefundTierLabel(72, 'vi') === 'Hoàn 100% (>48h)' && getRefundTierLabel(72, 'en') === '100% Refund (>48h)',
  'Bậc 1 (>48h): Nhãn hiển thị song ngữ chuẩn xác'
);

// Bậc 2: Hủy trong 24h - 48h (Hoàn 50%)
assert(
  calculateRefundRate(48) === 0.5,
  'Bậc 2 (Cận 48h): Hủy đúng mốc 48 giờ được hoàn 50% (tỷ lệ 0.5)'
);
assert(
  calculateRefundRate(36) === 0.5,
  'Bậc 2 (24-48h): Hủy trước 36 giờ được hoàn 50% (tỷ lệ 0.5)'
);
assert(
  calculateRefundAmount(4200000, 36) === 2100000,
  'Bậc 2 (24-48h): Đã thanh toán 4.200.000 ₫ được hoàn 2.100.000 ₫'
);
assert(
  calculateRefundRate(24) === 0.5,
  'Bậc 2 (Cận 24h): Hủy đúng mốc 24 giờ vẫn thuộc khung hoàn 50%'
);
assert(
  getRefundTierLabel(36, 'vi') === 'Hoàn 50% (24-48h)' && getRefundTierLabel(36, 'en') === '50% Refund (24-48h)',
  'Bậc 2 (24-48h): Nhãn hiển thị song ngữ chuẩn xác'
);

// Bậc 3: Hủy dưới 24h (Hoàn 0%)
assert(
  calculateRefundRate(23.9) === 0.0,
  'Bậc 3 (<24h): Hủy trước 23.9 giờ hoàn 0% (tỷ lệ 0.0)'
);
assert(
  calculateRefundRate(6) === 0.0,
  'Bậc 3 (<24h): Hủy trước 6 giờ hoàn 0% (tỷ lệ 0.0)'
);
assert(
  calculateRefundAmount(6000000, 6) === 0,
  'Bậc 3 (<24h): Đã thanh toán 6.000.000 ₫ hoàn 0 ₫'
);
assert(
  getRefundTierLabel(6, 'vi') === 'Không hoàn tiền (<24h)' && getRefundTierLabel(6, 'en') === '0% Non-refundable (<24h)',
  'Bậc 3 (<24h): Nhãn hiển thị song ngữ chuẩn xác'
);

// Trường hợp quá giờ (sau giờ Check-in: số giờ âm)
assert(
  calculateRefundRate(-2) === 0.0,
  'Trường hợp quá giờ check-in (số giờ âm) hoàn 0%'
);

// Trường hợp truyền chuỗi ngày tháng
const futureDate = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
assert(
  calculateRefundRate(futureDate) === 1.0,
  'Tính tỷ lệ hoàn tiền chính xác khi truyền chuỗi ISO Check-in (tương lai >48h)'
);

// ----------------------------------------------------------------------------
// SUITE 7: Bản đồ trạng thái & Nguồn đơn đặt (Status & Source Mappings)
// ----------------------------------------------------------------------------
console.log(`\n${BOLD}7. KIỂM THỬ TÍNH TOÀN VẸN BẢN ĐỒ TRẠNG THÁI (Status Maps)${RESET}`);

const bookingStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'EXPIRED', 'NO_SHOW'] as const;
const missingBookingStatus = bookingStatuses.filter((s) => !BOOKING_STATUS_MAP[s]);
assert(
  missingBookingStatus.length === 0,
  `Đầy đủ 7 trạng thái đặt phòng chuẩn 4 sao (${bookingStatuses.length}/7)`
);

const roomStatuses = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'] as const;
const missingRoomStatus = roomStatuses.filter((s) => !ROOM_STATUS_MAP[s]);
assert(
  missingRoomStatus.length === 0,
  `Đầy đủ 5 trạng thái buồng phòng PMS (${roomStatuses.length}/5)`
);

const sources = ['WEB', 'MOBILE', 'COUNTER', 'OTA'] as const;
const missingSources = sources.filter((s) => !BOOKING_SOURCE_MAP[s]);
assert(
  missingSources.length === 0,
  `Đầy đủ 4 nguồn kênh đặt phòng phân hệ (${sources.length}/4)`
);

// ----------------------------------------------------------------------------
// TỔNG KẾT KẾT QUẢ KIỂM THỬ
// ----------------------------------------------------------------------------
console.log(`\n----------------------------------------------------------------------`);
console.log(`Kết quả: ${GREEN}${passed} bài kiểm tra thành công${RESET}, ${failed > 0 ? `${RED}${failed} bài thất bại${RESET}` : '0 bài thất bại'}.`);

if (failed === 0) {
  console.log(`🎉 ${BOLD}${GREEN}TASK-61 (FE-S4-05) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!${RESET}\n`);
  process.exit(0);
} else {
  console.log(`❌ ${BOLD}${RED}TASK-61 CHƯA ĐẠT ĐỦ TIÊU CHÍ, VUI LÒNG KIỂM TRA LẠI.${RESET}\n`);
  process.exit(1);
}

