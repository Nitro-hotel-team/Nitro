/**
 * ============================================================================
 * TÊN FILE: DateRangePicker.tsx
 * VỊ TRÍ: src/components/common/DateRangePicker.tsx
 * PHÂN HỆ: Thành phần Giao diện Dùng chung (Common UI Components) - TASK-17
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Cung cấp bộ chọn khoảng ngày nhận phòng (Check-in) và trả phòng (Check-out)
 *   chuẩn khách sạn 4 sao với bảng lịch ma trận tương tác (Interactive Visual Calendar).
 * - Trải nghiệm chọn ngày thông minh:
 *     + Click lần 1: Đặt ngày nhận phòng (Check-in).
 *     + Rê chuột (Hover): Hiển thị dải highlight xem trước số đêm lưu trú.
 *     + Click lần 2: Đặt ngày trả phòng (Check-out) và tự động tính số đêm.
 * - Hỗ trợ các phím tắt chọn nhanh (Quick Presets):
 *     + ⚡ Hôm nay (1 đêm)
 *     + 🌅 Ngày mai (1 đêm)
 *     + 🏖️ Cuối tuần này (Thứ 6 - Chủ nhật, 2 đêm)
 *     + 🌴 Tuần tới (7 ngày tới, 3 đêm)
 * - Tối ưu hóa đa thiết bị (Responsive):
 *     + Mobile (< 640px): Dropdown vừa vặn màn hình `w-[calc(100vw-2rem)]`, nút bấm 40px+ dễ chạm.
 *     + Desktop: Dropdown bóng đổ sang trọng với hai chế độ (Lịch trực quan + Nhập nhanh).
 * - Đa ngôn ngữ (i18n): Tự động đổi thứ trong tuần và tên tháng theo tiếng Việt hoặc tiếng Anh.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, Clock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/format';

export interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChange: (startDate: string, endDate: string, nights: number) => void;
  minDate?: string;
  className?: string;
}

// Chuyển đổi Date sang YYYY-MM-DD theo giờ địa phương (tránh lệch timezone UTC)
const toLocalIsoDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Tính số đêm giữa 2 chuỗi YYYY-MM-DD
const calculateNights = (start: string, end: string): number => {
  if (!start || !end) return 1;
  const s = new Date(start + 'T00:00:00').getTime();
  const e = new Date(end + 'T00:00:00').getTime();
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  minDate,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Trạng thái ngày đang chọn trong popover
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Tháng và năm đang hiển thị trên lịch
  const initialDate = useMemo(() => {
    return startDate ? new Date(startDate + 'T00:00:00') : new Date();
  }, [startDate]);

  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-indexed

  // Ngày tối thiểu được phép chọn (mặc định là hôm nay)
  const todayIso = useMemo(() => toLocalIsoDate(new Date()), []);
  const effectiveMinDate = minDate || todayIso;

  // Đồng bộ lại khi props bên ngoài thay đổi
  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

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

  // Điều hướng tháng
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Tính toán các ngày trong tháng hiện tại
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Thứ 2 = 0, Thứ 3 = 1, ..., Chủ nhật = 6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const days: { dateIso: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Ngày của tháng trước (lấp ô trống đầu bảng)
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, d);
      days.push({
        dateIso: toLocalIsoDate(prevDate),
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Các ngày trong tháng này
    for (let d = 1; d <= totalDays; d++) {
      const current = new Date(currentYear, currentMonth, d);
      days.push({
        dateIso: toLocalIsoDate(current),
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Bổ sung các ô còn lại cho đủ 35 hoặc 42 ô
    const remainder = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainder; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      days.push({
        dateIso: toLocalIsoDate(nextDate),
        dayNumber: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Xử lý khi click vào 1 ngày trên bảng lịch
  const handleDateClick = (dateIso: string) => {
    if (dateIso < effectiveMinDate) return;

    if (!tempStart || (tempStart && tempEnd)) {
      // Đang bắt đầu lượt chọn mới -> chọn Check-in
      setTempStart(dateIso);
      setTempEnd('');
      setHoverDate(null);
    } else if (tempStart && !tempEnd) {
      // Đã có Check-in, đang chọn Check-out
      if (dateIso > tempStart) {
        setTempEnd(dateIso);
        const calculated = calculateNights(tempStart, dateIso);
        onChange(tempStart, dateIso, calculated);
        setIsOpen(false);
      } else {
        // Nếu click ngày trước ngày Check-in, đổi lại Check-in thành ngày đó
        setTempStart(dateIso);
        setTempEnd('');
      }
    }
  };

  // Áp dụng ngày khi ấn nút xác nhận
  const handleApply = () => {
    let finalStart = tempStart;
    let finalEnd = tempEnd;

    if (!finalStart) {
      finalStart = todayIso;
    }
    if (!finalEnd || finalEnd <= finalStart) {
      const d = new Date(finalStart + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      finalEnd = toLocalIsoDate(d);
    }

    const calculated = calculateNights(finalStart, finalEnd);
    onChange(finalStart, finalEnd, calculated);
    setIsOpen(false);
  };

  // Preset nhanh: Hôm nay, Ngày mai, Cuối tuần, Tuần tới
  const handleQuickPreset = (offsetDays: number, durationNights: number) => {
    const s = new Date();
    s.setDate(s.getDate() + offsetDays);
    const e = new Date(s);
    e.setDate(e.getDate() + durationNights);

    const sIso = toLocalIsoDate(s);
    const eIso = toLocalIsoDate(e);

    setTempStart(sIso);
    setTempEnd(eIso);
    onChange(sIso, eIso, durationNights);
    setIsOpen(false);
  };

  const nights = calculateNights(startDate, endDate);

  // Tiêu đề tháng hiển thị
  const monthNamesVi = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const displayMonthName = isEn ? monthNamesEn[currentMonth] : monthNamesVi[currentMonth];

  // Tên thứ trong tuần
  const weekDays = isEn
    ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Nút bấm Kích hoạt (Trigger Button) */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && startDate) {
            const d = new Date(startDate + 'T00:00:00');
            if (!isNaN(d.getTime())) {
              setCurrentYear(d.getFullYear());
              setCurrentMonth(d.getMonth());
            }
          }
        }}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-left hover:border-[#1F5AA6] focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]/20 transition-all min-h-[50px] cursor-pointer shadow-2xs group"
        aria-label="Chọn ngày nhận và trả phòng"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 overflow-hidden w-full">
          <div className="w-8 h-8 rounded-lg bg-[#EAF2FB] text-[#1F5AA6] flex items-center justify-center shrink-0 group-hover:bg-[#1F5AA6] group-hover:text-white transition-colors">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#475569] uppercase tracking-wider truncate">
              {t('search.checkIn')} &rarr; {t('search.checkOut')}
            </span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F172A] flex-wrap">
              <span className="whitespace-nowrap">{formatDate(startDate)}</span>
              <span className="text-slate-400 font-light">&rarr;</span>
              <span className="whitespace-nowrap">{formatDate(endDate)}</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#EAF2FB] text-[#1F5AA6] font-bold whitespace-nowrap border border-blue-100">
                {nights} {t('search.nights')}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Popover Lịch Đặt Phòng Chuẩn 4 Sao */}
      {isOpen && (
        <>
          {/* Lớp nền mờ trên Mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/25 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-0 sm:left-auto top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-[380px] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Thanh tiêu đề Popover */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
                <span className="font-bold text-sm text-[#0B1F3A]">
                  {t('search.checkIn')} &amp; {t('search.checkOut')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#1F5AA6] font-bold bg-[#EAF2FB] px-2.5 py-0.5 rounded-full border border-blue-100">
                  {tempStart && tempEnd ? calculateNights(tempStart, tempEnd) : nights} {t('search.nights')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Đóng bảng lịch"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Thông báo hướng dẫn chọn */}
            <div className="mb-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>
                {!tempStart
                  ? 'Vui lòng chọn ngày nhận phòng'
                  : !tempEnd
                  ? 'Rê chuột & chọn ngày trả phòng'
                  : `${formatDate(tempStart)} đến ${formatDate(tempEnd)}`}
              </span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Bộ điều hướng tháng */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer active:scale-95"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm text-[#0F172A] select-none">
                {displayMonthName}, {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition cursor-pointer active:scale-95"
                aria-label="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bảng ma trận ngày trong tuần */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {weekDays.map((w, idx) => (
                <div
                  key={w}
                  className={`text-[11px] font-bold py-1 select-none ${
                    idx >= 5 ? 'text-[#C9A227]' : 'text-slate-400'
                  }`}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Các ô ngày trong tháng */}
            <div className="grid grid-cols-7 gap-1 mb-4 select-none">
              {calendarDays.map((item, idx) => {
                const isPast = item.dateIso < effectiveMinDate;
                const isStart = tempStart === item.dateIso;
                const isEnd = tempEnd === item.dateIso;

                // Xác định xem ngày này có nằm trong dải đang chọn hoặc hover preview không
                const effectiveEnd = tempEnd || hoverDate;
                const inRange =
                  tempStart &&
                  effectiveEnd &&
                  effectiveEnd > tempStart &&
                  item.dateIso > tempStart &&
                  item.dateIso < effectiveEnd;

                const isToday = item.dateIso === todayIso;

                let dayStyles = 'text-slate-700 hover:bg-slate-100';

                if (isPast) {
                  dayStyles = 'text-slate-300 opacity-40 cursor-not-allowed';
                } else if (!item.isCurrentMonth) {
                  dayStyles = 'text-slate-400 hover:bg-slate-50';
                } else if (isStart || isEnd) {
                  dayStyles = 'bg-[#1F5AA6] text-white font-bold shadow-xs hover:bg-[#184A8A]';
                } else if (inRange) {
                  dayStyles = 'bg-[#EAF2FB] text-[#1F5AA6] font-semibold';
                }

                return (
                  <button
                    key={`${item.dateIso}-${idx}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDateClick(item.dateIso)}
                    onMouseEnter={() => {
                      if (tempStart && !tempEnd && item.dateIso > tempStart) {
                        setHoverDate(item.dateIso);
                      }
                    }}
                    onMouseLeave={() => setHoverDate(null)}
                    className={`h-9 w-full rounded-lg text-xs flex flex-col items-center justify-center transition-all relative cursor-pointer ${dayStyles} ${
                      isToday && !isStart && !isEnd ? 'border border-[#1F5AA6]/40 font-bold' : ''
                    }`}
                  >
                    <span>{item.dayNumber}</span>
                    {isToday && !isStart && !isEnd && (
                      <span className="w-1 h-1 rounded-full bg-[#1F5AA6] -mt-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Phím tắt Chọn Nhanh (Quick Presets) */}
            <div className="mb-3 pt-2.5 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                Chọn nhanh tiện lợi:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset(0, 1)}
                  className="px-2 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-[#EAF2FB] hover:text-[#1F5AA6] rounded-lg font-medium text-left truncate transition cursor-pointer border border-slate-100"
                >
                  ⚡ Hôm nay (1 đêm)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(1, 1)}
                  className="px-2 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-[#EAF2FB] hover:text-[#1F5AA6] rounded-lg font-medium text-left truncate transition cursor-pointer border border-slate-100"
                >
                  🌅 Ngày mai (1 đêm)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(5, 2)}
                  className="px-2 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-[#EAF2FB] hover:text-[#1F5AA6] rounded-lg font-medium text-left truncate transition cursor-pointer border border-slate-100"
                >
                  🏖️ Cuối tuần này (2 đêm)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(7, 3)}
                  className="px-2 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-[#EAF2FB] hover:text-[#1F5AA6] rounded-lg font-medium text-left truncate transition cursor-pointer border border-slate-100"
                >
                  🌴 Tuần tới (3 đêm)
                </button>
              </div>
            </div>

            {/* Chân hộp thoại hành động */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setTempStart(todayIso);
                  const next = new Date();
                  next.setDate(next.getDate() + 1);
                  setTempEnd(toLocalIsoDate(next));
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
              >
                Đặt lại
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#1F5AA6] hover:bg-[#184A8A] rounded-lg shadow-xs transition cursor-pointer"
                >
                  Áp dụng ngày
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
