/**
 * ============================================================================
 * KIỂM ĐỊNH TỰ ĐỘNG TASK-66 (FE-S4-10):
 * HOÀN THIỆN BỘ HỒ SƠ TÀI LIỆU KỸ THUẬT & BÀN GIAO TRIỂN KHAI
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');

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
console.log('   KIỂM ĐỊNH TỰ ĐỘNG TASK-66 (FE-S4-10): TÀI LIỆU KỸ THUẬT & BÀN GIAO');
console.log('======================================================================\n');

// ----------------------------------------------------------------------------
// 1. KIỂM ĐỊNH TỆP README.MD (DoD 1)
// ----------------------------------------------------------------------------
console.log('1. KIỂM ĐỊNH TÍNH TOÀN DIỆN CỦA TÀI LIỆU README.MD (DoD 1)');
const readmePath = path.join(frontendDir, 'README.md');
assert(fs.existsSync(readmePath), 'Tệp README.md tồn tại hợp lệ tại thư mục gốc frontend/');

const readmeContent = fs.readFileSync(readmePath, 'utf-8');
assert(
  readmeContent.includes('React 19') &&
    readmeContent.includes('Tailwind CSS v4') &&
    readmeContent.includes('Vite 8') &&
    readmeContent.includes('Lucide React'),
  'README.md giới thiệu chi tiết bộ công nghệ cốt lõi hiện đại (React 19, Tailwind v4, Vite 8, Lucide)'
);

assert(
  readmeContent.includes('SPRINT 1') &&
    readmeContent.includes('SPRINT 2') &&
    readmeContent.includes('SPRINT 3') &&
    readmeContent.includes('SPRINT 4'),
  'README.md bao quát lộ trình phát triển đầy đủ 4 Sprint theo mô hình Agile/Scrum'
);

assert(
  readmeContent.includes('npm run dev') &&
    readmeContent.includes('npm run build') &&
    readmeContent.includes('npm run preview') &&
    readmeContent.includes('npm run lint') &&
    readmeContent.includes('npm run test:smoke'),
  'README.md hướng dẫn rõ ràng quy trình cài đặt và bảng lệnh điều hành npm scripts'
);

// ----------------------------------------------------------------------------
// 2. KIỂM ĐỊNH DANH MỤC 27 ĐƯỜNG DẪN URL NGHIỆP VỤ & RBAC (DoD 2: SYSTEM_URLS.md)
// ----------------------------------------------------------------------------
console.log('\n2. KIỂM ĐỊNH DANH MỤC 27 ĐƯỜNG DẪN NGHIỆP VỤ & RBAC MATRIX (DoD 2)');
const systemUrlsPath = path.join(frontendDir, 'SYSTEM_URLS.md');
assert(fs.existsSync(systemUrlsPath), 'Tệp SYSTEM_URLS.md tồn tại hợp lệ');

const urlsContent = fs.readFileSync(systemUrlsPath, 'utf-8');

// 10 Customer Routes
const customerRoutes = [
  '/',
  '/rooms',
  '/rooms/:id',
  '/booking/step-1',
  '/booking/step-2',
  '/booking/payment-result',
  '/booking/step-3',
  '/my-bookings',
  '/my-bookings/:id',
  '/profile',
];
const allCustomerCovered = customerRoutes.every((r) => urlsContent.includes(r));
assert(allCustomerCovered, 'SYSTEM_URLS.md bao phủ đủ 10 đường dẫn thuộc phân hệ Khách hàng (Customer)');

// 3 Auth Routes
const authRoutes = ['/login', '/register', '/forgot-password'];
const allAuthCovered = authRoutes.every((r) => urlsContent.includes(r));
assert(allAuthCovered, 'SYSTEM_URLS.md bao phủ đủ 3 đường dẫn thuộc phân hệ Xác thực (Auth)');

// 14 Staff Routes
const staffRoutes = [
  '/staff/overview',
  '/staff/room-board',
  '/staff/timeline',
  '/staff/bookings',
  '/staff/bookings/:id',
  '/staff/walk-in',
  '/staff/customers',
  '/staff/dashboard',
  '/staff/room-types',
  '/staff/rooms',
  '/staff/services',
  '/staff/reports',
  '/staff/users',
  '/staff/settings',
];
const allStaffCovered = staffRoutes.every((r) => urlsContent.includes(r));
assert(allStaffCovered, 'SYSTEM_URLS.md bao phủ đủ 14 đường dẫn thuộc phân hệ Quản trị & Nghiệp vụ Staff/PMS');

assert(
  urlsContent.includes('CUSTOMER') &&
    urlsContent.includes('FRONT_DESK') &&
    urlsContent.includes('MANAGER') &&
    urlsContent.includes('ADMIN'),
  'SYSTEM_URLS.md chứa ma trận phân quyền 4 vai trò (RBAC Matrix) rõ ràng và minh bạch'
);

// ----------------------------------------------------------------------------
// 3. KIỂM ĐỊNH BIẾN MÔI TRƯỜNG MẪU (DoD 3: .env.example)
// ----------------------------------------------------------------------------
console.log('\n3. KIỂM ĐỊNH BIẾN MÔI TRƯỜNG MẪU .ENV.EXAMPLE (DoD 3)');
const envPath = path.join(frontendDir, '.env.example');
assert(fs.existsSync(envPath), 'Tệp .env.example tồn tại hợp lệ');

const envContent = fs.readFileSync(envPath, 'utf-8');
assert(
  envContent.includes('VITE_API_URL=') &&
    envContent.includes('VITE_USE_MOCK=') &&
    envContent.includes('VITE_GOOGLE_CLIENT_ID=') &&
    envContent.includes('VITE_HOTEL_NAME='),
  '.env.example chứa đầy đủ cấu hình kết nối API, cờ Dual-Mode, Google OAuth và thương hiệu khách sạn'
);

// ----------------------------------------------------------------------------
// 4. KIỂM ĐỊNH TÀI LIỆU BÀN GIAO TRIỂN KHAI (DoD 4: DEPLOYMENT.md)
// ----------------------------------------------------------------------------
console.log('\n4. KIỂM ĐỊNH HƯỚNG DẪN TRIỂN KHAI DOCKER & CLOUD (DoD 4)');
const deployPath = path.join(frontendDir, 'DEPLOYMENT.md');
assert(fs.existsSync(deployPath), 'Tệp DEPLOYMENT.md tồn tại hợp lệ phục vụ bàn giao DevOps');

const deployContent = fs.readFileSync(deployPath, 'utf-8');
assert(
  deployContent.includes('FROM node:20-alpine') && deployContent.includes('FROM nginx:alpine'),
  'DEPLOYMENT.md cung cấp tệp Dockerfile đa tầng (Multi-stage build) tiêu chuẩn sản xuất'
);

assert(
  deployContent.includes('try_files $uri $uri/ /index.html;') && deployContent.includes('gzip on;'),
  'DEPLOYMENT.md cung cấp tệp cấu hình Nginx tối ưu hóa nén Gzip và SPA fallback định tuyến'
);

assert(
  deployContent.includes('Vercel') && deployContent.includes('Netlify'),
  'DEPLOYMENT.md hướng dẫn triển khai nền tảng đám mây Vercel và Netlify'
);

// ----------------------------------------------------------------------------
// TỔNG KẾT
// ----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------------');
console.log(`Kết quả: ${passedTests} bài kiểm tra thành công, ${totalTests - passedTests} bài thất bại.`);
if (passedTests === totalTests) {
  console.log('🎉 TASK-66 (FE-S4-10) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!\n');
} else {
  console.error('❌ MỘT SỐ BÀI KIỂM TRA THẤT BẠI!\n');
}
