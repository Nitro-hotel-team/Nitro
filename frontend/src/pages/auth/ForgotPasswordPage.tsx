/**
 * ============================================================================
 * TÊN FILE: ForgotPasswordPage.tsx
 * VỊ TRÍ: src/pages/auth/ForgotPasswordPage.tsx
 * PHÂN HỆ: Phân hệ Xác thực Người dùng (Authentication - Forgot Password Page)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Giao diện Quên mật khẩu và Khôi phục tài khoản người dùng.
 * - Cho phép khách hàng nhập email để nhận liên kết khôi phục mật khẩu.
 * - Mô phỏng phản hồi gửi thành công với giao diện xác nhận trực quan và nút quay lại đăng nhập.
 * ============================================================================
 */

import React, { useState } from 'react';
import { ArrowLeft, Check, Hotel, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#E2E8F0] p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1F5AA6] text-[#C9A227] flex items-center justify-center mx-auto shadow-md">
            <Hotel className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{t('auth.forgotPassword')}</h1>
          <p className="text-xs text-[#475569]">
            {t('auth.resetPasswordDesc')}
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-emerald-900">{t('auth.resetPasswordSentTitle')}</h3>
            <p className="text-xs text-emerald-700">
              {t('auth.resetPasswordSentDesc')}
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  {t('auth.backToLogin')}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">
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
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6] focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-[#1F5AA6] hover:bg-[#184A8A] font-bold"
            >
              {t('auth.sendResetLink')}
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};
