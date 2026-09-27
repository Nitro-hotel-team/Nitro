/**
 * ============================================================================
 * TÊN FILE: LoginPage.tsx
 * VỊ TRÍ: src/pages/auth/LoginPage.tsx
 * PHÂN HỆ: Xác thực Người dùng & Phân quyền (Authentication & RBAC Login)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trang xác thực đăng nhập tài khoản đa vai trò:
 *     1. Đăng nhập truyền thống: Email / SĐT + Mật khẩu với chức năng ẩn/hiện mật khẩu.
 *     2. Đăng nhập nhanh 1-chạm thử nghiệm (Demo Quick Logins):
 *         * Khách hàng (CUSTOMER) -> Cổng Đặt phòng trực tuyến.
 *         * Lễ tân (FRONT_DESK) -> Sơ đồ phòng & Bàn giao ca.
 *         * Quản lý (MANAGER) -> Báo cáo doanh thu Dashboard.
 *         * Quản trị viên (ADMIN) -> Cấu hình hệ thống & Phân quyền.
 *     3. Ghi nhớ phiên đăng nhập (Remember Me) và liên kết Quên mật khẩu / Đăng ký mới.
 * ============================================================================
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Hotel, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../mocks/data';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, language } = useApp();
  const isEn = language === 'en';
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState('khachhang@nitrohotel.vn');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await login({ emailOrPhone, password });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || (isEn ? 'Login failed. Please verify credentials.' : 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.'));
      return;
    }

    // Check if there is a redirect URL in query params
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get('redirect');
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }

    const userRole = res.user?.role;
    if (userRole === 'CUSTOMER') {
      navigate('/');
    } else if (userRole === 'FRONT_DESK') {
      navigate('/staff/overview');
    } else if (userRole === 'MANAGER') {
      navigate('/staff/dashboard');
    } else if (userRole === 'ADMIN') {
      navigate('/staff/users');
    } else {
      navigate('/');
    }
  };
// ===============================Chức Năng Đổi Account=======================================
  const handleSelectAccount = (email: string) => {
    setEmailOrPhone(email);
    setPassword('password123');
  };
// =============================================================================================================
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-[#E2E8F0] overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Brand Visual */}
        <div className="relative bg-[#0B1F3A] text-white p-8 sm:p-10 flex flex-col justify-between hidden md:flex">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
              alt="Nitro Grand Hotel"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#1F5AA6] flex items-center justify-center text-[#C9A227]">
              <Hotel className="w-7 h-7" />
            </div>
            <div className="text-2xl font-bold tracking-tight">NITRO GRAND HOTEL</div>
            <div className="text-xs text-[#C9A227] uppercase tracking-widest font-semibold">
              Saigon Luxury 4-Star
            </div>
          </div>

          <div className="relative z-10 space-y-2 text-xs text-slate-300">
            <p className="italic">
              {isEn
                ? '"World-class hospitality right on Nguyen Hue walking street, District 1."'
                : '"Trải nghiệm lưu trú chuẩn mực quốc tế ngay trung tâm phố đi bộ Nguyễn Huệ, Quận 1."'}
            </p>
            <div className="text-[11px] text-[#C9A227]">
              {isEn ? 'Support Hotline: 1900 1234' : 'Hotline hỗ trợ: 1900 1234'}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">{t('auth.loginTitle')}</h2>
            <p className="text-xs text-[#475569] mt-1">{t('auth.loginSubtitle')}</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
                {t('auth.emailOrPhone')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6] focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1F5AA6] focus:ring-[#1F5AA6]"
                />
                <span>{t('auth.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className="text-[#1F5AA6] font-semibold hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-[#1F5AA6] hover:bg-[#184A8A] font-bold"
            >
              {isSubmitting ? t('auth.authenticating') : t('auth.loginButton')}
            </Button>
          </form>
{/* ======================================================Tài Khoản Mẫu======================================== */}
          {/* Quick Mock Accounts for Testing */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <span className="block text-center text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              {t('auth.demoAccountsTitle')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectAccount('khachhang@nitrohotel.vn')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-left transition cursor-pointer"
              >
                <div className="font-semibold text-[#0F172A]">{t('role.CUSTOMER')}</div>
                <div className="text-[10px] text-slate-500 truncate">khachhang@nitrohotel.vn</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectAccount('letan@nitrohotel.vn')}
                className="p-2 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 text-[#1F5AA6] text-left transition cursor-pointer"
              >
                <div className="font-bold">{t('role.FRONT_DESK')} (Front Desk)</div>
                <div className="text-[10px] text-blue-600 truncate">letan@nitrohotel.vn</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectAccount('quanly@nitrohotel.vn')}
                className="p-2 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 text-purple-700 text-left transition cursor-pointer"
              >
                <div className="font-bold">{t('role.MANAGER')} (Manager)</div>
                <div className="text-[10px] text-purple-600 truncate">quanly@nitrohotel.vn</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectAccount('admin@nitrohotel.vn')}
                className="p-2 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-amber-800 text-left transition cursor-pointer"
              >
                <div className="font-bold">{t('role.ADMIN')} (Admin)</div>
                <div className="text-[10px] text-amber-700 truncate">admin@nitrohotel.vn</div>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              {t('auth.demoAccountsDesc')}
            </p>
          </div>
{/* ============================================================================================================================ */}
          <div className="text-center text-xs text-[#475569]">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-[#1F5AA6] font-bold hover:underline">
              {t('auth.registerNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
