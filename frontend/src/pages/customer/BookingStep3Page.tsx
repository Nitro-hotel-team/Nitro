/**
 * ============================================================================
 * TÊN FILE: BookingStep3Page.tsx
 * VỊ TRÍ: src/pages/customer/BookingStep3Page.tsx
 * PHÂN HỆ: Quy trình Đặt phòng Khách hàng - Bước 3 (Confirmation & Receipt)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trang thông báo hoàn tất đặt phòng thành công:
 *     + Hiển thị mã đặt phòng PNR chính thức (ví dụ: NTR-260921-0042) kèm nút Sao chép (Copy to clipboard).
 *     + Mã QR Code check-in nhanh tại quầy lễ tân khách sạn.
 *     + Chi tiết biên nhận thanh toán: Hạng phòng, ngày check-in/out, tên khách, số tiền đã trả.
 *     + Các hành động tiện ích: Xem đơn trong "Đặt phòng của tôi", In xác nhận (Print receipt),
 *       hoặc quay về Trang chủ.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Home,
  Mail,
  MapPin,
  Printer,
  QrCode,
  Share2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/format';

export const BookingStep3Page: React.FC = () => {
  const { t } = useTranslation();
  const { draftBooking, language } = useApp();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  // Fallback booking code if draft is cleared
  const bookingCode = draftBooking?.bookingCode || 'NTR-260921-0042';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Success Banner Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-4">
        {/* Animated Checkmark */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            {t('booking.bookingSuccess')}
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto">
            {t('booking.confirmationSent')}
          </p>
        </div>

        {/* Booking Code Display Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between">
          <div className="text-left">
            <div className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-wider">
              {t('booking.bookingCode')}
            </div>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#1F5AA6]">
              {bookingCode}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </Button>
        </div>

        {/* Fast Check-in QR Code */}
        <div className="pt-4 border-t border-[#E2E8F0] max-w-md mx-auto">
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-5 flex flex-col items-center">
            {/* SVG simulated crisp QR code */}
            <div className="w-36 h-36 bg-slate-900 rounded-xl p-2.5 flex items-center justify-center text-white mb-2 shadow-xs">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                <rect x="10" y="10" width="30" height="30" fill="white" />
                <rect x="15" y="15" width="20" height="20" fill="#0B1F3A" />
                <rect x="20" y="20" width="10" height="10" fill="white" />

                <rect x="60" y="10" width="30" height="30" fill="white" />
                <rect x="65" y="15" width="20" height="20" fill="#0B1F3A" />
                <rect x="70" y="20" width="10" height="10" fill="white" />

                <rect x="10" y="60" width="30" height="30" fill="white" />
                <rect x="15" y="65" width="20" height="20" fill="#0B1F3A" />
                <rect x="20" y="70" width="10" height="10" fill="white" />

                <rect x="45" y="15" width="8" height="8" fill="white" />
                <rect x="45" y="30" width="8" height="8" fill="white" />
                <rect x="45" y="45" width="12" height="12" fill="white" />
                <rect x="15" y="45" width="10" height="8" fill="white" />
                <rect x="65" y="55" width="15" height="8" fill="white" />
                <rect x="60" y="75" width="25" height="10" fill="white" />
                <rect x="45" y="65" width="8" height="20" fill="white" />
              </svg>
            </div>
            <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#1F5AA6]" />
              Mã QR nhận phòng nhanh (Fast Check-in)
            </div>
            <p className="text-[11px] text-[#475569] mt-0.5">
              Xuất trình mã này tại quầy lễ tân tầng 1 để nhận thẻ phòng tức thì
            </p>
          </div>
        </div>

        {/* Manual Payment Instructions */}
        {draftBooking?.paymentMethod === 'BANK_TRANSFER' && (
          <div className="pt-4 border-t border-[#E2E8F0] max-w-md mx-auto">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-left space-y-3">
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Hướng dẫn chuyển khoản
              </h3>
              <div className="text-xs text-indigo-800 space-y-1.5">
                <div className="flex justify-between border-b border-indigo-100/50 pb-1.5">
                  <span className="opacity-70">Ngân hàng:</span>
                  <span className="font-bold">Vietcombank - CN Tân Định</span>
                </div>
                <div className="flex justify-between border-b border-indigo-100/50 pb-1.5">
                  <span className="opacity-70">Chủ tài khoản:</span>
                  <span className="font-bold">CTY TNHH KHÁCH SẠN NITRO</span>
                </div>
                <div className="flex justify-between border-b border-indigo-100/50 pb-1.5">
                  <span className="opacity-70">Số tài khoản:</span>
                  <span className="font-bold font-mono text-sm">0181001234567</span>
                </div>
                <div className="flex justify-between border-b border-indigo-100/50 pb-1.5">
                  <span className="opacity-70">Số tiền:</span>
                  <span className="font-bold text-red-600">{formatCurrency(draftBooking?.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="opacity-70">Nội dung CK:</span>
                  <span className="font-bold font-mono text-xs">{bookingCode}</span>
                </div>
              </div>
              <p className="text-[11px] text-indigo-700/80 italic text-center pt-2">
                * Đơn đặt phòng của quý khách sẽ được tự động xác nhận sau khi nhận được thanh toán (Tối đa 24h).
              </p>
            </div>
          </div>
        )}

        {draftBooking?.paymentMethod === 'CASH' && (
          <div className="pt-4 border-t border-[#E2E8F0] max-w-md mx-auto">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center space-y-2">
              <h3 className="text-sm font-bold text-emerald-900 flex justify-center items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Thanh toán tại quầy
              </h3>
              <p className="text-xs text-emerald-800">
                Quý khách vui lòng thanh toán số tiền <strong className="text-red-600">{formatCurrency(draftBooking?.totalAmount || 0)}</strong> trực tiếp tại Lễ tân (bằng tiền mặt hoặc thẻ) trong quá trình làm thủ tục nhận phòng.
              </p>
            </div>
          </div>
        )}

        {/* Booking Recap Details */}
        <div className="bg-slate-50 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto border border-slate-200">
          <div className="flex justify-between">
            <span className="text-[#475569]">Khách sạn:</span>
            <span className="font-bold text-[#0F172A]">Nitro Grand Hotel (24 Nguyễn Huệ, Q.1)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#475569]">Hạng phòng:</span>
            <span className="font-bold text-[#1F5AA6]">
              {draftBooking?.roomTypeName || 'Deluxe City View'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#475569]">Thời gian:</span>
            <span className="font-bold text-[#0F172A]">
              {formatDate(draftBooking?.checkInDate || '')} &rarr;{' '}
              {formatDate(draftBooking?.checkOutDate || '')} ({draftBooking?.nights || 1} đêm)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#475569]">Khách lưu trú:</span>
            <span className="font-bold text-[#0F172A]">
              {draftBooking?.guestName || 'Nguyễn Văn An'}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold">
            <span className="text-[#0F172A]">Đã thanh toán:</span>
            <span className="text-emerald-700 tabular-nums">
              {formatCurrency(draftBooking?.totalAmount || 1638000, language)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/my-bookings')}
            className="w-full sm:w-auto"
          >
            Xem danh sách đặt phòng của tôi
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/')}
            icon={<Home className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Về trang chủ
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
            className="w-full sm:w-auto text-slate-600"
          >
            In xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
};
