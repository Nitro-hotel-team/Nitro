/**
 * ============================================================================
 * TÊN FILE: AppContext.tsx
 * VỊ TRÍ: src/context/AppContext.tsx
 * PHÂN HỆ: Quản trị Trạng thái Toàn cục (Global State Management)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Cung cấp kho dữ liệu tập trung (React Context) quản lý phiên làm việc toàn hệ thống.
 * - Quản lý Phân quyền người dùng hiện tại (CUSTOMER, FRONT_DESK, MANAGER, ADMIN)
 *   hỗ trợ lưu trữ phiên làm việc bền vững qua localStorage và xác thực tài khoản.
 * - Quản lý Đa ngôn ngữ (VI / EN) đồng bộ cùng i18next và localStorage.
 * - Quản lý Đồng hồ đếm ngược giữ phòng tạm thời (Hold Countdown Timer, mặc định 10 phút)
 *   nhằm bảo vệ phòng tránh tình trạng đặt trùng lặp (Double Booking).
 * - Giả lập Xung đột phòng (Conflict Simulation) phục vụ kiểm thử phản ứng của hệ thống.
 * - Lưu trữ thông tin đơn đặt phòng nháp (draftBooking) qua các bước Checkout Step 1 -> 2 -> 3.
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const createDefaultUser = (role: UserRole): User => ({
  id: `default-${role.toLowerCase()}`,
  name: role === 'CUSTOMER' ? 'Khách hàng' : `User ${role}`,
  email: '',
  phone: '',
  role: role,
  status: 'ACTIVE',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  // Initialize token, role and user from localStorage if present
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('nitro_user_role') as UserRole;
    if (savedRole && ['CUSTOMER', 'FRONT_DESK', 'MANAGER', 'ADMIN'].includes(savedRole)) {
      return savedRole;
    }
    return 'CUSTOMER';
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedUser = localStorage.getItem('nitro_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed) return parsed;
      } catch {
        // ignore parse error
      }
    }
    const savedRole = localStorage.getItem('nitro_user_role') as UserRole;
    return createDefaultUser(savedRole || 'CUSTOMER');
  });

  const [language, setLanguageState] = useState<'vi' | 'en'>('vi');
  const [viewMode, setViewMode] = useState<'web' | 'mobile_app'>('web');

  // Hold countdown (10 minutes = 600 seconds)
  const [holdCountdown, setHoldCountdown] = useState<number>(600);
  const [isHoldExpired, setIsHoldExpired] = useState<boolean>(false);
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);

  // Draft booking held across customer booking steps W-C04 -> W-C05 -> W-C06
  const [draftBooking, setDraftBooking] = useState<Partial<Booking> | null>(null);

  // Validate token on mount
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
          }
        } catch {
          // Token invalid or expired -> logout
          await authService.logout();
          setToken(null);
          setRoleState('CUSTOMER');
          setCurrentUserState(createDefaultUser('CUSTOMER'));
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
      return { success: true, user: res.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Đăng ký không thành công' };
    }
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setRoleState('CUSTOMER');
    setCurrentUserState(createDefaultUser('CUSTOMER'));
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem('nitro_current_user', JSON.stringify(user));
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('nitro_user_role', newRole);
    const mockUser = createDefaultUser(newRole);
    setCurrentUserState(mockUser);
    localStorage.setItem('nitro_current_user', JSON.stringify(mockUser));
  };

  const setLanguage = (lang: 'vi' | 'en') => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  };

  const resetHoldCountdown = () => {
    setHoldCountdown(600);
    setIsHoldExpired(false);
  };

  const clearDraftBooking = () => {
    setDraftBooking(null);
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
