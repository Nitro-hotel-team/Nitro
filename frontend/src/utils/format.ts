/**
 * ============================================================================
 * TÊN FILE: format.ts
 * VỊ TRÍ: src/utils/format.ts
 * PHÂN HỆ: Tiện ích Định dạng Dữ liệu & Bản đồ Trạng thái (Formatting & Status Mapping)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Chứa các hàm chuyển đổi và định dạng dữ liệu hiển thị nhất quán trên toàn ứng dụng:
 *     + formatCurrency: Định dạng tiền tệ VND theo chuẩn Việt Nam (vi-VN) hoặc Quốc tế (en-US).
 *     + formatDate / formatDateTime: Chuẩn hóa hiển thị ngày tháng theo định dạng dd/MM/yyyy.
 *     + maskPhone / maskIdCard: Ẩn thông tin nhạy cảm của khách hàng (bảo mật dữ liệu cá nhân).
 * - Cung cấp bảng mã màu, biểu tượng và nhãn song ngữ cho các trạng thái:
 *     + BOOKING_STATUS_MAP: Trạng thái đặt phòng (Chờ xác nhận, Đã xác nhận, Đang ở, Đã trả phòng, Đã hủy).
 *     + ROOM_STATUS_MAP: Trạng thái phòng (Sẵn sàng, Đã đặt, Đang ở, Đang dọn dẹp, Bảo trì).
 * ============================================================================
 */

import { BookingSource, BookingStatus, RoomStatus } from '../types';

/**
 * Định dạng tiền tệ VND sang chuỗi có dấu phân cách hàng nghìn.
 * Xử lý an toàn các trường hợp biên: 0, số âm, NaN, undefined.
 * @param amount - Số tiền VND nguyên dương
 * @param language - Mã ngôn ngữ 'vi' hoặc 'en'
 */
export const formatCurrency = (amount: number, language: 'vi' | 'en' = 'vi'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return language === 'en' ? '₫0' : '0 ₫';
  }
  if (language === 'en') {
    return '₫' + amount.toLocaleString('en-US');
  }
  return amount.toLocaleString('vi-VN') + ' ₫';
};

/**
 * Chuẩn hóa định dạng ngày sang dd/MM/yyyy.
 * Hỗ trợ chuỗi yyyy-MM-dd, ISO 8601, xử lý an toàn chuỗi rỗng / không hợp lệ.
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  const trimmed = dateString.trim();
  // Nếu là định dạng yyyy-MM-dd thuần túy
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parts = trimmed.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Chuẩn hóa hiển thị thời gian ngày giờ dạng HH:mm dd/MM/yyyy.
 */
export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

/**
 * Ẩn thông tin nhạy cảm số điện thoại (ví dụ: 0901234567 -> 090****567)
 */
export const maskPhone = (phone?: string | null): string => {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.length < 7) return clean;
  return clean.slice(0, 3) + '****' + clean.slice(-3);
};

/**
 * Ẩn thông tin nhạy cảm CCCD/CMND (ví dụ: 079199001234 -> 079******234)
 */
export const maskIdCard = (id?: string | null): string => {
  if (!id) return '';
  const clean = id.trim();
  if (clean.length < 6) return clean;
  return clean.slice(0, 3) + '******' + clean.slice(-3);
};

/**
 * Thuật toán tính số đêm lưu trú giữa ngày nhận phòng (Check-in) và ngày trả phòng (Check-out)
 */
