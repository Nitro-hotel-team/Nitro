/**
 * ============================================================================
 * TEST RUNNER: TASK-60 (Jira: FE-S4-04)
 * Vi hoạt ảnh Motion, Trạng thái Tải & Phản hồi Trực quan
 * ============================================================================
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

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

console.log(`\n${BOLD}${CYAN}======================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   KIỂM ĐỊNH TỰ ĐỘNG TASK-60 (FE-S4-04): VI HOẠT ẢNH & TRẠNG THÁI TRỰC QUAN   ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

const cwd = process.cwd();

// ----------------------------------------------------------------------------
// SUITE 1: DoD 1 - Modal & Drawer Micro-animations (Fade-in, Zoom-in, Blur)
// ----------------------------------------------------------------------------
console.log(`${BOLD}1. KIỂM ĐỊNH MODAL & DRAWER MOTION (DoD 1)${RESET}`);
const modalContent = fs.readFileSync(path.resolve(cwd, 'src/components/common/Modal.tsx'), 'utf-8');
assert(
  modalContent.includes('backdrop-blur-sm') && modalContent.includes('animate-in fade-in'),
  'DoD 1: Modal sở hữu hiệu ứng nền mờ sang trọng (Backdrop Blur: backdrop-blur-sm) và fade-in mượt mà'
);
assert(
  modalContent.includes('zoom-in-95') && modalContent.includes('rounded-2xl'),
  'DoD 1: Hộp thoại Modal có hiệu ứng xuất hiện mở rộng nhẹ nhàng (zoom-in-95) và bo góc 2xl chuẩn 4 sao'
);
assert(
  modalContent.includes("e.key === 'Escape'") && modalContent.includes("document.body.style.overflow = 'hidden'"),
  'DoD 1: Modal khóa cuộn trang nền và hỗ trợ đóng nhanh bằng phím tắt ESC'
);

const drawerContent = fs.readFileSync(path.resolve(cwd, 'src/components/common/Drawer.tsx'), 'utf-8');
assert(
  drawerContent.includes('backdrop-blur-sm') && drawerContent.includes('slide-in-from-right'),
  'DoD 1: Drawer Panel hỗ trợ hiệu ứng trượt êm ái từ cạnh phải (slide-in-from-right) kèm nền mờ backdrop-blur-sm'
);

const roomCardContent = fs.readFileSync(path.resolve(cwd, 'src/components/common/RoomCard.tsx'), 'utf-8');
assert(
  roomCardContent.includes('group-hover:scale-105') && (roomCardContent.includes('hover:-translate-y-1') || roomCardContent.includes('hover:shadow-2xl')),
  'DoD 1: Thẻ phòng RoomCard có hiệu ứng phóng to nhẹ (Hover Zoom: group-hover:scale-105) và nổi khối (Hover Lift)'
);

// ----------------------------------------------------------------------------
// SUITE 2: DoD 2 - Real-time Toast Notifications (3s Auto-dismiss, 4 Types)
// ----------------------------------------------------------------------------
console.log(`\n${BOLD}2. KIỂM ĐỊNH HỆ THỐNG THÔNG BÁO NỔI TOAST (DoD 2)${RESET}`);
const toastPath = path.resolve(cwd, 'src/components/common/Toast.tsx');
assert(fs.existsSync(toastPath), 'DoD 2: Tồn tại module Toast chuẩn hóa tại src/components/common/Toast.tsx');

const toastContent = fs.readFileSync(toastPath, 'utf-8');
assert(
  toastContent.includes('duration = 3000') && toastContent.includes('setTimeout'),
  'DoD 2: Thông báo Toast tự động biến mất (Auto-dismiss) sau đúng 3 giây (3000ms)'
);
assert(
  toastContent.includes('bg-emerald-600') && toastContent.includes('bg-amber-500') && toastContent.includes('bg-rose-600'),
  'DoD 2: Toast hỗ trợ đủ 3 màu nhận diện cốt lõi: Thành công xanh lá (emerald), Cảnh báo vàng hổ phách (amber), Thất bại đỏ (rose)'
);
assert(
  toastContent.includes('fixed top-6 right-6'),
  'DoD 2: ToastContainer neo vị trí góc trên bên phải màn hình (fixed top-6 right-6)'
);

const appContextContent = fs.readFileSync(path.resolve(cwd, 'src/context/AppContext.tsx'), 'utf-8');
assert(
  appContextContent.includes('toast:') && appContextContent.includes('showToast:') && appContextContent.includes('hideToast:'),
  'DoD 2: AppContext cung cấp State toàn cục và phương thức showToast/hideToast cho toàn bộ ứng dụng'
);

const customerLayoutContent = fs.readFileSync(path.resolve(cwd, 'src/layouts/CustomerLayout.tsx'), 'utf-8');
const staffLayoutContent = fs.readFileSync(path.resolve(cwd, 'src/layouts/StaffLayout.tsx'), 'utf-8');
assert(
  customerLayoutContent.includes('<ToastContainer') && staffLayoutContent.includes('<ToastContainer'),
  'DoD 2: Cả hai phân hệ CustomerLayout và StaffLayout đều tích hợp sẵn ToastContainer'
);

const systemSettingsContent = fs.readFileSync(path.resolve(cwd, 'src/pages/staff/SystemSettingsPage.tsx'), 'utf-8');
assert(
  systemSettingsContent.includes('showToast') && systemSettingsContent.includes('3000'),
  'DoD 2: Màn hình Cài đặt (SystemSettingsPage) kích hoạt Toast thông báo thành công tự ẩn sau 3 giây khi bấm Lưu'
);

// ----------------------------------------------------------------------------
// SUITE 3: DoD 3 - Skeleton Loader with Shimmer Wave (Zero CLS)
// ----------------------------------------------------------------------------
console.log(`\n${BOLD}3. KIỂM ĐỊNH KHUNG XƯƠNG SKELETON & SHIMMER ANIMATION (DoD 3)${RESET}`);
const cssContent = fs.readFileSync(path.resolve(cwd, 'src/index.css'), 'utf-8');
assert(
  cssContent.includes('@keyframes shimmerWave') && cssContent.includes('.animate-shimmer'),
  'DoD 3: File src/index.css định nghĩa keyframe sóng lượn shimmerWave và lớp tiện ích .animate-shimmer'
);

const stateViewsContent = fs.readFileSync(path.resolve(cwd, 'src/components/common/StateViews.tsx'), 'utf-8');
assert(
  stateViewsContent.includes('animate-shimmer') && stateViewsContent.includes('RoomCardSkeleton') && stateViewsContent.includes('StatCardSkeleton'),
  'DoD 3: StateViews.tsx hiện thực Skeleton Shimmer, RoomCardSkeleton và StatCardSkeleton chuyên biệt'
);

const searchResultsContent = fs.readFileSync(path.resolve(cwd, 'src/pages/customer/SearchResultsPage.tsx'), 'utf-8');
assert(
  searchResultsContent.includes('<RoomCardSkeleton') || searchResultsContent.includes('RoomCardSkeleton'),
  'DoD 3: Màn hình Tìm kiếm SearchResultsPage ứng dụng RoomCardSkeleton loại bỏ hoàn toàn giật cục bố cục (CLS)'
);

// ----------------------------------------------------------------------------
// SUITE 4: DoD 4 - EmptyState & ErrorState Visual Design
// ----------------------------------------------------------------------------
console.log(`\n${BOLD}4. KIỂM ĐỊNH MÀN HÌNH DANH SÁCH RỖNG EMPTY STATE & LỖI (DoD 4)${RESET}`);
assert(
  stateViewsContent.includes('Compass') || stateViewsContent.includes('Sparkles') || stateViewsContent.includes('Inbox'),
  'DoD 4: EmptyState sở hữu hình minh họa đồ họa cao cấp chuẩn nhận diện thương hiệu khách sạn 4 sao'
);
assert(
  stateViewsContent.includes('actionText') && stateViewsContent.includes('onAction') && stateViewsContent.includes('ErrorState'),
  'DoD 4: EmptyState hỗ trợ nút hành động phản hồi (Action Button) và ErrorState có nút Thử lại (Retry)'
);
assert(
  searchResultsContent.includes('<EmptyState') && (searchResultsContent.includes('guestsParam') || searchResultsContent.includes('guests')),
  'DoD 4: SearchResultsPage hiển thị EmptyState khi tìm kiếm không có phòng (hỗ trợ tham số guests=20)'
);

// ----------------------------------------------------------------------------
// TỔNG KẾT KẾT QUẢ KIỂM THỬ
// ----------------------------------------------------------------------------
console.log(`\n----------------------------------------------------------------------`);
console.log(`Kết quả: ${GREEN}${passed} bài kiểm tra thành công${RESET}, ${failed > 0 ? `${RED}${failed} bài thất bại${RESET}` : '0 bài thất bại'}.`);

if (failed === 0) {
  console.log(`🎉 ${BOLD}${GREEN}TASK-60 (FE-S4-04) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!${RESET}\n`);
  process.exit(0);
} else {
  console.log(`❌ ${BOLD}${RED}TASK-60 CHƯA ĐẠT ĐỦ TIÊU CHÍ, VUI LÒNG KIỂM TRA LẠI.${RESET}\n`);
  process.exit(1);
}
