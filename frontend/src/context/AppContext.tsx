/**
 * ============================================================================
 * TÊN FILE: AppContext.tsx
 * VỊ TRÍ: src/context/AppContext.tsx
 * PHÂN HỆ: Quản trị Trạng thái Toàn cục (Global State Management)
 * MÃ TASK: TASK-57 (Jira: FE-S4-01) - Sprint 4
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Cung cấp kho dữ liệu tập trung (React Context) quản lý phiên làm việc toàn hệ thống.
 * - Quản lý Phân quyền người dùng hiện tại (CUSTOMER, FRONT_DESK, MANAGER, ADMIN)
 *   hỗ trợ lưu trữ phiên làm việc bền vững qua localStorage cho 4 khóa cốt lõi:
 *   1. auth_token: JWT Token xác thực phiên đăng nhập.
 *   2. nitro_user_role: Vai trò hiện tại (CUSTOMER, FRONT_DESK, MANAGER, ADMIN).
 *   3. nitro_user_info: Dữ liệu hồ sơ người dùng đầy đủ (User DTO).
 *   4. nitro_language: Ngôn ngữ hiển thị ưu tiên ('vi' | 'en').
 * - Lưu trữ thông tin đơn đặt phòng nháp (draftBooking) bền vững qua các bước Checkout
 *   (BookingStep1Page -> BookingStep2Page -> BookingStep3Page) chống mất dữ liệu khi tải lại trang.
 * - Quản lý Đồng hồ đếm ngược giữ phòng tạm thời (Hold Countdown Timer, 10 phút)
 *   nhằm bảo vệ phòng tránh tình trạng đặt trùng lặp (Double Booking).
 * - Giả lập Xung đột phòng (Conflict Simulation) phục vụ kiểm thử phản ứng của hệ thống.
 * - Tích hợp bộ chuyển đổi vai trò nhanh (Demo Switcher) phục vụ kiểm thử phân quyền 1 chạm.
 * ============================================================================
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authService } from '../services/api';
import { Booking, User, UserRole } from '../types';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (credentials: { emailOrPhone: string; password: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  viewMode: 'web' | 'mobile_app';
  setViewMode: (mode: 'web' | 'mobile_app') => void;
  
  // Hold timer for temporary reservations
  holdCountdown: number; // in seconds
  resetHoldCountdown: () => void;
  isHoldExpired: boolean;
  
  // Room conflict simulation
  showConflictModal: boolean;
  setShowConflictModal: (show: boolean) => void;
  triggerConflictSimulation: () => void;

  // Active Draft Booking for multi-step checkout
  draftBooking: Partial<Booking> | null;
  setDraftBooking: React.Dispatch<React.SetStateAction<Partial<Booking> | null>>;
  clearDraftBooking: () => void;

  // Notifications
  unreadNotifications: number;
  markNotificationsRead: () => void;

  // RBAC Permission helper
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Khởi tạo dữ liệu người dùng mẫu tương ứng với từng vai trò RBAC
 * Đồng bộ với MOCK_USERS chuẩn 4 sao trong src/mocks/data.ts
 */
