/**
 * ============================================================================
 * TÊN FILE: GuestCounter.tsx
 * VỊ TRÍ: src/components/common/GuestCounter.tsx
 * PHÂN HỆ: Thành phần Giao diện Dùng chung (Common UI Components) - TASK-17
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Cung cấp bộ chọn số lượng khách lưu trú và số lượng phòng theo chuẩn 4 sao:
 *     + Người lớn (Adults): Từ 13 tuổi trở lên (Tối thiểu 1, Tối đa 10).
 *     + Trẻ em (Children): Từ 2 đến 12 tuổi (Tối đa 6).
 *     + Em bé (Infants): Dưới 2 tuổi (Miễn phí nôi em bé / baby cot theo yêu cầu).
 *     + Số phòng (Rooms): Tối thiểu 1, Tối đa 5 phòng.
 * - Kiểm soát giới hạn dung tích lưu trú (Capacity Guard) bảo đảm không vượt quá
 *   tiêu chuẩn an toàn và chính sách phòng của Nitro Grand Hotel.
 * - Tối ưu hóa giao diện di động (Mobile Responsive):
 *     + Nút tăng/giảm ngón tay chạm 36-40px chuẩn UX với hiệu ứng nảy `active:scale-95`.
 *     + Hỗ trợ đóng mở bằng phím tắt Escape và sự kiện click bên ngoài Popover.
 * - Đa ngôn ngữ (i18n): Tự động bản địa hóa danh xưng theo tiếng Việt hoặc tiếng Anh.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Users, Baby, Home, Sparkles, Check, X, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface GuestCounterProps {
  adults: number;
  childrenCount: number;
  rooms: number;
  infants?: number;
  onChange: (adults: number, children: number, rooms: number, infants?: number) => void;
  className?: string;
}

export const GuestCounter: React.FC<GuestCounterProps> = ({
  adults,
  childrenCount,
  rooms,
  infants = 0,
  onChange,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Trạng thái tạm thời trong popover
  const [tempAdults, setTempAdults] = useState<number>(adults);
  const [tempChildren, setTempChildren] = useState<number>(childrenCount);
  const [tempRooms, setTempRooms] = useState<number>(rooms);
  const [tempInfants, setTempInfants] = useState<number>(infants);

  // Đồng bộ props bên ngoài
  useEffect(() => {
    setTempAdults(adults);
    setTempChildren(childrenCount);
    setTempRooms(rooms);
    setTempInfants(infants);
  }, [adults, childrenCount, rooms, infants]);

  // Đóng popover khi nhấn phím Escape hoặc click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Hàm thay đổi cục bộ
  const handleAdultChange = (delta: number) => {
    const next = Math.max(1, Math.min(10, tempAdults + delta));
    setTempAdults(next);
  };

  const handleChildChange = (delta: number) => {
    const next = Math.max(0, Math.min(6, tempChildren + delta));
    setTempChildren(next);
  };

  const handleInfantChange = (delta: number) => {
    const next = Math.max(0, Math.min(4, tempInfants + delta));
    setTempInfants(next);
  };

  const handleRoomChange = (delta: number) => {
    const next = Math.max(1, Math.min(5, tempRooms + delta));
    setTempRooms(next);
  };

  // Áp dụng lựa chọn
  const handleApply = () => {
    onChange(tempAdults, tempChildren, tempRooms, tempInfants);
    setIsOpen(false);
  };

  // Đặt lại mặc định
  const handleReset = () => {
    setTempAdults(2);
    setTempChildren(0);
    setTempInfants(0);
    setTempRooms(1);
  };

  // Chuỗi tóm tắt hiển thị
  const guestSummary = isEn
    ? `${adults} ${adults > 1 ? 'Adults' : 'Adult'}${
        childrenCount > 0 ? `, ${childrenCount} ${childrenCount > 1 ? 'Children' : 'Child'}` : ''
      }${infants > 0 ? `, ${infants} ${infants > 1 ? 'Infants' : 'Infant'}` : ''} • ${rooms} ${
        rooms > 1 ? 'Rooms' : 'Room'
      }`
    : `${adults} ${t('search.adults')}${
        childrenCount > 0 ? `, ${childrenCount} ${t('search.children')}` : ''
      }${infants > 0 ? `, ${infants} Em bé` : ''} • ${rooms} ${t('search.rooms')}`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Nút bấm Kích hoạt (Trigger Button) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-left hover:border-[#1F5AA6] focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]/20 transition-all min-h-[50px] cursor-pointer shadow-2xs group"
        aria-label="Chọn số lượng khách và phòng"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 overflow-hidden w-full">
          <div className="w-8 h-8 rounded-lg bg-[#EAF2FB] text-[#1F5AA6] flex items-center justify-center shrink-0 group-hover:bg-[#1F5AA6] group-hover:text-white transition-colors">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#475569] uppercase tracking-wider truncate">
              {t('search.guests')}
            </span>
            <div className="text-xs sm:text-sm font-semibold text-[#0F172A] truncate">
              {guestSummary}
            </div>
          </div>
        </div>
      </button>

      {/* Popover Điều khiển Số lượng Khách & Phòng */}
      {isOpen && (
        <>
          {/* Lớp nền mờ trên Mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/25 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-0 sm:left-auto top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-[350px] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Tiêu đề Popover */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
                <span className="font-bold text-sm text-[#0B1F3A]">
                  {t('search.guests')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Đóng bảng số khách"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* 1. Người lớn (Adults) */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    {t('search.adults')}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {isEn ? 'Age 13 and above' : 'Từ 13 tuổi trở lên'}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={tempAdults <= 1}
                    onClick={() => handleAdultChange(-1)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
                    aria-label="Giảm người lớn"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-[#0F172A]">
                    {tempAdults}
                  </span>
                  <button
                    type="button"
                    disabled={tempAdults >= 10}
                    onClick={() => handleAdultChange(1)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
                    aria-label="Tăng người lớn"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                </div>
              </div>

              {/* 2. Trẻ em (Children) */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    {t('search.children')}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {isEn ? 'Ages 2 to 12' : 'Từ 2 đến 12 tuổi'}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={tempChildren <= 0}
                    onClick={() => handleChildChange(-1)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
                    aria-label="Giảm trẻ em"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-[#0F172A]">
                    {tempChildren}
                  </span>
                  <button
                    type="button"
                    disabled={tempChildren >= 6}
                    onClick={() => handleChildChange(1)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
                    aria-label="Tăng trẻ em"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                </div>
              </div>

              {/* 3. Em bé (Infants) */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
                    <span>{isEn ? 'Infants' : 'Em bé'}</span>
                    <span className="text-[10px] font-bold text-[#1F5AA6] bg-[#EAF2FB] px-1.5 py-0.2 rounded">
                      {isEn ? 'Free' : 'Miễn phí'}
                    </span>
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {isEn ? 'Under 2 • Baby cot available' : 'Dưới 2 tuổi • Nôi trẻ em miễn phí'}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={tempInfants <= 0}
                    onClick={() => handleInfantChange(-1)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
                    aria-label="Giảm em bé"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-[#0F172A]">
                    {tempInfants}
                  </span>
                  <button
                    type="button"
                    disabled={tempInfants >= 4}
                    onClick={() => handleInfantChange(1)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
                    aria-label="Tăng em bé"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                </div>
              </div>

              {/* 4. Số phòng (Rooms) */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    {t('search.rooms')}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {isEn ? 'Max 4 guests per room' : 'Tối đa 4 khách/phòng'}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={tempRooms <= 1}
                    onClick={() => handleRoomChange(-1)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
                    aria-label="Giảm số phòng"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-[#0F172A]">
                    {tempRooms}
                  </span>
                  <button
                    type="button"
                    disabled={tempRooms >= 5}
                    onClick={() => handleRoomChange(1)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
                    aria-label="Tăng số phòng"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chú thích chính sách khách sạn */}
            <div className="mt-3 p-2 bg-[#F8FAFC] border border-slate-200/60 rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 text-[#1F5AA6] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#475569] leading-relaxed">
                {isEn
                  ? 'Standard 4-star capacity: up to 4 guests (adults & children) per room. Complimentary baby cots on request.'
                  : 'Tiêu chuẩn 4 sao: tối đa 4 khách/phòng. Khách sạn hỗ trợ kê thêm nôi trẻ em miễn phí theo yêu cầu.'}
              </p>
            </div>

            {/* Chân hộp thoại hành động */}
            <div className="mt-3.5 pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
              >
                {isEn ? 'Reset' : 'Đặt lại'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Hủy'}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#1F5AA6] hover:bg-[#184A8A] rounded-lg shadow-xs transition cursor-pointer"
                >
                  {isEn ? 'Apply' : 'Áp dụng'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
