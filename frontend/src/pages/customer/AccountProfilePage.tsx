/**
 * ============================================================================
 * TÊN FILE: AccountProfilePage.tsx
 * VỊ TRÍ: src/pages/customer/AccountProfilePage.tsx
 * PHÂN HỆ: Cổng Khách hàng - Hồ sơ Cá nhân & Bảo mật (Account Settings & Security)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trung tâm cài đặt thông tin cá nhân dành cho khách hàng:
 *     1. Thông tin cá nhân: Họ tên, Email, Số điện thoại, Ảnh đại diện Avatar.
 *     2. Bảo mật tài khoản: Thay đổi mật khẩu đăng nhập, xác nhận mật khẩu mới.
 *     3. Tùy chọn thông báo: Nhận email khuyến mãi, SMS nhắc nhở lịch nhận phòng.
 *     4. Tùy chọn ngôn ngữ hiển thị ưa thích (Tiếng Việt / English).
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Bell,
  Check,
  Globe,
  Key,
  Lock,
  Save,
  Shield,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';

export const AccountProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, setCurrentUser, language, setLanguage } = useApp();
  const isEn = language === 'en';

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      name,
      email,
      phone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.profile')}</h1>
        <p className="text-xs text-[#475569] mt-1">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col items-center text-center space-y-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
          />
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">{currentUser.name}</h3>
            <p className="text-xs text-[#475569]">{currentUser.email}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAF2FB] text-[#1F5AA6]">
            {t(`role.${currentUser.role}`)}
          </span>
          <div className="w-full pt-4 border-t border-[#E2E8F0] text-xs text-[#475569] space-y-2 text-left">
            <div>
              <span className="font-semibold text-slate-700">{t('profile.membership')}</span> VIP Silver
            </div>
            <div>
              <span className="font-semibold text-slate-700">{t('profile.points')}</span> 1.450 NitroPoints
            </div>
            <div>
              <span className="font-semibold text-slate-700">{t('profile.nightsCount')}</span> 6 {isEn ? 'nights' : 'đêm'}
            </div>
          </div>
        </div>

        {/* Right Forms Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Form 1: Profile Info */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <User className="w-4 h-4 text-[#1F5AA6]" />
              {t('profile.personalInfoTitle')}
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">{t('profile.fullName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">{t('profile.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    {t('profile.phone')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6]"
                  />
                </div>
              </div>

              {savedSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {t('profile.saveSuccess')}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={<Save className="w-4 h-4" />}
              >
                {t('profile.saveChanges')}
              </Button>
            </form>
          </div>

          {/* Form 2: Password Change */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <Lock className="w-4 h-4 text-[#1F5AA6]" />
              {t('profile.changePasswordTitle')}
            </h2>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">
                  {t('profile.currentPassword')}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    {t('profile.newPassword')}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('profile.newPasswordPlaceholder')}
                    className="w-full text-xs px-3.5 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    {t('profile.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('profile.confirmPasswordPlaceholder')}
                    className="w-full text-xs px-3.5 py-2 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6]"
                  />
                </div>
              </div>

              {passwordSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {t('profile.passwordSuccess')}
                </div>
              )}

              <Button
                type="submit"
                variant="outline"
                size="sm"
                icon={<Key className="w-4 h-4" />}
              >
                {t('profile.updatePassword')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
