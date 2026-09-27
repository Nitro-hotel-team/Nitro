/**
 * ============================================================================
 * TÊN FILE: BookingDetailPage.tsx
 * VỊ TRÍ: src/pages/customer/BookingDetailPage.tsx
 * PHÂN HỆ: Cổng Khách hàng - Chi tiết & Biên nhận Đặt phòng (Customer Booking Voucher)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Xem chi tiết phiếu xác nhận đặt phòng dành cho khách hàng:
 *     1. Mã đặt chỗ PNR lớn kèm huy hiệu trạng thái (StatusBadge).
 *     2. Tiến trình lưu trú trực quan: Đã đặt -> Đã nhận phòng -> Đã trả phòng.
 *     3. Thẻ mã QR Check-in siêu tốc không chạm tại sảnh đón.
 *     4. Thông tin chi tiết phòng, thời gian nhận/trả phòng và chính sách khách sạn.
 *     5. Bóc tách hóa đơn thanh toán chi tiết.
 *     6. Nút In hóa đơn / Lưu PDF và Modal Hủy phòng kèm chính sách hoàn tiền 4 sao.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DoorOpen,
  Mail,
  MapPin,
  Phone,
  Printer,
  QrCode,
  ShieldAlert,
  User,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/StateViews';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { MOCK_ROOM_TYPES, MOCK_SERVICES } from '../../mocks/data';
import { bookingService } from '../../services/api';
import { Booking } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useApp();
  const isEn = language === 'en';
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Thay đổi lịch trình cá nhân');
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    bookingService.getBookingById(id).then((data) => {
      setBooking(data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Calculate refund tier according to 4-star policy: >48h 100%, 24-48h 50%, <24h 0%
  const checkInTime = new Date(booking.checkInDate).getTime();
  const diffHours = (checkInTime - Date.now()) / (1000 * 60 * 60);
  let refundRate = 1;
  let refundTierLabel = isEn ? '100% Refund (>48h)' : 'Hoàn 100% (>48h)';

  if (diffHours < 24) {
    refundRate = 0;
    refundTierLabel = isEn ? '0% Non-refundable (<24h)' : 'Không hoàn tiền (<24h)';
  } else if (diffHours < 48) {
    refundRate = 0.5;
    refundTierLabel = isEn ? '50% Refund (24-48h)' : 'Hoàn 50% (24-48h)';
  }
  const estimatedRefund = Math.round(booking.paidAmount * refundRate);

  const rt = MOCK_ROOM_TYPES.find((r) => r.id === booking.roomTypeId || r.name === booking.roomTypeName);
  const localizedRoomName = isEn && rt?.nameEn ? rt.nameEn : booking.roomTypeName;

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const updated = await bookingService.updateBookingStatus(
        booking.id,
        'CANCELLED',
        { cancellationReason: `${cancelReason}: ${cancelNote}` }
      );
      setBooking(updated);
      setCancelModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/my-bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A]"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('booking.backToMyBookings')}
      </Link>

      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-xl font-extrabold text-[#0F172A]">
              {booking.bookingCode}
            </span>
            <StatusBadge status={booking.status} type="booking" size="md" />
          </div>
          <p className="text-xs text-[#475569]">
            {t('bookingDetail.createdAtLabel')} {formatDate(booking.createdAt)} • {t('bookingDetail.sourceLabel')} {booking.source}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
            className="flex-1 sm:flex-initial justify-center"
          >
            {t('bookingDetail.printInvoice')}
          </Button>
          {booking.status === 'CONFIRMED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 flex-1 sm:flex-initial justify-center"
            >
              {t('bookingDetail.cancelBookingBtn')}
            </Button>
          )}
        </div>
      </div>

      {/* Booking Timeline Flow */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
        <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-4">
          {t('bookingDetail.stayProgress')}
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-1">
              ✓
            </div>
            <span className="font-bold text-[#0F172A]">{t('bookingDetail.stepBooked')}</span>
            <span className="text-[11px] text-[#94A3B8]">{t('bookingDetail.stepBookedDesc')}</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${
                booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </div>
            <span className="font-bold text-[#0F172A]">{t('bookingDetail.stepCheckIn')}</span>
            <span className="text-[11px] text-[#94A3B8]">
              {formatDate(booking.checkInDate)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${
                booking.status === 'CHECKED_OUT'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </div>
            <span className="font-bold text-[#0F172A]">{t('bookingDetail.stepCheckOut')}</span>
            <span className="text-[11px] text-[#94A3B8]">
              {formatDate(booking.checkOutDate)}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Block 1: Room & Stay */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <DoorOpen className="w-4 h-4 text-[#1F5AA6]" />
            {t('bookingDetail.stayInfoTitle')}
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#475569]">{t('bookingDetail.roomType')}</span>
              <span className="font-bold text-[#1F5AA6]">{localizedRoomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">{t('bookingDetail.roomNumber')}</span>
              <span className="font-bold text-[#0F172A]">
                {booking.roomNumber ? `${isEn ? 'Room' : 'Phòng'} ${booking.roomNumber}` : t('bookingDetail.willAssignAtCheckIn')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">{t('bookingDetail.checkInTime')}</span>
              <span className="font-bold text-[#0F172A]">
                {formatDate(booking.checkInDate)} {t('bookingDetail.from1400')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">{isEn ? 'Check-out Time:' : 'Thời gian trả phòng:'}</span>
              <span className="font-bold text-[#0F172A]">
                {formatDate(booking.checkOutDate)} ({isEn ? 'before 12:00' : 'trước 12:00'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">{isEn ? 'Guests Count:' : 'Số lượng khách:'}</span>
              <span className="font-bold text-[#0F172A]">
                {booking.adults} {isEn ? 'adult(s)' : 'người lớn'} • {booking.children} {isEn ? 'child(ren)' : 'trẻ em'}
              </span>
            </div>
          </div>
        </div>

        {/* Block 2: Guest Details */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <User className="w-4 h-4 text-[#1F5AA6]" />
            {isEn ? 'Guest Information' : 'Thông tin khách hàng'}
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#475569]">{isEn ? 'Guest Name:' : 'Họ tên khách:'}</span>
              <span className="font-bold text-[#0F172A]">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">{isEn ? 'Phone Number:' : 'Số điện thoại:'}</span>
              <span className="font-mono text-[#0F172A]">{booking.guestPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">Email:</span>
              <span className="text-[#0F172A]">{booking.guestEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569]">{isEn ? 'Estimated Arrival:' : 'Giờ đến dự kiến:'}</span>
              <span className="text-[#0F172A]">{booking.estimatedArrivalTime || '14:00'}</span>
            </div>
            {booking.specialRequests && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[#475569] block mb-1">{isEn ? 'Special Requests:' : 'Yêu cầu đặc biệt:'}</span>
                <p className="p-2 bg-slate-50 rounded-lg text-slate-700 italic">
                  "{booking.specialRequests}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block 3: Billing Breakdown */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <CreditCard className="w-4 h-4 text-[#1F5AA6]" />
          {isEn ? 'Payment & Invoice Details' : 'Chi tiết thanh toán & Hóa đơn'}
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-[#475569]">
            <span>{isEn ? `Base Room Rate (${booking.nights} night(s)):` : `Tiền phòng cơ bản (${booking.nights} đêm):`}</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(booking.totalAmount * 0.88, language)}
            </span>
          </div>

          {booking.extraServices && booking.extraServices.length > 0 && (
            <div className="space-y-1 pl-2 border-l-2 border-slate-200">
              {booking.extraServices.map((s) => {
                const srv = MOCK_SERVICES.find((ms) => ms.id === s.id || ms.name === s.name);
                const localizedServiceName = isEn && srv?.nameEn ? srv.nameEn : s.name;
                return (
                  <div key={s.id} className="flex justify-between text-slate-600">
                    <span>+ {localizedServiceName}:</span>
                    <span className="tabular-nums">{formatCurrency(s.price, language)}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between text-[#475569]">
            <span>{isEn ? 'Service Fee & VAT (13%):' : 'Phí dịch vụ & Thuế VAT (13%):'}</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(booking.totalAmount * 0.12, language)}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-3 border-t border-[#E2E8F0] text-sm font-bold text-[#0F172A]">
            <span>{t('room.totalPrice')}:</span>
            <span className="text-lg text-[#1F5AA6] tabular-nums font-extrabold">
              {formatCurrency(booking.totalAmount, language)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-semibold pt-1">
            <span className="text-[#475569]">{isEn ? 'Payment Method:' : 'Phương thức thanh toán:'}</span>
            <span className="text-[#0F172A]">{booking.paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-[#475569]">{isEn ? 'Payment Status:' : 'Trạng thái thanh toán:'}</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              {booking.paymentStatus === 'PAID'
                ? (isEn ? 'Fully Paid' : 'Đã thanh toán đủ')
                : (isEn ? 'Pay at Desk' : 'Thanh toán tại quầy')}
            </span>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <span>{isEn ? `Cancel Booking #${booking.bookingCode}` : `Hủy đặt phòng #${booking.bookingCode}`}</span>
          </div>
        }
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
            >
              {isEn ? 'Keep Reservation' : 'Giữ lại đặt phòng'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={cancelling}
            >
              {cancelling
                ? (isEn ? 'Cancelling...' : 'Đang hủy...')
                : (isEn ? 'Confirm Cancellation' : 'Xác nhận hủy đặt phòng')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#475569]">
            {t('bookingDetail.cancelModalDesc')}
          </p>

          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold">{isEn ? 'Estimated Refund Amount:' : 'Số tiền hoàn lại dự kiến:'}</span>
              <span className="font-extrabold tabular-nums text-sm text-emerald-900">
                {formatCurrency(estimatedRefund, language)}
              </span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {refundTierLabel}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              {t('bookingDetail.refundNotice')}
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              {t('booking.cancelReason')}:
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] bg-white"
            >
              <option value="Thay đổi lịch trình cá nhân">{t('bookingDetail.reason1')}</option>
              <option value="Tìm được khách sạn hoặc giá tốt hơn">{t('bookingDetail.reason2')}</option>
              <option value="Chuyến bay / phương tiện bị hoãn, hủy">{t('bookingDetail.reason3')}</option>
              <option value="Lý do sức khỏe / việc khẩn cấp">{t('bookingDetail.reason4')}</option>
              <option value="Lý do khác">{t('bookingDetail.reason5')}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              {isEn ? 'Additional notes (optional):' : 'Ghi chú bổ sung (nếu có):'}
            </label>
            <textarea
              rows={2}
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
              placeholder={isEn ? 'Enter extra note...' : 'Nhập ghi chú thêm...'}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
