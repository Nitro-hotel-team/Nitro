/**
 * ============================================================================
 * TÊN FILE: SystemSettingsPage.tsx
 * VỊ TRÍ: src/pages/staff/SystemSettingsPage.tsx
 * PHÂN HỆ: Cài đặt Cấu hình Khách sạn (TASK-55 / FE-S3-25)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trung tâm thiết lập quy chuẩn và thông số vận hành của Nitro Grand Hotel:
 *     + Giờ nhận phòng tiêu chuẩn (14:00), Giờ trả phòng tiêu chuẩn (12:00) (DoD 1).
 *     + Tỷ lệ thuế Giá trị gia tăng (% VAT: 8% hoặc 10%) (DoD 1).
 *     + Phí phục vụ tiêu chuẩn 4 sao (% Service Charge: 5%) (DoD 1).
 *     + Chính sách phụ thu quá giờ (Early check-in / Late check-out surcharge).
 *     + Nút "Lưu cài đặt" với thông báo Toast phản hồi thành công tức thời (DoD 1).
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Bell,
  Building,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Globe,
  Hotel,
  Percent,
  Receipt,
  Save,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';

export const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  // Hotel Profile
  const [hotelName, setHotelName] = useState('Nitro Grand Hotel Saigon');
  const [hotelAddress, setHotelAddress] = useState('24 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
  const [hotelPhone, setHotelPhone] = useState('1900 1234 / (028) 3822 9999');
  const [hotelEmail, setHotelEmail] = useState('booking@nitrograndhotel.vn');

  // Operational Times (DoD 1)
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('12:00');
  const [holdTimerMinutes, setHoldTimerMinutes] = useState(10);

  // Taxes & Service Fees (DoD 1)
  const [vatRate, setVatRate] = useState(8); // % VAT GTGT
  const [serviceFeeRate, setServiceFeeRate] = useState(5); // % Phí phục vụ

  // Surcharges & Policies
  const [earlyCheckInFee, setEarlyCheckInFee] = useState(30); // % phụ thu nhận sớm trước 12:00
  const [lateCheckOutFee, setLateCheckOutFee] = useState(50); // % phụ thu trả muộn sau 15:00
  const [currency, setCurrency] = useState('VND');

  // Integrations
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'https://api.nitrohotel.vn/v1');
  const [paymentGateway, setPaymentGateway] = useState('VNPAY_SANDBOX');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu cấu hình thông số vận hành khách sạn thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Notification (DoD 1) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.systemSettings')}</h1>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-300">
              Admin Configuration
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            Cấu hình giờ nhận/trả phòng tiêu chuẩn, tỷ lệ thuế VAT, phí dịch vụ và chính sách phụ thu vận hành
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleSave}
          icon={<Save className="w-4 h-4" />}
          className="font-bold shadow-xs cursor-pointer"
        >
          Lưu cài đặt
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* KHUNG GIỜ NHẬN & TRẢ PHÒNG TIÊU CHUẨN (DoD 1) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h2 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1F5AA6]" />
              Quy chuẩn Giờ giấc Vận hành &amp; Giữ phòng (DoD 1)
            </h2>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Chuẩn 4 sao quốc tế
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">
                Giờ Check-in tiêu chuẩn:
              </label>
              <input
                type="text"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                placeholder="14:00"
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono font-bold text-sm text-[#1F5AA6] focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Mặc định 14:00 chiều</span>
            </div>

            <div>
              <label className="block font-bold text-[#0F172A] mb-1">
                Giờ Check-out tiêu chuẩn:
              </label>
              <input
                type="text"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                placeholder="12:00"
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono font-bold text-sm text-amber-700 focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Mặc định 12:00 trưa</span>
            </div>

            <div>
              <label className="block font-bold text-[#0F172A] mb-1">
                Thời gian giữ phòng tạm (phút):
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={holdTimerMinutes}
                onChange={(e) => setHoldTimerMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Hold timer đặt chỗ trực tuyến</span>
            </div>
          </div>
        </div>

        {/* THUẾ GTGT (VAT) & PHÍ PHỤC VỤ (DoD 1) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h2 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Chính sách Thuế GTGT (VAT) &amp; Phí Phục vụ (DoD 1)
            </h2>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Chuẩn tài chính VAS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-[#0F172A] flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  Thuế Giá trị gia tăng (% VAT):
                </label>
                <span className="font-mono font-black text-sm text-emerald-700">{vatRate}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="20"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500">
                Áp dụng tính tự động trên hóa đơn đặt phòng và dịch vụ minibar (Thường 8% hoặc 10%).
              </p>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-[#0F172A] flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-[#1F5AA6]" />
                  Phí dịch vụ khách sạn (% Service Fee):
                </label>
                <span className="font-mono font-black text-sm text-[#1F5AA6]">{serviceFeeRate}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="15"
                value={serviceFeeRate}
                onChange={(e) => setServiceFeeRate(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-[#E2E8F0] bg-white font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500">
                Phí phục vụ tiêu chuẩn khách sạn 4 sao (Mặc định 5% giá trị phòng).
              </p>
            </div>
          </div>

          {/* Phụ thu quá giờ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phụ thu nhận phòng sớm (% tiền phòng 1 đêm):
              </label>
              <input
                type="number"
                value={earlyCheckInFee}
                onChange={(e) => setEarlyCheckInFee(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Áp dụng nhận phòng từ 06:00 - 12:00</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phụ thu trả phòng muộn (% tiền phòng 1 đêm):
              </label>
              <input
                type="number"
                value={lateCheckOutFee}
                onChange={(e) => setLateCheckOutFee(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Áp dụng trả phòng từ 12:00 - 18:00</span>
            </div>
          </div>
        </div>

        {/* THÔNG TIN KHÁCH SẠN */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Hotel className="w-4 h-4 text-[#1F5AA6]" />
            Thông tin Pháp nhân &amp; Thương hiệu Khách sạn
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên khách sạn chính thức:</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Địa chỉ trụ sở khách sạn:</label>
              <input
                type="text"
                value={hotelAddress}
                onChange={(e) => setHotelAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tổng đài lễ tân:</label>
                <input
                  type="text"
                  value={hotelPhone}
                  onChange={(e) => setHotelPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email liên hệ tiếp tân:</label>
                <input
                  type="email"
                  value={hotelEmail}
                  onChange={(e) => setHotelEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* NÚT LƯU THIẾT LẬP */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="gold"
            size="md"
            icon={<Save className="w-4 h-4" />}
            className="font-bold shadow-md cursor-pointer px-6"
          >
            Lưu cài đặt thông số
          </Button>
        </div>
      </form>
    </div>
  );
};
