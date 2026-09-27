/**
 * ============================================================================
 * TÊN FILE: CustomerLayout.tsx
 * VỊ TRÍ: src/layouts/CustomerLayout.tsx
 * PHÂN HỆ: Khung Giao diện Khách hàng Đặt phòng (Customer Portal Layout)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Định hình giao diện công khai dành cho khách lưu trú và đối tác:
 *     + Topbar: Địa chỉ khách sạn (24 Nguyễn Huệ, Q.1), Hotline 1900 1234, Bộ chọn ngôn ngữ VI/EN.
 *     + Header Sticky: Thương hiệu 4-Star Nitro Grand Hotel, Menu điều hướng (Trang chủ,
 *       Hạng phòng, Đặt phòng của tôi, Liên hệ), Avatar tài khoản và nút CTA "Đặt ngay".
 *     + Mobile Drawer: Menu vuốt gọn gàng trên smartphone và tablet.
 *     + Footer chân trang: Thông tin chứng nhận sao, bản đồ Google Maps, phương thức thanh toán,
 *       chính sách hủy phòng và form đăng ký nhận ưu đãi.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Calendar,
  Globe,
  Hotel,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const CustomerLayout: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage, currentUser, role, setRole, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isEn = language === 'en';

  const navLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.rooms'), path: '/rooms' },
    { label: t('nav.myBookings'), path: '/my-bookings' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Banner for hotel address & phone */}
      <div className="bg-[#0B1F3A] text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="hidden sm:inline">{t('brand.address')}</span>
              <span className="sm:hidden">{isEn ? '24 Nguyen Hue Blvd, Dist 1, HCMC' : '24 Nguyễn Huệ, Q.1, TP.HCM'}</span>
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>{t('brand.hotline')}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 font-semibold text-xs">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`px-1.5 py-0.5 rounded transition ${
                  language === 'vi'
                    ? 'bg-[#1F5AA6] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                VI
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded transition ${
                  language === 'en'
                    ? 'bg-[#1F5AA6] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Staff Portal switch / login */}
            {role !== 'CUSTOMER' ? (
              <button
                type="button"
                onClick={() => navigate('/staff/overview')}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium hover:bg-amber-500/30 transition cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3" />
                {t('footer.staffPortalActive')}
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition"
              >
                <ShieldCheck className="w-3 h-3 text-[#C9A227]" />
                {t('footer.staffPortal')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Main Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1F5AA6] to-[#0B1F3A] flex items-center justify-center text-[#C9A227] shadow-md group-hover:scale-105 transition-transform">
              <Hotel className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl sm:text-2xl text-[#0B1F3A] tracking-tight">
                  NITRO
                </span>
                <span className="font-serif italic text-lg sm:text-xl text-[#C9A227] font-semibold">
                  Grand Hotel
                </span>
              </div>
              <span className="text-[10px] text-[#475569] font-medium tracking-widest uppercase">
                Saigon Luxury 4-Star
              </span>
            </div>
          </Link>

          {/* Desktop & Wide Screen Nav Links (Only show when >= lg: 1024px to prevent tablet overflow) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors relative py-1 whitespace-nowrap ${
                    active
                      ? 'text-[#1F5AA6]'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F5AA6] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth & CTA Right */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            <Link
              to="/rooms"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#1F5AA6] text-white hover:bg-[#184A8A] transition shadow-xs whitespace-nowrap"
            >
              {t('room.bookNow')}
            </Link>

            {/* User Account / Avatar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 transition cursor-pointer"
                aria-label="Tài khoản khách hàng"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <span className="text-xs font-semibold text-[#0F172A] max-w-[100px] truncate">
                  {currentUser.name}
                </span>
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-[#E2E8F0]">
                      <div className="text-xs font-bold text-[#0F172A]">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-[#475569] truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#1F5AA6] border border-blue-200">
                          {t(`role.${currentUser.role}`)}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#0F172A] hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-[#1F5AA6]" />
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#0F172A] hover:bg-slate-50"
                    >
                      <Calendar className="w-4 h-4 text-[#1F5AA6]" />
                      {t('nav.myBookings')}
                    </Link>

                    {role !== 'CUSTOMER' && (
                      <Link
                        to="/staff/overview"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        {t('footer.staffPortalTitle')}
                      </Link>
                    )}

                    <div className="border-t border-[#E2E8F0] mt-1 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile & Tablet menu trigger (visible on screen < 1024px) */}
          <div className="flex lg:hidden items-center gap-2 sm:gap-3">
            <Link
              to="/rooms"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1F5AA6] text-white hover:bg-[#184A8A] transition shadow-xs whitespace-nowrap"
            >
              {t('room.bookNow')}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
              aria-label={isEn ? "Open navigation menu" : "Mở menu điều hướng"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                  location.pathname === link.path
                    ? 'bg-[#EAF2FB] text-[#1F5AA6]'
                    : 'text-[#0F172A] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <Link
                to="/rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-[#1F5AA6] text-white font-bold rounded-lg text-center block shadow-sm hover:bg-[#184A8A] transition"
              >
                {t('room.bookNow')}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 border border-[#E2E8F0] text-[#0F172A] font-semibold rounded-lg text-center block hover:bg-slate-50 transition"
              >
                {t('nav.profile')} ({currentUser.name})
              </Link>

              {role !== 'CUSTOMER' && (
                <Link
                  to="/staff/overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-amber-50 border border-amber-200 text-amber-800 font-bold rounded-lg text-center flex items-center justify-center gap-1.5 hover:bg-amber-100 transition text-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  {t('footer.staffPortalTitle')}
                </Link>
              )}

              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full py-2 border border-rose-200 text-rose-600 font-semibold rounded-lg text-center flex items-center justify-center gap-1.5 hover:bg-rose-50 transition text-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </button>

              {/* Language switcher inside mobile menu */}
              <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-500">
                <span>{t('footer.selectLanguage')}</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLanguage('vi')}
                    className={`px-2 py-1 rounded text-xs font-bold transition ${
                      language === 'vi' ? 'bg-[#1F5AA6] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Tiếng Việt
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 rounded text-xs font-bold transition ${
                      language === 'en' ? 'bg-[#1F5AA6] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0B1F3A] text-slate-300 pt-14 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            {/* Col 1: Hotel Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hotel className="w-6 h-6 text-[#C9A227]" />
                <span className="font-bold text-xl text-white">NITRO GRAND HOTEL</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {t('footer.desc')}
              </p>
              <div className="text-xs text-[#C9A227] font-semibold">
                {t('footer.certified')}
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                {t('footer.popularRooms')}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link to="/rooms" className="hover:text-[#C9A227] transition">
                    {t('footer.room1')}
                  </Link>
                </li>
                <li>
                  <Link to="/rooms" className="hover:text-[#C9A227] transition">
                    {t('footer.room2')}
                  </Link>
                </li>
                <li>
                  <Link to="/rooms" className="hover:text-[#C9A227] transition">
                    {t('footer.room3')}
                  </Link>
                </li>
                <li>
                  <Link to="/rooms" className="hover:text-[#C9A227] transition">
                    {t('footer.room4')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Policies & Security */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                {t('footer.policiesTitle')}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>{t('footer.policy1')}</li>
                <li>{t('footer.policy2')}</li>
                <li>{t('footer.policy3')}</li>
                <li>{t('footer.policy4')}</li>
                <li>{t('footer.policy5')}</li>
              </ul>
            </div>

            {/* Col 4: Contact & Location */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                {t('footer.contactTitle')}
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <span>{t('footer.address')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C9A227] shrink-0" />
                  <span>{t('brand.phone')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C9A227] shrink-0" />
                  <span>{t('brand.email')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div>
              {t('footer.copyright')}
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <span>{t('footer.terms')}</span>
              <span>•</span>
              <span>{t('footer.privacy')}</span>
              <span>•</span>
              <Link to="/smoke-test" className="text-[#C9A227] hover:underline font-medium">
                {t('footer.smokeTest')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
