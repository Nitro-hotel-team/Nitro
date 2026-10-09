/**
 * ============================================================================
 * TÊN FILE: StaffLayout.tsx
 * VỊ TRÍ: src/layouts/StaffLayout.tsx
 * PHÂN HỆ: Khung Giao diện Quản trị & Nghiệp vụ Khách sạn (Staff & Admin Portal)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Định hình layout chuẩn cho toàn bộ 15 trang chức năng nội bộ:
 *     + Sidebar cố định bên trái (hỗ trợ thu gọn Collapse / mở rộng Expand).
 *     + Header trên cùng: Tìm kiếm nhanh PNR/khách, chuông thông báo ca, chuyển ngôn ngữ,
 *       nút CTA tạo nhanh đặt phòng trực tiếp "+ Walk-in".
 *     + Drawer trượt bên hông (Off-canvas) mượt mà khi người dùng thao tác trên Smartphone / Tablet.
 *     + Kiểm soát quyền hạn động (Dynamic RBAC Menu Filtering): Menu tự động ẩn hiện
 *       dựa trên vai trò hiện tại (`FRONT_DESK`, `MANAGER`, `ADMIN`).
 *     + Màn hình cảnh báo 403 Forbidden trực quan nếu truy cập vượt thẩm quyền.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  FileText,
  History,
  Home,
  Hotel,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ForbiddenView } from '../components/common/ForbiddenView';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { canAccessRoute } from '../utils/rbac';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
  category: 'FRONT_DESK' | 'MANAGER' | 'ADMIN';
}

export const StaffLayout: React.FC = () => {
  const { t } = useTranslation();
  const { role, setRole, logout, currentUser, language, setLanguage, unreadNotifications, markNotificationsRead } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  // All menu items mapped by role permission and grouped by operational area
  const menuItems: MenuItem[] = [
    // Front Desk (Lễ tân)
    {
      title: t('nav.shiftOverview'),
      path: '/staff/overview',
      icon: <ClipboardList className="w-5 h-5" />,
      allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'],
      category: 'FRONT_DESK',
    },
    {
      title: t('nav.roomBoard'),
      path: '/staff/room-board',
      icon: <DoorOpen className="w-5 h-5" />,
      allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'],
      category: 'FRONT_DESK',
    },
    {
      title: t('nav.roomTimeline'),
      path: '/staff/timeline',
      icon: <Calendar className="w-5 h-5" />,
      allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'],
      category: 'FRONT_DESK',
    },
    {
      title: t('nav.bookingsList'),
      path: '/staff/bookings',
      icon: <FileText className="w-5 h-5" />,
      allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'],
      category: 'FRONT_DESK',
    },
    {
      title: t('nav.customers'),
      path: '/staff/customers',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['FRONT_DESK', 'MANAGER', 'ADMIN'],
      category: 'FRONT_DESK',
    },

    // Manager (Quản lý)
    {
      title: t('nav.dashboard'),
      path: '/staff/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: ['MANAGER', 'ADMIN'],
      category: 'MANAGER',
    },
    {
      title: t('nav.roomTypes'),
      path: '/staff/room-types',
      icon: <Layers className="w-5 h-5" />,
      allowedRoles: ['MANAGER', 'ADMIN'],
      category: 'MANAGER',
    },
    {
      title: t('nav.roomsManage'),
      path: '/staff/rooms',
      icon: <Hotel className="w-5 h-5" />,
      allowedRoles: ['MANAGER', 'ADMIN'],
      category: 'MANAGER',
    },
    {
      title: t('nav.services'),
      path: '/staff/services',
      icon: <Utensils className="w-5 h-5" />,
      allowedRoles: ['MANAGER', 'ADMIN'],
      category: 'MANAGER',
    },
    {
      title: t('nav.reports'),
      path: '/staff/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      allowedRoles: ['MANAGER', 'ADMIN'],
      category: 'MANAGER',
    },

    // Admin
    {
      title: t('nav.usersPermissions'),
      path: '/staff/users',
      icon: <ShieldCheck className="w-5 h-5" />,
      allowedRoles: ['ADMIN'],
      category: 'ADMIN',
    },
    {
      title: t('nav.settings'),
      path: '/staff/settings',
      icon: <Settings className="w-5 h-5" />,
      allowedRoles: ['ADMIN'],
      category: 'ADMIN',
    },
    {
      title: t('nav.auditLogs'),
      path: '/staff/logs',
      icon: <History className="w-5 h-5" />,
      allowedRoles: ['ADMIN'],
      category: 'ADMIN',
    },
  ];

  // Filter menu items allowed for the current role
  const visibleMenuItems = menuItems.filter((item) =>
    item.allowedRoles.includes(role)
  );

  // Check if current route is allowed for the active role (403 guard)
  const currentMenuItem = menuItems.find((item) => item.path === location.pathname);
  const isForbidden = !canAccessRoute(location.pathname, role) || (currentMenuItem && !currentMenuItem.allowedRoles.includes(role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchQuery.trim()) return;
    navigate(`/staff/bookings?search=${encodeURIComponent(quickSearchQuery.trim())}`);
  };

  if (isForbidden) {
    return (
      <ForbiddenView
        currentRole={role}
        requiredRoles={currentMenuItem?.allowedRoles}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Desktop Sidebar (Dark Navy #0B1F3A) */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0B1F3A] text-slate-300 border-r border-slate-800 transition-all duration-300 select-none z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#1F5AA6] flex items-center justify-center text-[#C9A227] shrink-0 shadow-sm">
              <Hotel className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white tracking-wide">NITRO GRAND</span>
                <span className="text-[10px] text-[#C9A227] uppercase tracking-wider font-semibold">
                  Staff Portal
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-3">
          {(['FRONT_DESK', 'MANAGER', 'ADMIN'] as const).map((cat) => {
            const catItems = visibleMenuItems.filter((item) => item.category === cat);
            if (catItems.length === 0) return null;

            const categoryLabels: Record<string, string> = {
              FRONT_DESK: 'Vận hành Lễ tân',
              MANAGER: 'Quản trị & Báo cáo',
              ADMIN: 'Hệ thống & Bảo mật',
            };

            return (
              <div key={cat} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {categoryLabels[cat]}
                  </div>
                )}
                {catItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors group relative ${
                        active
                          ? 'bg-[#1F5AA6] text-white shadow-xs font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={collapsed ? item.title : undefined}
                    >
                      <span className={`shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer with Fast Role Switcher */}
        <div className="p-3 border-t border-slate-800 relative">
          <div
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition select-none"
            title="Nhấp để đổi nhanh vai trò kiểm thử (RBAC Switcher)"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </div>
                <div className="text-[10px] text-[#C9A227] font-semibold uppercase tracking-wider">
                  {t(`role.${role}`)}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Popover */}
          {roleSwitcherOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleSwitcherOpen(false)}
              />
              <div className="absolute bottom-20 left-3 right-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800 mb-1">
                  Chuyển đổi Vai trò (Demo RBAC)
                </div>
                {(['FRONT_DESK', 'MANAGER', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                      role === r ? 'bg-[#1F5AA6] text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{t(`role.${r}`)}</span>
                    {role === r && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          <Link
            to="/"
            className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <Home className="w-4 h-4" />
            {!collapsed && <span>Về trang chủ Khách</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 w-full flex items-center justify-center gap-2 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
            title={collapsed ? t('nav.logout') : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for staff */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-20 shadow-xs">
          {/* Left: Mobile drawer button & Quick Search */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer"
              aria-label="Mở menu nhân viên"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Search */}
            <form onSubmit={handleQuickSearch} className="relative w-full max-w-[140px] xs:max-w-[200px] sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder={t('staff.quickSearch')}
                className="w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 sm:py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]/20 focus:border-[#1F5AA6] transition truncate"
              />
            </form>
          </div>

          {/* Right: Actions, Language, Role Badge, + Walk-in */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Real-time Indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[11px]">Hệ thống đồng bộ</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-0.5 sm:gap-1 text-xs font-bold border border-slate-200 rounded-lg p-0.5 sm:p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`px-1 sm:px-1.5 py-0.5 rounded text-[11px] sm:text-xs transition cursor-pointer ${
                  language === 'vi' ? 'bg-[#1F5AA6] text-white' : 'text-slate-600'
                }`}
              >
                VI
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1 sm:px-1.5 py-0.5 rounded text-[11px] sm:text-xs transition cursor-pointer ${
                  language === 'en' ? 'bg-[#1F5AA6] text-white' : 'text-slate-600'
                }`}
              >
                EN
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  markNotificationsRead();
                }}
                className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#DC2626] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setNotifDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-3 z-40 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2">
                      <span className="text-xs font-bold text-[#0F172A]">Thông báo ca làm việc</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Tất cả đã đọc</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg">
                        <div className="font-semibold text-[#1F5AA6]">Đặt phòng mới trực tuyến</div>
                        <div className="text-slate-600 text-[11px]">NTR-260921-0042 (Nguyễn Văn An) vừa đặt phòng DLX-302</div>
                        <div className="text-[10px] text-slate-400 mt-1">2 phút trước</div>
                      </div>
                      <div className="p-2 bg-amber-50/70 border border-amber-100 rounded-lg">
                        <div className="font-semibold text-amber-800">Nhắc nhở Check-in</div>
                        <div className="text-slate-600 text-[11px]">Khách Trần Thị Bích Ngọc sắp đến vào lúc 15:00</div>
                        <div className="text-[10px] text-slate-400 mt-1">15 phút trước</div>
                      </div>
                      <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                        <div className="font-semibold text-emerald-800">Phòng 105 đã dọn xong</div>
                        <div className="text-slate-600 text-[11px]">Bộ phận buồng phòng đã chuyển sang trạng thái Trống</div>
                        <div className="text-[10px] text-slate-400 mt-1">30 phút trước</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Prominent "+ Đặt phòng Walk-in" button */}
            <Button
              variant="gold"
              size="sm"
              icon={<PlusCircle className="w-4 h-4 shrink-0" />}
              onClick={() => navigate('/staff/walk-in')}
              className="font-bold shadow-xs tracking-wide shrink-0 px-2 sm:px-3 text-xs"
            >
              <span className="hidden sm:inline">{t('nav.walkInBooking')}</span>
              <span className="sm:hidden">Walk-in</span>
            </Button>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#0B1F3A] text-white flex flex-col shadow-2xl p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Hotel className="w-6 h-6 text-[#C9A227]" />
                <span className="font-bold text-sm text-white">NITRO GRAND HOTEL</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {visibleMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    location.pathname === item.path
                      ? 'bg-[#1F5AA6] text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Button
                variant="gold"
                size="md"
                className="w-full"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate('/staff/walk-in');
                }}
              >
                {t('nav.walkInBooking')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-slate-900 border-slate-700 text-white"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate('/');
                }}
              >
                Về giao diện Khách hàng
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-rose-950/30 border-rose-800/60 text-rose-300 hover:bg-rose-900/50"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  handleLogout();
                }}
              >
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
