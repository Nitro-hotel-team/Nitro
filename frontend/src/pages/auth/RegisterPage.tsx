/**
 * ============================================================================
 * TÊN FILE: RegisterPage.tsx
 * VỊ TRÍ: src/pages/auth/RegisterPage.tsx
 * PHÂN HỆ: Phân hệ Xác thực Người dùng (Authentication - Register Page)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Giao diện Đăng ký tài khoản hội viên Nitro Grand Hotel dành cho khách hàng mới.
 * - Thu thập thông tin Họ tên, Email, Số điện thoại và Mật khẩu.
 * - Sau khi đăng ký thành công, tự động cập nhật phiên đăng nhập `currentUser`
 *   với vai trò `CUSTOMER` và chuyển hướng về trang chủ để tiếp tục đặt phòng.
 * ============================================================================
 */

import React, { useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff, Hotel, Lock, Mail, Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (res.success) {
        navigate('/');
      } else {
        setErrorMessage(res.error || 'Đăng ký không thành công. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra trong quá trình đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-gold-500 flex items-center justify-center mx-auto shadow-md">
            <Hotel className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.registerTitle')}</h1>
          <p className="text-xs text-slate-500">{t('auth.registerSubtitle')}</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t('booking.fullName')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn An"
                required
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t('booking.email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="an.nguyen@example.com"
                required
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t('booking.phone')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                required
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('profile.newPasswordPlaceholder')}
                required
                minLength={6}
                className="w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-600 focus:outline-none"
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

          <div className="text-xs">
            <label className="flex items-start gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-primary-600 focus:ring-primary-600"
              />
              <span>
                {t('auth.agreeTermsRegister')}
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!agreeTerms || isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 font-bold"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('auth.processingRegister')}
              </span>
            ) : (
              t('auth.registerButton')
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:underline">
            {t('auth.loginNow')}
          </Link>
        </div>
      </div>
    </div>
  );
};
