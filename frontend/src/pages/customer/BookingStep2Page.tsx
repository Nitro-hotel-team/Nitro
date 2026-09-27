/**
 * ============================================================================
 * TÊN FILE: BookingStep2Page.tsx
 * VỊ TRÍ: src/pages/customer/BookingStep2Page.tsx
 * PHÂN HỆ: Quy trình Đặt phòng Khách hàng - Bước 2 (Payment Gateway Selection)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Lựa chọn phương thức thanh toán bảo mật:
 *     + Cổng VNPAY (Thẻ ATM nội địa, QR Pay, Visa/Master/JCB).
 *     + Ví điện tử MoMo (Quét mã QR tức thì).
 *     + Thẻ quốc tế Visa / MasterCard / JCB (Mã hóa SSL 256-bit).
 *     + Thanh toán trực tiếp khi nhận phòng tại Lễ tân (Pay at Hotel Check-in).
 * - Hiển thị bộ đếm giữ phòng khẩn cấp (HoldCountdown).
 * - Mô phỏng quá trình giao tiếp Payment Gateway (Loading overlay modal & xử lý lỗi mô phỏng).
 * - Tạo mã PNR và chuyển tiếp sang Bước 3 (Xác nhận thành công).
 * - Kết nối Backend REST API:
 *     + `POST /api/v1/bookings`: Tạo bản ghi đặt phòng mới kèm trạng thái thanh toán.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { HoldCountdown } from '../../components/common/HoldCountdown';
import { useApp } from '../../context/AppContext';
import { bookingService } from '../../services/api';
import { PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const BookingStep2Page: React.FC = () => {
  const { t } = useTranslation();
  const { draftBooking, setDraftBooking, language } = useApp();
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('VNPAY');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (!draftBooking || !draftBooking.roomTypeId) {
      navigate('/rooms');
    }
  }, [draftBooking, navigate]);

  const paymentMethods: {
    id: PaymentMethod;
    name: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'VNPAY',
      name: 'Cổng VNPay-QR / ATM Nội địa',
      description: 'Quét mã QR từ hơn 40 ứng dụng ngân hàng và ví điện tử Việt Nam',
      badge: 'Khuyên dùng',
      icon: <QrCode className="w-6 h-6 text-[#1F5AA6]" />,
    },
    {
      id: 'CREDIT_CARD',
      name: 'Thẻ quốc tế (Visa / MasterCard / JCB)',
      description: 'Cổng thanh toán bảo mật 3D-Secure quốc tế',
      badge: 'Bảo mật PCI-DSS',
      icon: <CreditCard className="w-6 h-6 text-[#0F172A]" />,
    },
    {
      id: 'MOMO',
      name: 'Ví điện tử MoMo',
      description: 'Xác nhận thanh toán một chạm tức thì trên điện thoại',
      badge: 'Nhanh chóng',
      icon: <Smartphone className="w-6 h-6 text-pink-600" />,
    },
    {
      id: 'ZALOPAY',
      name: 'Ví điện tử ZaloPay',
      description: 'Liên kết thẻ ngân hàng hoặc số dư ZaloPay',
      badge: 'Ưu đãi 5%',
      icon: <Wallet className="w-6 h-6 text-blue-500" />,
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Chuyển khoản ngân hàng',
      description: 'Thanh toán bằng hình thức chuyển khoản qua ngân hàng',
      badge: 'An toàn',
      icon: <CheckCircle2 className="w-6 h-6 text-indigo-600" />,
    },
    {
      id: 'CASH',
      name: 'Tiền mặt tại quầy',
      description: 'Thanh toán trực tiếp tại Lễ tân khi nhận phòng',
      badge: 'Linh hoạt',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    },
  ];

  const handleProcessPayment = async () => {
    if (!agreedToTerms) {
      setPaymentError('Vui lòng đồng ý với Điều khoản và Chính sách hủy phòng trước khi thanh toán');
      return;
    }

    if (!draftBooking) {
      navigate('/rooms');
      return;
    }

    setPaymentError(null);
    setIsProcessing(true);

    try {
      // Chuẩn bị payload đúng với BookingCreate schema của backend
      const bookingPayload: Record<string, any> = {
        roomTypeId: draftBooking.roomTypeId,
        roomNumber: draftBooking.roomNumber || undefined,
        checkInDate: draftBooking.checkInDate,
        checkOutDate: draftBooking.checkOutDate,
        nights: draftBooking.nights || 1,
        adults: draftBooking.adults || 1,
        children: draftBooking.children || 0,
        guestName: draftBooking.guestName,
        guestPhone: draftBooking.guestPhone,
        guestEmail: draftBooking.guestEmail || undefined,
        guestIdCard: draftBooking.guestIdCard || undefined,
        totalAmount: draftBooking.totalAmount || 0,
        paidAmount: 0,
        paymentMethod: selectedMethod,
        source: 'WEB',
        specialRequests: draftBooking.specialRequests || undefined,
        // Chuyển đổi extraServices: frontend dùng `id`, backend cần `serviceId`
        extraServices: (draftBooking.extraServices || []).map((svc) => ({
          serviceId: svc.id,
          name: svc.name,
          price: svc.price,
          quantity: svc.quantity || 1,
        })),
      };

      const newBooking = await bookingService.createBooking(bookingPayload as any);

      setDraftBooking({
        ...draftBooking,
        bookingCode: newBooking.bookingCode,
        id: newBooking.id,
        paymentMethod: selectedMethod,
      });

      if (selectedMethod === 'VNPAY') {
        const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();
        const res = await fetch(`${API_URL}/api/payments/create_vnpay_url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: parseInt(newBooking.id, 10),
            amount: newBooking.totalAmount
          })
        });
        
        if (!res.ok) throw new Error('Lỗi kết nối cổng thanh toán VNPay');
        
        const data = await res.json();
        // Redirect to VNPay
        window.location.href = data.payment_url;
        return; 
      }

      setIsProcessing(false);
      navigate('/booking/step-3');
    } catch (err: any) {
      console.error('Lỗi khi thanh toán:', err);
      setIsProcessing(false);
      setPaymentError(err.message || 'Thanh toán không thành công. Vui lòng thử lại.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Stepper & Hold Notice */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ✓
            </span>
            <span>{t('booking.step1')}</span>
          </div>
          <span className="text-slate-300">&rarr;</span>
          <div className="flex items-center gap-1.5 text-[#1F5AA6]">
            <span className="w-6 h-6 rounded-full bg-[#1F5AA6] text-white flex items-center justify-center font-bold text-xs">
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

        <HoldCountdown />
      </div>

      {/* Payment Container */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">{t('booking.selectPaymentMethod')}</h1>
          <p className="text-xs text-[#475569] mt-1">
            Chọn một trong các phương thức thanh toán bảo mật bên dưới để hoàn tất đặt phòng.
          </p>
        </div>

        {/* Payment Methods Radio List */}
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <label
                key={method.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'border-[#1F5AA6] bg-blue-50/40 ring-1 ring-[#1F5AA6]'
                    : 'border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => setSelectedMethod(method.id)}
                  className="mt-1 w-4 h-4 text-[#1F5AA6] focus:ring-[#1F5AA6]"
                />
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0">
                  {method.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0F172A]">{method.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {method.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5">{method.description}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Security & Non-storage Card Data Notice (Strict Rule) */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold">An toàn &amp; Bảo mật tuyệt đối:</span> Giao dịch được mã hóa
            chuẩn 256-bit SSL trực tiếp tại cổng thanh toán ngân hàng đối tác. Nitro Grand Hotel{' '}
            <span className="font-semibold underline">cam kết không lưu trữ thông tin thẻ</span> và
            không phát sinh bất kỳ khoản phí ẩn nào.
          </div>
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <label className="flex items-start gap-2.5 text-xs text-[#475569] cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded text-[#1F5AA6] focus:ring-[#1F5AA6]"
            />
            <span>
              Tôi xác nhận thông tin đặt phòng là chính xác và đồng ý với{' '}
              <span className="text-[#1F5AA6] font-semibold underline">Điều khoản &amp; Điều kiện</span>{' '}
              và <span className="text-[#1F5AA6] font-semibold underline">Chính sách hủy phòng</span>{' '}
              của Nitro Grand Hotel.
            </span>
          </label>
        </div>

        {/* Payment Error */}
        {paymentError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{paymentError}</span>
            </div>
            <button
              onClick={handleProcessPayment}
              className="font-bold underline text-rose-900 hover:text-rose-950"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
          <Link
            to="/booking/step-1"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại thông tin
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="text-left sm:text-right flex items-center justify-between sm:block">
              <div className="text-[11px] text-[#475569]">Số tiền thanh toán:</div>
              <div className="text-lg sm:text-xl font-extrabold text-[#1F5AA6] tabular-nums">
                {formatCurrency(draftBooking?.totalAmount || 0, language)}
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              onClick={handleProcessPayment}
              disabled={isProcessing || !agreedToTerms}
              className="w-full sm:w-auto font-bold px-8 py-3 shadow-md text-center justify-center"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang xử lý thanh toán...
                </span>
              ) : (
                `Thanh toán ${formatCurrency(draftBooking?.totalAmount || 0, language)}`
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Simulated Gateway Processing Overlay Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1F5AA6] flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Đang kết nối cổng {selectedMethod}...
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Hệ thống đang tiến hành xác thực và thanh toán số tiền{' '}
              <span className="font-bold text-[#0F172A]">
                {formatCurrency(draftBooking?.totalAmount || 0, language)}
              </span>
              . Vui lòng không tải lại hoặc đóng trình duyệt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
