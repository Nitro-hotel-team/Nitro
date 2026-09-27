/**
 * ============================================================================
 * TÊN FILE: BookingStep1Page.tsx
 * VỊ TRÍ: src/pages/customer/BookingStep1Page.tsx
 * PHÂN HỆ: Quy trình Đặt phòng Khách hàng - Bước 1 (Guest Info & Add-ons)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Thu thập thông tin cá nhân khách đặt phòng (Họ tên, SĐT, Email, Giờ nhận phòng, Ghi chú).
 * - Cho phép chọn thêm các dịch vụ gia tăng (Add-on Services: Buffet sáng, Xe đón tiễn sân bay,
 *   Spa thư giãn, Giặt là).
 * - Nhập mã ưu đãi giảm giá (Promo Code: NITRO10 - giảm ngay 10%).
 * - Khởi chạy bộ đếm giữ phòng tạm thời 10 phút (HoldCountdown) để chống xung đột phòng ảo.
 * - Sidebar hiển thị tóm tắt chi phí thời gian thực (Giá gốc + Dịch vụ + VAT 8% - Giảm giá).
 * - Nút điều hướng chuyển tiếp sang Bước 2 (Thanh toán).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  HelpCircle,
  Luggage,
  ShieldCheck,
  Tag,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { HoldCountdown } from '../../components/common/HoldCountdown';
import { useApp } from '../../context/AppContext';
import { roomService, hotelServiceService } from '../../services/api';
import { ExtraServiceItem, HotelService, RoomType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const BookingStep1Page: React.FC = () => {
  const { t } = useTranslation();
  const { draftBooking, setDraftBooking, currentUser, language, resetHoldCountdown } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [services, setServices] = useState<HotelService[]>([]);

  // Redirect if no active draft booking
  useEffect(() => {
    if (!draftBooking || !draftBooking.roomTypeId) {
      navigate('/rooms');
    } else {
      const fetchData = async () => {
        try {
          const [fetchedRoomType, fetchedServices] = await Promise.all([
            roomService.getRoomTypeById(draftBooking.roomTypeId),
            hotelServiceService.getServices()
          ]);
          setRoomType(fetchedRoomType);
          setServices(fetchedServices);
        } catch (error) {
          console.error("Failed to load data", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [draftBooking, navigate]);

  // Form states
  const [fullName, setFullName] = useState(draftBooking?.guestName || currentUser?.name || '');
  const [phone, setPhone] = useState(draftBooking?.guestPhone || currentUser?.phone || '');
  const [email, setEmail] = useState(draftBooking?.guestEmail || currentUser?.email || '');
  const [arrivalTime, setArrivalTime] = useState(draftBooking?.estimatedArrivalTime || '14:00 - 16:00');
  const [specialRequests, setSpecialRequests] = useState(draftBooking?.specialRequests || '');

  // Validation errors
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});

  // Extra services selected
  const [selectedServices, setSelectedServices] = useState<ExtraServiceItem[]>(
    draftBooking?.extraServices || []
  );

  // Promo code
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDiscountRate, setPromoDiscountRate] = useState(0); // 0 or 0.1 (10%)
  const [promoStatus, setPromoStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (loading) {
    return <div className="max-w-6xl mx-auto p-8 text-center text-slate-500 text-sm font-semibold">Đang tải dữ liệu đặt phòng...</div>;
  }
  
  if (!roomType) {
    return <div className="max-w-6xl mx-auto p-8 text-center text-rose-500 font-bold">Không tìm thấy thông tin loại phòng.</div>;
  }

  const nights = draftBooking?.nights || 1;
  const baseRoomTotal = roomType.basePrice * nights;
  const servicesTotal = selectedServices.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const discountAmount = Math.round(baseRoomTotal * promoDiscountRate);
  const subtotalAfterDiscount = baseRoomTotal - discountAmount + servicesTotal;
  const serviceFee = Math.round(subtotalAfterDiscount * 0.05);
  const vat = Math.round(subtotalAfterDiscount * 0.08);
  const finalTotal = subtotalAfterDiscount + serviceFee + vat;

  const handleToggleService = (svc: HotelService) => {
    const exists = selectedServices.find((s) => s.id === svc.id);
    if (exists) {
      setSelectedServices(selectedServices.filter((s) => s.id !== svc.id));
    } else {
      setSelectedServices([
        ...selectedServices,
        { id: svc.id, name: svc.name, nameEn: svc.nameEn, price: svc.price, quantity: 1 },
      ]);
    }
  };

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'NITRO10' || code === 'WELCOME' || code === 'VIP4STAR') {
      setPromoDiscountRate(0.1); // 10%
      setPromoStatus('success');
    } else {
      setPromoDiscountRate(0);
      setPromoStatus('error');
    }
  };

  const validateForm = (): boolean => {
    const errs: { fullName?: string; phone?: string; email?: string } = {};
    if (!fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên';
    if (!phone.trim()) {
      errs.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^0\d{9}$/.test(phone.trim())) {
      errs.phone = 'Số điện thoại phải gồm 10 chữ số bắt đầu bằng số 0';
    }
    if (!email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Email không hợp lệ';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setDraftBooking((prev) => ({
      ...prev,
      guestName: fullName,
      guestPhone: phone,
      guestEmail: email,
      estimatedArrivalTime: arrivalTime,
      specialRequests,
      extraServices: selectedServices,
      totalAmount: finalTotal,
    }));

    navigate('/booking/step-2');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Stepper & Hold Notice */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Stepper */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-[#1F5AA6]">
            <span className="w-6 h-6 rounded-full bg-[#1F5AA6] text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <span>{t('booking.step1')}</span>
          </div>
          <span className="text-slate-300">&rarr;</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <span>{t('booking.step2')}</span>
          </div>
          <span className="text-slate-300">&rarr;</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <span>{t('booking.step3')}</span>
          </div>
        </div>

        {/* Hold Countdown */}
        <HoldCountdown />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleContinue} className="space-y-6">
            {/* Guest Contact Box */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <Users className="w-4 h-4 text-[#1F5AA6]" />
                {t('booking.guestInfo')}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    {t('booking.fullName')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className={`w-full text-sm px-3.5 py-2.5 rounded-lg border ${
                      errors.fullName ? 'border-rose-500 bg-rose-50/20' : 'border-[#E2E8F0]'
                    } focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">
                      {t('booking.phone')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      className={`w-full text-sm px-3.5 py-2.5 rounded-lg border ${
                        errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">
                      {t('booking.email')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="an.nguyen@example.com"
                      className={`w-full text-sm px-3.5 py-2.5 rounded-lg border ${
                        errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-[#E2E8F0]'
                      } focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    {t('booking.arrivalTime')}
                  </label>
                  <select
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1F5AA6] bg-white"
                  >
                    <option value="14:00 - 16:00">14:00 - 16:00 (Tiêu chuẩn)</option>
                    <option value="16:00 - 18:00">16:00 - 18:00</option>
                    <option value="18:00 - 20:00">18:00 - 20:00 (Buổi tối)</option>
                    <option value="Sau 20:00">Sau 20:00 (Đến muộn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    {t('booking.specialRequests')}
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Ví dụ: Phòng tầng cao, phòng không hút thuốc, chuẩn bị nôi trẻ em..."
                    className="w-full text-sm px-3.5 py-2 rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
                  />
                </div>
              </div>
            </div>

            {/* Extra Services Add-ons */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <Luggage className="w-4 h-4 text-[#1F5AA6]" />
                {t('booking.extraServices')}
              </h2>

              <div className="space-y-2.5">
                {services.map((svc) => {
                  const isChecked = selectedServices.some((s) => s.id === svc.id);
                  return (
                    <label
                      key={svc.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                        isChecked
                          ? 'border-[#1F5AA6] bg-blue-50/50'
                          : 'border-[#E2E8F0] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleService(svc)}
                          className="w-4 h-4 rounded text-[#1F5AA6] focus:ring-[#1F5AA6]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#0F172A]">{svc.name}</div>
                          <div className="text-[11px] text-[#475569]">{svc.description}</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#1F5AA6] shrink-0 ml-2">
                        +{formatCurrency(svc.price, language)} / {svc.unit}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <Tag className="w-4 h-4 text-[#C9A227]" />
                {t('booking.promoCode')}
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => {
                    setPromoCodeInput(e.target.value);
                    setPromoStatus('idle');
                  }}
                  placeholder="Nhập mã (VD: NITRO10)"
                  className="flex-1 text-sm px-3.5 py-2 uppercase font-mono rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#1F5AA6] focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleApplyPromo}
                >
                  {t('booking.applyCode')}
                </Button>
              </div>

              {promoStatus === 'success' && (
                <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {t('booking.codeApplied')}
                </div>
              )}
              {promoStatus === 'error' && (
                <div className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  {t('booking.codeInvalid')} (Thử mã: NITRO10)
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <Link
                to={`/rooms/${roomType.id}`}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('booking.backToRooms')}
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto bg-[#1F5AA6] hover:bg-[#184A8A] font-bold shadow-md px-8 py-3"
              >
                {t('booking.continueToPayment')} &rarr;
              </Button>
            </div>
          </form>
        </div>

        {/* Right Sticky Summary Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-lg p-6 space-y-5">
            <h3 className="text-base font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
              Tóm tắt đặt phòng
            </h3>

            {/* Room Info */}
            <div className="flex gap-3">
              <img
                src={roomType.image}
                alt={roomType.name}
                className="w-24 h-20 rounded-xl object-cover shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-[#1F5AA6]">{roomType.code}</div>
                <div className="text-sm font-bold text-[#0F172A]">{roomType.name}</div>
                <div className="text-xs text-[#475569] mt-1">
                  {roomType.area} m² • {roomType.maxGuests} khách • {roomType.bedType}
                </div>
              </div>
            </div>

            {/* Dates Recap */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs border border-slate-100">
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
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-[#475569]">Thời lượng:</span>
                <span className="font-bold text-[#1F5AA6]">
                  {nights} đêm • {draftBooking?.adults || 2} người lớn
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs border-t border-[#E2E8F0] pt-4">
              <div className="flex justify-between text-[#475569]">
                <span>
                  Tiền phòng ({nights} đêm):
                </span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(baseRoomTotal, language)}
                </span>
              </div>

              {promoDiscountRate > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Khuyến mãi voucher (-10%):</span>
                  <span className="tabular-nums">-{formatCurrency(discountAmount, language)}</span>
                </div>
              )}

              {selectedServices.map((svc) => (
                <div key={svc.id} className="flex justify-between text-[#475569]">
                  <span className="truncate pr-2">+ {svc.name}:</span>
                  <span className="font-semibold tabular-nums shrink-0">
                    {formatCurrency(svc.price, language)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between text-[#475569]">
                <span>Phí dịch vụ 5%:</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(serviceFee, language)}
                </span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Thuế VAT 8%:</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(vat, language)}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-[#E2E8F0] text-sm font-bold text-[#0F172A]">
                <span>{t('room.totalPrice')}:</span>
                <span className="text-xl text-[#1F5AA6] tabular-nums font-extrabold">
                  {formatCurrency(finalTotal, language)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#475569] bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
              {t('room.cancellationPolicy')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
