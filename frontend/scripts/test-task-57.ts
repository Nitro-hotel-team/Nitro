/**
 * ============================================================================
 * TEST RUNNER: TASK-57 (Jira: FE-S4-01)
 * Hoàn thiện State Toàn cục (AppContext) & Bộ Demo Switcher Chuyển Vai trò
 * ============================================================================
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createDefaultUser } from '../src/context/AppContext';
import { UserRole } from '../src/types';

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
console.log(`${BOLD}${CYAN}   KIỂM ĐỊNH TỰ ĐỘNG TASK-57 (FE-S4-01): APPCONTEXT & DEMO SWITCHER   ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================================${RESET}\n`);

const cwd = process.cwd();

// DoD 1: AppContext quản lý localStorage keys
const appContextFile = fs.readFileSync(path.resolve(cwd, 'src/context/AppContext.tsx'), 'utf-8');

assert(
  appContextFile.includes("'auth_token'"),
  "DoD 1: Quản lý khóa 'auth_token' trong localStorage"
);
assert(
  appContextFile.includes("'nitro_user_role'"),
  "DoD 1: Quản lý khóa 'nitro_user_role' trong localStorage"
);
assert(
  appContextFile.includes("'nitro_user_info'"),
  "DoD 1: Quản lý khóa 'nitro_user_info' trong localStorage"
);
assert(
  appContextFile.includes("'nitro_language'"),
  "DoD 1: Quản lý khóa 'nitro_language' trong localStorage"
);

// DoD 2: draftBooking được bảo toàn
assert(
  appContextFile.includes("'nitro_draft_booking'"),
  "DoD 2: Dữ liệu draftBooking được lưu bền vững qua khóa 'nitro_draft_booking'"
);

// DoD 3: DemoSwitcher tồn tại và phủ đủ 4 vai trò
const demoSwitcherFile = fs.readFileSync(path.resolve(cwd, 'src/components/common/DemoSwitcher.tsx'), 'utf-8');
const roles: UserRole[] = ['CUSTOMER', 'FRONT_DESK', 'MANAGER', 'ADMIN'];

roles.forEach((r) => {
  const user = createDefaultUser(r);
  assert(
    user.role === r && !!user.name && !!user.email,
    `DoD 3: createDefaultUser('${r}') tạo người dùng hợp lệ (${user.name} - ${user.email})`
  );
  assert(
    demoSwitcherFile.includes(`role: '${r}'`),
    `DoD 3: DemoSwitcher có cấu hình 1-click cho vai trò '${r}'`
  );
});

// Kiểm tra tích hợp Demo Switcher trong layouts
const staffLayoutFile = fs.readFileSync(path.resolve(cwd, 'src/layouts/StaffLayout.tsx'), 'utf-8');
assert(
  staffLayoutFile.includes('<DemoSwitcher variant="sidebar"'),
  "DoD 3: StaffLayout đã tích hợp DemoSwitcher tại Sidebar"
);

const custLayoutFile = fs.readFileSync(path.resolve(cwd, 'src/layouts/CustomerLayout.tsx'), 'utf-8');
assert(
  custLayoutFile.includes('<DemoSwitcher variant="header"'),
  "DoD 3: CustomerLayout đã tích hợp DemoSwitcher tại Header Topbar"
);

// DoD 4: Export hook useApp
assert(
  appContextFile.includes('export const useApp = () =>'),
  "DoD 4: Export hook tiện ích useApp() cho toàn bộ các trang con"
);

console.log(`\n----------------------------------------------------------------------`);
console.log(`Kết quả: ${passed} bài kiểm tra thành công, ${failed} bài thất bại.`);
if (failed === 0) {
  console.log(`${BOLD}${GREEN}🎉 TASK-57 (FE-S4-01) ĐẠT 100% TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)!${RESET}\n`);
} else {
  console.log(`${BOLD}${RED}Có bài kiểm tra thất bại!${RESET}\n`);
  process.exit(1);
}
