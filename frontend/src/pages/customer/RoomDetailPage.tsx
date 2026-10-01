/**
 * ============================================================================
 * TÊN FILE: RoomDetailPage.tsx
 * VỊ TRÍ: src/pages/customer/RoomDetailPage.tsx
 * PHÂN HỆ: Cổng Khách hàng - Chi tiết Hạng phòng & Đặt chỗ (Room Detail - TASK-19)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trình bày thông tin chi tiết đầy đủ của một hạng phòng khách sạn 4 sao:
 *     1. Thư viện hình ảnh chất lượng cao Bento Grid + Lightbox tương tác toàn màn hình.
 *     2. Thông số buồng phòng: Diện tích (m²), loại giường, sức chứa tối đa, hướng nhìn.
 *     3. Tiện nghi phân nhóm chuyên nghiệp: Giường ngủ, Phòng tắm & Spa, Công nghệ, Ẩm thực, An toàn.
 *     4. Quy định nhận/trả phòng, chính sách hủy miễn phí và lưu ý trẻ em/nôi em bé.
 *     5. Đánh giá khách lưu trú (Customer Reviews): Điểm số 4.9★ chi tiết từng tiêu chí và nhận xét mẫu.
 *     6. Bảng tính giá tương tác Sticky Sidebar (hoặc thanh cố định đáy màn hình trên Mobile):
 *         * Bộ chọn khoảng ngày Check-in/Check-out (DateRangePicker).
 *         * Bộ chọn phân bổ khách và phòng (GuestCounter).
 *         * Bóc tách chi phí: Giá ưu đãi x Số đêm + Phí dịch vụ 5% + Thuế VAT = Tổng chi phí.
 *         * Nút CTA "Đặt phòng ngay": Tự động nạp Draft Booking vào AppContext và điều hướng tới Step 1.
 *     7. Đề xuất các hạng phòng tương tự có thể quan tâm (Similar Rooms).
 *     8. Tính năng chia sẻ liên kết (Share) và lưu danh sách yêu thích (Wishlist).
 * ============================================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  Bath,
  BedDouble,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Heart,
  Info,
  Maximize2,
  PhoneCall,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
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

  // Gallery state & Lightbox modal
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Wishlist & Share toast feedback
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dates & Guests state from URL Query Params or defaults
  const today = searchParams.get('checkIn') || new Date().toISOString().slice(0, 10);
  const tomorrow =
    searchParams.get('checkOut') ||
    new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '2', 10));
  const [childrenCount, setChildrenCount] = useState(
    parseInt(searchParams.get('children') || '0', 10)
  );
  const [rooms, setRooms] = useState(parseInt(searchParams.get('rooms') || '1', 10));

  // Tự động tính số đêm lưu trú chuẩn xác
  const nights = useMemo(() => {
    const s = new Date(startDate + 'T00:00:00').getTime();
    const e = new Date(endDate + 'T00:00:00').getTime();
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  // Nạp thông tin phòng và các phòng tương tự
  useEffect(() => {
    setLoading(true);
    if (!id) return;
    Promise.all([roomService.getRoomTypeById(id), roomService.getRoomTypes()]).then(
      ([room, allRooms]) => {
        setRoomType(room);
        setSimilarRooms(allRooms.filter((r) => r.id !== id).slice(0, 3));
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    );
  }, [id]);

  // Điều khiển bàn phím cho Lightbox (Escape đóng, Mũi tên trái/phải đổi ảnh)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight' && roomType) {
        setSelectedImageIndex((prev) => (prev + 1) % (roomType.images?.length || 1));
      }
      if (e.key === 'ArrowLeft' && roomType) {
        const total = roomType.images?.length || 1;
        setSelectedImageIndex((prev) => (prev - 1 + total) % total);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, roomType]);

  if (loading || !roomType) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-10 w-80 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[420px]">
          <Skeleton className="md:col-span-2 md:row-span-2 h-full rounded-2xl" />
          <Skeleton className="h-[200px] rounded-xl hidden sm:block" />
          <Skeleton className="h-[200px] rounded-xl hidden sm:block" />
          <Skeleton className="h-[200px] rounded-xl hidden sm:block" />
          <Skeleton className="h-[200px] rounded-xl hidden sm:block" />
        </div>
      </div>
    );
  }

  const isEn = language === 'en';
  const images = roomType.images && roomType.images.length > 0 ? roomType.images : [roomType.image];

  // Tính toán định giá minh bạch (Giá gốc -15%, Phí dịch vụ 5%, Thuế VAT 8%)
  const originalPerNight = Math.round(roomType.basePrice * 1.15);
  const baseTotal = roomType.basePrice * nights;
  const serviceFee = Math.round(baseTotal * 0.05); // 5% phí phục vụ 4 sao
  const vat = Math.round(baseTotal * 0.08); // 8% thuế giá trị gia tăng
  const grandTotal = baseTotal + serviceFee + vat;

  // Xử lý chia sẻ liên kết
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Đặt phòng ngay -> Ghi nhớ vào AppContext và sang Bước 1
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
      roomsCount: rooms,
      totalAmount: grandTotal,
      paidAmount: 0,
      source: 'WEB',
    });
    navigate('/booking/step-1');
  };

  // Đánh giá mẫu khách hàng (Localized reviews)
  const sampleReviews = useMemo(() => [
    {
      author: isEn ? 'Minh Nguyen' : 'Nguyễn Văn Minh',
      date: isEn ? '2 weeks ago' : '2 tuần trước',
      score: 5.0,
      badge: isEn ? 'Stayed 3 nights' : 'Đã lưu trú 3 đêm',
      comment: isEn
        ? 'Extremely clean room, stunning panoramic view of the Saigon river at night. Super plush bed and relaxing soaking tub after a long business day.'
        : 'Phòng cực kỳ sạch sẽ, view ngắm toàn cảnh sông Sài Gòn tuyệt đẹp về đêm. Giường êm ái, bồn tắm ngâm rất thư giãn sau ngày dài công tác.',
    },
    {
      author: 'David Harrison',
      date: isEn ? '1 month ago' : '1 tháng trước',
      score: 4.9,
      badge: isEn ? 'International Guest (Australia)' : 'Khách quốc tế (Australia)',
      comment:
        'Exceptional 4-star experience! The breakfast buffet was fantastic with diverse Asian and Western dishes. Staff was extremely accommodating.',
    },
    {
      author: isEn ? 'Thu Thao Tran' : 'Trần Thị Thu Thảo',
      date: isEn ? 'August 2026' : 'Tháng 8/2026',
      score: 4.8,
      badge: isEn ? 'Family with young kids' : 'Gia đình có trẻ nhỏ',
      comment: isEn
        ? 'The hotel provided a complimentary baby cot and high chair very thoughtfully. Soundproofing is great, kids slept soundly.'
        : 'Khách sạn hỗ trợ kê thêm nôi trẻ em miễn phí rất chu đáo. Không gian cách âm tốt, các bé ngủ ngon giấc.',
    },
  ], [isEn]);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 space-y-8">
      {/* 1. Breadcrumb điều hướng */}
      <nav className="flex items-center gap-2 text-xs text-[#475569]">
        <Link to="/" className="hover:text-[#1F5AA6] transition font-medium">
          {t('nav.home')}
        </Link>
        <span>/</span>
        <Link to="/rooms" className="hover:text-[#1F5AA6] transition font-medium">
          {t('nav.rooms')}
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#0F172A] truncate">
          {isEn ? roomType.nameEn : roomType.name}
        </span>
      </nav>

      {/* 2. Tiêu đề hạng phòng & Nút hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2FB] text-[#1F5AA6] font-bold text-xs uppercase tracking-wide">
              {roomType.code}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> {t('roomDetail.fourStarStandard')}
            </span>
            <div className="flex items-center text-amber-500 text-xs font-bold gap-1 ml-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.9</span>
              <span className="text-slate-400 font-normal">
                (128 {t('roomDetail.verifiedGuestBadge')})
              </span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            {isEn ? roomType.nameEn || roomType.name : roomType.name}
          </h1>
        </div>

        {/* Share & Wishlist buttons */}
        <div className="flex items-center gap-2 relative">
          {copiedLink && (
            <div className="absolute -top-9 right-0 bg-[#0B1F3A] text-white text-xs px-3 py-1 rounded-lg shadow-lg animate-in fade-in">
              {isEn ? 'Link copied to clipboard!' : 'Đã sao chép liên kết!'}
            </div>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 transition flex items-center gap-2 text-xs font-semibold shadow-xs"
            title={isEn ? 'Share room' : 'Chia sẻ phòng'}
          >
            <Share2 className="w-4 h-4 text-[#1F5AA6]" />
            <span className="hidden sm:inline">{isEn ? 'Share' : 'Chia sẻ'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2.5 rounded-xl border transition flex items-center gap-2 text-xs font-semibold shadow-xs ${
              isFavorite
                ? 'border-rose-300 bg-rose-50 text-rose-600'
                : 'border-[#E2E8F0] hover:bg-slate-50 text-slate-700'
            }`}
            title={isEn ? 'Save to wishlist' : 'Lưu yêu thích'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isEn ? (isFavorite ? 'Saved' : 'Save') : (isFavorite ? 'Đã thích' : 'Yêu thích')}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Thư viện hình ảnh Bento Grid (1 Ảnh lớn + 4 Ảnh nhỏ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl overflow-hidden shadow-md">
        {/* Ảnh chính lớn (Chiếm 2 cột 2 hàng) */}
        <div
          className="sm:col-span-2 sm:row-span-2 h-[280px] sm:h-[420px] relative cursor-pointer group overflow-hidden bg-slate-100"
          onClick={() => {
            setSelectedImageIndex(0);
            setLightboxOpen(true);
          }}
        >
          <img
            src={images[0]}
            alt={isEn ? roomType.nameEn || roomType.name : roomType.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md">
            {isEn ? '-15% Early Bird Offer' : '-15% Ưu đãi đặt sớm'}
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3.5 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 transition">
            <Maximize2 className="w-4 h-4" />
            <span>
              {isEn ? `View all photos (${images.length})` : `Xem toàn bộ ảnh (${images.length} ảnh)`}
            </span>
          </div>
        </div>

        {/* 4 ảnh nhỏ xung quanh */}
        {images.slice(1, 5).map((img, idx) => (
          <div
            key={idx}
            className="h-[135px] sm:h-[204px] relative cursor-pointer group overflow-hidden bg-slate-100"
            onClick={() => {
              setSelectedImageIndex(idx + 1);
              setLightboxOpen(true);
            }}
          >
            <img
              src={img}
              alt={`${isEn ? roomType.nameEn || roomType.name : roomType.name} thumbnail ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {idx === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 hover:bg-black/60 transition flex flex-col items-center justify-center text-white font-bold text-sm">
                <span>+{images.length - 5} {isEn ? 'photos' : 'ảnh'}</span>
                <span className="text-[11px] font-normal text-slate-200">
                  {isEn ? 'Explore' : 'Khám phá'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. Nội dung chính: Cột chi tiết bên trái (8 cols) + Cột Sticky bên phải (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI (8 Cột) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Thanh thông số kỹ thuật cốt lõi (Key Specs Bar) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#EAF2FB] text-[#1F5AA6]">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-wider">
                  {t('room.area')}
                </div>
                <div className="text-base font-extrabold text-[#0F172A]">{roomType.area} m²</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#EAF2FB] text-[#1F5AA6]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-wider">
                  {t('room.capacity')}
                </div>
                <div className="text-base font-extrabold text-[#0F172A]">
                  {isEn ? `Up to ${roomType.maxGuests} guests` : `Tối đa ${roomType.maxGuests} khách`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#EAF2FB] text-[#1F5AA6]">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-wider">
                  {t('room.bed')}
                </div>
                <div className="text-base font-extrabold text-[#0F172A] truncate">
                  {isEn ? roomType.bedTypeEn || roomType.bedType : roomType.bedType}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#EAF2FB] text-[#1F5AA6]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-wider">
                  {t('room.view')}
                </div>
                <div className="text-base font-extrabold text-[#0F172A]">
                  {isEn ? 'Panoramic City' : 'Toàn cảnh Phố'}
                </div>
              </div>
            </div>
          </div>

          {/* Giới thiệu chi tiết hạng phòng */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A227]" />
              {t('roomDetail.roomOverview')}
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              {isEn ? roomType.descriptionEn || roomType.description : roomType.description}
            </p>
            <p className="text-sm text-[#475569] leading-relaxed">
              {isEn
                ? `All ${roomType.nameEn || roomType.name} rooms at Nitro Grand Hotel feature international 4-star soundproof triple glazing, private fresh-air balconies, and imported natural wood flooring. The ambience is an exquisite fusion of nostalgic Indochine architectural aesthetics and refined modern luxury.`
                : `Tất cả các phòng thuộc phân khúc ${roomType.name} tại Nitro Grand Hotel đều được trang bị hệ thống cửa kính cách âm 3 lớp đạt chuẩn quốc tế, ban công riêng đón ánh nắng sớm tự nhiên cùng sàn gỗ tự nhiên nhập khẩu. Không gian thiết kế là sự hòa quyện tuyệt vời giữa phong cách kiến trúc Đông Dương hoài niệm và sự tiện nghi tinh hoa của cuộc sống hiện đại.`}
            </p>
          </div>

          {/* Tiện nghi phân nhóm khoa học (Grouped Amenities) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <h2 className="text-xl font-bold text-[#0B1F3A]">{t('roomDetail.amenitiesIncluded')}</h2>
              <span className="text-xs font-semibold text-[#1F5AA6] bg-[#EAF2FB] px-3 py-1 rounded-full">
                {isEn ? 'Full 4★ Hotel Standard' : 'Đầy đủ 100% dịch vụ 4★'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              {/* Nhóm 1: Phòng ngủ & Nghỉ ngơi */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F5AA6] mb-3 flex items-center gap-2">
                  <BedDouble className="w-4 h-4" /> {isEn ? 'Bedroom & Comfort' : 'Phòng ngủ & Nghỉ ngơi'}
                </h3>
                <ul className="space-y-2.5 text-xs text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Independent pocket spring mattress' : 'Đệm lò xo túi độc lập êm ái'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Premium natural silk bed linen' : 'Bộ ga gối lụa tơ tằm cao cấp'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? '4-type customizable pillow menu' : 'Menu 4 loại gối tự chọn độ cao'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? '100% automated blackout curtains' : 'Rèm cản sáng tự động 100%'}
                  </li>
                </ul>
              </div>

              {/* Nhóm 2: Phòng tắm & Thư giãn */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F5AA6] mb-3 flex items-center gap-2">
                  <Bath className="w-4 h-4" /> {isEn ? 'Bathroom & Spa' : 'Phòng tắm & Vệ sinh'}
                </h3>
                <ul className="space-y-2.5 text-xs text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Deep soaking tub with mineral bath salts' : 'Bồn tắm nằm thư giãn với muối khoáng'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'High-pressure standing rainfall shower' : 'Vòi hoa sen mưa đứng áp lực cao'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Plush cotton bathrobes & soft slippers' : 'Áo choàng tắm sợi bông & dép êm'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? "Luxury L'Occitane toiletries set" : "Bộ đồ dùng vệ sinh L'Occitane cao cấp"}
                  </li>
                </ul>
              </div>

              {/* Nhóm 3: Công nghệ & Giải trí */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F5AA6] mb-3 flex items-center gap-2">
                  <Tv className="w-4 h-4" /> {isEn ? 'Tech & Connectivity' : 'Công nghệ & Kết nối'}
                </h3>
                <ul className="space-y-2.5 text-xs text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Smart TV 55" with Netflix & YouTube' : 'Smart TV 55" kết nối Netflix & YouTube'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'High-speed Wi-Fi 6 hotel coverage' : 'Wi-Fi 6 tốc độ cao phủ sóng toàn phòng'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Harman Kardon Bluetooth speaker' : 'Loa Bluetooth Harman Kardon âm vòm'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Bedside USB & Type-C charging ports' : 'Cổng sạc USB & Type-C đầu giường'}
                  </li>
                </ul>
              </div>

              {/* Nhóm 4: Ẩm thực & Đồ uống */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F5AA6] mb-3 flex items-center gap-2">
                  <Coffee className="w-4 h-4" /> {isEn ? 'Beverages & Minibar' : 'Đồ uống & Minibar'}
                </h3>
                <ul className="space-y-2.5 text-xs text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Complimentary 2 mineral waters daily' : 'Miễn phí 2 chai nước khoáng mỗi ngày'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Nespresso capsule coffee machine' : 'Máy pha cà phê viên nén Nespresso'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Premium chamomile & green tea selection' : 'Trà hoa cúc & trà xanh hảo hạng'}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {isEn ? 'Rapid chilling minibar refrigerator' : 'Tủ lạnh Minibar làm lạnh nhanh'}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quy định khách sạn & Chính sách hủy (Hotel Policies) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {t('room.policies')}
            </h2>
            <div className="space-y-4 text-xs text-[#475569] divide-y divide-slate-100">
              <div className="flex items-start gap-3 pt-3 first:pt-0">
                <Clock className="w-4 h-4 text-[#1F5AA6] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A] text-sm">
                    {isEn ? 'Check-in & Check-out times:' : 'Thời gian nhận & trả phòng:'}
                  </span>
                  <p className="mt-0.5">
                    {isEn
                      ? 'Check-in from 14:00 • Check-out before 12:00 noon. Early check-in supported based on room availability.'
                      : 'Nhận phòng từ 14:00 • Trả phòng trước 12:00 trưa hôm sau. Khách sạn hỗ trợ nhận phòng sớm tùy tình trạng buồng trống.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A] text-sm">
                    {isEn ? 'Flexible Cancellation Policy:' : 'Chính sách hủy phòng linh hoạt:'}
                  </span>
                  <p className="mt-0.5 text-emerald-700 font-medium">
                    {isEn
                      ? '100% free cancellation if canceled 24 hours prior to check-in.'
                      : 'Miễn phí 100% chi phí hủy phòng nếu hủy trước 24 giờ so với thời điểm nhận phòng.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A] text-sm">
                    {isEn ? 'Children & Baby Cot Policy:' : 'Quy định trẻ em & nôi em bé:'}
                  </span>
                  <p className="mt-0.5">
                    {isEn
                      ? 'Children under 6 stay free in existing bedding. Complimentary baby cots available upon advance request.'
                      : 'Trẻ em dưới 6 tuổi lưu trú miễn phí chung giường với cha mẹ. Khách sạn hỗ trợ kê nôi trẻ em miễn phí theo yêu cầu khi đặt trước.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Đánh giá & Nhận xét của khách lưu trú (Customer Reviews) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0B1F3A]">
                  {isEn ? 'Guest Reviews & Ratings' : 'Đánh giá từ khách lưu trú'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? '100% verified reviews from checked-out guests'
                    : '100% đánh giá xác thực từ khách hàng đã trả phòng'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-[#0F172A]">
                    {isEn ? 'Exceptional' : 'Tuyệt đỉnh'}
                  </div>
                  <div className="text-xs text-slate-500">
                    128 {isEn ? 'reviews' : 'nhận xét'}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#1F5AA6] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                  4.9
                </div>
              </div>
            </div>

            {/* Chi tiết từng tiêu chí */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-slate-500">{isEn ? 'Cleanliness' : 'Vệ sinh & Sạch sẽ'}</span>
                <div className="font-bold text-[#0F172A] text-sm mt-0.5">5.0 / 5.0</div>
              </div>
              <div>
                <span className="text-slate-500">{isEn ? 'Room Amenities' : 'Tiện nghi phòng'}</span>
                <div className="font-bold text-[#0F172A] text-sm mt-0.5">4.9 / 5.0</div>
              </div>
              <div>
                <span className="text-slate-500">{isEn ? 'Central Location' : 'Vị trí trung tâm'}</span>
                <div className="font-bold text-[#0F172A] text-sm mt-0.5">5.0 / 5.0</div>
              </div>
              <div>
                <span className="text-slate-500">{isEn ? 'Staff Service' : 'Thái độ phục vụ'}</span>
                <div className="font-bold text-[#0F172A] text-sm mt-0.5">4.9 / 5.0</div>
              </div>
            </div>

            {/* Danh sách 3 nhận xét mẫu */}
            <div className="space-y-4">
              {sampleReviews.map((rev, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1F5AA6]/10 text-[#1F5AA6] font-bold text-xs flex items-center justify-center">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#0F172A]">{rev.author}</span>
                        <span className="text-[10px] text-slate-400 block">{rev.date} • {rev.badge}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{rev.score.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG TÍNH GIÁ VÀ ĐẶT PHÒNG STICKY (4 Cột) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xl space-y-5">
            {/* Header giá phòng */}
            <div className="border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatCurrency(originalPerNight, language)}
                </span>
                <span className="bg-rose-50 text-rose-600 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {isEn ? 'Save 15%' : 'Tiết kiệm 15%'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#1F5AA6] tabular-nums">
                    {formatCurrency(roomType.basePrice, language)}
                  </span>
                  <span className="text-xs text-[#94A3B8] ml-1">{t('room.perNight')}</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {isEn ? 'Available' : 'Còn phòng trống'}
                </span>
              </div>
            </div>

            {/* Các trường điều khiển thời gian và lượng khách */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1F5AA6]" />
                  {isEn ? 'Stay Period' : 'Thời gian lưu trú'}
                </label>
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(s, e) => {
                    setStartDate(s);
                    setEndDate(e);
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#1F5AA6]" />
                  {isEn ? 'Guests & Rooms' : 'Khách & Số buồng phòng'}
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
            </div>

            {/* Bóc tách chi tiết giá (Transparent Price Breakdown) */}
            <div className="border-t border-[#E2E8F0] pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-[#475569]">
                <span>
                  {formatCurrency(roomType.basePrice, language)} &times; {nights} {t('search.nights')}
                </span>
                <span className="font-semibold tabular-nums text-[#0F172A]">
                  {formatCurrency(baseTotal, language)}
                </span>
              </div>

              <div className="flex justify-between text-[#475569]">
                <span className="flex items-center gap-1">
                  {t('room.serviceFee')} (5%)
                  <span title={isEn ? '4-star standard room service fee' : 'Phí dịch vụ buồng phòng tiêu chuẩn 4 sao'}>
                    <Info className="w-3 h-3 text-slate-400" />
                  </span>
                </span>
                <span className="font-semibold tabular-nums text-[#0F172A]">
                  {formatCurrency(serviceFee, language)}
                </span>
              </div>

              <div className="flex justify-between text-[#475569]">
                <span className="flex items-center gap-1">
                  {t('room.vat')} (8%)
                  <span title={isEn ? 'Value Added Tax (VAT)' : 'Thuế giá trị gia tăng'}>
                    <Info className="w-3 h-3 text-slate-400" />
                  </span>
                </span>
                <span className="font-semibold tabular-nums text-[#0F172A]">
                  {formatCurrency(vat, language)}
                </span>
              </div>

              {/* Tổng cộng */}
              <div className="flex justify-between items-baseline pt-3 border-t border-[#E2E8F0] text-sm font-bold text-[#0F172A]">
                <div>
                  <span>{t('room.totalPrice')}</span>
                  <span className="text-[10px] text-slate-400 block font-normal">
                    {isEn ? 'Includes taxes & service fees' : 'Đã gồm thuế & phí dịch vụ'}
                  </span>
                </div>
                <span className="text-2xl text-[#1F5AA6] tabular-nums font-extrabold">
                  {formatCurrency(grandTotal, language)}
                </span>
              </div>
            </div>

            {/* Nút hành động chính (Primary CTA) */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleBookNow}
              className="w-full bg-[#1F5AA6] hover:bg-[#184A8A] font-bold text-sm shadow-lg shadow-blue-900/10 py-3.5 transition active:scale-[0.99]"
            >
              {t('room.bookNow')}
            </Button>

            {/* Các bảo đảm uy tín */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-[#64748B]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isEn ? '10-minute instant hold during payment' : 'Khóa giữ phòng trong 10 phút thanh toán'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isEn ? 'No hidden fees at check-in' : 'Không phát sinh phụ phí ẩn khi nhận phòng'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#1F5AA6] shrink-0" />
                <span>
                  {isEn ? '24/7 Front desk support: ' : 'Hỗ trợ lễ tân 24/7: '}
                  <strong>1900 6868</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Khối gợi ý các hạng phòng tương tự (Similar Rooms) */}
      {similarRooms.length > 0 && (
        <section className="pt-10 border-t border-[#E2E8F0] space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0B1F3A]">{t('room.similarRooms')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isEn
                ? 'Equivalent room options for your perfect stay'
                : 'Các lựa chọn buồng phòng tương đương cho kỳ nghỉ hoàn hảo của bạn'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarRooms.map((sr) => (
              <RoomCard
                key={sr.id}
                roomType={sr}
                nights={nights}
                startDate={startDate}
                endDate={endDate}
                adults={adults}
                childrenCount={childrenCount}
                roomsCount={rooms}
                layout="grid"
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Modal Lightbox Xem Toàn Màn Hình Thư Viện Ảnh */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-white px-2 sm:px-4 py-2 border-b border-white/10">
            <div>
              <span className="text-sm sm:text-base font-bold text-amber-400">
                {isEn ? roomType.nameEn : roomType.name}
              </span>
              <span className="text-xs text-slate-300 ml-2">
                {isEn ? 'Photo' : 'Ảnh'} {selectedImageIndex + 1} / {images.length}
              </span>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full hover:bg-white/20 text-white transition"
              aria-label={isEn ? 'Close full photo' : 'Đóng ảnh phóng to'}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4">
            <img
              src={images[selectedImageIndex]}
              alt={isEn ? roomType.nameEn : roomType.name}
              className="max-h-[75vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() =>
                setSelectedImageIndex(
                  (selectedImageIndex - 1 + images.length) % images.length
                )
              }
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white transition backdrop-blur-xs"
              aria-label={isEn ? 'Previous photo' : 'Ảnh trước'}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                setSelectedImageIndex((selectedImageIndex + 1) % images.length)
              }
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white transition backdrop-blur-xs"
              aria-label={isEn ? 'Next photo' : 'Ảnh tiếp theo'}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dải thumbnail bên dưới */}
          <div className="flex justify-center gap-2 py-2 overflow-x-auto max-w-full">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="thumbnail"
                onClick={() => setSelectedImageIndex(i)}
                className={`w-16 sm:w-20 h-12 sm:h-14 object-cover rounded-lg cursor-pointer transition shrink-0 ${
                  i === selectedImageIndex
                    ? 'ring-2 ring-[#C9A227] scale-105 opacity-100'
                    : 'opacity-50 hover:opacity-80'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 7. Thanh Đặt Phòng Cố Định Đáy Màn Hình Cho Thiết Bị Di Động (Mobile Sticky Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 block">
            {isEn
              ? `Total (${nights} ${nights > 1 ? 'nights' : 'night'} • ${adults} ${adults > 1 ? 'guests' : 'guest'})`
              : `Tổng (${nights} đêm • ${adults} khách)`}
          </span>
          <span className="text-lg font-extrabold text-[#1F5AA6]">
            {formatCurrency(grandTotal, language)}
          </span>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleBookNow}
          className="bg-[#1F5AA6] hover:bg-[#184A8A] font-bold px-6 text-xs shadow-md shrink-0 py-2.5"
        >
          {t('room.bookNow')}
        </Button>
      </div>
    </div>
  );
};
