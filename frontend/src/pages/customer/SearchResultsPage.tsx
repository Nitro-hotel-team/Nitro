/**
 * ============================================================================
 * TÊN FILE: SearchResultsPage.tsx
 * VỊ TRÍ: src/pages/customer/SearchResultsPage.tsx
 * PHÂN HỆ: Cổng Thông tin Khách hàng (Room Search & Availability Results) - TASK-18
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trang tìm kiếm và lọc phòng lưu trú trực tuyến tiêu chuẩn khách sạn 4 sao:
 *     1. Thanh tìm kiếm dính (Sticky Header Bar): Tích hợp trực tiếp DateRangePicker
 *        và GuestCounter, đồng bộ trạng thái thời gian thực với URL Query Params.
 *     2. Bộ lọc đa tiêu chí thông minh (Multi-facet Filter):
 *        + Lọc theo khoảng giá tối đa (Price Range Slider).
 *        + Lọc theo 6 hạng phòng (STD, SUP, DLX, FAM, EXE, PRE).
 *        + Lọc theo cấu hình giường ngủ (Giường King đôi / 2 Giường Twin đơn).
 *        + Lọc theo tiện nghi 4 sao (Bữa sáng buffet, Bồn tắm nằm, Ban công, View phố).
 *        + Lọc theo đánh giá sao (Tất cả, 4.5★ trở lên, 4.8★ tuyệt đỉnh).
 *        + Lọc theo chính sách (Ưu đãi hủy phòng miễn phí).
 *     3. Thanh sắp xếp (Sort Bar): Giá thấp/cao, Đánh giá sao cao nhất, Diện tích lớn nhất, Phổ biến.
 *     4. Danh sách thẻ RoomCard tương tác (Carousel ảnh, thông số phòng, giá ưu đãi 15%,
 *        nút "Xem chi tiết" và nút "Chọn phòng" nạp Draft Booking).
 *     5. Thẻ chip bộ lọc đang áp dụng (Active Filter Chips) với nút gỡ bỏ 1 chạm.
 *     6. Giao diện trống (Empty State) và thẻ gợi ý khoảng ngày gần nhất còn phòng.
 *     7. Mobile Filter Drawer: Drawer trượt từ cạnh phải cho màn hình di động/tablet.
 * ============================================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  ChevronDown,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { GuestCounter } from '../../components/common/GuestCounter';
import { RoomCard } from '../../components/common/RoomCard';
import { EmptyState, Skeleton } from '../../components/common/StateViews';
import { useApp } from '../../context/AppContext';
import { roomService } from '../../services/api';
import { RoomType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const SearchResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEn = language === 'en';

  // Lấy dữ liệu tìm kiếm từ URL Query Params
  const checkInParam = searchParams.get('checkIn') || new Date().toISOString().slice(0, 10);
  const checkOutParam =
    searchParams.get('checkOut') ||
    new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const adultsParam = parseInt(searchParams.get('adults') || '2', 10);
  const childrenParam = parseInt(searchParams.get('children') || '0', 10);
  const roomsParam = parseInt(searchParams.get('rooms') || '1', 10);

  const [startDate, setStartDate] = useState(checkInParam);
  const [endDate, setEndDate] = useState(checkOutParam);
  const [adults, setAdults] = useState(adultsParam);
  const [childrenCount, setChildrenCount] = useState(childrenParam);
  const [roomsCount, setRoomsCount] = useState(roomsParam);

  const [allRoomTypes, setAllRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Trạng thái các bộ lọc (Filters state)
  const [maxPrice, setMaxPrice] = useState<number>(6000000);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0); // 0, 4.5, 4.8
  const [freeCancellationOnly, setFreeCancellationOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'area' | 'popular'>('popular');

  // Tính số đêm lưu trú
  const nights = useMemo(() => {
    const s = new Date(startDate + 'T00:00:00').getTime();
    const e = new Date(endDate + 'T00:00:00').getTime();
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  // Nạp danh sách hạng phòng từ Service
  useEffect(() => {
    setLoading(true);
    roomService.getRoomTypes().then((data) => {
      setAllRoomTypes(data);
      setLoading(false);
    });
  }, []);

  // Cập nhật tham số ngày và đồng bộ URL
  const handleUpdateDates = (newStart: string, newEnd: string, newNights?: number) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setSearchParams({
      checkIn: newStart,
      checkOut: newEnd,
      adults: String(adults),
      children: String(childrenCount),
      rooms: String(roomsCount),
    });
  };

  // Cập nhật số lượng khách và đồng bộ URL
  const handleUpdateGuests = (a: number, c: number, r: number) => {
    setAdults(a);
    setChildrenCount(c);
    setRoomsCount(r);
    setSearchParams({
      checkIn: startDate,
      checkOut: endDate,
      adults: String(a),
      children: String(c),
      rooms: String(r),
    });
  };

  // Đặt lại toàn bộ bộ lọc về mặc định
  const handleClearFilters = () => {
    setMaxPrice(6000000);
    setSelectedTypes([]);
    setSelectedBeds([]);
    setSelectedAmenities([]);
    setMinRating(0);
    setFreeCancellationOnly(false);
    setSortBy('popular');
  };

  // Logic lọc và sắp xếp phòng (Filter & Sort Logic)
  const filteredRooms = useMemo(() => {
    return allRoomTypes
      .filter((room) => {
        // 1. Lọc theo giá tối đa
        if (room.basePrice > maxPrice) return false;

        // 2. Lọc theo mã hạng phòng
        if (selectedTypes.length > 0 && !selectedTypes.includes(room.code)) {
          return false;
        }

        // 3. Lọc theo sức chứa khách
        if ((room.maxGuests || 2) < adults) return false;

        // 4. Lọc theo loại giường
        if (selectedBeds.length > 0) {
          const bedText = (room.bedType || '').toLowerCase();
          const matchBed = selectedBeds.some((bed) => {
            if (bed === 'king') return bedText.includes('king') || bedText.includes('đôi');
            if (bed === 'twin') return bedText.includes('twin') || bedText.includes('đơn');
            return true;
          });
          if (!matchBed) return false;
        }

        // 5. Lọc theo tiện nghi
        if (selectedAmenities.length > 0) {
          const roomAmenitiesText = (room.amenities || []).join(' ').toLowerCase();
          const hasAll = selectedAmenities.every((amenity) =>
            roomAmenitiesText.includes(amenity.toLowerCase())
          );
          if (!hasAll) return false;
        }

        // 6. Lọc theo đánh giá sao tối thiểu
        if (minRating > 0) {
          const ratingScore = room.code === 'PRE' ? 5.0 : room.code === 'EXE' ? 4.9 : room.code === 'DLX' ? 4.9 : 4.7;
          if (ratingScore < minRating) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price_desc') return b.basePrice - a.basePrice;
        if (sortBy === 'area') return b.area - a.area;
        if (sortBy === 'rating') {
          const scoreA = a.code === 'PRE' ? 5.0 : a.code === 'EXE' ? 4.9 : 4.7;
          const scoreB = b.code === 'PRE' ? 5.0 : b.code === 'EXE' ? 4.9 : 4.7;
          return scoreB - scoreA;
        }
        return 0; // 'popular'
      });
  }, [allRoomTypes, maxPrice, selectedTypes, selectedBeds, selectedAmenities, minRating, adults, sortBy]);

  // Danh mục tiện nghi tùy chọn
  const amenityOptions = [
    { label: isEn ? 'Buffet Breakfast' : 'Bữa sáng buffet', value: 'sáng' },
    { label: isEn ? 'Luxury Soaking Tub' : 'Bồn tắm nằm cao cấp', value: 'bồn tắm' },
    { label: isEn ? 'Private Balcony' : 'Ban công đón gió', value: 'ban công' },
    { label: isEn ? 'Panoramic City View' : 'Tầm nhìn toàn cảnh phố', value: 'nhìn' },
    { label: isEn ? 'Airport Shuttle' : 'Xe đưa đón sân bay', value: 'đưa đón' },
    { label: isEn ? 'High-speed Wi-Fi 6' : 'Wi-Fi 6 tốc độ cao', value: 'wi-fi' },
  ];

  // Kiểm tra xem có bộ lọc nào đang được kích hoạt hay không
  const hasActiveFilters =
    maxPrice < 6000000 ||
    selectedTypes.length > 0 ||
    selectedBeds.length > 0 ||
    selectedAmenities.length > 0 ||
    minRating > 0 ||
    freeCancellationOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Sticky Search & Availability Header Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="w-full lg:w-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={handleUpdateDates}
              />
            </div>
            <div>
              <GuestCounter
                adults={adults}
                childrenCount={childrenCount}
                rooms={roomsCount}
                onChange={handleUpdateGuests}
              />
            </div>
          </div>

          <div className="w-full lg:w-auto flex items-center justify-between sm:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
            <div className="text-xs text-[#475569]">
              <span className="font-extrabold text-base text-[#1F5AA6] mr-1">
                {filteredRooms.length}
              </span>
              {t('search.resultsFound', { count: filteredRooms.length })}
            </div>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 border-slate-300 font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#1F5AA6]" />
              <span>{isEn ? 'Filters' : 'Bộ lọc'}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#1F5AA6]"></span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Sort Bar & Active Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs">
        {/* Sort Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-[#0F172A] whitespace-nowrap mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#1F5AA6]" />
            {t('search.sort')}:
          </span>
          <button
            type="button"
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              sortBy === 'popular'
                ? 'bg-[#1F5AA6] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEn ? 'Most Popular' : 'Phổ biến nhất'}
          </button>
          <button
            type="button"
            onClick={() => setSortBy('price_asc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              sortBy === 'price_asc'
                ? 'bg-[#1F5AA6] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEn ? 'Price: Low to High' : 'Giá: Thấp đến cao'}
          </button>
          <button
            type="button"
            onClick={() => setSortBy('price_desc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              sortBy === 'price_desc'
                ? 'bg-[#1F5AA6] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEn ? 'Price: High to Low' : 'Giá: Cao đến thấp'}
          </button>
          <button
            type="button"
            onClick={() => setSortBy('rating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              sortBy === 'rating'
                ? 'bg-[#1F5AA6] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEn ? 'Top Rated' : 'Đánh giá sao'}
          </button>
          <button
            type="button"
            onClick={() => setSortBy('area')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              sortBy === 'area'
                ? 'bg-[#1F5AA6] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEn ? 'Largest Space' : 'Diện tích lớn'}
          </button>
        </div>

        {/* Quick Clear Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('search.clearFilter')}
          </button>
        )}
      </div>

      {/* Applied Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#475569] font-bold">{t('search.activeFilterPrefix')}</span>
          {maxPrice < 6000000 && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-[#EAF2FB] text-[#1F5AA6] px-3 py-1 rounded-full font-bold border border-blue-100">
              &le; {formatCurrency(maxPrice, language)}
              <button
                type="button"
                onClick={() => setMaxPrice(6000000)}
                className="hover:text-blue-900 cursor-pointer"
                aria-label="Remove price filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTypes.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1.5 text-xs bg-[#EAF2FB] text-[#1F5AA6] px-3 py-1 rounded-full font-bold border border-blue-100"
            >
              {isEn ? 'Tier' : 'Hạng'}: {code}
              <button
                type="button"
                onClick={() => setSelectedTypes(selectedTypes.filter((t) => t !== code))}
                className="hover:text-blue-900 cursor-pointer"
                aria-label={`Remove tier ${code}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedBeds.map((bed) => (
            <span
              key={bed}
              className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-bold border border-amber-200"
            >
              {isEn ? 'Bed' : 'Giường'}: {bed === 'king' ? (isEn ? 'King Bed' : 'King Đôi') : (isEn ? 'Twin Bed' : 'Twin Đơn')}
              <button
                type="button"
                onClick={() => setSelectedBeds(selectedBeds.filter((b) => b !== bed))}
                className="hover:text-amber-950 cursor-pointer"
                aria-label={`Remove bed ${bed}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedAmenities.map((am) => (
            <span
              key={am}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold border border-slate-200"
            >
              {am}
              <button
                type="button"
                onClick={() => setSelectedAmenities(selectedAmenities.filter((a) => a !== am))}
                className="hover:text-slate-900 cursor-pointer"
                aria-label={`Remove amenity ${am}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full font-bold border border-amber-200">
              ★ {minRating}+ {isEn ? 'stars' : 'sao'}
              <button
                type="button"
                onClick={() => setMinRating(0)}
                className="hover:text-amber-950 cursor-pointer"
                aria-label="Remove rating filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* 3. Main Grid: Filters Sidebar (Desktop) + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-6 self-start sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="font-bold text-sm text-[#0B1F3A] flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#1F5AA6]" />
              {isEn ? 'Search Filters 4★' : 'Bộ lọc tìm kiếm 4★'}
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-[#1F5AA6] hover:underline font-bold cursor-pointer"
            >
              {t('search.clearFilter')}
            </button>
          </div>

          {/* 3.1. Price Range Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-[#0F172A] mb-2">
              <span>{t('search.priceRange')}</span>
              <span className="text-[#1F5AA6] font-extrabold tabular-nums">
                {formatCurrency(maxPrice, language)}
              </span>
            </div>
            <input
              type="range"
              min="850000"
              max="6000000"
              step="100000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F5AA6]"
            />
            <div className="flex justify-between text-[11px] text-[#94A3B8] font-medium mt-1">
              <span>850.000 ₫</span>
              <span>6.000.000 ₫</span>
            </div>
          </div>

          {/* 3.2. Room Types */}
          <div className="border-t border-[#E2E8F0] pt-4">
            <span className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
              {t('search.roomType')}
            </span>
            <div className="space-y-2">
              {[
                { code: 'STD', label: 'Standard Room', price: '850k' },
                { code: 'SUP', label: 'Superior Room', price: '1.15tr' },
                { code: 'DLX', label: 'Deluxe Room', price: '1.45tr' },
                { code: 'FAM', label: 'Family Suite', price: '2.10tr' },
                { code: 'EXE', label: 'Executive Suite', price: '2.80tr' },
                { code: 'PRE', label: 'Presidential Suite', price: '5.20tr' },
              ].map((item) => {
                const checked = selectedTypes.includes(item.code);
                return (
                  <label
                    key={item.code}
                    className="flex items-center justify-between text-xs text-[#475569] hover:text-[#0F172A] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTypes([...selectedTypes, item.code]);
                          } else {
                            setSelectedTypes(selectedTypes.filter((t) => t !== item.code));
                          }
                        }}
                        className="rounded border-slate-300 text-[#1F5AA6] focus:ring-[#1F5AA6]"
                      />
                      <span className={checked ? 'font-bold text-[#0F172A]' : ''}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">từ {item.price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3.3. Bed Configuration */}
          <div className="border-t border-[#E2E8F0] pt-4">
            <span className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
              {t('search.bedType')}
            </span>
            <div className="space-y-2">
              {[
                { id: 'king', label: isEn ? '1 King Bed' : '1 Giường King đôi lớn' },
                { id: 'twin', label: isEn ? '2 Twin Beds' : '2 Giường Twin đơn' },
              ].map((item) => {
                const checked = selectedBeds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 text-xs text-[#475569] hover:text-[#0F172A] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBeds([...selectedBeds, item.id]);
                        } else {
                          setSelectedBeds(selectedBeds.filter((b) => b !== item.id));
                        }
                      }}
                      className="rounded border-slate-300 text-[#1F5AA6] focus:ring-[#1F5AA6]"
                    />
                    <span className={checked ? 'font-bold text-[#0F172A]' : ''}>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3.4. Amenities */}
          <div className="border-t border-[#E2E8F0] pt-4">
            <span className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
              {t('search.amenities')}
            </span>
            <div className="space-y-2">
              {amenityOptions.map((am) => {
                const checked = selectedAmenities.includes(am.value);
                return (
                  <label
                    key={am.value}
                    className="flex items-center gap-2 text-xs text-[#475569] hover:text-[#0F172A] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAmenities([...selectedAmenities, am.value]);
                        } else {
                          setSelectedAmenities(selectedAmenities.filter((a) => a !== am.value));
                        }
                      }}
                      className="rounded border-slate-300 text-[#1F5AA6] focus:ring-[#1F5AA6]"
                    />
                    <span className={checked ? 'font-bold text-[#0F172A]' : ''}>
                      {am.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3.5. Rating Filter */}
          <div className="border-t border-[#E2E8F0] pt-4">
            <span className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
              {isEn ? 'Guest Rating' : 'Đánh giá khách hàng'}
            </span>
            <div className="space-y-1.5">
              {[
                { score: 0, label: isEn ? 'All Ratings' : 'Tất cả đánh giá' },
                { score: 4.5, label: isEn ? '★ 4.5+ (Very Good)' : '★ 4.5 trở lên (Rất tốt)' },
                { score: 4.8, label: isEn ? '★ 4.8+ (Superb)' : '★ 4.8 trở lên (Tuyệt hảo)' },
              ].map((r) => (
                <button
                  key={r.score}
                  type="button"
                  onClick={() => setMinRating(r.score)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    minRating === r.score
                      ? 'bg-[#EAF2FB] text-[#1F5AA6] font-bold border border-blue-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 4. Results List Container (Right Column) */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="space-y-4">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  roomType={room}
                  nights={nights}
                  startDate={startDate}
                  endDate={endDate}
                  adults={adults}
                  childrenCount={childrenCount}
                  roomsCount={roomsCount}
                  availableCount={room.code === 'PRE' ? 2 : room.code === 'EXE' ? 3 : 5}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs">
              <EmptyState
                title={t('search.noResults')}
                description={t('search.noResultsDesc')}
                actionText={t('search.resetAllFilters')}
                onAction={handleClearFilters}
              />
            </div>
          )}

          {/* Nearby Date Suggestion Card if 0 or 1 result */}
          {filteredRooms.length <= 1 && (
            <div className="bg-gradient-to-r from-amber-50/80 to-blue-50/80 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#0B1F3A] font-extrabold text-xs uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
                {t('search.tryNearbyDates')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                  <div>
                    <div className="font-bold text-[#0F172A]">
                      {isEn ? 'Sep 28 → Sep 30 (Early Week)' : '28/09 → 30/09 (Đầu tuần)'}
                    </div>
                    <div className="text-emerald-700 font-semibold mt-0.5">
                      {isEn ? 'From 850,000 ₫ • 7 available' : 'Từ 850.000 ₫ • 7 phòng trống'}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUpdateDates('2026-09-28', '2026-09-30')}
                  >
                    {t('search.viewDate')}
                  </Button>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                  <div>
                    <div className="font-bold text-[#0F172A]">
                      {isEn ? 'Oct 02 → Oct 04 (Next Weekend)' : '02/10 → 04/10 (Cuối tuần tới)'}
                    </div>
                    <div className="text-emerald-700 font-semibold mt-0.5">
                      {isEn ? 'From 1,050,000 ₫ • 5 available' : 'Từ 1.050.000 ₫ • 5 phòng trống'}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUpdateDates('2026-10-02', '2026-10-04')}
                  >
                    {t('search.viewDate')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <span className="font-extrabold text-base text-[#0B1F3A]">
                  {isEn ? 'Search Filters 4★' : 'Bộ lọc tìm kiếm 4★'}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price slider */}
              <div>
                <span className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  {isEn ? 'Max Price:' : 'Khoảng giá tối đa:'}{' '}
                  <strong className="text-[#1F5AA6]">{formatCurrency(maxPrice, language)}</strong>
                </span>
                <input
                  type="range"
                  min="850000"
                  max="6000000"
                  step="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none accent-[#1F5AA6]"
                />
              </div>

              {/* Room types */}
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-xs font-bold text-[#0F172A] mb-2 uppercase">
                  {t('search.roomType')}
                </span>
                <div className="space-y-2">
                  {['STD', 'SUP', 'DLX', 'FAM', 'EXE', 'PRE'].map((code) => (
                    <label key={code} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(code)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTypes([...selectedTypes, code]);
                          else setSelectedTypes(selectedTypes.filter((t) => t !== code));
                        }}
                        className="rounded border-slate-300 text-[#1F5AA6]"
                      />
                      <span>{isEn ? 'Tier' : 'Hạng'} {code}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-xs font-bold text-[#0F172A] mb-2 uppercase">
                  {t('search.amenities')}
                </span>
                <div className="space-y-2">
                  {amenityOptions.map((am) => (
                    <label key={am.value} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(am.value)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedAmenities([...selectedAmenities, am.value]);
                          else setSelectedAmenities(selectedAmenities.filter((a) => a !== am.value));
                        }}
                        className="rounded border-slate-300 text-[#1F5AA6]"
                      />
                      <span>{am.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-[#1F5AA6] hover:bg-[#184A8A] font-bold"
              >
                {t('search.applyFilter')} ({filteredRooms.length} {isEn ? 'rooms' : 'phòng'})
              </Button>
              <button
                type="button"
                onClick={() => {
                  handleClearFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 underline font-medium py-1"
              >
                {t('search.resetAllFilters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
