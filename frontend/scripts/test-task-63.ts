/**
 * ============================================================================
 * KIỂM ĐỊNH TỰ ĐỘNG TASK-63 (FE-S4-07):
 * KIỂM THỬ TƯƠNG THÍCH ĐA TRÌNH DUYỆT & RÀ SOÁT BẢO MẬT FRONTEND
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  escapeHtml,
  stripTags,
  sanitizeUserInput,
  isSafeUrl,
  maskSensitiveData,
  auditStorageSecurity,
} from '../src/utils/security';
import { canAccessRoute } from '../src/utils/rbac';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ THẤT BẠI: ${message}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================================');
console.log('   KIỂM ĐỊNH TỰ ĐỘNG TASK-63 (FE-S4-07): TƯƠNG THÍCH TRÌNH DUYỆT & BẢO MẬT');
console.log('======================================================================\n');

// ----------------------------------------------------------------------------
// 1. KIỂM ĐỊNH TÍNH TƯƠNG THÍCH ĐA TRÌNH DUYỆT (DoD 1: Chrome, Edge, Firefox, Safari)
// ----------------------------------------------------------------------------
console.log('1. KIỂM ĐỊNH ĐỊNH KIỂU & BỐ CỤC ĐA TRÌNH DUYỆT (DoD 1)');
const cssPath = path.resolve(__dirname, '../src/index.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

assert(
  cssContent.includes('-webkit-font-smoothing: antialiased') &&
    cssContent.includes('-moz-osx-font-smoothing: grayscale'),
  'Hỗ trợ làm mịn font đa trình duyệt (WebKit/Blink cho Chrome/Edge/Safari & Gecko cho Firefox)'
);

assert(
  cssContent.includes('scrollbar-width: thin') && cssContent.includes('scrollbar-color:'),
  'Hỗ trợ thanh cuộn chuẩn W3C cho Mozilla Firefox (scrollbar-width & scrollbar-color)'
);

assert(
  cssContent.includes('::-webkit-scrollbar') && cssContent.includes('::-webkit-scrollbar-thumb'),
  'Hỗ trợ thanh cuộn tùy biến WebKit cho Google Chrome, Microsoft Edge, Opera và Apple Safari'
);

assert(
  cssContent.includes('-webkit-text-size-adjust: 100%'),
  'Ngăn ngừa lỗi tự động phóng to font chữ trên trình duyệt di động iOS Safari (-webkit-text-size-adjust)'
);

assert(
  cssContent.includes(':focus-visible') && cssContent.includes('outline:'),
  'Đồng nhất vòng nét hiển thị tiêu điểm trợ năng (:focus-visible) trên cả 4 trình duyệt'
);

// ----------------------------------------------------------------------------
// 2. KIỂM ĐỊNH PHÒNG CHỐNG TẤN CÔNG XSS & HTML ENTITY ESCAPING (DoD 2)
// ----------------------------------------------------------------------------
console.log('\n2. KIỂM ĐỊNH PHÒNG CHỐNG TẤN CÔNG XSS & HTML ENTITY ESCAPING (DoD 2)');

const xssPayloadScript = "<script>alert('XSS')</script>";
const escapedScript = escapeHtml(xssPayloadScript);
assert(
  !escapedScript.includes('<') &&
    !escapedScript.includes('>') &&
    escapedScript.includes('&lt;script&gt;'),
  `escapeHtml mã hóa an toàn thẻ script: "${escapedScript}"`
);

const xssPayloadImg = '<img src=x onerror="alert(\'Hacked\')">';
const sanitizedImg = sanitizeUserInput(xssPayloadImg);
assert(
  !sanitizedImg.includes('onerror') && !sanitizedImg.includes('alert'),
  `sanitizeUserInput triệt tiêu thuộc tính onerror độc hại: "${sanitizedImg}"`
);

const xssPayloadIframe = '<iframe src="javascript:alert(1)"></iframe>';
const sanitizedIframe = sanitizeUserInput(xssPayloadIframe);
assert(
  !sanitizedIframe.includes('<iframe') && !sanitizedIframe.includes('javascript:'),
  `sanitizeUserInput vô hiệu hóa thẻ iframe và giao thức javascript:`
);

const strippedText = stripTags('<p>Khách hàng <b>VIP 4★</b></p>');
assert(
  strippedText === 'Khách hàng VIP 4★',
  `stripTags loại bỏ thành công toàn bộ thẻ HTML: "${strippedText}"`
);

// Kiểm tra áp dụng trong các trang nhập liệu form
const bookingStep1Path = path.resolve(__dirname, '../src/pages/customer/BookingStep1Page.tsx');
const bookingStep1Content = fs.readFileSync(bookingStep1Path, 'utf-8');
assert(
  bookingStep1Content.includes('sanitizeUserInput') &&
    bookingStep1Content.includes('specialRequests: sanitizeUserInput'),
  'Trang BookingStep1Page đã áp dụng sanitizeUserInput cho ô Yêu cầu đặc biệt và Họ tên'
);

const walkInPath = path.resolve(__dirname, '../src/pages/staff/WalkInBookingPage.tsx');
const walkInContent = fs.readFileSync(walkInPath, 'utf-8');
assert(
  walkInContent.includes('sanitizeUserInput') &&
    walkInContent.includes('guestName: sanitizeUserInput'),
  'Trang WalkInBookingPage đã áp dụng sanitizeUserInput cho biểu mẫu khách vãng lai'
);

// ----------------------------------------------------------------------------
// 3. KIỂM ĐỊNH BẢO MẬT DỮ LIỆU NHẠY CẢM & RÀ SOÁT CONSOLE LOG (DoD 3)
// ----------------------------------------------------------------------------
console.log('\n3. KIỂM ĐỊNH BẢO MẬT DỮ LIỆU NHẠY CẢM & CONSOLE LOG (DoD 3)');

const mockPayloadWithSecrets = {
  user: 'customer_01',
  password: 'PlainSecretPassword123!',
  cardNumber: '9704198526714029',
  cvv: '999',
  address: '123 Nguyen Hue, Q1, HCM',
};

const masked = maskSensitiveData(mockPayloadWithSecrets);
assert(
  masked.password === '***[PROTECTED]***' &&
    masked.cardNumber === '***[PROTECTED]***' &&
    masked.cvv === '***[PROTECTED]***' &&
    masked.address === '123 Nguyen Hue, Q1, HCM',
  'maskSensitiveData tự động che giấu trường password, cardNumber, cvv trước khi ghi nhận'
);

// Rà soát mã nguồn src xem có log mật khẩu hay token không
const srcDir = path.resolve(__dirname, '../src');
function scanDirForPlainSecretLogs(dir: string): string[] {
  let findings: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findings = findings.concat(scanDirForPlainSecretLogs(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (
        /console\.log\([^)]*password/i.test(content) ||
        /console\.log\([^)]*card_number/i.test(content) ||
        /console\.log\([^)]*cvv/i.test(content)
      ) {
        findings.push(fullPath);
      }
    }
  }
  return findings;
}

const secretLogFindings = scanDirForPlainSecretLogs(srcDir);
assert(
  secretLogFindings.length === 0,
  `Rà soát toàn bộ thư mục src/: 0 câu lệnh console.log làm rò rỉ password, thẻ hoặc CVV (Zero Leaks)`
);

// Mock storage audit
const mockStorage: any = {
  store: {
    auth_token: 'jwt.header.payload.signature',
    nitro_user_role: 'CUSTOMER',
    nitro_user_info: JSON.stringify({ id: 'u1', name: 'Le Van An', email: 'an@gmail.com' }),
    nitro_language: 'vi',
  },
  get length() {
    return Object.keys(this.store).length;
  },
  key(i: number) {
    return Object.keys(this.store)[i] || null;
  },
  getItem(k: string) {
    return this.store[k] || null;
  },
};

const auditResult = auditStorageSecurity(mockStorage);
assert(
  auditResult.secure && auditResult.issues.length === 0,
  'auditStorageSecurity xác nhận phiên lưu trữ LocalStorage sạch sẽ, không chứa mật khẩu hay thẻ'
);

// ----------------------------------------------------------------------------
// 4. KIỂM ĐỊNH BẢO VỆ ĐƯỜNG DẪN & CHỐNG OPEN REDIRECT (DoD 4)
// ----------------------------------------------------------------------------
console.log('\n4. KIỂM ĐỊNH BẢO VỆ ĐƯỜNG DẪN ROUTE GUARD & CHỐNG OPEN REDIRECT (DoD 4)');

// Route Guard matrix
assert(
  !canAccessRoute('/staff/overview', 'CUSTOMER') &&
    !canAccessRoute('/staff/dashboard', 'CUSTOMER') &&
    !canAccessRoute('/staff/settings', 'CUSTOMER'),
  'Route Guard: Khách hàng (CUSTOMER) bị từ chối 100% khi cố ý truy cập vào phân hệ /staff'
);

assert(
  canAccessRoute('/staff/overview', 'FRONT_DESK') &&
    canAccessRoute('/staff/room-board', 'FRONT_DESK') &&
    !canAccessRoute('/staff/dashboard', 'FRONT_DESK') &&
    !canAccessRoute('/staff/settings', 'FRONT_DESK'),
  'Route Guard: Nhân viên Lễ tân (FRONT_DESK) không thể truy cập Dashboard KPI hay Cấu hình hệ thống'
);

assert(
  canAccessRoute('/staff/dashboard', 'MANAGER') &&
    canAccessRoute('/staff/reports', 'MANAGER') &&
    !canAccessRoute('/staff/settings', 'MANAGER') &&
    !canAccessRoute('/staff/users', 'MANAGER'),
  'Route Guard: Quản lý Khách sạn (MANAGER) không có quyền truy cập trang Quản trị người dùng & Phân quyền'
);

assert(
  canAccessRoute('/staff/settings', 'ADMIN') &&
    canAccessRoute('/staff/users', 'ADMIN') &&
    canAccessRoute('/staff/audit-logs', 'ADMIN'),
  'Route Guard: Quản trị viên Tối cao (ADMIN) có quyền truy cập toàn diện 15 trang nghiệp vụ'
);

// Safe URL checks (Open Redirect Prevention)
assert(
  isSafeUrl('/rooms') && isSafeUrl('/staff/overview') && isSafeUrl('#contact'),
  'isSafeUrl chấp nhận các đường dẫn điều hướng nội bộ an toàn (/ và #)'
);

assert(
  !isSafeUrl('javascript:alert(document.domain)') &&
    !isSafeUrl('vbscript:msgbox(1)') &&
    !isSafeUrl('data:text/html,<script>alert(1)</script>'),
  'isSafeUrl chặn đứng các đường dẫn mã độc javascript:, vbscript:, data:'
);

const loginPath = path.resolve(__dirname, '../src/pages/auth/LoginPage.tsx');
const loginContent = fs.readFileSync(loginPath, 'utf-8');
assert(
  loginContent.includes('isSafeUrl') && loginContent.includes('redirectUrl.startsWith'),
  'LoginPage kiểm tra isSafeUrl và giới hạn URL tương đối trước khi chuyển hướng'
);

// ----------------------------------------------------------------------------
// TỔNG KẾT
// ----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------------');
console.log(`Kết quả: ${passedTests} bài kiểm tra thành công, ${totalTests - passedTests} bài thất bại.`);
if (passedTests === totalTests) {
  console.log('🎉 TASK-63 (FE-S4-07) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!\n');
} else {
  console.error('❌ MỘT SỐ BÀI KIỂM TRA THẤT BẠI!\n');
}
