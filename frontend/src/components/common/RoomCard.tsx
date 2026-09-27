/**
 * ============================================================================
 * TÊN FILE: RoomCard.tsx
 * VỊ TRÍ: src/components/common/RoomCard.tsx
 * PHÂN HỆ: Thành phần Giao diện Dùng chung (Common UI Components) - TASK-18
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Card hiển thị chi tiết hạng phòng khách sạn 4 sao (Room Type Card):
 *     + Album ảnh trượt đa góc nhìn (Carousel ảnh) kèm chỉ báo ảnh và nút prev/next.
 *     + Huy hiệu độc quyền theo phân hạng (Presidential, Executive, Deluxe Bán chạy).
 *     + Đánh giá sao từ khách lưu trú (Rating: 4.8 - 4.9★ kèm số lượt review).
 *     + Thông số buồng phòng: Diện tích m², sức chứa người lớn/trẻ em, cấu hình giường, tầm nhìn.
 *     + Nhãn tiện ích nổi bật: Wi-Fi, Ăn sáng buffet, Bồn tắm nằm, Ban công, Hủy miễn phí.
 *     + Khối giá minh bạch: Giá niêm yết cũ gạch ngang, giá ưu đãi hôm nay, tổng chi phí
 *       theo số đêm đã chọn (bao gồm thuế VAT & phí dịch vụ 4 sao).
 *     + Hai nút thao tác CTA:
 *         * "Xem chi tiết" (Nút Outline): Mở trang chi tiết hạng phòng (`/rooms/:id`).
 *         * "Chọn phòng" (Nút Primary Royal Blue): Tự động nạp Draft Booking vào AppContext
 *           và điều hướng thẳng đến Quy trình Đặt phòng Bước 1 (`/booking/step-1`).
 * - Tối ưu hóa đa thiết bị (Responsive):
 *     + Layout ngang (Horizontal) trên Desktop (ảnh 360px bên trái, thông tin bên phải).
 *     + Layout dọc (Vertical) trên Mobile (< 768px), các nút bấm đạt 100% chiều ngang dễ chạm.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Bath,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Eye,
  Maximize2,
  Sparkles,
  Star,
  Users,
  Wifi,
  Wind,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RoomType } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Button } from './Button';

export interface RoomCardProps {
  roomType: RoomType;
  nights?: number;
  startDate?: string;
  endDate?: string;
  adults?: number;
  childrenCount?: number;
  roomsCount?: number;
  availableCount?: number;
  onSelect?: (roomType: RoomType) => void;
  onBookNow?: (roomType: RoomType) => void;
  layout?: 'horizontal' | 'grid';
  className?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  roomType,
  nights = 1,
  startDate,
  endDate,
  adults = 2,
  childrenCount = 0,
  roomsCount = 1,
  availableCount = 4,
  onSelect,
  onBookNow,
  layout = 'horizontal',
  className = '',
}) => {
  const { t } = useTranslation();
  const { language, setDraftBooking } = useApp();
  const navigate = useNavigate();
  const isEn = language === 'en';

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Danh sách ảnh phòng
  const images =
    roomType.images && roomType.images.length > 0
      ? roomType.images
      : [roomType.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'];

  // Tính toán giá và ưu đãi
  const basePrice = roomType.basePrice || 1450000;
  const originalPrice = Math.round(basePrice * 1.15); // Giá gốc trước giảm 15%
  const totalPrice = basePrice * nights;

  // Đánh giá sao giả lập cho từng hạng phòng
  const getRatingInfo = (code: string) => {
    switch (code) {
      case 'PRE':
        return { score: '5.0', reviews: 48, label: t('roomCard.ratingExceptional') };
      case 'EXE':
        return { score: '4.9', reviews: 96, label: t('roomCard.ratingSuperb') };
      case 'FAM':
        return { score: '4.8', reviews: 114, label: t('roomCard.ratingFamilyFavorite') };
      case 'DLX':
        return { score: '4.9', reviews: 236, label: t('roomCard.ratingTopPick') };
      case 'SUP':
        return { score: '4.7', reviews: 182, label: t('roomCard.ratingVeryGood') };
      default:
        return { score: '4.6', reviews: 140, label: t('roomCard.ratingGood') };
    }
  };

  const rating = getRatingInfo(roomType.code);

  // Điều khiển chuyển ảnh
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Xem chi tiết phòng
  const handleViewDetails = () => {
    const params = new URLSearchParams();
    if (startDate) params.set('checkIn', startDate);
    if (endDate) params.set('checkOut', endDate);
    if (adults) params.set('adults', String(adults));
    if (childrenCount) params.set('children', String(childrenCount));
    if (roomsCount) params.set('rooms', String(roomsCount));
    navigate(`/rooms/${roomType.id}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Chọn phòng -> nạp DraftBooking và vào bước đặt phòng
  const handleSelectRoom = () => {
    if (onBookNow) {
      onBookNow(roomType);
      return;
    }
    if (onSelect) {
      onSelect(roomType);
      return;
    }

    // Mặc định: Ghi draft booking vào AppContext và vào Step 1
    const sDate = startDate || new Date().toISOString().slice(0, 10);
    const dEnd = new Date();
    dEnd.setDate(dEnd.getDate() + nights);
    const eDate = endDate || dEnd.toISOString().slice(0, 10);

    setDraftBooking({
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      checkInDate: sDate,
      checkOutDate: eDate,
      nights: nights,
      adults: adults || 2,
      children: childrenCount || 0,
      roomsCount: roomsCount || 1,
      totalAmount: totalPrice,
    });

    navigate('/booking/step-1');
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[#1F5AA6]/40 transition-all duration-300 overflow-hidden flex ${
        layout === 'horizontal' ? 'flex-col md:flex-row' : 'flex-col'
      } ${className}`}
    >
      {/* 1. Photo carousel container */}
      <div
        className={`relative overflow-hidden bg-slate-100 shrink-0 group ${
          layout === 'horizontal'
            ? 'w-full md:w-[320px] lg:w-[380px] h-[240px] md:h-auto min-h-[240px]'
            : 'h-[240px] w-full'
        }`}
      >
        <img
          src={images[currentImgIndex]}
          alt={isEn ? roomType.nameEn || roomType.name : roomType.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          onClick={handleViewDetails}
          loading="lazy"
        />

        {/* Lớp bóng mờ chuyển ảnh */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Huy hiệu Góc Trái: Tình trạng phòng / Hạng VIP */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {roomType.code === 'PRE' && (
            <span className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Presidential 4★
            </span>
          )}
          {roomType.code === 'EXE' && (
            <span className="bg-[#0B1F3A] text-[#C9A227] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              Executive Lounge
            </span>
          )}
          {roomType.code === 'DLX' && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
              {t('roomCard.bestSeller')}
            </span>
          )}

          {availableCount <= 3 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wide animate-pulse">
              {t('search.onlyLeft', { count: availableCount })}
            </span>
          )}
        </div>

        {/* Huy hiệu Góc Phải: Thẻ Giảm Giá 15% */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/95 backdrop-blur-xs text-[#1F5AA6] text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs border border-blue-100">
            {t('roomCard.discountToday')}
          </span>
        </div>

        {/* Nút lướt ảnh sang trái/phải */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImg}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs"
              aria-label={t('roomCard.prevPhoto')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImg}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs"
              aria-label={t('roomCard.nextPhoto')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Chỉ báo số ảnh (Dots indicator) */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImgIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentImgIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5 hover:bg-white/80'
                  }`}
                  aria-label={t('roomCard.viewPhotoDot', { index: i + 1 })}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Info container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Rating */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[#1F5AA6] bg-[#EAF2FB] px-2 py-0.5 rounded border border-blue-100">
                  {roomType.code}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rating.score}</span>
                  <span className="text-slate-400 font-normal">({rating.reviews})</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-medium text-[11px]">{rating.label}</span>
                </div>
              </div>

              <h3
                onClick={handleViewDetails}
                className="text-base sm:text-lg md:text-xl font-extrabold text-[#0B1F3A] hover:text-[#1F5AA6] transition cursor-pointer mt-1"
              >
                {isEn ? roomType.nameEn || roomType.name : roomType.name}
              </h3>
            </div>
          </div>

          {/* Mô tả ngắn */}
          <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed mb-3">
            {isEn ? roomType.descriptionEn || roomType.description : roomType.description}
          </p>

          {/* Thông số phòng quan trọng (Key Specs) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-2 border-y border-[#E2E8F0] mb-3 text-xs text-[#475569]">
            <div className="flex items-center gap-1.5" title={t('room.area')}>
              <Maximize2 className="w-3.5 h-3.5 text-[#1F5AA6] shrink-0" />
              <span className="font-semibold text-slate-800">{roomType.area} m²</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5" title={t('room.capacity')}>
              <Users className="w-3.5 h-3.5 text-[#1F5AA6] shrink-0" />
              <span>
                {roomType.maxGuests || 2} {t('search.adults')}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5" title={t('room.bed')}>
              <BedDouble className="w-3.5 h-3.5 text-[#1F5AA6] shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-none">
                {isEn ? roomType.bedTypeEn || roomType.bedType : roomType.bedType || '1 giường King lớn'}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5" title={t('room.view')}>
              <Eye className="w-3.5 h-3.5 text-[#1F5AA6] shrink-0" />
              <span className="text-slate-600">
                {roomType.code === 'PRE' || roomType.code === 'EXE' ? t('roomCard.landmarkView') : t('roomCard.streetView')}
              </span>
            </div>
          </div>

          {/* Danh mục tiện nghi nổi bật (Highlighted Amenities) */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              <Wifi className="w-3 h-3 text-[#1F5AA6]" /> Wi-Fi 6
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              <Coffee className="w-3 h-3 text-[#C9A227]" /> {t('roomCard.buffetBreakfast')}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              <Wind className="w-3 h-3 text-[#1F5AA6]" /> {t('roomCard.airConditioner')}
            </span>
            {['DLX', 'EXE', 'PRE'].includes(roomType.code) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                <Bath className="w-3 h-3 text-[#1F5AA6]" /> {t('roomCard.soakingTub')}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <Check className="w-3 h-3 text-emerald-600" /> {t('search.freeCancellation')}
            </span>
          </div>
        </div>

        {/* 3. Pricing & Call To Action Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pt-3 border-t border-[#E2E8F0] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(originalPrice, language)}
              </span>
              <span className="text-[10px] uppercase font-bold text-[#1F5AA6] bg-[#EAF2FB] px-1.5 py-0.2 rounded">
                {t('roomCard.fourStarOffer')}
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#1F5AA6] tabular-nums tracking-tight">
                {formatCurrency(basePrice, language)}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {t('room.perNight')}
              </span>
            </div>

            {nights > 1 ? (
              <div className="text-xs text-[#475569] font-medium mt-0.5">
                {t('room.totalPrice')}:{' '}
                <strong className="text-[#0B1F3A] tabular-nums font-bold">
                  {formatCurrency(totalPrice, language)}
                </strong>{' '}
                ({nights} {t('search.nights')}) • <span className="text-emerald-700 font-semibold">{t('roomCard.taxInclusive')}</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 mt-0.5">
                {t('roomCard.taxInclusiveDetailed')}
              </div>
            )}
          </div>

          {/* Action buttons: on mobile full width grid, on sm flex */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="w-full sm:w-auto font-semibold border-slate-300 hover:bg-slate-50"
            >
              {t('room.details')}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSelectRoom}
              className="w-full sm:w-auto bg-[#1F5AA6] hover:bg-[#184A8A] font-bold shadow-md cursor-pointer"
            >
              {t('room.selectRoom')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