export const createDefaultUser = (role: UserRole): User => {
  switch (role) {
    case 'ADMIN':
      return {
        id: 'usr-admin',
        employeeCode: 'ADM-001',
        name: 'Ban Quản Trị Hệ Thống',
        email: 'admin@nitrohotel.vn',
        phone: '0912000111',
        role: 'ADMIN',
        status: 'ACTIVE',
        lastLogin: 'Hôm nay 08:30',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      };
    case 'MANAGER':
      return {
        id: 'usr-manager',
        employeeCode: 'MGR-001',
        name: 'Trần Quốc Hưng',
        email: 'quanly@nitrohotel.vn',
        phone: '0919998888',
        role: 'MANAGER',
        status: 'ACTIVE',
        lastLogin: 'Hôm nay 08:00',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      };
    case 'FRONT_DESK':
      return {
        id: 'usr-frontdesk',
        employeeCode: 'FD-001',
        name: 'Đỗ Mai Phương',
        email: 'letan@nitrohotel.vn',
        phone: '0908889999',
        role: 'FRONT_DESK',
        status: 'ACTIVE',
        lastLogin: 'Hôm nay 07:00',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      };
    case 'CUSTOMER':
    default:
      return {
        id: 'usr-customer',
        employeeCode: 'CUST-001',
        name: 'Nguyễn Văn An',
        email: 'khachhang@nitrohotel.vn',
        phone: '0901234567',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        lastLogin: 'Hôm nay 08:15',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      };
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  // 1. Quản lý Token xác thực phiên đăng nhập qua localStorage ('auth_token')
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // 2. Quản lý Vai trò phân quyền qua localStorage ('nitro_user_role')
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('nitro_user_role') as UserRole;
    if (savedRole && ['CUSTOMER', 'FRONT_DESK', 'MANAGER', 'ADMIN'].includes(savedRole)) {
      return savedRole;
    }
    return 'CUSTOMER';
  });

  // 3. Quản lý Thông tin người dùng qua localStorage ('nitro_user_info' & 'nitro_current_user')
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedUser = localStorage.getItem('nitro_user_info') || localStorage.getItem('nitro_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.role) return parsed;
      } catch {
        // ignore parse error
      }
    }
    const savedRole = (localStorage.getItem('nitro_user_role') as UserRole) || 'CUSTOMER';
    return createDefaultUser(savedRole);
  });

  // 4. Quản lý Ngôn ngữ ưu tiên qua localStorage ('nitro_language')
  const [language, setLanguageState] = useState<'vi' | 'en'>(() => {
    const savedLang = localStorage.getItem('nitro_language') as 'vi' | 'en';
    if (savedLang === 'vi' || savedLang === 'en') {
      return savedLang;
    }
    return 'vi';
  });

  const [viewMode, setViewMode] = useState<'web' | 'mobile_app'>('web');

  // Hold countdown (10 minutes = 600 seconds)
  const [holdCountdown, setHoldCountdown] = useState<number>(600);
  const [isHoldExpired, setIsHoldExpired] = useState<boolean>(false);
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);

  // 5. Quản lý Đơn đặt phòng nháp lưu bền vững qua localStorage ('nitro_draft_booking')
  const [draftBooking, setDraftBookingState] = useState<Partial<Booking> | null>(() => {
    const savedDraft = localStorage.getItem('nitro_draft_booking');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {
        // ignore parse error
      }
    }
    return null;
  });

  // Wrapper setDraftBooking đồng bộ tức thời với localStorage
  const setDraftBooking: React.Dispatch<React.SetStateAction<Partial<Booking> | null>> = (valueOrUpdater) => {
    setDraftBookingState((prev) => {
      const next = typeof valueOrUpdater === 'function' ? (valueOrUpdater as any)(prev) : valueOrUpdater;
      if (next) {
        localStorage.setItem('nitro_draft_booking', JSON.stringify(next));
      } else {
        localStorage.removeItem('nitro_draft_booking');
      }
      return next;
    });
  };

  // Đồng bộ ngôn ngữ i18n khi khởi chạy
  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
      document.documentElement.lang = language;
    }
  }, [language, i18n]);

  // Kiểm định Token xác thực khi tải ứng dụng
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        try {
          const user = await authService.getMe();
          if (user) {
            setCurrentUserState(user);
            setRoleState(user.role);
            setToken(savedToken);
            localStorage.setItem('nitro_user_role', user.role);
            localStorage.setItem('nitro_user_info', JSON.stringify(user));
            localStorage.setItem('nitro_current_user', JSON.stringify(user));
          }
        } catch {
          // Token không hợp lệ hoặc đã hết hạn -> đăng xuất an toàn
          await authService.logout();
          setToken(null);
          setRoleState('CUSTOMER');
          const defaultCust = createDefaultUser('CUSTOMER');
          setCurrentUserState(defaultCust);
          localStorage.setItem('nitro_user_role', 'CUSTOMER');
          localStorage.setItem('nitro_user_info', JSON.stringify(defaultCust));
          localStorage.setItem('nitro_current_user', JSON.stringify(defaultCust));
        }
      }
      setIsAuthLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: { emailOrPhone: string; password: string }) => {
    try {
      const res = await authService.login(credentials);
      setToken(res.token);
      setRoleState(res.user.role);
      setCurrentUserState(res.user);
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('nitro_user_role', res.user.role);
      localStorage.setItem('nitro_user_info', JSON.stringify(res.user));
      localStorage.setItem('nitro_current_user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Đăng nhập không thành công' };
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    try {
      const res = await authService.register(data);
      setToken(res.token);
      setRoleState(res.user.role);
      setCurrentUserState(res.user);
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('nitro_user_role', res.user.role);
      localStorage.setItem('nitro_user_info', JSON.stringify(res.user));
      localStorage.setItem('nitro_current_user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Đăng ký không thành công' };
    }
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setRoleState('CUSTOMER');
    const defaultCust = createDefaultUser('CUSTOMER');
    setCurrentUserState(defaultCust);
    localStorage.removeItem('auth_token');
    localStorage.setItem('nitro_user_role', 'CUSTOMER');
    localStorage.removeItem('nitro_user_info');
    localStorage.removeItem('nitro_current_user');
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem('nitro_user_info', JSON.stringify(user));
    localStorage.setItem('nitro_current_user', JSON.stringify(user));
  };

  /**
   * Chuyển đổi vai trò 1-click (Demo Switcher RBAC)
   * Tự động khởi tạo hồ sơ nhân sự/khách tương ứng và cấp mock token cho Staff
   */
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('nitro_user_role', newRole);
    const mockUser = createDefaultUser(newRole);
    setCurrentUserState(mockUser);
    localStorage.setItem('nitro_user_info', JSON.stringify(mockUser));
    localStorage.setItem('nitro_current_user', JSON.stringify(mockUser));

    if (newRole !== 'CUSTOMER') {
      const mockToken = `demo-token-${newRole.toLowerCase()}-${Date.now()}`;
      setToken(mockToken);
      localStorage.setItem('auth_token', mockToken);
    } else {
      // Khi về Customer, nếu là mock demo token thì dọn dẹp
      const currentToken = localStorage.getItem('auth_token');
      if (currentToken && currentToken.startsWith('demo-token-')) {
        setToken(null);
        localStorage.removeItem('auth_token');
      }
    }
  };

  const setLanguage = (lang: 'vi' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('nitro_language', lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  };

  const resetHoldCountdown = () => {
    setHoldCountdown(600);
    setIsHoldExpired(false);
  };

  const clearDraftBooking = () => {
    setDraftBookingState(null);
    localStorage.removeItem('nitro_draft_booking');
    resetHoldCountdown();
  };

  const triggerConflictSimulation = () => {
    setShowConflictModal(true);
  };

  const markNotificationsRead = () => {
    setUnreadNotifications(0);
  };

  // Timer decrement
  useEffect(() => {
    if (holdCountdown <= 0) {
      setIsHoldExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setHoldCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [holdCountdown]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        token,
        isAuthenticated: !!token,
        isAuthLoading,
        login,
        register,
        logout,
        language,
        setLanguage,
        viewMode,
        setViewMode,
        holdCountdown,
        resetHoldCountdown,
        isHoldExpired,
        showConflictModal,
        setShowConflictModal,
        triggerConflictSimulation,
        draftBooking,
        setDraftBooking,
        clearDraftBooking,
        unreadNotifications,
        markNotificationsRead,
        hasPermission: (allowedRoles: UserRole[]) => allowedRoles.includes(role),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
