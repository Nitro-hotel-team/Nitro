/**
 * ============================================================================
 * TÊN FILE: HomePage.tsx
 * VỊ TRÍ: src/pages/customer/HomePage.tsx
 * PHÂN HỆ: Cổng Thông tin Khách hàng (Customer Landing & Booking Search)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trang chủ chính của khách sạn 4 sao Nitro Grand Hotel (24 Nguyễn Huệ, Quận 1):
 *     1. Hero Banner: Hình ảnh sang trọng, tiêu đề đẳng cấp, Widget tìm kiếm đặt phòng nổi
 *        (DateRangePicker + GuestCounter + CTA Tìm phòng).
 *     2. Showcase Hạng phòng nổi bật (Standard, Superior, Deluxe, Executive, Suite) với
 *        giá thời gian thực, xem nhanh album ảnh và chi tiết tiện nghi.
 *     3. Tiện ích 4 sao đặc quyền: Nhà hàng ẩm thực Á-Âu, Hồ bơi vô cực ngắm phố đi bộ,
 *        Phòng Gym & Spa cao cấp, Dịch vụ phòng 24/7.
 *     4. Đánh giá thực tế từ khách hàng quốc tế & trong nước (4.9/5 sao).
 * - Kết nối Backend REST API:
 *     + `GET /api/v1/room-types`: Lấy danh mục hạng phòng kèm ảnh và biểu giá.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  CreditCard,
  Dumbbell,
  Headphones,
  Hotel,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Tv,
  Users,
  Utensils,
  Waves,
  Wifi,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { GuestCounter } from '../../components/common/GuestCounter';
import { RoomCard } from '../../components/common/RoomCard';
import { Skeleton } from '../../components/common/StateViews';
import { useApp } from '../../context/AppContext';
import { roomService } from '../../services/api';
import { RoomType } from '../../types';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const navigate = useNavigate();

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Search widget state
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [nights, setNights] = useState(1);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [rooms, setRooms] = useState(1);

  useEffect(() => {
    roomService.getRoomTypes().then((data) => {
      setRoomTypes(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams({
      checkIn: startDate,
      checkOut: endDate,
      adults: String(adults),
      children: String(childrenCount),
      rooms: String(rooms),
    });
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[560px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background photo with deep navy overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
            alt="Nitro Grand Hotel Sài Gòn"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/60 to-[#0B1F3A]/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#C9A227] text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t('home.locationBadge')}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-4">
            {t('home.heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto mb-10 font-light">
            {t('home.heroDesc')}
          </p>

          {/* Floating Search Widget */}
          <div className="bg-white/98 backdrop-blur-lg p-3 sm:p-5 rounded-2xl shadow-2xl border border-white/40 max-w-4xl mx-auto text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Dates */}
              <div className="md:col-span-6">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(s, e, n) => {
                    setStartDate(s);
                    setEndDate(e);
                    setNights(n);
                  }}
                />
              </div>

              {/* Guests */}
              <div className="md:col-span-4">
                <GuestCounter
                  adults={adults}
                  childrenCount={childrenCount}
                  rooms={rooms}
                  onChange={(a, c, r) => {
                    setAdults(a);
                    setChildrenCount(c);
                    setRooms(r);
                  }}
                />
              </div>

              {/* Search button */}
              <div className="md:col-span-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSearch}
                  className="w-full h-12 bg-[#1F5AA6] hover:bg-[#184A8A] font-bold text-sm shadow-md"
                >
                  {t('search.button')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Room Types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-[#1F5AA6] uppercase tracking-wider mb-1">
              {t('home.featuredRoomsSubtitle')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              {t('home.featuredRoomsTitle')}
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/rooms')}
          >
            {t('home.viewAllRooms')}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {roomTypes.slice(0, 4).map((rt) => (
              <RoomCard
                key={rt.id}
                roomType={rt}
                nights={nights}
                onSelect={() => navigate(`/rooms/${rt.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us (4 Pillars) */}
      <section className="bg-white py-16 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold text-[#1F5AA6] uppercase tracking-wider mb-1">
              {t('home.whyChooseUsSubtitle')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              {t('home.whyChooseUsTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:border-[#1F5AA6] transition group">
              <div className="w-12 h-12 rounded-xl bg-[#EAF2FB] text-[#1F5AA6] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">{t('home.feature1Title')}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                {t('home.feature1Desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:border-[#1F5AA6] transition group">
              <div className="w-12 h-12 rounded-xl bg-[#EAF2FB] text-[#1F5AA6] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">{t('home.feature2Title')}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                {t('home.feature2Desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:border-[#1F5AA6] transition group">
              <div className="w-12 h-12 rounded-xl bg-[#EAF2FB] text-[#1F5AA6] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">{t('home.feature3Title')}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                {t('home.feature3Desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:border-[#1F5AA6] transition group">
              <div className="w-12 h-12 rounded-xl bg-[#EAF2FB] text-[#1F5AA6] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">{t('home.feature4Title')}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                {t('home.feature4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Amenities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-[#1F5AA6] uppercase tracking-wider mb-1">
            {t('home.amenitiesSubtitle')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            {t('home.amenitiesTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative rounded-2xl overflow-hidden group h-80 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"
              alt="Nitro Grand Rooftop Pool"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
              <div className="flex items-center gap-2 text-[#C9A227] text-xs font-bold uppercase tracking-wider mb-1">
                <Waves className="w-4 h-4" /> {t('home.amenity1Category')}
              </div>
              <h3 className="text-xl font-bold">{t('home.amenity1Title')}</h3>
              <p className="text-xs text-slate-300 mt-1">
                {t('home.amenity1Desc')}
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden group h-80 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"
              alt="Nitro Grand Le Grand Buffet"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
              <div className="flex items-center gap-2 text-[#C9A227] text-xs font-bold uppercase tracking-wider mb-1">
                <Utensils className="w-4 h-4" /> {t('home.amenity2Category')}
              </div>
              <h3 className="text-xl font-bold">{t('home.amenity2Title')}</h3>
              <p className="text-xs text-slate-300 mt-1">
                {t('home.amenity2Desc')}
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden group h-80 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
              alt="Nitro Grand Lotus Wellness & Fitness"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
              <div className="flex items-center gap-2 text-[#C9A227] text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> {t('home.amenity3Category')}
              </div>
              <h3 className="text-xl font-bold">{t('home.amenity3Title')}</h3>
              <p className="text-xs text-slate-300 mt-1">
                {t('home.amenity3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Reviews */}
      <section className="bg-slate-50 py-16 border-t border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">
              {t('home.reviewsHeadline')}
            </h3>
            <p className="text-xs text-[#475569] mt-1">
              {t('home.reviewsSubtext')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
              <p className="text-xs text-[#475569] italic mb-4 leading-relaxed">
                {t('home.review1Text')}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 font-bold text-[#1F5AA6] flex items-center justify-center text-xs">
                  NA
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">{t('home.review1Author')}</div>
                  <div className="text-[11px] text-[#94A3B8]">{t('home.review1Stay')}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
              <p className="text-xs text-[#475569] italic mb-4 leading-relaxed">
                {t('home.review2Text')}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pink-100 font-bold text-pink-600 flex items-center justify-center text-xs">
                  DW
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">{t('home.review2Author')}</div>
                  <div className="text-[11px] text-[#94A3B8]">{t('home.review2Stay')}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
              <p className="text-xs text-[#475569] italic mb-4 leading-relaxed">
                {t('home.review3Text')}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-100 font-bold text-purple-600 flex items-center justify-center text-xs">
                  TT
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">{t('home.review3Author')}</div>
                  <div className="text-[11px] text-[#94A3B8]">{t('home.review3Stay')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
