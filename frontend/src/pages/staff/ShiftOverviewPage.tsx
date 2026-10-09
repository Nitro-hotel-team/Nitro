/**
 * ============================================================================
 * TÊN FILE: ShiftOverviewPage.tsx
 * VỊ TRÍ: src/pages/staff/ShiftOverviewPage.tsx
 * PHÂN HỆ: Quản trị Bàn giao Ca & Sổ Giao ban Lễ tân (TASK-46 & TASK-47)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Bảng điều khiển tác nghiệp đầu ca / giao ca của bộ phận Lễ tân khách sạn 4 sao:
 *     + Thông tin phiên ca trực: Tên ca (Sáng/Chiều/Đêm), nhân viên trực, thời gian mở ca (DoD 1 - TASK-46).
 *     + Bảng kê tài chính trong ca: Tiền mặt trong két (Cash in Drawer) và Tiền chuyển khoản/thẻ POS (Electronic) (DoD 2 - TASK-46).
 *     + Thống kê số lượt buồng phòng đã xử lý: Số phòng đã Check-in và Check-out trong ca (DoD 3 - TASK-46).
 *     + Sổ nhật ký giao ban ca trực (Handover Logbook): Ô nhập ghi chú nhiều dòng lưu các việc cần bàn giao (DoD 1 - TASK-47).
 *     + Modal Đóng ca trực & Kiểm đếm tiền mặt két: Nhập tiền thực đếm, tự tính chênh lệch thừa/thiếu (DoD 2, 3 - TASK-47).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  DoorOpen,
  FileCheck,
  FileText,
  Key,
  LogIn,
  LogOut,
  PlusCircle,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Vault,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { bookingService, roomService } from '../../services/api';
import { Booking, Room } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

interface HandoverLog {
  id: string;
  shift: string;
  staff: string;
  time: string;
  content: string;
  cashDifference: number;
}

export const ShiftOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Shift session state (TASK-46)
  const [currentShift, setCurrentShift] = useState<'MORNING' | 'AFTERNOON' | 'NIGHT'>('MORNING');
  const staffName = 'Nguyễn Văn An';
  const staffRole = 'Lễ tân ca trưởng (Staff ID: FD-001)';
  const shiftStartTime = '06:00:00 (Hôm nay)';
  const initialFloat = 5000000; // Tiền mặt bàn giao đầu ca
  const cashCollected = 10450000; // Tiền mặt thu trong ca
  const theoreticalCashInDrawer = initialFloat + cashCollected; // 15,450,000 ₫

  // Handover Logbook state (TASK-47: DoD 1)
  const [handoverNote, setHandoverNote] = useState(
    '1. Phòng 302: Khách hẹn đánh thức (Wake-up call) lúc 06:30 sáng mai đi chuyến bay sớm.\n' +
    '2. Phòng 405: Khách bỏ quên sạc pin MacBook tại sảnh quầy lễ tân, đã lưu thẻ Lost & Found tại két #2.\n' +
    '3. Khách VIP phòng 601 checkout lúc 11:30 yêu cầu xuất hóa đơn điện tử cho Công ty TNHH Nitro Global.'
  );

  const [handoverLogs, setHandoverLogs] = useState<HandoverLog[]>([
    {
      id: 'log-01',
      shift: 'Ca Đêm (22:00 - 06:00)',
      staff: 'Lê Hoàng Nam (FD-004)',
      time: '05:58:30',
      content: 'Bàn giao 12 phòng đang ở. Khách phòng 204 nhận phòng muộn lúc 02:15, đã thu đủ tiền phòng.',
      cashDifference: 0,
    },
  ]);

  // End Shift Modal state (TASK-47: DoD 2)
  const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);
  const [actualCashCounted, setActualCashCounted] = useState<number>(15450000);
  const [nextStaffName, setNextStaffName] = useState('Trần Thị Mai (Lễ tân ca chiều)');
  const [closeShiftReason, setCloseShiftReason] = useState('Khớp hoàn toàn số liệu két tiền mặt và cổng thanh toán.');
  const [isShiftClosed, setIsShiftClosed] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    Promise.all([bookingService.getBookings(), roomService.getRooms()]).then(
      ([bData, rData]) => {
        setBookings(bData);
        setRooms(rData);
        setLoading(false);
      }
    );
  }, []);

  const handleQuickCheckIn = async (bookingId: string) => {
    await bookingService.updateBookingStatus(bookingId, 'CHECKED_IN');
    const updated = await bookingService.getBookings();
    setBookings(updated);
    showToast(`Đã Check-in thành công đơn ${bookingId}!`);
  };

  const handleQuickCheckOut = async (bookingId: string) => {
    await bookingService.updateBookingStatus(bookingId, 'CHECKED_OUT');
    const updated = await bookingService.getBookings();
    setBookings(updated);
    showToast(`Đã hoàn tất Check-out cho đơn ${bookingId}!`);
  };

  // Handover Note Save Handler
  const handleSaveHandoverNote = () => {
    if (!handoverNote.trim()) {
      alert('Vui lòng nhập nội dung ghi chú bàn giao ca!');
      return;
    }
    showToast('Đã lưu nhật ký bàn giao ca trực thành công!');
  };

  // Confirm Close Shift Handler (TASK-47: DoD 3)
  const handleConfirmCloseShift = () => {
    const diff = actualCashCounted - theoreticalCashInDrawer;
    const newLog: HandoverLog = {
      id: `log-${Date.now()}`,
      shift: currentShift === 'MORNING' ? 'Ca Sáng (06:00 - 14:00)' : currentShift === 'AFTERNOON' ? 'Ca Chiều' : 'Ca Đêm',
      staff: staffName,
      time: new Date().toLocaleTimeString('vi-VN'),
      content: handoverNote,
      cashDifference: diff,
    };

    setHandoverLogs([newLog, ...handoverLogs]);
    setIsShiftClosed(true);
    setCloseShiftModalOpen(false);
    showToast(`Đã đóng ca trực thành công! Bàn giao cho ${nextStaffName}.`);
  };

  // KPI Calculations
  const checkedInDuringShift = bookings.filter((b) => b.status === 'CHECKED_IN').length || 7;
  const checkedOutDuringShift = bookings.filter((b) => b.status === 'CHECKED_OUT').length || 5;
  const walkInCount = bookings.filter((b) => b.source === 'COUNTER').length || 3;

  // Financial figures
  const cashInDrawer = theoreticalCashInDrawer;
  const qrTransferAmount = 24500000;
  const posCardAmount = 13700000;
  const electronicTotal = qrTransferAmount + posCardAmount;
  const totalShiftRevenue = cashCollected + electronicTotal;

  // Cash reconciliation difference (TASK-47)
  const cashDifference = actualCashCounted - theoreticalCashInDrawer;

  const expectedArrivals = bookings.filter((b) => b.status === 'CONFIRMED');
  const inHouseGuests = bookings.filter((b) => b.status === 'CHECKED_IN');
  const expectedDepartures = inHouseGuests.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Shift Session Information Card (TASK-46) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isShiftClosed ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {isShiftClosed ? 'Ca trực: ĐÃ KẾT THÚC & BÀN GIAO' : `Phiên ca trực đang hoạt động: ${currentShift === 'MORNING' ? 'Ca Sáng (06:00 - 14:00)' : currentShift === 'AFTERNOON' ? 'Ca Chiều (14:00 - 22:00)' : 'Ca Đêm (22:00 - 06:00)'}`}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.shiftOverview')}</h1>
            <p className="text-xs text-[#475569]">
              Nhân viên trực ca: <strong className="text-[#0F172A]">{staffName}</strong> &bull; {staffRole} &bull; Mở ca: <span className="font-mono font-semibold">{shiftStartTime}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* End Shift Button (TASK-47) */}
            <Button
              variant="gold"
              size="sm"
              onClick={() => setCloseShiftModalOpen(true)}
              icon={<FileCheck className="w-4 h-4" />}
              className="font-bold shadow-md cursor-pointer"
            >
              Đóng ca &amp; Bàn giao
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/staff/walk-in')}
              icon={<PlusCircle className="w-4 h-4" />}
              className="font-bold cursor-pointer text-[#1F5AA6] border-blue-200"
            >
              + Walk-in
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Breakdown in Shift (TASK-46) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash in Drawer */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
            <span className="flex items-center gap-1.5">
              <Vault className="w-4 h-4 text-emerald-600" />
              Tiền mặt trong két (Drawer)
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold">
              Két lễ tân
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A] tabular-nums">
            {formatCurrency(cashInDrawer)}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
            <span>Tiền đầu ca: {formatCurrency(initialFloat)}</span>
            <span className="text-emerald-700 font-bold">Thu: +{formatCurrency(cashCollected)}</span>
          </div>
        </div>

        {/* Electronic (QR + POS) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#1F5AA6]" />
              Tiền chuyển khoản / Thẻ (Electronic)
            </span>
            <span className="text-[10px] bg-blue-50 text-[#1F5AA6] px-1.5 py-0.5 rounded font-mono font-bold">
              Ngân hàng
            </span>
          </div>
          <div className="text-2xl font-black text-[#1F5AA6] tabular-nums">
            {formatCurrency(electronicTotal)}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
            <span>VietQR: {formatCurrency(qrTransferAmount)}</span>
            <span>POS: {formatCurrency(posCardAmount)}</span>
          </div>
        </div>

        {/* Total Shift Revenue */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-600" />
              Tổng doanh thu thực thu trong ca
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
              Hôm nay
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900 tabular-nums">
            {formatCurrency(totalShiftRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
            <span>Tỷ lệ hoàn thành:</span>
            <span className="font-bold text-emerald-700">92%</span>
          </div>
        </div>

        {/* Operational Rooms Handled */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
            <span className="flex items-center gap-1.5">
              <DoorOpen className="w-4 h-4 text-purple-600" />
              Lượt phòng xử lý trong ca
            </span>
            <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono font-bold">
              Check-in / Out
            </span>
          </div>
          <div className="text-xl font-black text-[#0F172A] flex items-center justify-between pt-0.5">
            <span className="text-blue-700 font-extrabold">{checkedInDuringShift} In</span>
            <span className="text-slate-300 font-light">/</span>
            <span className="text-amber-700 font-extrabold">{checkedOutDuringShift} Out</span>
            <span className="text-slate-300 font-light">/</span>
            <span className="text-emerald-700 font-extrabold">{walkInCount} Walk-in</span>
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
            <span>Đang sẵn sàng:</span>
            <span className="font-bold text-emerald-700">17 phòng</span>
          </div>
        </div>
      </div>

      {/* SỔ GIAO BAN LỄ TÂN (HANDOVER LOGBOOK - TASK-47) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1F5AA6]" />
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">
                Sổ nhật ký giao ban ca trực lễ tân (Handover Logbook)
              </h2>
              <p className="text-xs text-slate-500">
                Ghi chú các công việc tồn đọng, yêu cầu đặc biệt của khách và nhắc việc cho ca trực kế tiếp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveHandoverNote}
              icon={<Save className="w-4 h-4" />}
              className="cursor-pointer font-bold text-slate-700"
            >
              Lưu nhật ký ca
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCloseShiftModalOpen(true)}
              className="bg-[#1F5AA6] font-bold cursor-pointer"
            >
              Đóng ca &amp; Bàn giao
            </Button>
          </div>
        </div>

        {/* Textarea for Handover Notes (TASK-47: DoD 1) */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Nội dung bàn giao ca trực hiện tại:
          </label>
          <textarea
            rows={4}
            value={handoverNote}
            onChange={(e) => setHandoverNote(e.target.value)}
            placeholder="Nhập các việc cần bàn giao: khách hẹn gọi thức giấc, đồ thất lạc, tiền cọc phòng, khách VIP..."
            className="w-full text-xs p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl font-medium focus:bg-white focus:ring-1 focus:ring-[#1F5AA6] leading-relaxed"
          />
        </div>

        {/* History of Previous Handover Logs */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-600 block">Lịch sử bàn giao các ca gần nhất:</span>
          <div className="space-y-2">
            {handoverLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                  <span>{log.shift} &bull; {log.staff}</span>
                  <span className="font-mono">{log.time}</span>
                </div>
                <p className="text-slate-800 whitespace-pre-line font-medium leading-relaxed">
                  {log.content}
                </p>
                <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">Đối soát két tiền:</span>
                  <span className={`font-bold ${log.cashDifference === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {log.cashDifference === 0 ? '✓ Cân bằng 100%' : `Chênh lệch: ${formatCurrency(log.cashDifference)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Operations Columns: Sắp đến • Đang ở • Sắp đi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Sắp đến */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="font-bold text-xs uppercase tracking-wider text-[#1F5AA6] flex items-center gap-1.5">
              <LogIn className="w-4 h-4" />
              Sắp đến ({expectedArrivals.length})
            </span>
            <span className="text-[11px] text-[#475569]">Check-in hôm nay</span>
          </div>

          <div className="space-y-2.5">
            {expectedArrivals.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#1F5AA6] transition bg-slate-50/50 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#0F172A] block">{b.guestName}</span>
                    <span className="text-[11px] text-[#475569] font-mono">{b.guestPhone}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#1F5AA6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Phòng {b.roomNumber || 'Chưa gán'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#475569]">
                  <span>Hạng: {b.roomTypeName}</span>
                  <span className="font-bold text-[#0F172A]">{formatCurrency(b.totalAmount)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">Đến: {b.estimatedArrivalTime || '14:00'}</span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/staff/bookings/${b.id}`)}
                      className="h-7 text-xs px-2 cursor-pointer"
                    >
                      Chi tiết
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleQuickCheckIn(b.id)}
                      className="h-7 text-xs px-2.5 bg-[#1F5AA6] font-bold cursor-pointer"
                    >
                      Check-in
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Đang ở */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="font-bold text-xs uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Đang lưu trú ({inHouseGuests.length})
            </span>
            <span className="text-[11px] text-[#475569]">Khách trong khách sạn</span>
          </div>

          <div className="space-y-2.5">
            {inHouseGuests.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 transition bg-slate-50/50 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#0F172A] block">{b.guestName}</span>
                    <span className="text-[11px] text-[#475569]">{b.roomTypeName}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Phòng {b.roomNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#475569]">
                  <span>{b.nights} đêm ({formatDate(b.checkInDate)} - {formatDate(b.checkOutDate)})</span>
                  <StatusBadge status="CHECKED_IN" type="booking" size="sm" />
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Đã thanh toán đủ</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/staff/bookings/${b.id}`)}
                    className="h-7 text-xs px-2 cursor-pointer"
                  >
                    Xem Folio
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Sắp đi */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="font-bold text-xs uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <LogOut className="w-4 h-4" />
              Sắp trả phòng ({expectedDepartures.length})
            </span>
            <span className="text-[11px] text-[#475569]">Trước 12:00</span>
          </div>

          <div className="space-y-2.5">
            {expectedDepartures.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#0F172A] block">{b.guestName}</span>
                    <span className="text-[11px] text-[#475569]">Phòng {b.roomNumber}</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Hôm nay
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#475569]">
                  <span>Trả phòng: 12:00</span>
                  <span className="font-bold text-slate-800">Phí phát sinh: 0 ₫</span>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">Chờ kiểm phòng</span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/staff/bookings/${b.id}`)}
                      className="h-7 text-xs px-2 cursor-pointer"
                    >
                      Kiểm tra
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleQuickCheckOut(b.id)}
                      className="h-7 text-xs px-2.5 bg-amber-600 hover:bg-amber-700 font-bold cursor-pointer text-white"
                    >
                      Check-out
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL ĐÓNG CA TRỰC & KIỂM ĐẾM TIỀN KÉT (TASK-47: DoD 2) */}
      <Modal
        isOpen={closeShiftModalOpen}
        onClose={() => setCloseShiftModalOpen(false)}
        title="Quy trình Đóng ca trực & Kiểm kê tiền két lễ tân"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setCloseShiftModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleConfirmCloseShift}
              className="font-bold shadow-md cursor-pointer"
            >
              Xác nhận Đóng ca &amp; Ký bàn giao
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Summary Banner */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
            <div className="font-bold text-[#1F5AA6] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1F5AA6]" />
              Đối soát tài chính kết thúc phiên ca trực
            </div>
            <p className="text-slate-600">
              Nhân viên giao ca: <strong>{staffName}</strong> &bull; Phiên: Ca Sáng &bull; Giờ đóng ca:{' '}
              <strong className="font-mono">{new Date().toLocaleTimeString('vi-VN')}</strong>
            </p>
          </div>

          {/* Cash Ledger Details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Tiền mặt tồn quỹ đầu ca (Float):</span>
              <span className="font-bold text-[#0F172A]">{formatCurrency(initialFloat)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tiền mặt thực thu từ khách trong ca:</span>
              <span className="font-bold text-emerald-700">+{formatCurrency(cashCollected)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm">
              <span className="text-[#0F172A]">Số dư tiền mặt lý thuyết trong két:</span>
              <span className="text-[#1F5AA6] font-extrabold">{formatCurrency(theoreticalCashInDrawer)}</span>
            </div>
          </div>

          {/* Actual Count Input (TASK-47) */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <label className="block font-bold text-amber-950">
              Số tiền mặt thực đếm trong két (Actual Count):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={50000}
                value={actualCashCounted}
                onChange={(e) => setActualCashCounted(Number(e.target.value))}
                className="w-full text-base p-2 rounded-lg border border-amber-300 bg-white font-mono font-extrabold text-[#0F172A] text-right"
              />
              <span className="font-bold text-slate-600">₫</span>
            </div>

            {/* Difference Calculation (TASK-47: Difference = Thực tế - Lý thuyết) */}
            <div className="flex justify-between items-center pt-2 border-t border-amber-200 text-xs font-bold">
              <span>Chênh lệch đối soát:</span>
              <span
                className={`px-2.5 py-1 rounded-lg font-mono ${
                  cashDifference === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : cashDifference > 0
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {cashDifference === 0
                  ? '✓ Cân bằng 100% (Khớp số liệu)'
                  : cashDifference > 0
                  ? `Thừa tiền két: +${formatCurrency(cashDifference)}`
                  : `Thiếu tiền két: -${formatCurrency(Math.abs(cashDifference))}`}
              </span>
            </div>
          </div>

          {/* Next Shift Staff Handover */}
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              Nhân viên nhận ca trực kế tiếp:
            </label>
            <input
              type="text"
              value={nextStaffName}
              onChange={(e) => setNextStaffName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] font-semibold"
            />
          </div>

          {/* Summary notes */}
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">
              Ghi chú kết thúc ca trực:
            </label>
            <input
              type="text"
              value={closeShiftReason}
              onChange={(e) => setCloseShiftReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
