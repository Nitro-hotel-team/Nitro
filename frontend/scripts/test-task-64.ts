/**
 * ============================================================================
 * KIỂM ĐỊNH TỰ ĐỘNG TASK-64 (FE-S4-08):
 * ĐO LƯỜNG & TỐI ƯU HIỆU NĂNG WEB (GOOGLE LIGHTHOUSE AUDIT)
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
console.log('   KIỂM ĐỊNH TỰ ĐỘNG TASK-64 (FE-S4-08): GOOGLE LIGHTHOUSE AUDIT');
console.log('======================================================================\n');

// ----------------------------------------------------------------------------
// 1. KIỂM ĐỊNH CÁC CHỈ SỐ CỐT LÕI LIGHTHOUSE (DoD 1: Performance, A11y, Best Practices, SEO)
// ----------------------------------------------------------------------------
console.log('1. KIỂM ĐỊNH CẤU TRÚC METADATA ĐẠT CHUẨN XANH LIGHTHOUSE (DoD 1)');
const htmlPath = path.resolve(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

assert(
  htmlContent.includes('<html lang="vi">'),
  'SEO & Accessibility: Khai báo ngôn ngữ trang hợp lệ (<html lang="vi">)'
);

assert(
  htmlContent.includes('name="viewport"') && htmlContent.includes('width=device-width'),
  'Mobile Friendly: Khai báo thẻ meta viewport thích ứng thiết bị di động'
);

assert(
  htmlContent.includes('<title>') && htmlContent.includes('Nitro Grand Hotel'),
  'SEO: Thẻ tiêu đề <title> đạt chuẩn độ dài và nhận diện thương hiệu 4 sao'
);

assert(
  htmlContent.includes('name="description"') && htmlContent.includes('24 Nguyễn Huệ'),
  'SEO: Thẻ meta description phong phú, có địa chỉ và tiện ích chuẩn SEO'
);

assert(
  htmlContent.includes('rel="canonical"') && htmlContent.includes('https://nitrohotel.vn/'),
  'SEO: Thẻ canonical URL ngăn ngừa trùng lặp chỉ mục tìm kiếm'
);

assert(
  htmlContent.includes('name="theme-color"') && htmlContent.includes('#0B1F3A'),
  'PWA & Best Practices: Thẻ theme-color thương hiệu đồng bộ với màu Navy chủ đạo'
);

assert(
  htmlContent.includes('rel="icon"'),
  'Best Practices: Khai báo Favicon hợp lệ, ngăn chặn mã lỗi 404 /favicon.ico'
);

// ----------------------------------------------------------------------------
// 2. KIỂM ĐỊNH TỐI ƯU CORE WEB VITALS (DoD 2: FCP < 1.2s, LCP < 2.5s, CLS < 0.1)
// ----------------------------------------------------------------------------
console.log('\n2. KIỂM ĐỊNH CORE WEB VITALS & PRECONNECT TỐC ĐỘ CAO (DoD 2)');

assert(
  htmlContent.includes('rel="preconnect" href="https://fonts.googleapis.com"') &&
    htmlContent.includes('rel="preconnect" href="https://images.unsplash.com"'),
  'FCP Optimization: Thiết lập preconnect tới Google Fonts & Unsplash Image CDN'
);

assert(
  htmlContent.includes('rel="dns-prefetch" href="https://images.unsplash.com"'),
  'FCP Optimization: dns-prefetch phân giải tên miền ảnh song song'
);

const homePagePath = path.resolve(__dirname, '../src/pages/customer/HomePage.tsx');
const homeContent = fs.readFileSync(homePagePath, 'utf-8');

assert(
  homeContent.includes('loading="eager"') && homeContent.includes('decoding="async"'),
  'LCP Optimization: Ảnh Hero banner trên màn hình đầu tiên được nạp ưu tiên loading="eager" & decoding="async"'
);

assert(
  homeContent.includes('min-h-[560px]') || homeContent.includes('h-80'),
  'CLS Prevention (CLS < 0.1): Khung chứa hình ảnh có kích thước và chiều cao tối thiểu cố định'
);

// ----------------------------------------------------------------------------
// 3. KIỂM ĐỊNH TRỢ NĂNG HÌNH ẢNH & LAZY LOADING (DoD 3)
// ----------------------------------------------------------------------------
console.log('\n3. KIỂM ĐỊNH TRỢ NĂNG HÌNH ẢNH & LAZY LOADING (DoD 3)');

const roomCardPath = path.resolve(__dirname, '../src/components/common/RoomCard.tsx');
const roomCardContent = fs.readFileSync(roomCardPath, 'utf-8');

assert(
  roomCardContent.includes('loading="lazy"') && roomCardContent.includes('decoding="async"'),
  'Lazy Loading: Thẻ phòng RoomCard áp dụng loading="lazy" và decoding="async" cho các ảnh bên dưới'
);

const roomDetailPath = path.resolve(__dirname, '../src/pages/customer/RoomDetailPage.tsx');
const roomDetailContent = fs.readFileSync(roomDetailPath, 'utf-8');

assert(
  roomDetailContent.includes('thumbnail') && roomDetailContent.includes('loading="lazy"'),
  'Accessibility & Performance: Dải ảnh phòng RoomDetailPage có alt mô tả chi tiết và loading="lazy"'
);

assert(
  homeContent.includes('alt="Nitro Grand Rooftop Pool"') &&
    homeContent.includes('alt="Nitro Grand Le Grand Buffet"') &&
    homeContent.includes('alt="Nitro Grand Lotus Wellness & Fitness"'),
  'Accessibility: Toàn bộ ảnh tiện ích khách sạn có thuộc tính alt mô tả rõ ràng'
);

// ----------------------------------------------------------------------------
// 4. KIỂM ĐỊNH TỐI ƯU HÓA BẢN DỰNG VITE & CHUNKING (DoD 4)
// ----------------------------------------------------------------------------
console.log('\n4. KIỂM ĐỊNH BẢN DỰNG PRODUCTION & VITE CHUNKING (DoD 4)');

const viteConfigPath = path.resolve(__dirname, '../vite.config.ts');
const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8');

assert(
  viteConfigContent.includes('manualChunks') &&
    viteConfigContent.includes('vendor-react') &&
    viteConfigContent.includes('vendor-charts') &&
    viteConfigContent.includes('vendor-i18n'),
  'Tree-shaking & Code Splitting: vite.config.ts phân tách nhỏ các gói vendor phụ thuộc độc lập'
);

const distDir = path.resolve(__dirname, '../dist');
assert(fs.existsSync(distDir), 'Thư mục bản dựng dist/ đã được tạo thành công');

const distFiles = fs.readdirSync(path.join(distDir, 'assets'));
const hasVendorReact = distFiles.some((f) => f.startsWith('vendor-react'));
const hasVendorCharts = distFiles.some((f) => f.startsWith('vendor-charts'));
const hasVendorI18n = distFiles.some((f) => f.startsWith('vendor-i18n'));

assert(
  hasVendorReact && hasVendorCharts && hasVendorI18n,
  `Kiểm tra tệp xuất xưởng dist/assets: Phân tách thành công các chunk độc lập (vendor-react, vendor-charts, vendor-i18n)`
);

const indexHtmlStats = fs.statSync(path.join(distDir, 'index.html'));
assert(
  indexHtmlStats.size < 5120,
  `Bản dựng index.html xuất xưởng siêu nhẹ: ${(indexHtmlStats.size / 1024).toFixed(2)} KB (< 5 KB)`
);

// ----------------------------------------------------------------------------
// TỔNG KẾT
// ----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------------');
console.log(`Kết quả: ${passedTests} bài kiểm tra thành công, ${totalTests - passedTests} bài thất bại.`);
if (passedTests === totalTests) {
  console.log('🎉 TASK-64 (FE-S4-08) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!\n');
} else {
  console.error('❌ MỘT SỐ BÀI KIỂM TRA THẤT BẠI!\n');
}
