import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { draftBooking, setDraftBooking } = useApp();
  const [isProcessing, setIsProcessing] = useState(true);

  const status = searchParams.get('status');
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (status === 'success') {
      setTimeout(() => {
        setIsProcessing(false);
        if (draftBooking) {
          setDraftBooking(prev => prev ? {
            ...prev,
            paymentStatus: 'PAID',
            status: 'CONFIRMED'
          } : prev);
        }
      }, 1000);
    } else {
      setIsProcessing(false);
    }
  }, [status, draftBooking, setDraftBooking]);

  const handleGoToSuccess = () => {
    navigate('/booking/step-3');
  };

  const handleRetry = () => {
    navigate('/booking/step-2');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      {isProcessing ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 shadow-sm flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-[#1F5AA6] animate-spin mb-4" />
          <h2 className="text-xl font-bold text-[#0F172A]">Đang xử lý kết quả giao dịch...</h2>
          <p className="text-[#475569] mt-2">Vui lòng không đóng trình duyệt.</p>
        </div>
      ) : status === 'success' ? (
        <div className="bg-white border border-emerald-200 rounded-2xl p-10 shadow-sm flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Giao dịch thành công!</h2>
          <p className="text-[#475569]">
            Cảm ơn bạn đã thanh toán qua VNPay. Đơn đặt phòng <span className="font-bold">{bookingId || draftBooking?.bookingCode}</span> đã được ghi nhận.
          </p>
          <Button variant="primary" size="lg" onClick={handleGoToSuccess} className="mt-4 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            Xem xác nhận đặt phòng
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-rose-200 rounded-2xl p-10 shadow-sm flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <XCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Giao dịch thất bại!</h2>
          <p className="text-[#475569]">
            Quá trình thanh toán qua VNPay đã bị hủy hoặc xảy ra lỗi (Mã lỗi: {status}).
          </p>
          <div className="flex gap-4 mt-4 w-full justify-center">
            <Button variant="outline" size="lg" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
            <Button variant="primary" size="lg" onClick={handleRetry} className="bg-rose-600 hover:bg-rose-700">
              <RefreshCw className="w-4 h-4 mr-2" /> Thử thanh toán lại
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
