/**
 * ============================================================================
 * TÊN FILE: BookingStep1Page.tsx
 * VỊ TRÍ: src/pages/customer/BookingStep1Page.tsx
 * PHÂN HỆ: Quy trình Đặt phòng Khách hàng - Bước 1 (TASK-20: Guest Info & Extra Services)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Tiếp nhận thông tin phòng đã chọn từ RoomDetailPage hoặc SearchResultsPage.
 * - Xác nhận kỳ lưu trú (ngày nhận, trả, số đêm, số phòng và số lượng khách).
 * - Thu thập thông tin cá nhân khách đặt phòng (Họ tên, SĐT, Email, Giờ nhận phòng, Yêu cầu đặc biệt).
 * - Cho phép chọn thêm các dịch vụ gia tăng (Add-on Services: Buffet sáng, Đưa đón sân bay,
 *   Spa thư giãn, Giường phụ, Giặt là) với bộ đếm số lượng (+/-) linh hoạt.
 * - Áp dụng đúng công thức tính phụ phí từ BA/PO:
 *     + Đưa đón sân bay: tính theo chuyến (1 chiều / 2 chiều khứ hồi).
 *     + Buffet sáng: tính theo đầu người/ngày (suất), hỗ trợ gợi ý tự động (khách × đêm).
 *     + Giường phụ: tính theo đêm.
 *     + Giặt ủi: tính theo bộ.
 *     + Spa: tính theo liệu trình.
 * - Nhập mã ưu đãi giảm giá (PB-15 Promo Code: NITRO10 - 10%, VIP4STAR - 15%, SUMMER200 - 200k).
 * - Khởi chạy bộ đếm giữ phòng tạm thời (HoldCountdown) chống xung đột phòng ảo.
 * - Bảng tóm tắt chi phí Sticky bên phải cập nhật thời gian thực:
 *     Tiền phòng (basePrice × đêm × phòng) - Giảm giá + Phụ phí dịch vụ + Phí dịch vụ (5%) + VAT (8%).
 * - Lưu trữ trạng thái toàn vẹn vào AppContext (draftBooking) trước khi chuyển sang Bước 2.
 * ============================================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BedDouble,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Flower2,
  Gift,
  HelpCircle,
  Info,
  Luggage,
  Minus,
  Percent,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Users,
  Utensils,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { HoldCountdown } from '../../components/common/HoldCountdown';
import { useApp } from '../../context/AppContext';
import { MOCK_ROOM_TYPES, MOCK_SERVICES } from '../../mocks/data';
import { ExtraServiceItem, HotelService } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

// Quick tags for special requests
const QUICK_REQUEST_TAGS = [
  'Phòng tầng cao thoáng đãng',
  'Phòng yên tĩnh, xa thang máy',
  'Phòng không hút thuốc',
  'Chuẩn bị nôi trẻ em',
  'Giường King lớn',
  'Nhận phòng sớm nếu có thể',
  'Trang trí phòng trăng mật (Honeymoon)',
];

// Preset promo voucher codes for easy testing and conversion (PB-15)
const PRESET_VOUCHERS = [
  { code: 'NITRO10', label: 'Giảm 10% tiền phòng', rate: 0.1, fixed: 0 },
  { code: 'VIP4STAR', label: 'Giảm 15% VIP Member', rate: 0.15, fixed: 0 },
  { code: 'SUMMER200', label: 'Giảm 200.000 ₫ trực tiếp', rate: 0, fixed: 200000 },
];

export const BookingStep1Page: React.FC = () => {
  const { t } = useTranslation();
  const { draftBooking, setDraftBooking, currentUser, language, resetHoldCountdown } = useApp();
  const navigate = useNavigate();

  // If no active draft booking, initialize a default 4-star room draft so user can test directly
  useEffect(() => {
    if (!draftBooking || !draftBooking.roomTypeId) {
      const today = new Date();
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() + 1);
      const checkOut = new Date(today);
      checkOut.setDate(today.getDate() + 3);

      const inStr = checkIn.toISOString().split('T')[0];
      const outStr = checkOut.toISOString().split('T')[0];

      setDraftBooking({
        roomTypeId: 'rt-03',
        roomTypeName: 'Deluxe City View',
        checkInDate: inStr,
        checkOutDate: outStr,
        nights: 2,
        adults: 2,
        children: 0,
        roomsCount: 1,
        totalAmount: 1850000 * 2,
      });
    }
    resetHoldCountdown();
  }, [draftBooking, setDraftBooking, resetHoldCountdown]);

  const roomType = useMemo(() => {
    return (
      MOCK_ROOM_TYPES.find((rt) => rt.id === draftBooking?.roomTypeId) ||
      MOCK_ROOM_TYPES[2] ||
      MOCK_ROOM_TYPES[0]
    );
  }, [draftBooking?.roomTypeId]);

  // Stay parameters
  const nights = Math.max(1, draftBooking?.nights || 1);
  const adults = Math.max(1, draftBooking?.adults || 2);
  const children = draftBooking?.children || 0;
  const [roomsCount, setRoomsCount] = useState<number>(draftBooking?.roomsCount || 1);

  // Form states
  const [fullName, setFullName] = useState(draftBooking?.guestName || currentUser.name || '');
  const [phone, setPhone] = useState(draftBooking?.guestPhone || currentUser.phone || '');
  const [email, setEmail] = useState(draftBooking?.guestEmail || currentUser.email || '');
  const [arrivalTime, setArrivalTime] = useState(
    draftBooking?.estimatedArrivalTime || '14:00 - 16:00 (Tiêu chuẩn)'
  );
  const [specialRequests, setSpecialRequests] = useState(draftBooking?.specialRequests || '');

  // Validation errors
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});

  // Extra services selected with quantity
  const [selectedServices, setSelectedServices] = useState<ExtraServiceItem[]>(
    draftBooking?.extraServices || []
  );

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState(draftBooking?.discountCode || '');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    label: string;
    rate: number;
    fixed: number;
  } | null>(
    draftBooking?.discountCode === 'NITRO10'
      ? { code: 'NITRO10', label: 'Giảm 10% tiền phòng', rate: 0.1, fixed: 0 }
      : null
  );
  const [promoStatus, setPromoStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [promoMessage, setPromoMessage] = useState('');

  // --------------------------------------------------------------------------
  // FINANCIAL CALCULATIONS (BA/PO Formulas)
  // --------------------------------------------------------------------------
  const baseRoomTotal = roomType.basePrice * nights * roomsCount;

  // Calculate discount on room total
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.rate > 0) {
      return Math.round(baseRoomTotal * appliedPromo.rate);
    }
    if (appliedPromo.fixed > 0) {
      return Math.min(appliedPromo.fixed, baseRoomTotal);
    }
    return 0;
  }, [appliedPromo, baseRoomTotal]);

  // Services Total (Price × Quantity for each add-on)
  const servicesTotal = useMemo(() => {
    return selectedServices.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }, [selectedServices]);

  // Subtotal after room discount + services
  const subtotalAfterDiscount = Math.max(0, baseRoomTotal - discountAmount) + servicesTotal;

  // Hotel service charge (5%) and VAT tax (8%)
  const serviceFee = Math.round(subtotalAfterDiscount * 0.05);
  const vat = Math.round(subtotalAfterDiscount * 0.08);
  const finalTotal = subtotalAfterDiscount + serviceFee + vat;

  // --------------------------------------------------------------------------
  // SERVICE TOGGLE & QUANTITY HANDLERS
  // --------------------------------------------------------------------------
  const handleToggleService = (svc: HotelService) => {
    const existingIndex = selectedServices.findIndex((s) => s.id === svc.id);
    if (existingIndex >= 0) {
      setSelectedServices(selectedServices.filter((s) => s.id !== svc.id));
    } else {
      // Default recommended quantity based on service type
      let defaultQty = 1;
      if (svc.id === 'svc-02') {
        // Buffet: recommend adults * nights
        defaultQty = adults * nights;
      }
      setSelectedServices([
        ...selectedServices,
        {
          id: svc.id,
          name: svc.name,
          nameEn: svc.nameEn,
          price: svc.price,
          quantity: defaultQty,
          unit: svc.unit,
          unitEn: svc.unitEn,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (serviceId: string, delta: number) => {
    setSelectedServices((prev) =>
      prev
        .map((item) => {
          if (item.id === serviceId) {
            const currentQty = item.quantity || 1;
            const newQty = currentQty + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: Math.min(20, newQty) };
          }
          return item;
        })
        .filter(Boolean) as ExtraServiceItem[]
    );
  };

  const handleSetExactQuantity = (serviceId: string, qty: number) => {
    setSelectedServices((prev) =>
      prev.map((item) => (item.id === serviceId ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  // --------------------------------------------------------------------------
  // PROMO CODE APPLICATION
  // --------------------------------------------------------------------------
  const applyVoucher = (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setPromoStatus('error');
      setPromoMessage('Vui lòng nhập mã khuyến mãi');
      return;
    }

    const matched = PRESET_VOUCHERS.find((v) => v.code === code);
    if (matched) {
      setAppliedPromo(matched);
      setPromoCodeInput(matched.code);
      setPromoStatus('success');
      setPromoMessage(`Áp dụng thành công mã ${matched.code} (${matched.label})`);
    } else if (code === 'WELCOME' || code === 'HOTEL50') {
      const welcomeVoucher = {
        code,
        label: 'Giảm 50.000 ₫ cho khách hàng mới',
        rate: 0,
        fixed: 50000,
      };
      setAppliedPromo(welcomeVoucher);
      setPromoCodeInput(code);
      setPromoStatus('success');
      setPromoMessage('Áp dụng mã ưu đãi chào mừng thành công');
    } else {
      setAppliedPromo(null);
      setPromoStatus('error');
      setPromoMessage('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoStatus('idle');
    setPromoMessage('');
  };

  // --------------------------------------------------------------------------
  // SPECIAL REQUEST TAG CHIP TOGGLE
  // --------------------------------------------------------------------------
  const handleToggleRequestTag = (tagText: string) => {
    if (specialRequests.includes(tagText)) {
      const updated = specialRequests
        .replace(tagText, '')
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*|,\s*$/g, '')
        .trim();
      setSpecialRequests(updated);
    } else {
      const prefix = specialRequests.trim() ? `${specialRequests.trim()}, ` : '';
      setSpecialRequests(`${prefix}${tagText}`);
    }
  };

  // --------------------------------------------------------------------------
  // FORM VALIDATION & SUBMISSION
  // --------------------------------------------------------------------------
  const validateForm = (): boolean => {
    const errs: { fullName?: string; phone?: string; email?: string } = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự)';
    }

    if (!phone.trim()) {
      errs.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^0\d{9}$/.test(phone.trim())) {
      errs.phone = 'Số điện thoại không hợp lệ (gồm 10 chữ số bắt đầu bằng số 0)';
    }

    if (!email.trim()) {
      errs.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Địa chỉ email không đúng định dạng';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // Persist full draft booking state into AppContext
    setDraftBooking((prev) => ({
      ...prev,
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      roomsCount,
      nights,
      adults,
      children,
      guestName: fullName.trim(),
      guestPhone: phone.trim(),
      guestEmail: email.trim(),
      estimatedArrivalTime: arrivalTime,
      specialRequests: specialRequests.trim(),
      extraServices: selectedServices,
      discountCode: appliedPromo?.code,
      discountAmount,
      serviceFee,
      vatAmount: vat,
      totalAmount: finalTotal,
    }));

    // Transition smoothly to Step 2 (Payment)
    navigate('/booking/step-2');
  };

  // Helper for rendering category icons
  const renderServiceIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Car':
        return <Car className="w-5 h-5 text-blue-600" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-600" />;
      case 'BedDouble':
        return <BedDouble className="w-5 h-5 text-purple-600" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-indigo-600" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'Flower2':
        return <Flower2 className="w-5 h-5 text-rose-600" />;
      default:
        return <Luggage className="w-5 h-5 text-primary-600" />;
    }
  };

  const getServiceCategoryBadge = (svcId: string) => {
    switch (svcId) {
      case 'svc-01':
        return { label: 'Di chuyển sân bay', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'svc-02':
        return { label: 'Ẩm thực 4★ Buffet', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'svc-03':
        return { label: 'Tiện nghi phòng', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'svc-04':
        return { label: 'Giờ giấc linh hoạt', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'svc-05':
        return { label: 'Dịch vụ phòng nhanh', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'svc-06':
        return { label: 'Chăm sóc sức khỏe', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'Dịch vụ cộng thêm', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Stepper & Hold Notice */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Stepper */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2 text-[#1F5AA6] bg-blue-50/70 px-3 py-1.5 rounded-full border border-blue-200/60">
            <span className="w-5 h-5 rounded-full bg-[#1F5AA6] text-white flex items-center justify-center font-bold text-[11px]">
              1
            </span>
            <span className="font-bold">{t('booking.step1')} & Dịch vụ</span>
          </div>
          <span className="text-slate-300 font-bold">&rarr;</span>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px]">
              2
            </span>
            <span>{t('booking.step2')}</span>
          </div>
          <span className="text-slate-300 font-bold">&rarr;</span>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px]">
              3
            </span>
            <span>{t('booking.step3')}</span>
          </div>
        </div>

        {/* Hold Countdown Component */}
        <HoldCountdown />
      </div>

      {/* Main Grid: Form (7 cols) + Sticky Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleContinue} className="space-y-6">
            {/* 1. ACCOMMODATION RECAP & ROOM QUANTITY ADJUSTMENT */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-[#1F5AA6]" />
                  Xác nhận kỳ nghỉ & Số lượng phòng
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1F5AA6] border border-blue-200">
                  {roomType.code}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <img
                    src={roomType.image}
                    alt={roomType.name}
                    className="w-16 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{roomType.name}</h3>
                    <div className="text-xs text-[#475569] mt-0.5">
                      {roomType.area} m² • {roomType.bedType} • Tối đa {roomType.maxGuests} khách
                    </div>
                  </div>
                </div>

                {/* Room Counter Stepper */}
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-2xs self-end sm:self-auto">
                  <span className="text-xs font-semibold text-[#475569]">Số phòng:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={roomsCount <= 1}
                      onClick={() => setRoomsCount((prev) => Math.max(1, prev - 1))}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-[#0F172A] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Giảm số phòng"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold text-[#0F172A] w-5 text-center">
                      {roomsCount}
                    </span>
                    <button
                      type="button"
                      disabled={roomsCount >= 5}
                      onClick={() => setRoomsCount((prev) => Math.min(5, prev + 1))}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-[#0F172A] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Tăng số phòng"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#475569] pt-1">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-400">Nhận phòng</div>
                  <div className="font-bold text-[#0F172A]">
                    {formatDate(draftBooking?.checkInDate || '')}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-400">Trả phòng</div>
                  <div className="font-bold text-[#0F172A]">
                    {formatDate(draftBooking?.checkOutDate || '')}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-400">Thời lượng</div>
                  <div className="font-bold text-[#1F5AA6]">{nights} đêm</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-400">Khách lưu trú</div>
                  <div className="font-bold text-[#0F172A]">
                    {adults} lớn{children > 0 ? `, ${children} trẻ` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GUEST CONTACT INFO */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <Users className="w-4 h-4 text-[#1F5AA6]" />
                {t('booking.guestInfo')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    {t('booking.fullName')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    placeholder="VD: Nguyễn Văn An"
                    className={`w-full text-sm px-3.5 py-2.5 rounded-lg border ${
                      errors.fullName ? 'border-rose-500 bg-rose-50/20' : 'border-[#E2E8F0]'
                    } focus:outline-none focus:ring-2 focus:ring-[#1F5AA6] transition`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5">
                      {t('booking.phone')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      placeholder="0901234567"
                      className={`w-full text-sm px-3.5 py-2.5 rounded-lg border ${
                        errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:ring-2 focus:ring-[#1F5AA6] transition`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5">
                      {t('booking.email')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="an.nguyen@example.com"
                      className={`w-full text-sm px-3.5 py-2.5 rounded-lg border ${
                        errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:ring-2 focus:ring-[#1F5AA6] transition`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    {t('booking.arrivalTime')}
                  </label>
                  <select
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1F5AA6] bg-white cursor-pointer"
                  >
                    <option value="14:00 - 16:00 (Tiêu chuẩn)">
                      14:00 - 16:00 (Tiêu chuẩn khách sạn)
                    </option>
                    <option value="16:00 - 18:00 (Buổi chiều)">16:00 - 18:00 (Buổi chiều)</option>
                    <option value="18:00 - 20:00 (Buổi tối)">18:00 - 20:00 (Buổi tối)</option>
                    <option value="Sau 20:00 (Đến muộn - Khách sạn giữ phòng)">
                      Sau 20:00 (Đến muộn - Khách sạn giữ phòng sau 20h)
                    </option>
                    <option value="Trước 14:00 (Yêu cầu nhận phòng sớm)">
                      Trước 14:00 (Yêu cầu nhận phòng sớm tùy thuộc tình trạng buồng)
                    </option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#475569]">
                      {t('booking.specialRequests')}
                    </label>
                    <span className="text-[11px] text-slate-400">Không cam kết 100%</span>
                  </div>

                  {/* Quick Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {QUICK_REQUEST_TAGS.map((tagText) => {
                      const isSelected = specialRequests.includes(tagText);
                      return (
                        <button
                          key={tagText}
                          type="button"
                          onClick={() => handleToggleRequestTag(tagText)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
                            isSelected
                              ? 'bg-blue-50 text-[#1F5AA6] border-blue-300 font-semibold'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-[#1F5AA6]" />}
                          <span>{tagText}</span>
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Ví dụ: Cần phòng tầng cao yên tĩnh, chuẩn bị nôi em bé hoặc hoa tươi kỷ niệm..."
                    className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1F5AA6] transition"
                  />
                </div>
              </div>
            </div>

            {/* 3. EXTRA ADD-ON SERVICES (TASK-20: CÔNG THỨC PHỤ PHÍ BA/PO) */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9A227]" />
                    {t('booking.extraServices')}
                  </h2>
                  <p className="text-xs text-[#475569] mt-0.5">
                    Tối ưu hóa kỳ nghỉ với biểu phí ưu đãi trực tuyến độc quyền từ khách sạn.
                  </p>
                </div>
                {selectedServices.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đã chọn {selectedServices.length} dịch vụ
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {MOCK_SERVICES.map((svc) => {
                  const selectedItem = selectedServices.find((s) => s.id === svc.id);
                  const isChecked = !!selectedItem;
                  const qty = selectedItem?.quantity || 1;
                  const itemTotal = svc.price * qty;
                  const cat = getServiceCategoryBadge(svc.id);

                  return (
                    <div
                      key={svc.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-[#1F5AA6] bg-blue-50/30 ring-1 ring-[#1F5AA6]/20'
                          : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Checkbox & Details */}
                        <div className="flex items-start gap-3.5 flex-1">
                          <input
                            type="checkbox"
                            id={`svc-${svc.id}`}
                            checked={isChecked}
                            onChange={() => handleToggleService(svc)}
                            className="w-4 h-4 mt-1 rounded text-[#1F5AA6] focus:ring-[#1F5AA6] cursor-pointer"
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <label
                                htmlFor={`svc-${svc.id}`}
                                className="text-sm font-bold text-[#0F172A] cursor-pointer hover:text-[#1F5AA6] transition"
                              >
                                {svc.name}
                              </label>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cat.bg}`}
                              >
                                {cat.label}
                              </span>
                            </div>

                            <p className="text-xs text-[#475569] leading-relaxed">
                              {svc.description}
                            </p>

                            {/* Service smart helpers */}
                            {svc.id === 'svc-02' && (
                              <div className="text-[11px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded-md border border-amber-200 inline-flex items-center gap-1.5 mt-1">
                                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                                <span>
                                  Khuyến nghị: {adults} khách × {nights} đêm = {adults * nights}{' '}
                                  suất buffet ({formatCurrency(adults * nights * svc.price)})
                                </span>
                              </div>
                            )}

                            {svc.id === 'svc-01' && (
                              <div className="text-[11px] text-blue-700 bg-blue-50/80 px-2 py-1 rounded-md border border-blue-200 inline-flex items-center gap-1.5 mt-1">
                                <Car className="w-3.5 h-3.5 text-blue-600" />
                                <span>
                                  Xe riêng sang trọng: 1 chuyến (Đón hoặc Tiễn) hoặc 2 chuyến (Khứ
                                  hồi hai chiều)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price & Icon */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end gap-1.5 mb-1">
                            {renderServiceIcon(svc.icon)}
                          </div>
                          <div className="text-xs font-bold text-[#1F5AA6]">
                            +{formatCurrency(svc.price, language)}
                          </div>
                          <div className="text-[11px] text-slate-400">/ {svc.unit}</div>
                        </div>
                      </div>

                      {/* Expanded Quantity Controls when Checked */}
                      {isChecked && (
                        <div className="mt-3 pt-3 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#475569]">
                              Số lượng ({svc.unit}):
                            </span>
                            <div className="flex items-center gap-1 bg-white border border-blue-200 rounded-lg p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(svc.id, -1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-[#0F172A] flex items-center justify-center transition"
                                aria-label="Giảm số lượng"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-[#0F172A]">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(svc.id, 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-[#0F172A] flex items-center justify-center transition"
                                aria-label="Tăng số lượng"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Quick recommendation button for buffet */}
                            {svc.id === 'svc-02' && qty !== adults * nights && (
                              <button
                                type="button"
                                onClick={() => handleSetExactQuantity(svc.id, adults * nights)}
                                className="text-[11px] text-[#1F5AA6] hover:underline font-semibold ml-1"
                              >
                                (Đặt đủ {adults * nights} suất)
                              </button>
                            )}

                            {/* Quick round trip button for airport pickup */}
                            {svc.id === 'svc-01' && qty === 1 && (
                              <button
                                type="button"
                                onClick={() => handleSetExactQuantity(svc.id, 2)}
                                className="text-[11px] text-[#1F5AA6] hover:underline font-semibold ml-1"
                              >
                                (Khứ hồi 2 chiều)
                              </button>
                            )}
                          </div>

                          <div className="text-xs font-bold text-[#0F172A] self-end sm:self-auto">
                            <span className="text-[#475569] font-normal mr-1.5">Tạm tính:</span>
                            <span className="text-[#1F5AA6] font-extrabold text-sm">
                              {formatCurrency(itemTotal, language)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. PROMO VOUCHER CODE (PB-15) */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <Tag className="w-4 h-4 text-[#C9A227]" />
                {t('booking.promoCode')}
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => {
                    setPromoCodeInput(e.target.value.toUpperCase());
                    if (promoStatus !== 'idle') setPromoStatus('idle');
                  }}
                  placeholder="Nhập mã (VD: NITRO10, VIP4STAR)"
                  className="flex-1 text-sm px-3.5 py-2 uppercase font-mono rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6] focus:outline-none transition"
                />
                {appliedPromo ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleRemovePromo}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
                  >
                    <Trash2 className="w-4 h-4 mr-1 text-rose-500" />
                    Hủy mã
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => applyVoucher(promoCodeInput)}
                    className="font-bold border-[#1F5AA6] text-[#1F5AA6] hover:bg-blue-50"
                  >
                    {t('booking.applyCode')}
                  </Button>
                )}
              </div>

              {/* Quick voucher chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-[#475569] font-medium mr-1">Gợi ý mã:</span>
                {PRESET_VOUCHERS.map((v) => (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => applyVoucher(v.code)}
                    className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition font-mono font-bold"
                  >
                    {v.code} ({v.label})
                  </button>
                ))}
              </div>

              {promoStatus === 'success' && (
                <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{promoMessage}</span>
                  </div>
                  <span className="font-bold text-emerald-700">
                    -{formatCurrency(discountAmount, language)}
                  </span>
                </div>
              )}

              {promoStatus === 'error' && (
                <div className="text-xs text-rose-800 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{promoMessage}</span>
                </div>
              )}
            </div>

            {/* Submit Action Bar */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <Link
                to={`/rooms/${roomType.id}`}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] py-2 px-3 rounded-lg hover:bg-slate-100 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('booking.backToRooms')}
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto bg-[#1F5AA6] hover:bg-[#184A8A] font-bold shadow-md px-8 py-3 text-sm"
              >
                {t('booking.continueToPayment')} &rarr;
              </Button>
            </div>
          </form>
        </div>

        {/* Right Sticky Summary Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-lg p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#0F172A]">Tóm tắt đặt phòng</h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Giá tốt nhất 4★
              </span>
            </div>

            {/* Room Info Card */}
            <div className="flex gap-3.5">
              <img
                src={roomType.image}
                alt={roomType.name}
                className="w-24 h-20 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
              />
              <div>
                <span className="text-[11px] font-extrabold text-[#1F5AA6] bg-blue-50 px-1.5 py-0.5 rounded">
                  {roomType.code}
                </span>
                <div className="text-sm font-bold text-[#0F172A] mt-1 leading-snug">
                  {roomType.name}
                </div>
                <div className="text-xs text-[#475569] mt-1">
                  {roomType.area} m² • {roomType.bedType}
                </div>
              </div>
            </div>

            {/* Dates & Capacity Recap */}
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">{t('search.checkIn')}:</span>
                <span className="font-bold text-[#0F172A]">
                  {formatDate(draftBooking?.checkInDate || '')} (từ 14:00)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#475569]">{t('search.checkOut')}:</span>
                <span className="font-bold text-[#0F172A]">
                  {formatDate(draftBooking?.checkOutDate || '')} (trước 12:00)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                <span className="text-[#475569]">Quy mô lưu trú:</span>
                <span className="font-bold text-[#1F5AA6]">
                  {roomsCount} phòng • {nights} đêm • {adults} người lớn
                  {children > 0 ? `, ${children} trẻ em` : ''}
                </span>
              </div>
            </div>

            {/* Itemized Price Breakdown (BA/PO Formula) */}
            <div className="space-y-2.5 text-xs border-t border-[#E2E8F0] pt-4">
              <div className="flex justify-between text-[#475569]">
                <span>
                  Tiền phòng ({nights} đêm × {roomsCount} phòng):
                </span>
                <span className="font-semibold tabular-nums text-[#0F172A]">
                  {formatCurrency(baseRoomTotal, language)}
                </span>
              </div>

              {appliedPromo && discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/60 px-2 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Voucher ({appliedPromo.code}):
                  </span>
                  <span className="tabular-nums">-{formatCurrency(discountAmount, language)}</span>
                </div>
              )}

              {/* Extra Services Sub-items */}
              {selectedServices.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-dashed border-slate-200">
                  <div className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    Dịch vụ cộng thêm ({selectedServices.length}):
                  </div>
                  {selectedServices.map((svc) => (
                    <div
                      key={svc.id}
                      className="flex justify-between text-[#475569] pl-2 border-l-2 border-blue-300 py-0.5"
                    >
                      <span className="truncate pr-2">
                        + {svc.name} <span className="font-bold text-[#1F5AA6]">(x{svc.quantity || 1})</span>:
                      </span>
                      <span className="font-semibold tabular-nums text-[#0F172A] shrink-0">
                        {formatCurrency(svc.price * (svc.quantity || 1), language)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium text-slate-600 pt-0.5">
                    <span>Tổng tiền dịch vụ:</span>
                    <span className="font-bold tabular-nums">
                      {formatCurrency(servicesTotal, language)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-[#475569] pt-2 border-t border-slate-100">
                <span>Phí dịch vụ khách sạn (5%):</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(serviceFee, language)}
                </span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Thuế giá trị gia tăng (VAT 8%):</span>
                <span className="font-semibold tabular-nums">{formatCurrency(vat, language)}</span>
              </div>

              {/* Final Payable Total */}
              <div className="flex justify-between items-baseline pt-3 border-t border-[#E2E8F0] text-sm font-bold text-[#0F172A]">
                <span>{t('room.totalPrice')}:</span>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl text-[#1F5AA6] tabular-nums font-extrabold">
                    {formatCurrency(finalTotal, language)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Đã bao gồm 5% phí phục vụ & 8% thuế VAT
                  </div>
                </div>
              </div>
            </div>

            {/* Policy & Trust Guarantee Notice */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Hủy phòng linh hoạt</div>
                  <div>Hủy miễn phí trước 48 giờ trước ngày nhận phòng theo quy định.</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#475569] px-1 pt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mã hóa SSL 256-bit</span>
                </div>
                <div>Hotline: <span className="font-bold text-[#1F5AA6]">1900 6868</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