export const calculateNights = (checkInDate?: string | null, checkOutDate?: string | null): number => {
  if (!checkInDate || !checkOutDate) return 1;
  const start = new Date(checkInDate.includes('T') ? checkInDate : `${checkInDate}T00:00:00`).getTime();
  const end = new Date(checkOutDate.includes('T') ? checkOutDate : `${checkOutDate}T00:00:00`).getTime();
  if (isNaN(start) || isNaN(end)) return 1;
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

export interface TaxBreakdown {
  subtotal: number;
  serviceFee: number;
  vat: number;
  totalTaxesAndFees: number;
  grandTotal: number;
}

/**
 * Công thức tính thuế VAT và phí dịch vụ 4 sao tiêu chuẩn
 * @param subtotal - Tiền phòng và dịch vụ trước thuế
 * @param vatPercent - Tỷ lệ thuế VAT (% - mặc định 8%)
 * @param serviceFeePercent - Tỷ lệ phí phục vụ (% - mặc định 5%)
 */
export const calculateTaxesAndFees = (
  subtotal: number,
  vatPercent: number = 8,
  serviceFeePercent: number = 5
): TaxBreakdown => {
  const safeSubtotal = Math.max(0, isNaN(subtotal) ? 0 : subtotal);
  const serviceFee = Math.round(safeSubtotal * (serviceFeePercent / 100));
  const vat = Math.round(safeSubtotal * (vatPercent / 100));
  const totalTaxesAndFees = serviceFee + vat;
  const grandTotal = safeSubtotal + totalTaxesAndFees;
  return {
    subtotal: safeSubtotal,
    serviceFee,
    vat,
    totalTaxesAndFees,
    grandTotal,
  };
};

/**
 * Logic tính tỷ lệ hoàn tiền hủy phòng 3 bậc theo chính sách khách sạn 4 sao của BA/PO:
 * - Hủy trước > 48 giờ: Hoàn 100% (tỷ lệ 1.0)
 * - Hủy trong khoảng 24 - 48 giờ: Hoàn 50% (tỷ lệ 0.5)
 * - Hủy dưới 24 giờ hoặc quá hạn: Hoàn 0% (tỷ lệ 0.0)
 */
export const calculateRefundRate = (
  hoursOrCheckIn: number | string,
  cancelDateInput?: string | Date
): number => {
  let hoursRemaining: number;
  if (typeof hoursOrCheckIn === 'number') {
    hoursRemaining = hoursOrCheckIn;
  } else {
    const checkInTime = new Date(
      hoursOrCheckIn.includes('T') ? hoursOrCheckIn : `${hoursOrCheckIn}T14:00:00`
    ).getTime();
    const cancelTime = cancelDateInput
      ? (cancelDateInput instanceof Date ? cancelDateInput.getTime() : new Date(cancelDateInput).getTime())
      : Date.now();
    if (isNaN(checkInTime) || isNaN(cancelTime)) return 0;
    hoursRemaining = (checkInTime - cancelTime) / (1000 * 60 * 60);
  }

  if (hoursRemaining > 48) {
    return 1.0;
  } else if (hoursRemaining >= 24) {
    return 0.5;
  } else {
    return 0.0;
  }
};

/**
 * Tính số tiền hoàn lại thực tế cho khách hàng dựa trên số tiền đã thanh toán
 */
export const calculateRefundAmount = (
  paidAmount: number,
  hoursOrCheckIn: number | string,
  cancelDateInput?: string | Date
): number => {
  if (typeof paidAmount !== 'number' || isNaN(paidAmount) || paidAmount <= 0) {
    return 0;
  }
  const rate = calculateRefundRate(hoursOrCheckIn, cancelDateInput);
  return Math.round(paidAmount * rate);
};

/**
 * Nhãn chính sách hoàn tiền tương ứng
 */
export const getRefundTierLabel = (
  hoursOrCheckIn: number | string,
  language: 'vi' | 'en' = 'vi'
): string => {
  const rate = calculateRefundRate(hoursOrCheckIn);
  const isEn = language === 'en';
  if (rate === 1.0) {
    return isEn ? '100% Refund (>48h)' : 'Hoàn 100% (>48h)';
  } else if (rate === 0.5) {
    return isEn ? '50% Refund (24-48h)' : 'Hoàn 50% (24-48h)';
  } else {
    return isEn ? '0% Non-refundable (<24h)' : 'Không hoàn tiền (<24h)';
  }
};

export interface StatusConfig {
  labelVi: string;
  labelEn: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  iconName: string;
}

export const BOOKING_STATUS_MAP: Record<BookingStatus, StatusConfig> = {
  PENDING: {
    labelVi: 'Đang giữ chỗ',
    labelEn: 'Pending',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    iconName: 'Clock',
  },
  CONFIRMED: {
    labelVi: 'Đã xác nhận',
    labelEn: 'Confirmed',
    bgColor: 'bg-blue-50',
    textColor: 'text-[#1F5AA6]',
    borderColor: 'border-blue-200',
    dotColor: 'bg-[#1F5AA6]',
    iconName: 'CheckCircle',
  },
  CHECKED_IN: {
    labelVi: 'Đang lưu trú',
    labelEn: 'Checked-in',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-600',
    iconName: 'Key',
  },
  CHECKED_OUT: {
    labelVi: 'Đã trả phòng',
    labelEn: 'Checked-out',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
    dotColor: 'bg-slate-400',
    iconName: 'LogOut',
  },
  CANCELLED: {
    labelVi: 'Đã hủy',
    labelEn: 'Cancelled',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-600',
    iconName: 'XCircle',
  },
  EXPIRED: {
    labelVi: 'Hết hạn giữ chỗ',
    labelEn: 'Expired',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
    iconName: 'TimerOff',
  },
  NO_SHOW: {
    labelVi: 'Không đến',
    labelEn: 'No-show',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    dotColor: 'bg-purple-600',
    iconName: 'UserX',
  },
};

export const ROOM_STATUS_MAP: Record<RoomStatus, {
  labelVi: string;
  labelEn: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeBg: string;
}> = {
  AVAILABLE: {
    labelVi: 'Trống',
    labelEn: 'Available',
    bgColor: 'bg-[#DCFCE7]',
    textColor: 'text-emerald-800',
    borderColor: 'border-[#16A34A]',
    badgeBg: 'bg-[#DCFCE7] text-emerald-800 border-emerald-300',
  },
  RESERVED: {
    labelVi: 'Đã đặt',
    labelEn: 'Reserved',
    bgColor: 'bg-[#DBEAFE]',
    textColor: 'text-blue-800',
    borderColor: 'border-[#1F5AA6]',
    badgeBg: 'bg-[#DBEAFE] text-blue-800 border-blue-300',
  },
  OCCUPIED: {
    labelVi: 'Có khách',
    labelEn: 'Occupied',
    bgColor: 'bg-[#FFEDD5]',
    textColor: 'text-orange-800',
    borderColor: 'border-[#EA580C]',
    badgeBg: 'bg-[#FFEDD5] text-orange-800 border-orange-300',
  },
  CLEANING: {
    labelVi: 'Đang dọn',
    labelEn: 'Cleaning',
    bgColor: 'bg-[#FEF9C3]',
    textColor: 'text-yellow-800',
    borderColor: 'border-[#CA8A04]',
    badgeBg: 'bg-[#FEF9C3] text-yellow-800 border-yellow-300',
  },
  MAINTENANCE: {
    labelVi: 'Bảo trì',
    labelEn: 'Maintenance',
    bgColor: 'bg-[#E2E8F0]',
    textColor: 'text-slate-700',
    borderColor: 'border-[#64748B]',
    badgeBg: 'bg-[#E2E8F0] text-slate-700 border-slate-300',
  },
};

export const BOOKING_SOURCE_MAP: Record<BookingSource, {
  labelVi: string;
  labelEn: string;
  color: string;
  textColor: string;
  bgColor: string;
}> = {
  WEB: {
    labelVi: 'Web',
    labelEn: 'Web',
    color: '#1F5AA6',
    textColor: 'text-[#1F5AA6]',
    bgColor: 'bg-blue-50 border-blue-200 text-[#1F5AA6]',
  },
  MOBILE: {
    labelVi: 'Mobile App',
    labelEn: 'Mobile App',
    color: '#7C3AED',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  COUNTER: {
    labelVi: 'Quầy',
    labelEn: 'Front Desk / Walk-in',
    color: '#EA580C',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  OTA: {
    labelVi: 'Đại lý OTA',
    labelEn: 'Online Travel Agent',
    color: '#059669',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
};
