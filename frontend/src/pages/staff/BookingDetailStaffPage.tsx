/**
 * ============================================================================
 * TÊN FILE: BookingDetailStaffPage.tsx
 * VỊ TRÍ: src/pages/staff/BookingDetailStaffPage.tsx
 * PHÂN HỆ: Chi tiết Hồ sơ Lưu trú & Nghiệp vụ Lễ tân (TASK-44 - FE-S3-14)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Xem toàn diện hồ sơ đặt phòng phía nhân viên (Hotel Folio Standard):
 *     + Thông tin định danh khách hàng: Họ tên, SĐT, Email, CCCD/Passport.
 *     + Chi tiết phòng: Số phòng, Hạng phòng, Tầng, Ngày nhận/trả phòng thực tế.
 *     + Bảng kê tài chính Folio: Tiền phòng theo đêm, phụ thu thêm khách, tiền cọc, số dư cần thu.
 *     + 4 Tác vụ nghiệp vụ lễ tân chuẩn mực:
 *         1. Đổi phòng (Change Room): Chuyển khách sang phòng vật lý khả dụng khác.
 *         2. Check-in: Xác thực CCCD, cấp mã thẻ từ RFID, giao phòng.
 *         3. Check-out: Quyết toán chi phí phát sinh, thanh toán tiền mặt/POS/QR.
 *         4. Hủy đơn (Cancel): Xử lý hủy đơn và hoàn tiền cọc theo chính sách khách sạn.
 * - Kết nối Backend REST API:
 *     + `GET /api/v1/bookings/:id`: Tải chi tiết đơn.
 *     + `PATCH /api/v1/bookings/:id/status`: Đổi trạng thái đơn.
 *     + `GET /api/v1/rooms`: Tải danh sách phòng khả dụng cho nghiệp vụ đổi phòng.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  DoorOpen,
  FileText,
  IdCard,
  Key,
  Mail,
  Phone,
  Printer,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  User,
  Utensils,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/StateViews';
import { StatusBadge } from '../../components/common/StatusBadge';
import { bookingService, roomService } from '../../services/api';
import { Booking, BookingStatus, Room } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const BookingDetailStaffPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check-in modal state
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [idCardNumber, setIdCardNumber] = useState('');
  const [roomKeyAssigned, setRoomKeyAssigned] = useState('');

  // Check-out modal state
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [extraMinibar, setExtraMinibar] = useState(120000);
  const [paymentMethodStaff, setPaymentMethodStaff] = useState('Tiền mặt');
  const [cashReceived, setCashReceived] = useState(200000);

  // Change room modal state (TASK-44)
  const [changeRoomModalOpen, setChangeRoomModalOpen] = useState(false);
  const [targetRoomNumber, setTargetRoomNumber] = useState('');
  const [changeRoomReason, setChangeRoomReason] = useState('Khách yêu cầu đổi phòng hướng view đẹp hơn');

  // Cancel booking modal state (TASK-44)
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Khách thay đổi lịch trình công tác đột xuất');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      bookingService.getBookingById(id),
      roomService.getRooms(),
    ]).then(([bData, rData]) => {
      setBooking(bData);
      setAvailableRooms(rData.filter((r) => r.status === 'AVAILABLE'));
      if (bData) {
        setIdCardNumber(bData.guestIdCard || '079094001234');
        setRoomKeyAssigned(`Thẻ RFID #${bData.roomNumber || '101'}`);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading || !booking) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Folio Calculations (TASK-44)
  const roomRatePerNight = Math.round(booking.totalAmount / Math.max(1, booking.nights));
  const extraGuestCount = Math.max(0, (booking.adults || 2) - 2);
  const extraGuestFee = extraGuestCount * 250000 * Math.max(1, booking.nights);
  const baseRoomTotal = Math.max(0, booking.totalAmount - extraGuestFee);
  const remainingToCollect = Math.max(0, booking.totalAmount - booking.paidAmount);

  // Handlers for Operational Actions (TASK-44)
  const handleConfirmCheckIn = async () => {
    const updated = await bookingService.updateBookingStatus(booking.id, 'CHECKED_IN');
    if (booking.roomNumber) {
      await roomService.updateRoomStatus(booking.roomNumber, 'OCCUPIED');
    }
    setBooking({ ...updated, guestIdCard: idCardNumber });
    setCheckInModalOpen(false);
    showToast(`Check-in thành công đơn ${booking.bookingCode}! Đã giao phòng ${booking.roomNumber}.`);
  };

  const handleConfirmCheckOut = async () => {
    const updated = await bookingService.updateBookingStatus(booking.id, 'CHECKED_OUT');
    if (booking.roomNumber) {
      await roomService.updateRoomStatus(booking.roomNumber, 'CLEANING');
    }
    setBooking(updated);
    setCheckOutModalOpen(false);
    showToast(`Check-out thành công đơn ${booking.bookingCode}! Phòng ${booking.roomNumber} chuyển sang Dọn dẹp.`);
  };

  const handleConfirmChangeRoom = async () => {
    if (!targetRoomNumber) {
      alert('Vui lòng chọn số phòng muốn chuyển đến!');
      return;
    }
    const oldRoom = booking.roomNumber;
    // Set old room to CLEANING if guest is checked in
    if (oldRoom && booking.status === 'CHECKED_IN') {
      await roomService.updateRoomStatus(oldRoom, 'CLEANING');
    }
    // Set target room to OCCUPIED or RESERVED
    await roomService.updateRoomStatus(
      targetRoomNumber,
      booking.status === 'CHECKED_IN' ? 'OCCUPIED' : 'RESERVED'
    );

    setBooking((prev) => (prev ? { ...prev, roomNumber: targetRoomNumber } : null));
    setChangeRoomModalOpen(false);
    showToast(`Đã chuyển phòng từ P.${oldRoom} sang P.${targetRoomNumber} thành công!`);
  };

  const handleConfirmCancel = async () => {
    const updated = await bookingService.updateBookingStatus(booking.id, 'CANCELLED');
    if (booking.roomNumber) {
      await roomService.updateRoomStatus(booking.roomNumber, 'AVAILABLE');
    }
    setBooking(updated);
    setCancelModalOpen(false);
    showToast(`Đã hủy đơn ${booking.bookingCode} theo quy chế. Phòng ${booking.roomNumber} đã mở lại.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Link */}
      <Link
        to="/staff/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A]"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('staff.backToBookings')}
      </Link>

      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className="font-mono text-2xl font-extrabold text-[#0F172A]">
              {booking.bookingCode}
            </span>
            <StatusBadge status={booking.status} type="booking" size="md" />
            <StatusBadge status={booking.source} type="source" size="sm" />
          </div>
          <p className="text-xs text-[#475569]">
            Ngày tạo: {formatDate(booking.createdAt)} &bull; Kênh tiếp nhận:{' '}
            <strong className="text-[#0F172A]">{booking.source}</strong>
          </p>
        </div>

        {/* Operational Actions Toolbar (TASK-44: Đổi phòng, Check-in, Check-out, Hủy đơn) */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
            className="cursor-pointer"
          >
            In Folio
          </Button>

          {/* Change room button */}
          {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangeRoomModalOpen(true)}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              className="cursor-pointer font-bold text-slate-700"
            >
              Đổi phòng
            </Button>
          )}

          {/* Check-in button */}
          {booking.status === 'CONFIRMED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCheckInModalOpen(true)}
              className="bg-[#1F5AA6] font-bold cursor-pointer"
            >
              Check-in khách
            </Button>
          )}

          {/* Check-out button */}
          {booking.status === 'CHECKED_IN' && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => setCheckOutModalOpen(true)}
              className="font-bold cursor-pointer"
            >
              Check-out &amp; Quyết toán
            </Button>
          )}

          {/* Cancel button */}
          {booking.status === 'CONFIRMED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              className="text-rose-600 hover:bg-rose-50 border-rose-200 font-bold cursor-pointer"
            >
              Hủy đơn
            </Button>
          )}
        </div>
      </div>

      {/* 2-Column Ledger & Folio View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Guest and Identification Profile (TASK-44) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-[#1F5AA6]" />
            Hồ sơ cá nhân khách lưu trú
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-[#475569]">Họ và tên khách:</span>
              <span className="font-extrabold text-[#0F172A] text-sm">{booking.guestName}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-[#475569]">Số CCCD / Hộ chiếu:</span>
              <span className="font-mono font-bold text-[#1F5AA6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {booking.guestIdCard || idCardNumber || '079094001234'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-[#475569]">Số điện thoại:</span>
              <span className="font-mono font-semibold text-[#0F172A]">{booking.guestPhone}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-[#475569]">Địa chỉ Email:</span>
              <span className="text-[#0F172A] font-medium">{booking.guestEmail}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-[#475569]">Số khách đăng ký:</span>
              <span className="font-bold text-[#0F172A]">
                {booking.adults} người lớn &bull; {booking.children} trẻ em
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-[#475569]">Nguồn đặt chỗ:</span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {booking.source === 'COUNTER'
                  ? 'Tại quầy lễ tân (COUNTER)'
                  : booking.source === 'WEB'
                  ? 'Website trực tuyến (WEB)'
                  : booking.source === 'MOBILE'
                  ? 'Ứng dụng di động (MOBILE)'
                  : 'Đại lý du lịch (OTA)'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[#475569] text-xs block mb-1 font-semibold">
              Ghi chú &amp; Yêu cầu đặc biệt:
            </span>
            <p className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-200">
              "{booking.specialRequests || 'Không có yêu cầu đặc biệt nào từ khách lưu trú.'}"
            </p>
          </div>
        </div>

        {/* Column 2: Room & Folio Financial Breakdown (TASK-44) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-[#1F5AA6]" />
              Phòng nghỉ &amp; Bảng kê Folio tài chính
            </div>
            {booking.roomNumber && (
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-[#1F5AA6] font-bold rounded-full border border-blue-200">
                Phòng {booking.roomNumber}
              </span>
            )}
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#475569]">Hạng phòng:</span>
              <span className="font-bold text-[#1F5AA6]">{booking.roomTypeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">Số phòng gán kèm:</span>
              <span className="font-extrabold text-sm text-[#0F172A]">
                {booking.roomNumber ? `Phòng ${booking.roomNumber}` : 'Chưa xếp phòng vật lý'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">Thời gian lưu trú:</span>
              <span className="font-bold text-[#0F172A]">
                {formatDate(booking.checkInDate)} &rarr; {formatDate(booking.checkOutDate)} ({booking.nights} đêm)
              </span>
            </div>
          </div>

          {/* Charges Folio Breakdown (TASK-44) */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex justify-between text-[#475569]">
              <span>Tiền phòng theo đêm ({booking.nights} đêm):</span>
              <span className="font-semibold tabular-nums text-[#0F172A]">
                {formatCurrency(baseRoomTotal)}
              </span>
            </div>

            {extraGuestCount > 0 && (
              <div className="flex justify-between text-amber-800 bg-amber-50/60 px-2 py-1 rounded">
                <span>Phụ thu thêm khách (+{extraGuestCount} khách):</span>
                <span className="font-bold tabular-nums">
                  {formatCurrency(extraGuestFee)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-[#475569]">
              <span>Phí phục vụ (5%) &amp; Thuế VAT (8%):</span>
              <span className="font-semibold tabular-nums text-slate-500">
                Đã bao gồm trong giá
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-[#E2E8F0] text-sm font-bold">
              <span className="text-[#0F172A]">Tổng chi phí lưu trú:</span>
              <span className="text-lg text-[#1F5AA6] tabular-nums font-black">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-[#475569]">Số tiền khách đã thanh toán (Tiền cọc/Đủ):</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {formatCurrency(booking.paidAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded-xl">
              <span className="text-[#0F172A]">Số dư còn lại cần thu tại quầy:</span>
              <span className="text-base text-rose-600 font-extrabold tabular-nums">
                {formatCurrency(remainingToCollect)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Check-in (TASK-44) */}
      <Modal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        title={`Xác nhận Check-in khách: #${booking.bookingCode}`}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setCheckInModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmCheckIn} className="bg-[#1F5AA6] font-bold">
              Xác nhận Check-in &amp; Cấp chìa khóa
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
            <div className="font-bold text-[#1F5AA6] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1F5AA6]" />
              Tiếp nhận khách lưu trú vào nhận phòng
            </div>
            <p className="text-slate-600">
              Khách: <strong className="text-[#0F172A]">{booking.guestName}</strong> &bull; Phòng bàn giao:{' '}
              <strong className="text-[#0F172A]">P.{booking.roomNumber} ({booking.roomTypeName})</strong>
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              Số CMND / CCCD / Hộ chiếu kiểm tra đối chiếu:
            </label>
            <input
              type="text"
              value={idCardNumber}
              onChange={(e) => setIdCardNumber(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] font-mono font-bold"
              placeholder="VD: 079094001234"
            />
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              Mã thẻ từ RFID / Số chìa khóa bàn giao:
            </label>
            <input
              type="text"
              value={roomKeyAssigned}
              onChange={(e) => setRoomKeyAssigned(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] font-mono"
            />
          </div>
        </div>
      </Modal>

      {/* Modal 2: Check-out (TASK-44) */}
      <Modal
        isOpen={checkOutModalOpen}
        onClose={() => setCheckOutModalOpen(false)}
        title={`Quyết toán Check-out trả phòng: #${booking.bookingCode}`}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setCheckOutModalOpen(false)}>
              Đóng
            </Button>
            <Button variant="gold" size="sm" onClick={handleConfirmCheckOut} className="font-bold">
              Hoàn tất Check-out &amp; Thu tiền
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex justify-between">
              <span>Tiền phòng theo hợp đồng:</span>
              <span className="font-bold text-[#0F172A]">{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Đã tạm ứng / Thanh toán trước:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(booking.paidAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Dịch vụ phát sinh (Minibar / Giặt là):</span>
              <span className="font-bold text-rose-600">{formatCurrency(extraMinibar)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm bg-blue-50/60 p-2 rounded-lg">
              <span className="text-[#1F5AA6]">Tổng phải thu tại quầy:</span>
              <span className="text-[#1F5AA6] font-black text-base">
                {formatCurrency(remainingToCollect + extraMinibar)}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              Hình thức thanh toán tại quầy:
            </label>
            <select
              value={paymentMethodStaff}
              onChange={(e) => setPaymentMethodStaff(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] bg-white font-semibold"
            >
              <option value="Tiền mặt">Tiền mặt (Cash)</option>
              <option value="Quẹt thẻ POS">Quẹt thẻ ngân hàng POS (Visa/Master/ATM)</option>
              <option value="Chuyển khoản QR">Chuyển khoản ngân hàng 24/7 (VietQR)</option>
            </select>
          </div>

          {paymentMethodStaff === 'Tiền mặt' && (
            <div className="space-y-2">
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">
                  Tiền khách đưa (₫):
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] font-bold"
                />
              </div>
              <div className="flex justify-between p-2.5 bg-emerald-50 text-emerald-800 rounded-lg font-bold">
                <span>Tiền thối lại cho khách:</span>
                <span>{formatCurrency(Math.max(0, cashReceived - (remainingToCollect + extraMinibar)))}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal 3: Đổi phòng (TASK-44) */}
      <Modal
        isOpen={changeRoomModalOpen}
        onClose={() => setChangeRoomModalOpen(false)}
        title={`Đổi phòng lưu trú: #${booking.bookingCode}`}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setChangeRoomModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmChangeRoom} className="bg-[#1F5AA6] font-bold">
              Xác nhận đổi phòng
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-700" />
              Chuyển đổi phòng vật lý cho khách
            </div>
            <p className="text-amber-800">
              Phòng hiện tại: <strong>P.{booking.roomNumber || 'Chưa xếp'}</strong> ({booking.roomTypeName})
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              Chọn phòng trống muốn chuyển đến:
            </label>
            <select
              value={targetRoomNumber}
              onChange={(e) => setTargetRoomNumber(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] bg-white font-bold text-[#0F172A]"
            >
              <option value="">-- Chọn phòng khả dụng --</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.roomNumber}>
                  Phòng {r.roomNumber} - Tầng {r.floor} ({r.roomTypeName || r.roomTypeCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              Lý do đổi phòng (Ghi chú nội bộ):
            </label>
            <input
              type="text"
              value={changeRoomReason}
              onChange={(e) => setChangeRoomReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0]"
              placeholder="VD: Khách yêu cầu tầng cao, thiết bị điều hòa kiểm tra lại..."
            />
          </div>
        </div>
      </Modal>

      {/* Modal 4: Hủy đơn đặt phòng (TASK-44) */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={`Xác nhận HỦY ĐƠN ĐẶT PHÒNG: #${booking.bookingCode}`}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Quay lại
            </Button>
            <Button variant="secondary" size="sm" onClick={handleConfirmCancel} className="bg-rose-600 text-white font-bold hover:bg-rose-700">
              Xác nhận Hủy Đơn
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
            <div className="font-bold text-rose-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Cảnh báo thao tác hủy đặt phòng
            </div>
            <p className="text-rose-700">
              Đơn hàng sẽ chuyển sang trạng thái <strong>CANCELLED (Đã hủy)</strong> và phòng{' '}
              <strong>P.{booking.roomNumber}</strong> sẽ được mở lại cho khách khác đặt.
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              Lý do hủy đơn:
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0]"
            />
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
            <span>Chính sách hoàn tiền: </span>
            <strong className="text-[#0F172A]">Hoàn lại 100% tiền cọc ({formatCurrency(booking.paidAmount)})</strong> theo quy định hủy trước 24 giờ của Nitro Hotel.
          </div>
        </div>
      </Modal>
    </div>
  );
};
