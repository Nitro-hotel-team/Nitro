/**
 * ============================================================================
 * TÊN FILE: DemoSwitcher.tsx
 * VỊ TRÍ: src/components/common/DemoSwitcher.tsx
 * PHÂN HỆ: Tiện ích Chuyển đổi Vai trò Nhanh (Demo RBAC Switcher)
 * MÃ TASK: TASK-57 (Jira: FE-S4-01) - Sprint 4
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Cung cấp tiện ích 1-click chuyển đổi nhanh giữa 4 vai trò phân quyền:
 *   + CUSTOMER   : Khách lưu trú (Cổng Khách hàng / Customer Portal)
 *   + FRONT_DESK : Nhân viên Lễ tân (Cổng Quản trị PMS: Sơ đồ phòng, Walk-in, Ca trực)
 *   + MANAGER    : Quản lý Khách sạn (Dashboard KPI, Doanh thu, Báo cáo, Menu)
 *   + ADMIN      : Quản trị viên (Toàn quyền: Quản lý nhân sự, Audit Logs, Cài đặt)
 * - Tự động đồng bộ hóa phiên làm việc vào localStorage:
 *   auth_token, nitro_user_role, nitro_user_info, nitro_current_user.
 * - Hỗ trợ 2 chế độ hiển thị linh hoạt:
 *   1. 'sidebar' : Tích hợp ở chân Sidebar của StaffLayout (hỗ trợ thu gọn/mở rộng).
 *   2. 'header'  : Tích hợp trên thanh Topbar/Header của CustomerLayout & StaffLayout.
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  UserCheck,
  Briefcase,
  Crown,
  ChevronDown,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface DemoSwitcherProps {
  variant?: 'sidebar' | 'header';
  collapsed?: boolean;
  className?: string;
}

interface RoleConfig {
  role: UserRole;
  titleKey: string;
  defaultTitle: string;
  desc: string;
  portalDesc: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
  icon: React.ComponentType<{ className?: string }>;
  targetPath: string;
}

const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'CUSTOMER',
    titleKey: 'role.CUSTOMER',
    defaultTitle: 'Khách hàng',
    desc: 'Nguyễn Văn An • khachhang@nitrohotel.vn',
    portalDesc: 'Cổng Khách hàng: Đặt phòng 3 bước, Lịch sử đơn, Hồ sơ cá nhân',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400',
    dotColor: 'bg-emerald-500',
    icon: UserCheck,
    targetPath: '/',
  },
  {
    role: 'FRONT_DESK',
    titleKey: 'role.FRONT_DESK',
    defaultTitle: 'Nhân viên Lễ tân',
    desc: 'Đỗ Mai Phương (FD-001) • letan@nitrohotel.vn',
    portalDesc: 'PMS Vận hành: Sơ đồ 60 buồng phòng, Đón khách Walk-in, Ca trực',
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-400',
    dotColor: 'bg-blue-500',
    icon: Briefcase,
    targetPath: '/staff/overview',
  },
  {
    role: 'MANAGER',
    titleKey: 'role.MANAGER',
    defaultTitle: 'Quản lý Khách sạn',
    desc: 'Trần Quốc Hưng (MGR-001) • quanly@nitrohotel.vn',
    portalDesc: 'Giám sát: Dashboard KPI phòng, Báo cáo tài chính, Menu dịch vụ',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    dotColor: 'bg-amber-500',
    icon: Shield,
    targetPath: '/staff/dashboard',
  },
  {
    role: 'ADMIN',
    titleKey: 'role.ADMIN',
    defaultTitle: 'Quản trị viên Hệ thống',
    desc: 'Ban Quản Trị (ADM-001) • admin@nitrohotel.vn',
    portalDesc: 'Toàn quyền: Quản trị nhân sự RBAC, Cài đặt giá/VAT, Audit Logs',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-400',
    dotColor: 'bg-purple-500',
    icon: Crown,
    targetPath: '/staff/overview',
  },
];

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({
  variant = 'sidebar',
  collapsed = false,
  className = '',
}) => {
  const { role, setRole, currentUser } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentConfig = ROLE_CONFIGS.find((c) => c.role === role) || ROLE_CONFIGS[0];

  const handleSelectRole = (config: RoleConfig) => {
    setRole(config.role);
    setIsOpen(false);

    // If switching between Customer Portal and Staff Portal, navigate to the target entry path
    const isCurrentlyStaffPath = window.location.pathname.startsWith('/staff');
    if (config.role === 'CUSTOMER' && isCurrentlyStaffPath) {
      navigate('/');
    } else if (config.role !== 'CUSTOMER' && !isCurrentlyStaffPath) {
      navigate(config.targetPath);
    }
  };

  // --------------------------------------------------------------------------
  // VARIANT: HEADER (Used in CustomerLayout Topbar or Navigation Bar)
  // --------------------------------------------------------------------------
  if (variant === 'header') {
    return (
      <div className={`relative inline-block ${className}`} ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/50 shadow-sm text-xs font-medium transition cursor-pointer"
          title="Nhấp để chuyển đổi nhanh vai trò kiểm thử (Demo RBAC Switcher)"
        >
          <span className={`w-2 h-2 rounded-full ${currentConfig.dotColor} animate-pulse`} />
          <span className="hidden sm:inline text-slate-400">Demo RBAC:</span>
          <span className="font-bold text-amber-400">{t(currentConfig.titleKey, currentConfig.defaultTitle)}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Chuyển đổi Vai trò (Demo RBAC)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Switch</span>
            </div>

            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              Chọn vai trò bên dưới để kiểm thử ngay phân quyền 4 sao mà không cần đăng nhập:
            </p>

            <div className="space-y-1.5">
              {ROLE_CONFIGS.map((cfg) => {
                const isSelected = role === cfg.role;
                const IconComponent = cfg.icon;
                return (
                  <button
                    key={cfg.role}
                    type="button"
                    onClick={() => handleSelectRole(cfg)}
                    className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#1F5AA6]/20 border-[#1F5AA6] text-white shadow-md shadow-[#1F5AA6]/10'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">
                          {t(cfg.titleKey, cfg.defaultTitle)}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                            <Check className="w-3 h-3" /> Đang chọn
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{cfg.desc}</div>
                      <div className="text-[10px] text-amber-300/80 mt-1 line-clamp-1">
                        &bull; {cfg.portalDesc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Phiên làm việc tự lưu vào <code className="text-amber-400 font-mono">localStorage</code></span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VARIANT: SIDEBAR (Used in StaffLayout Sidebar Footer)
  // --------------------------------------------------------------------------
  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition select-none group"
        title="Nhấp để chuyển đổi nhanh vai trò kiểm thử (Demo RBAC Switcher)"
      >
        <img
          src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-700 group-hover:ring-amber-500/50 transition"
        />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate flex items-center justify-between">
              <span className="truncate">{currentUser.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${currentConfig.dotColor}`} />
              <span className="text-[10px] text-[#C9A227] font-semibold uppercase tracking-wider">
                {t(currentConfig.titleKey, currentConfig.defaultTitle)}
              </span>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute bottom-full mb-2 ${
              collapsed ? 'left-14 w-80' : 'left-0 right-0'
            } bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 text-xs`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Chuyển đổi Vai trò (Demo RBAC)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Sprint 4</span>
            </div>

            <div className="space-y-1.5">
              {ROLE_CONFIGS.map((cfg) => {
                const isSelected = role === cfg.role;
                const IconComponent = cfg.icon;
                return (
                  <button
                    key={cfg.role}
                    type="button"
                    onClick={() => handleSelectRole(cfg)}
                    className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-[#1F5AA6]/20 border-[#1F5AA6] text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">
                          {t(cfg.titleKey, cfg.defaultTitle)}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{cfg.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Tự động cập nhật menu theo quyền</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

