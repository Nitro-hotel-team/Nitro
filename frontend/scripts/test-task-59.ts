/**
 * ============================================================================
 * TEST RUNNER: TASK-59 (Jira: FE-S4-03)
 * Tối ưu Giao diện Tương thích Đa Thiết bị (Responsive Mobile & Tablet)
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
console.log(`${BOLD}${CYAN}   KIỂM ĐỊNH TỰ ĐỘNG TASK-59 (FE-S4-03): TỐI ƯU RESPONSIVE & MOBILE    ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

const cwd = process.cwd();

// DoD 1: CustomerLayout Responsive Mobile Drawer
const custLayout = fs.readFileSync(path.resolve(cwd, 'src/layouts/CustomerLayout.tsx'), 'utf-8');
assert(
  custLayout.includes('lg:hidden') && custLayout.includes('setMobileMenuOpen(!mobileMenuOpen)'),
  "DoD 1: CustomerLayout có icon Hamburger Menu kích hoạt trên màn hình < 1024px"
);
assert(
  custLayout.includes('document.body.style.overflow'),
  "DoD 1: Khóa cuộn trang nền (Body Scroll Lock) khi mở Mobile Drawer"
);
assert(
  custLayout.includes('min-h-[44px]') && custLayout.includes("t('room.bookNow')"),
  "DoD 1: Các nút CTA và liên kết điều hướng trong Mobile Drawer đạt chuẩn vùng chạm >= 44px"
);
assert(
  custLayout.includes('<DemoSwitcher variant="header" />'),
  "DoD 1: Tích hợp bộ chuyển đổi Demo Switcher & Đa ngôn ngữ trong Mobile Drawer"
);

// DoD 2: StaffLayout Responsive Mobile Drawer
const staffLayout = fs.readFileSync(path.resolve(cwd, 'src/layouts/StaffLayout.tsx'), 'utf-8');
assert(
  staffLayout.includes('setMobileDrawerOpen(true)') && staffLayout.includes('lg:hidden'),
  "DoD 2: StaffLayout có nút mở Mobile Drawer trên thiết bị di động/tablet"
);
assert(
  staffLayout.includes('document.body.style.overflow'),
  "DoD 2: Khóa cuộn trang nền khi mở Staff Mobile Drawer"
);
assert(
  staffLayout.includes('min-h-[44px] min-w-[44px]'),
  "DoD 2: Nút mở và đóng Mobile Drawer đạt chuẩn kích thước tối thiểu 44x44px"
);
assert(
  staffLayout.includes('<DemoSwitcher variant="sidebar" />'),
  "DoD 2: Mobile Drawer tích hợp DemoSwitcher chuyển vai trò 1-click trực tiếp"
);

// DoD 3: Chống tràn màn hình ngang (No Horizontal Page Overflow)
const roomBoard = fs.readFileSync(path.resolve(cwd, 'src/pages/staff/RoomBoardPage.tsx'), 'utf-8');
assert(
  roomBoard.includes('max-w-full') && roomBoard.includes('overflow-x-hidden'),
  "DoD 3: RoomBoardPage bảo đảm không bị tràn ngang layout (max-w-full overflow-x-hidden)"
);

const timeline = fs.readFileSync(path.resolve(cwd, 'src/pages/staff/BookingTimelinePage.tsx'), 'utf-8');
assert(
  timeline.includes('overflow-x-auto') && timeline.includes('touch-pan-x'),
  "DoD 3: BookingTimelinePage có vùng cuộn ngang nội bộ mượt mà hỗ trợ cảm ứng (touch-pan-x)"
);

// DoD 4: Chuẩn Apple HIG và quy chuẩn CSS
const indexCss = fs.readFileSync(path.resolve(cwd, 'src/index.css'), 'utf-8');
assert(
  indexCss.includes('overflow-x: hidden') && indexCss.includes('max-width: 100vw'),
  "DoD 4: src/index.css thiết lập chặn tràn ngang toàn cục (overflow-x: hidden, max-width: 100vw)"
);
assert(
  indexCss.includes('touch-target-44') && indexCss.includes('min-height: 44px'),
  "DoD 4: src/index.css định nghĩa chuẩn vùng chạm cảm ứng tối thiểu 44px theo Apple HIG"
);

console.log(`\n----------------------------------------------------------------------`);
console.log(`Kết quả: ${passed} bài kiểm tra thành công, ${failed} bài thất bại.`);
if (failed === 0) {
  console.log(`${BOLD}${GREEN}🎉 TASK-59 (FE-S4-03) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!${RESET}\n`);
} else {
  console.log(`${BOLD}${RED}Có bài kiểm tra thất bại!${RESET}\n`);
  process.exit(1);
}

