/**
 * ============================================================================
 * TÊN FILE: rbac.ts
 * VỊ TRÍ: src/utils/rbac.ts
 * PHÂN HỆ: Ma trận Phân quyền & Kiểm soát Truy cập (RBAC Matrix & Route Guard)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Chuẩn hóa ma trận phân quyền 4 vai trò: CUSTOMER, FRONT_DESK, MANAGER, ADMIN
 *   theo đúng yêu cầu của BA/PO và Backend.
 * - Cung cấp các hàm kiểm tra quyền truy cập (hasRole, canAccessRoute).
 * - Cung cấp nhãn hiển thị và màu sắc nhận diện trực quan cho từng vai trò.
 * ============================================================================
 */

import { UserRole } from '../types';

export const ROLE_LABELS: Record<UserRole, { vi: string; en: string }> = {
  CUSTOMER: { vi: 'Khách hàng', en: 'Customer' },
  FRONT_DESK: { vi: 'Nhân viên Lễ tân', en: 'Front Desk' },
  MANAGER: { vi: 'Quản lý Khách sạn', en: 'Hotel Manager' },
  ADMIN: { vi: 'Quản trị viên Hệ thống', en: 'System Admin' },
};

export const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  CUSTOMER: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  FRONT_DESK: 'bg-blue-100 text-blue-800 border-blue-300',
  MANAGER: 'bg-purple-100 text-purple-800 border-purple-300',
  ADMIN: 'bg-rose-100 text-rose-800 border-rose-300',
};

/**
 * Kiểm tra xem vai trò hiện tại có nằm trong danh sách vai trò được phép hay không.
 */
export function hasRole(currentRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(currentRole);
}

/**
 * Danh sách định tuyến nội bộ và các vai trò có quyền truy cập.
 */
export const ROUTE_PERMISSIONS: { path: string; allowedRoles: UserRole[] }[] = [
  // Lễ tân, Quản lý, Admin
  { path: '/staff/overview', allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'] },
  { path: '/staff/room-board', allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'] },
  { path: '/staff/timeline', allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'] },
  { path: '/staff/bookings', allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'] },
  { path: '/staff/walk-in', allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'] },
  { path: '/staff/customers', allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'] },

  // Quản lý & Admin
  { path: '/staff/dashboard', allowedRoles: ['MANAGER', 'ADMIN'] },
  { path: '/staff/room-types', allowedRoles: ['MANAGER', 'ADMIN'] },
  { path: '/staff/rooms', allowedRoles: ['MANAGER', 'ADMIN'] },
  { path: '/staff/services', allowedRoles: ['MANAGER', 'ADMIN'] },
  { path: '/staff/reports', allowedRoles: ['MANAGER', 'ADMIN'] },

  // Admin tối cao
  { path: '/staff/users', allowedRoles: ['ADMIN'] },
  { path: '/staff/settings', allowedRoles: ['ADMIN'] },
  { path: '/staff/logs', allowedRoles: ['ADMIN'] },
  { path: '/staff/audit-logs', allowedRoles: ['ADMIN'] },
];

/**
 * Kiểm tra người dùng có quyền truy cập vào đường dẫn cụ thể không.
 */
export function canAccessRoute(pathname: string, currentRole: UserRole): boolean {
  if (currentRole === 'CUSTOMER' && pathname.startsWith('/staff')) {
    return false;
  }
  const matched = ROUTE_PERMISSIONS.find((r) => pathname.startsWith(r.path));
  if (!matched) {
    // Mặc định các trang con của /staff yêu cầu tối thiểu FRONT_DESK
    return currentRole !== 'CUSTOMER';
  }
  return matched.allowedRoles.includes(currentRole);
}
