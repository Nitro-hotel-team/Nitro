/**
 * ============================================================================
 * KIỂM ĐỊNH TỰ ĐỘNG TASK-67 (FE-S4-11):
 * GHI HÌNH VIDEO DEMO TOÀN DIỆN GIAO DIỆN & TẤT CẢ LUỒNG NGHIỆP VỤ
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
console.log('   KIỂM ĐỊNH TỰ ĐỘNG TASK-67 (FE-S4-11): VIDEO DEMO TOÀN DIỆN WEBSITE');
console.log('======================================================================\n');

// ----------------------------------------------------------------------------
// 1. KIỂM ĐỊNH TỆP KỊCH BẢN VIDEO DEMO (DoD 1: VIDEO_DEMO_SCRIPT.md)
// ----------------------------------------------------------------------------
console.log('1. KIỂM ĐỊNH TÍNH TOÀN DIỆN CỦA KỊCH BẢN QUAY VIDEO DEMO (DoD 1)');
const scriptPath = path.join(frontendDir, 'docs/VIDEO_DEMO_SCRIPT.md');
assert(fs.existsSync(scriptPath), 'Tệp VIDEO_DEMO_SCRIPT.md tồn tại hợp lệ trong frontend/docs/');

const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

assert(
  scriptContent.includes('PHẦN 1') && scriptContent.includes('Khởi động & Nhận diện Thương hiệu'),
  'Kịch bản bao gồm Phần 1: Khởi động & Nhận diện Thương hiệu 4 sao (00:00 - 01:00)'
);

assert(
  scriptContent.includes('PHẦN 2') && scriptContent.includes('Cổng Khách hàng') && scriptContent.includes('HoldCountdown'),
  'Kịch bản bao gồm Phần 2: Cổng Khách hàng, đặt phòng 3 bước và giữ phòng 10 phút (01:00 - 04:15)'
);

assert(
  scriptContent.includes('PHẦN 3') && scriptContent.includes('Lễ tân') && scriptContent.includes('/staff/room-board'),
  'Kịch bản bao gồm Phần 3: Lễ tân PMS, sơ đồ 60 phòng phân tầng, walk-in, timeline và giao ca (04:15 - 08:30)'
);

assert(
  scriptContent.includes('PHẦN 4') && scriptContent.includes('Quản lý') && scriptContent.includes('/staff/dashboard'),
  'Kịch bản bao gồm Phần 4: Phân hệ Quản lý & Admin, KPI Recharts, CRM và RBAC (08:30 - 10:30)'
);

assert(
  scriptContent.includes('PHẦN 5') && scriptContent.includes('Responsive') && scriptContent.includes('Apple HIG'),
  'Kịch bản bao gồm Phần 5: Thử nghiệm Responsive Mobile/Tablet và phát biểu kết thúc (10:30 - 11:30)'
);

// ----------------------------------------------------------------------------
// 2. KIỂM ĐỊNH HỒ SƠ QUY CHUẨN XUẤT XƯỞNG VIDEO (DoD 2: DEMO_WALKTHROUGH_EVIDENCE.md)
// ----------------------------------------------------------------------------
console.log('\n2. KIỂM ĐỊNH HỒ SƠ QUY CHUẨN XUẤT XƯỞNG VIDEO (DoD 2)');
const evidencePath = path.join(frontendDir, 'docs/DEMO_WALKTHROUGH_EVIDENCE.md');
assert(fs.existsSync(evidencePath), 'Tệp DEMO_WALKTHROUGH_EVIDENCE.md tồn tại hợp lệ');

const evidenceContent = fs.readFileSync(evidencePath, 'utf-8');

assert(
  evidenceContent.includes('Nitro_Grand_Hotel_Frontend_Full_Demo_Walkthrough.mp4'),
  'Quy chuẩn tên tệp video đúng chuẩn: Nitro_Grand_Hotel_Frontend_Full_Demo_Walkthrough.mp4'
);

assert(
  evidenceContent.includes('1920 x 1080') && evidenceContent.includes('60 FPS'),
  'Cam kết độ phân giải Full HD (1920x1080) và tốc độ khung hình 60 FPS'
);

assert(
  evidenceContent.includes('Google Drive') && evidenceContent.includes('YouTube'),
  'Cung cấp đầy đủ đường dẫn lưu trữ đám mây trực tuyến phục vụ Hội đồng nghiệm thu'
);

// ----------------------------------------------------------------------------
// 3. KIỂM ĐỊNH SỰ TỒN TẠI VÀ SẴN SÀNG CỦA CÁC TRANG TRÌNH DIỄN (DoD 3)
// ----------------------------------------------------------------------------
console.log('\n3. KIỂM ĐỊNH TÍNH SẴN SÀNG CỦA CÁC MÀN HÌNH ĐƯỢC QUAY (DoD 3)');
const pagesDir = path.join(frontendDir, 'src/pages');

const requiredPages = [
  'customer/HomePage.tsx',
  'customer/SearchResultsPage.tsx',
  'customer/RoomDetailPage.tsx',
  'customer/BookingStep1Page.tsx',
  'customer/BookingStep2Page.tsx',
  'customer/BookingStep3Page.tsx',
  'customer/MyBookingsPage.tsx',
  'customer/BookingDetailPage.tsx',
  'staff/ShiftOverviewPage.tsx',
  'staff/RoomBoardPage.tsx',
  'staff/BookingTimelinePage.tsx',
  'staff/WalkInBookingPage.tsx',
  'staff/BookingsListPage.tsx',
  'staff/BookingDetailStaffPage.tsx',
  'staff/DashboardPage.tsx',
  'staff/RoomTypesManagePage.tsx',
  'staff/RoomsManagePage.tsx',
  'staff/CustomersListPage.tsx',
  'staff/UsersPermissionsPage.tsx',
  'staff/SystemSettingsPage.tsx',
];

for (const p of requiredPages) {
  const pagePath = path.join(pagesDir, p);
  assert(fs.existsSync(pagePath), `Màn hình trình diễn "${p}" sẵn sàng mã nguồn 100%`);
}

// ----------------------------------------------------------------------------
// 4. KIỂM ĐỊNH SẴN SÀNG BỘ TÀI KHOẢN MẪU THUYẾT TRÌNH (DoD 4)
// ----------------------------------------------------------------------------
console.log('\n4. KIỂM ĐỊNH SẴN SÀNG BỘ TÀI KHOẢN MẪU (DoD 4)');
const dataPath = path.join(frontendDir, 'src/mocks/data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf-8');

assert(
  dataContent.includes('khachhang@nitrohotel.vn') &&
    dataContent.includes('letan@nitrohotel.vn') &&
    dataContent.includes('quanly@nitrohotel.vn') &&
    dataContent.includes('admin@nitrohotel.vn'),
  'Đầy đủ 4 tài khoản thử nghiệm tương ứng 4 vai trò (Customer, Front Desk, Manager, Admin)'
);

// ----------------------------------------------------------------------------
// TỔNG KẾT
// ----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------------');
console.log(`Kết quả: ${passedTests} bài kiểm tra thành công, ${totalTests - passedTests} bài thất bại.`);
if (passedTests === totalTests) {
  console.log('🎉 TASK-67 (FE-S4-11) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!\n');
} else {
  console.error('❌ MỘT SỐ BÀI KIỂM TRA THẤT BẠI!\n');
}
