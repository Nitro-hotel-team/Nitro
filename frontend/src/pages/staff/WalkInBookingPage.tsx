/**
 * ============================================================================
 * TÊN FILE: WalkInBookingPage.tsx
 * VỊ TRÍ: src/pages/staff/WalkInBookingPage.tsx
 * PHÂN HỆ: Nghiệp vụ Tiếp đón Khách vãng lai tại Quầy (Front Desk Walk-in Booking)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Quy trình 3 bước tốc độ cao phục vụ khách vào trực tiếp không đặt trước:
 *     + Bước 1: Chọn phòng trống trực quan theo số phòng, tầng và hạng phòng.
 *     + Bước 2: Nhập nhanh CCCD / Passport, Họ tên, SĐT, số đêm lưu trú, số lượng khách.
 *     + Bước 3: Quyết toán thu tiền tại quầy (Tiền mặt + tính tiền thối tự động, Quẹt POS, hoặc Quét QR Chuyển khoản).
 *     + Tùy chọn: Tự động Check-in phòng ngay lập tức và phát hành thẻ phòng.
 * - Kết nối Backend REST API:
 *     + `POST /api/v1/bookings`: Tạo đơn đặt phòng mới kênh COUNTER.
 *     + `PATCH /api/v1/rooms/:id/status`: Đổi trạng thái phòng sang OCCUPIED.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  DollarSign,
  DoorOpen,
  Key,
  PlusCircle,
  Printer,
  QrCode,
  Search,
  User,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { bookingService, roomService } from '../../services/api';
import { Booking, Room, RoomType } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const WalkInBookingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomTypeTab, setSelectedRoomTypeTab] = useState<string>('ALL');

  // Dates & Duration state (TASK-39)
  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [nights, setNights] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Selected room
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Guest details with Validation (TASK-40)
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [idCard, setIdCard] = useState('');
  const [formErrors, setFormErrors] = useState<{ guestName?: string; idCard?: string; guestPhone?: string }>({});

  // Payment & Deposit state (TASK-40)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'POS' | 'TRANSFER'>('CASH');
  const [depositAmount, setDepositAmount] = useState<number>(500000);
  const [isFullPayment, setIsFullPayment] = useState<boolean>(true);
  const [cashGiven, setCashGiven] = useState(2000000);
  const [posCode, setPosCode] = useState('POS-98421');
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // Date synchronization
  const handleNightsChange = (newNights: number) => {
    const n = Math.max(1, newNights);
    setNights(n);
    const inTime = new Date(checkInDate).getTime();
    setCheckOutDate(new Date(inTime + n * 86400000).toISOString().slice(0, 10));
  };

  const handleCheckInDateChange = (newInDate: string) => {
    setCheckInDate(newInDate);
    const inTime = new Date(newInDate).getTime();
    setCheckOutDate(new Date(inTime + nights * 86400000).toISOString().slice(0, 10));
  };

  const handleCheckOutDateChange = (newOutDate: string) => {
    setCheckOutDate(newOutDate);
    const diff = Math.round(
      (new Date(newOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000
    );
    setNights(Math.max(1, diff));
  };

  useEffect(() => {
    Promise.all([roomService.getRooms(), roomService.getRoomTypes()]).then(
      ([rData, rtData]) => {
        const available = rData.filter((r) => r.status === 'AVAILABLE');
        setRooms(available);
        setRoomTypes(rtData);

        // Pre-select if URL params passed
        const paramRoomId = searchParams.get('roomId');
        if (paramRoomId) {
          const match = available.find((r) => r.id === paramRoomId);
          if (match) setSelectedRoom(match);
        }
      }
    );
  }, [searchParams]);

  const matchedRoomType = selectedRoom
    ? roomTypes.find((rt) => rt.id === selectedRoom.roomTypeId)
    : null;

  const basePrice = matchedRoomType?.basePrice || 1200000;
  const totalAmount = basePrice * nights;
  const actualDeposit = isFullPayment ? totalAmount : Math.min(depositAmount, totalAmount);
  const remainingAmount = Math.max(0, totalAmount - actualDeposit);
  const changeDue = Math.max(0, cashGiven - actualDeposit);

  const handleValidateStep2 = () => {
    const errors: { guestName?: string; idCard?: string; guestPhone?: string } = {};
    if (!guestName.trim()) {
      errors.guestName = 'Bắt buộc nhập Họ và tên khách hàng lưu trú.';
    }
    if (!idCard.trim()) {
      errors.idCard = 'Bắt buộc nhập Số CCCD hoặc Hộ chiếu theo quy định đăng ký lưu trú.';
    }
    if (!guestPhone.trim()) {
      errors.guestPhone = 'Bắt buộc nhập số điện thoại liên hệ.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setStep(3);
    }
  };

  const handleCompleteWalkIn = async () => {
    if (!selectedRoom) return;

    const generatedCode = `WK-${Math.floor(100000 + Math.random() * 900000)}`;
    const created = await bookingService.createBooking({
      bookingCode: generatedCode,
      roomTypeId: selectedRoom.roomTypeId,
      roomTypeName: selectedRoom.roomTypeName,
      roomNumber: selectedRoom.roomNumber,
      checkInDate,
      checkOutDate,
      nights,
      adults,
      children,
      guestName: guestName.trim() || 'Khách vãng lai',
      guestPhone: guestPhone.trim() || '0900000000',
      guestEmail: guestEmail.trim() || 'khach@nitrohotel.vn',
      guestIdCard: idCard.trim(),
      totalAmount,
      paidAmount: actualDeposit,
      paymentMethod: paymentMethod === 'CASH' ? 'TIEN_MAT' : paymentMethod === 'POS' ? 'THE_POS' : 'CHUYEN_KHOAN',
      status: autoCheckIn ? 'CHECKED_IN' : 'CONFIRMED',
      source: 'COUNTER',
    });

    // Update room status to OCCUPIED
    await roomService.updateRoomStatus(selectedRoom.id, autoCheckIn ? 'OCCUPIED' : 'RESERVED');

    setCompletedBooking(created);
  };

  const handleResetWalkIn = () => {
    setCompletedBooking(null);
    setStep(1);
    setSelectedRoom(null);
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setIdCard('');
    setFormErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/staff/overview"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A]"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('staff.backToOverview')}
      </Link>

      {/* Confirmation Slip / Key Handover when booking completed (TASK-41) */}
      {completedBooking ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#0F172A]">
                  Tạo đơn &amp; Check-in Thành Công!
                </h2>
                <p className="text-xs text-[#475569] mt-0.5">
                  Phòng đã được chuyển sang trạng thái <strong className="text-emerald-700">OCCUPIED (Đang sử dụng)</strong> trên toàn hệ thống.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 block">Mã đặt phòng (PNR):</span>
              <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 font-mono font-black text-lg rounded-xl shadow-xs">
                {completedBooking.bookingCode}
              </span>
            </div>
          </div>

          {/* Slip Content Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Customer Info Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-[#0F172A] flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <User className="w-4 h-4 text-[#1F5AA6]" />
                Hồ sơ khách lưu trú
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="font-bold text-[#0F172A]">{completedBooking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số CCCD / Hộ chiếu:</span>
                <span className="font-mono font-bold text-[#0F172A]">{completedBooking.guestIdCard || idCard || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-semibold text-[#0F172A]">{completedBooking.guestPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kênh tiếp nhận:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                  Tại quầy (COUNTER)
                </span>
              </div>
            </div>

            {/* Room Info Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-[#0F172A] flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <DoorOpen className="w-4 h-4 text-[#1F5AA6]" />
                Thông tin phòng lưu trú
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-500">Số phòng bàn giao:</span>
                <span className="font-black text-[#1F5AA6] text-sm">
                  Phòng {completedBooking.roomNumber} (Tầng {selectedRoom?.floor || '1'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hạng phòng:</span>
                <span className="font-semibold text-[#0F172A]">{completedBooking.roomTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian lưu trú:</span>
                <span className="font-semibold text-[#0F172A]">
                  {formatDate(completedBooking.checkInDate)} &rarr; {formatDate(completedBooking.checkOutDate)} ({completedBooking.nights} đêm)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái phòng:</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                  Đang sử dụng (OCCUPIED)
                </span>
              </div>
            </div>
          </div>

          {/* Key handover & Financial breakdown */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Key className="w-4 h-4 text-emerald-700" />
              Bàn giao chìa khóa &amp; Thẻ từ phòng {completedBooking.roomNumber}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-emerald-950 pt-2 border-t border-emerald-200/70">
              <div>
                <span className="block text-emerald-800 text-[11px]">Tổng chi phí:</span>
                <span className="font-black text-sm">{formatCurrency(completedBooking.totalAmount)}</span>
              </div>
              <div>
                <span className="block text-emerald-800 text-[11px]">Đã thanh toán (Cọc/Đủ):</span>
                <span className="font-black text-sm text-emerald-700">{formatCurrency(completedBooking.paidAmount)}</span>
              </div>
              <div>
                <span className="block text-emerald-800 text-[11px]">Còn lại thu khi Check-out:</span>
                <span className="font-black text-sm text-rose-700">
                  {formatCurrency(Math.max(0, completedBooking.totalAmount - completedBooking.paidAmount))}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetWalkIn}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              + Đón khách Walk-in mới
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                In biên nhận (Print)
              </button>
              <Button
                variant="gold"
                size="md"
                onClick={() => navigate('/staff/room-board')}
                className="font-bold shadow-md"
              >
                Về Sơ đồ buồng phòng &rarr;
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header & Stepper */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0F172A]">
                  Đặt phòng trực tiếp tại quầy (Walk-in)
                </h1>
                <p className="text-xs text-[#475569] mt-0.5">
                  Quy trình nhanh 3 bước dành cho nhân viên Lễ tân nhận khách vãng lai
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                Kênh: Tại quầy (COUNTER)
              </span>
            </div>

        {/* 3 Step Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] text-xs font-semibold">
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              step === 1
                ? 'border-[#1F5AA6] bg-blue-50/50 text-[#1F5AA6]'
                : step > 1
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              {step > 1 ? '✓' : '1'}
            </span>
            <span className="truncate">1. Chọn phòng trống</span>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              step === 2
                ? 'border-[#1F5AA6] bg-blue-50/50 text-[#1F5AA6]'
                : step > 2
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              {step > 2 ? '✓' : '2'}
            </span>
            <span className="truncate">2. Thông tin khách</span>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              step === 3
                ? 'border-[#1F5AA6] bg-blue-50/50 text-[#1F5AA6]'
                : 'border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              3
            </span>
            <span className="truncate">3. Thanh toán &amp; Nhận phòng</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Available Room & Dates (TASK-39) */}
      {step === 1 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5">
          {/* Date Range & Nights Selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="block font-bold text-xs text-[#0F172A] uppercase tracking-wider">
              1. Thiết lập thời gian lưu trú:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#475569] font-semibold mb-1">Ngày nhận phòng (Check-in):</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => handleCheckInDateChange(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg font-semibold text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Ngày trả phòng (Check-out):</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => handleCheckOutDateChange(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg font-semibold text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#475569] font-semibold mb-1">Số đêm lưu trú:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={nights}
                    onChange={(e) => handleNightsChange(Number(e.target.value))}
                    className="w-full py-1.5 px-3 bg-white border border-[#E2E8F0] rounded-lg font-bold text-center text-[#1F5AA6]"
                  />
                  <span className="font-bold text-slate-500 whitespace-nowrap">đêm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Room Type Filter Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                2. Chọn phòng trống sẵn có ({rooms.length} phòng khả dụng):
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['ALL', 'STD', 'SUP', 'DLX', 'FAM', 'EXE', 'PRE'].map((code) => {
                const active = selectedRoomTypeTab === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedRoomTypeTab(code)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      active
                        ? 'bg-[#1F5AA6] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {code === 'ALL' ? 'Tất cả hạng' : code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {rooms
              .filter(
                (r) =>
                  selectedRoomTypeTab === 'ALL' ||
                  r.roomTypeCode === selectedRoomTypeTab
              )
              .map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const rType = roomTypes.find((rt) => rt.id === room.roomTypeId);
                const price = rType?.basePrice || 1000000;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition text-center space-y-1 ${
                      isSelected
                        ? 'border-[#1F5AA6] bg-blue-50 ring-2 ring-[#1F5AA6] shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-mono font-extrabold text-base text-[#0F172A]">
                      {room.roomNumber}
                    </div>
                    <div className="text-[10px] font-bold text-[#1F5AA6] uppercase">
                      {room.roomTypeCode}
                    </div>
                    <div className="text-[10px] text-slate-500">Tầng {room.floor}</div>
                    <div className="text-[10px] font-bold text-emerald-700">
                      {formatCurrency(price)}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Selected Room Calculation Summary */}
          {selectedRoom && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-900">
                  Phòng đã chọn: Phòng {selectedRoom.roomNumber} ({selectedRoom.roomTypeName})
                </span>
                <span className="text-emerald-700 ml-2">
                  ({nights} đêm × {formatCurrency(basePrice)}/đêm)
                </span>
              </div>
              <span className="text-base font-extrabold text-[#1F5AA6] tabular-nums">
                Tạm tính: {formatCurrency(totalAmount)}
              </span>
            </div>
          )}

          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
            <Button
              variant="primary"
              size="md"
              disabled={!selectedRoom}
              onClick={() => setStep(2)}
            >
              Tiếp tục nhập thông tin khách &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Guest Details & Mandatory Validation (TASK-40) */}
      {step === 2 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Hồ sơ khách lưu trú tại quầy</h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Theo quy định lưu trú, Họ tên và Số CCCD/Hộ chiếu là thông tin bắt buộc.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#475569] mb-1">
                Họ và tên khách hàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  if (formErrors.guestName) setFormErrors({ ...formErrors, guestName: undefined });
                }}
                placeholder="VD: Nguyễn Văn Bình"
                className={`w-full p-2.5 rounded-lg border text-xs ${
                  formErrors.guestName
                    ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
                    : 'border-[#E2E8F0]'
                }`}
              />
              {formErrors.guestName && (
                <span className="text-rose-600 text-[11px] font-semibold mt-1 block">
                  {formErrors.guestName}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#475569] mb-1">
                Số CCCD / Hộ chiếu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={idCard}
                onChange={(e) => {
                  setIdCard(e.target.value);
                  if (formErrors.idCard) setFormErrors({ ...formErrors, idCard: undefined });
                }}
                placeholder="07909400xxxx"
                className={`w-full p-2.5 rounded-lg border text-xs ${
                  formErrors.idCard
                    ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
                    : 'border-[#E2E8F0]'
                }`}
              />
              {formErrors.idCard && (
                <span className="text-rose-600 text-[11px] font-semibold mt-1 block">
                  {formErrors.idCard}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#475569] mb-1">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => {
                  setGuestPhone(e.target.value);
                  if (formErrors.guestPhone) setFormErrors({ ...formErrors, guestPhone: undefined });
                }}
                placeholder="0912345678"
                className={`w-full p-2.5 rounded-lg border text-xs ${
                  formErrors.guestPhone
                    ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
                    : 'border-[#E2E8F0]'
                }`}
              />
              {formErrors.guestPhone && (
                <span className="text-rose-600 text-[11px] font-semibold mt-1 block">
                  {formErrors.guestPhone}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#475569] mb-1">Email liên hệ (Tùy chọn)</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="khach@example.com"
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0] text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex justify-between">
            <Button variant="outline" size="md" onClick={() => setStep(1)}>
              &larr; Chọn lại phòng
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleValidateStep2}
            >
              Tiến hành thanh toán &rarr;
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment & Instant Check-in */}
      {step === 3 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[#0F172A]">Thanh toán &amp; Nhận phòng</h2>

          {/* Booking & Financial Recap (TASK-40) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-bold text-[#0F172A]">Chi tiết đơn Walk-in:</span>
              <span className="font-bold text-[#1F5AA6]">
                Phòng {selectedRoom?.roomNumber} ({selectedRoom?.roomTypeName})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">Khách lưu trú:</span>
              <span className="font-bold text-[#0F172A]">{guestName} ({guestPhone}) — CCCD: {idCard}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">Thời gian:</span>
              <span className="font-bold text-[#0F172A]">
                {formatDate(checkInDate)} &rarr; {formatDate(checkOutDate)} ({nights} đêm)
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
              <span className="text-[#475569]">Tổng chi phí lưu trú:</span>
              <span className="text-base text-[#0F172A] tabular-nums font-extrabold">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Deposit vs Full Payment Switcher (TASK-40) */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="font-bold text-[#0F172A] block">Chính sách thu tiền tại quầy:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullPayment(true)}
                  className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                    isFullPayment
                      ? 'border-[#1F5AA6] bg-blue-50 text-[#1F5AA6]'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  Thu đủ 100% ({formatCurrency(totalAmount)})
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullPayment(false)}
                  className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                    !isFullPayment
                      ? 'border-[#1F5AA6] bg-blue-50 text-[#1F5AA6]'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  Tạm thu tiền cọc (Deposit)
                </button>
              </div>

              {!isFullPayment && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-bold text-amber-900">Số tiền cọc tạm thu (₫):</label>
                    <input
                      type="number"
                      step={50000}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-36 p-1.5 border border-amber-300 rounded bg-white text-right font-bold text-amber-900"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-amber-800 font-semibold pt-1 border-t border-amber-200/60">
                    <span>Còn lại thu khi trả phòng (Check-out):</span>
                    <span className="font-bold text-rose-700">{formatCurrency(remainingAmount)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold bg-blue-50/50 p-2 rounded-lg">
              <span className="text-[#1F5AA6]">Cần thanh toán tại quầy:</span>
              <span className="text-xl text-[#1F5AA6] tabular-nums font-extrabold">
                {formatCurrency(actualDeposit)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector (TASK-40) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#0F172A]">
              Phương thức thanh toán tại quầy:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'CASH', label: 'Tiền mặt (Cash)' },
                { id: 'POS', label: 'Quẹt thẻ POS' },
                { id: 'TRANSFER', label: 'Chuyển khoản QR' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-[#1F5AA6] bg-blue-50 text-[#1F5AA6] ring-1 ring-[#1F5AA6]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* CASH details */}
            {paymentMethod === 'CASH' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <label className="font-bold text-[#475569]">Tiền khách đưa (₫):</label>
                  <input
                    type="number"
                    step={50000}
                    value={cashGiven}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-40 text-sm p-2 rounded-lg border border-[#E2E8F0] font-bold text-right"
                  />
                </div>
                <div className="flex justify-between p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold">
                  <span>Tiền thối lại khách:</span>
                  <span className="text-sm font-extrabold">{formatCurrency(changeDue)}</span>
                </div>
              </div>
            )}

            {/* POS CARD details */}
            {paymentMethod === 'POS' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <label className="font-bold text-[#475569] block">Mã số chuẩn chi máy POS:</label>
                <input
                  type="text"
                  value={posCode}
                  onChange={(e) => setPosCode(e.target.value)}
                  placeholder="VD: POS-98421"
                  className="w-full p-2.5 rounded-lg border border-[#E2E8F0] font-mono text-xs uppercase"
                />
                <span className="text-[11px] text-slate-500">Quẹt thẻ qua cổng Vietcombank POS tại quầy tiếp tân.</span>
              </div>
            )}

            {/* BANK TRANSFER / QR details */}
            {paymentMethod === 'TRANSFER' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#1F5AA6]" />
                  Quét mã VietQR chuyển khoản nhanh 24/7
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Ngân hàng:</span>
                    <span className="font-bold text-[#0F172A]">Vietcombank — CN Bến Thành</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Số tài khoản:</span>
                    <span className="font-mono font-bold text-[#1F5AA6]">0071001234567</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Chủ tài khoản:</span>
                    <span className="font-bold text-[#0F172A]">NITRO GRAND HOTEL SAIGON</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Số tiền:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(actualDeposit)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Check-in checkbox */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <label className="flex items-center gap-2 text-xs font-bold text-[#0F172A] cursor-pointer">
              <input
                type="checkbox"
                checked={autoCheckIn}
                onChange={(e) => setAutoCheckIn(e.target.checked)}
                className="rounded text-[#1F5AA6] focus:ring-[#1F5AA6]"
              />
              <span>Tự động Check-in phòng ngay sau khi lưu</span>
            </label>
          </div>

          {/* Final Submit */}
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto text-center justify-center"
            >
              &larr; Quay lại thông tin
            </Button>
            <Button
              variant="gold"
              size="lg"
              onClick={handleCompleteWalkIn}
              className="w-full sm:w-auto font-bold shadow-md px-8 py-3 text-center justify-center inline-flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Tạo đơn &amp; Check-in ngay
            </Button>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
