/**
 * ============================================================================
 * TÊN FILE: RoomDetailPage.tsx
 * VỊ TRÍ: src/pages/customer/RoomDetailPage.tsx
 * PHÂN HỆ: Cổng Khách hàng - Chi tiết Hạng phòng & Đặt chỗ (Room Detail & Booking)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trình bày thông tin chi tiết đầy đủ của một hạng phòng 4 sao:
 *     1. Thư viện hình ảnh chất lượng cao + Chế độ phóng to Lightbox toàn màn hình.
 *     2. Thông số kỹ thuật phòng: Diện tích (m²), loại giường, sức chứa tối đa, hướng nhìn.
 *     3. Tiện nghi phân nhóm khoa học: Phòng tắm & Vệ sinh, Công nghệ & Giải trí, Ẩm thực, An toàn.
 *     4. Bảng tính giá tương tác Sticky Sidebar (hoặc thanh cố định đáy màn hình trên Mobile):
 *         * Chọn ngày nhận/trả phòng (DateRangePicker).
 *         * Chọn số lượng người lớn/trẻ em/số phòng (GuestCounter).
 *         * Bóc tách chi tiết: Giá cơ sở x Số đêm + Phí dịch vụ 5% + Thuế VAT 10% = Tổng cộng.
 *     5. Gợi ý các hạng phòng tương tự có thể quan tâm.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bath,
  BedDouble,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Heart,
  Maximize2,
  Shield,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
  Tv,
  Users,
  Wifi,
  Wind,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { GuestCounter } from '../../components/common/GuestCounter';
import { RoomCard } from '../../components/common/RoomCard';
import { Skeleton } from '../../components/common/StateViews';
import { useApp } from '../../context/AppContext';
import { roomService } from '../../services/api';
import { RoomType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { language, setDraftBooking, resetHoldCountdown } = useApp();
  const navigate = useNavigate();

  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [similarRooms, setSimilarRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state & Lightbox
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Dates & Guests
  const today = searchParams.get('checkIn') || new Date().toISOString().slice(0, 10);
  const tomorrow =
    searchParams.get('checkOut') ||
    new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [nights, setNights] = useState(1);
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '2', 10));
  const [childrenCount, setChildrenCount] = useState(
    parseInt(searchParams.get('children') || '0', 10)
  );
  const [rooms, setRooms] = useState(1);

  useEffect(() => {
    setLoading(true);
    if (!id) return;
    Promise.all([roomService.getRoomTypeById(id), roomService.getRoomTypes()]).then(
      ([room, allRooms]) => {
        setRoomType(room);
        setSimilarRooms(allRooms.filter((r) => r.id !== id).slice(0, 3));
        setLoading(false);
      }
    );
  }, [id]);

  if (loading || !roomType) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const isEn = language === 'en';
  const images = roomType.images?.length > 0 ? roomType.images : [roomType.image];

  // Pricing calculations
  const baseTotal = roomType.basePrice * nights;
  const serviceFee = Math.round(baseTotal * 0.05); // 5%
  const vat = Math.round(baseTotal * 0.08); // 8%
  const grandTotal = baseTotal + serviceFee + vat;

  const handleBookNow = () => {
    resetHoldCountdown();
    setDraftBooking({
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      checkInDate: startDate,
      checkOutDate: endDate,
      nights,
      adults,
      children: childrenCount,
      totalAmount: grandTotal,
      paidAmount: 0,
      source: 'WEB',
    });
    navigate('/booking/step-1');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#475569]">
        <Link to="/" className="hover:text-[#1F5AA6]">
          {t('nav.home')}
        </Link>
        <span>/</span>
        <Link to="/rooms" className="hover:text-[#1F5AA6]">
          {t('nav.rooms')}
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#0F172A]">
          {isEn ? roomType.nameEn : roomType.name}
        </span>
      </nav>

      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1F5AA6] font-bold text-xs uppercase tracking-wide">
              {roomType.code}
            </span>
            <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
              <Star className="w-4 h-4 fill-current" />
              <span>4.9 (128 đánh giá)</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            {isEn ? roomType.nameEn : roomType.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 transition"
            aria-label="Chia sẻ phòng"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-rose-600 transition"
            aria-label="Lưu yêu thích"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photo Gallery Grid (1 Large + 4 small thumbnails) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl overflow-hidden">
        {/* Large featured photo */}
        <div
          className="md:col-span-2 md:row-span-2 h-[320px] md:h-[420px] relative cursor-pointer group overflow-hidden bg-slate-100"
          onClick={() => {
            setSelectedImageIndex(0);
            setLightboxOpen(true);
          }}
        >
          <img
            src={images[0]}
            alt={roomType.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" />
            Xem toàn màn hình (5 ảnh)
          </div>
        </div>

        {/* 3-4 side thumbnails */}
        {images.slice(1, 5).map((img, idx) => (
          <div
            key={idx}
            className="h-[155px] md:h-[205px] relative cursor-pointer group overflow-hidden bg-slate-100 hidden sm:block"
            onClick={() => {
              setSelectedImageIndex(idx + 1);
              setLightboxOpen(true);
            }}
          >
            <img
              src={img}
              alt={`${roomType.name} thumbnail ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Main Content: Left Details + Right Sticky Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#EAF2FB] text-[#1F5AA6]">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#94A3B8] uppercase font-semibold">
                  {t('room.area')}
                </div>
                <div className="text-sm font-bold text-[#0F172A]">{roomType.area} m²</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#EAF2FB] text-[#1F5AA6]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#94A3B8] uppercase font-semibold">
                  {t('room.capacity')}
                </div>
                <div className="text-sm font-bold text-[#0F172A]">
                  Tối đa {roomType.maxGuests} khách
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#EAF2FB] text-[#1F5AA6]">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#94A3B8] uppercase font-semibold">
                  {t('room.bed')}
                </div>
                <div className="text-sm font-bold text-[#0F172A] truncate">
                  {isEn ? roomType.bedTypeEn : roomType.bedType}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#EAF2FB] text-[#1F5AA6]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#94A3B8] uppercase font-semibold">
                  {t('room.view')}
                </div>
                <div className="text-sm font-bold text-[#0F172A]">Phố Nguyễn Huệ</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-[#0F172A]">Giới thiệu loại phòng</h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              {isEn ? roomType.descriptionEn : roomType.description}
            </p>
            <p className="text-sm text-[#475569] leading-relaxed">
              Được thiết kế tinh xảo bởi các kiến trúc sư hàng đầu, không gian phòng kết hợp hài hòa
              giữa vẻ đẹp cổ điển phương Đông và sự tiện nghi của phong cách nội thất hiện đại châu Âu.
              Hệ thống cách âm kính 3 lớp chống ồn tuyệt đối giúp bạn tận hưởng giấc ngủ êm dịu nhất.
            </p>
          </div>

          {/* Grouped Amenities */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-[#0F172A]">Tiện nghi phòng tiêu chuẩn</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              {/* Bedroom */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F5AA6] mb-3 flex items-center gap-2">
                  <BedDouble className="w-4 h-4" /> Phòng ngủ &amp; Nghỉ ngơi
                </h3>
                <ul className="space-y-2 text-xs text-[#475569]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Nệm lò xo cao cấp
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Ga gối 100% cotton Ai Cập
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Két sắt điện tử an toàn
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Rèm cản sáng 100%
                  </li>
                </ul>
              </div>

              {/* Bathroom */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F5AA6] mb-3 flex items-center gap-2">
                  <Bath className="w-4 h-4" /> Phòng tắm &amp; Vệ sinh
                </h3>
                <ul className="space-y-2 text-xs text-[#475569]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Bồn tắm nằm sang trọng
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Vòi sen đứng áp lực cao
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Áo choàng tắm &amp; dép đi trong phòng
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Bộ đồ dùng vệ sinh L'Occitane
                  </li>
                </ul>
              </div>

              {/* Tech & Entertainment */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F5AA6] mb-3 flex items-center gap-2">
                  <Tv className="w-4 h-4" /> Công nghệ &amp; Giải trí
                </h3>
                <ul className="space-y-2 text-xs text-[#475569]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Smart TV 55 inch Netflix &amp; YouTube
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Wi-Fi tốc độ cao 100 Mbps
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Loa Bluetooth Harman Kardon
                  </li>
                </ul>
              </div>

              {/* Food & Beverage */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F5AA6] mb-3 flex items-center gap-2">
                  <Coffee className="w-4 h-4" /> Đồ uống &amp; Ẩm thực
                </h3>
                <ul className="space-y-2 text-xs text-[#475569]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> 2 chai nước khoáng miễn phí/ngày
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Máy pha cà phê viên nén
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Trà hoa cúc &amp; trà lài hảo hạng
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hotel Policies Accordion */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-[#0F172A]">{t('room.policies')}</h2>
            <div className="space-y-3 text-xs text-[#475569]">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#1F5AA6] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A]">Giờ nhận &amp; trả phòng:</span>
                  <p>Nhận phòng từ 14:00 • Trả phòng trước 12:00 trưa hôm sau.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A]">Chính sách hủy phòng:</span>
                  <p>{t('room.cancellationPolicy')}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A]">Trẻ em &amp; Giường phụ:</span>
                  <p>Trẻ em dưới 6 tuổi ở chung giường với bố mẹ miễn phí tiền phòng.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-lg space-y-5">
            {/* Price Header */}
            <div className="flex items-baseline justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-[#1F5AA6] tabular-nums">
                  {formatCurrency(roomType.basePrice, language)}
                </span>
                <span className="text-xs text-[#94A3B8] ml-1">{t('room.perNight')}</span>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700">
                Còn phòng
              </span>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Thời gian lưu trú
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(s, e, n) => {
                  setStartDate(s);
                  setEndDate(e);
                  setNights(n);
                }}
              />

              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider pt-2">
                Số lượng khách
              </label>
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

            {/* Price Breakdown */}
            <div className="border-t border-[#E2E8F0] pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#475569]">
                <span>
                  {formatCurrency(roomType.basePrice, language)} &times; {nights} {t('search.nights')}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(baseTotal, language)}
                </span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>{t('room.serviceFee')}</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(serviceFee, language)}
                </span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>{t('room.vat')}</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(vat, language)}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-[#E2E8F0] text-sm font-bold text-[#0F172A]">
                <span>{t('room.totalPrice')}</span>
                <span className="text-xl text-[#1F5AA6] tabular-nums font-extrabold">
                  {formatCurrency(grandTotal, language)}
                </span>
              </div>
            </div>

            {/* Book Now Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleBookNow}
              className="w-full bg-[#1F5AA6] hover:bg-[#184A8A] font-bold text-sm shadow-md"
            >
              {t('room.bookNow')}
            </Button>

            <div className="text-center text-[11px] text-[#94A3B8]">
              Thanh toán an toàn • Giữ chỗ tạm thời 10 phút
            </div>
          </div>
        </div>
      </div>

      {/* Similar Rooms Section */}
      {similarRooms.length > 0 && (
        <section className="pt-8 border-t border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">{t('room.similarRooms')}</h2>
          <div className="space-y-4">
            {similarRooms.map((sr) => (
              <RoomCard key={sr.id} roomType={sr} nights={nights} />
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in">
          <div className="flex justify-between items-center text-white px-4 py-2">
            <span className="text-sm font-medium">
              {roomType.name} — Ảnh {selectedImageIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full hover:bg-white/20 text-white transition"
              aria-label="Đóng ảnh phóng to"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center">
            <img
              src={images[selectedImageIndex]}
              alt={roomType.name}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
            />
            <button
              onClick={() =>
                setSelectedImageIndex(
                  (selectedImageIndex - 1 + images.length) % images.length
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                setSelectedImageIndex((selectedImageIndex + 1) % images.length)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center gap-2 py-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="thumbnail"
                onClick={() => setSelectedImageIndex(i)}
                className={`w-16 h-12 object-cover rounded cursor-pointer transition ${
                  i === selectedImageIndex ? 'ring-2 ring-[#C9A227]' : 'opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Booking Bar (Visible on mobile/tablet screens only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 block">Tổng cộng ({nights} đêm)</span>
          <span className="text-base font-extrabold text-[#1F5AA6]">
            {formatCurrency(grandTotal, language)}
          </span>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleBookNow}
          className="bg-[#1F5AA6] hover:bg-[#184A8A] font-bold px-5 text-xs shadow-md shrink-0"
        >
          {t('room.bookNow')}
        </Button>
      </div>
    </div>
  );
};
