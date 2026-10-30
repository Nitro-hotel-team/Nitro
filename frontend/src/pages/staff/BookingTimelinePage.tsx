/**
 * ============================================================================
 * TÊN FILE: BookingTimelinePage.tsx
 * VỊ TRÍ: src/pages/staff/BookingTimelinePage.tsx
 * PHÂN HỆ: Lịch Đặt phòng Trực quan (Gantt Chart Room Timeline - TASK-42)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Biểu diễn lịch trình chiếm phòng theo sơ đồ Gantt trực quan:
 *     + Trục tung (Y-axis): Danh sách 60 phòng vật lý từ Tầng 1 đến Tầng 10 (Sticky left column).
 *     + Trục hoành (X-axis): Các mốc ngày tương lai (7 ngày, 14 ngày hoặc 30 ngày) kèm thứ trong tuần.
 *     + Khối thanh dài thể hiện khoảng lưu trú (Check-in đến Check-out) kèm tên khách và mã đơn PNR.
 *     + Nhận biết ngày cuối tuần, ngày hiện tại (Today highlight màu xanh dương).
 *     + Bộ điều hướng: "Tuần trước", "Hôm nay", "Tuần tới" và bộ lọc nhanh theo số tầng (Tầng 1 - 10).
 *     + Nhấp vào ô phòng trống để khởi tạo đơn Walk-in tức thì tại quầy.
 * - Kết nối Backend REST API:
 *     + `GET /api/v1/rooms`: Lấy danh sách 60 phòng.
 *     + `GET /api/v1/bookings`: Lấy các đơn đặt phòng tương ứng.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { bookingService, roomService } from '../../services/api';
import { Booking, Room } from '../../types';
import { formatDate } from '../../utils/format';

export const BookingTimelinePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [daysCount, setDaysCount] = useState<7 | 14 | 30>(14);
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');

  // Today reference
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current view window start date (defaults to today or start of current week)
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    // Align to Monday or today
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  useEffect(() => {
    Promise.all([roomService.getRooms(), bookingService.getBookings()]).then(
      ([rData, bData]) => {
        setRooms(rData);
        setBookings(bData);
      }
    );
  }, []);

  // Generate date array
  const dateColumns: Date[] = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dateColumns.push(d);
  }

  // Week navigation (TASK-42: Tuần trước, Hôm nay, Tuần tới)
  const handlePrevWeek = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() - 7);
    setStartDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 7);
    setStartDate(d);
  };

  const handleToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setStartDate(monday);
  };

  // Filter rooms by Floor (TASK-42)
  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor === 'ALL') return true;
    return r.floor === selectedFloor;
  });

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.roomTimeline')}</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Lịch đặt phòng trực quan dạng sơ đồ Gantt cho toàn bộ 60 buồng phòng (Tầng 1 &mdash; 10)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Days window toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {[7, 14, 30].map((num) => (
              <button
                key={num}
                onClick={() => setDaysCount(num as any)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  daysCount === num ? 'bg-white text-[#1F5AA6] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {num} ngày
              </button>
            ))}
          </div>

          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/staff/walk-in')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            + Walk-in
          </Button>
        </div>
      </div>

      {/* Date Navigation & Floor Filter Controls (TASK-42) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation buttons: Tuần trước, Hôm nay, Tuần tới */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Tuần trước
          </button>

          <button
            type="button"
            onClick={handleToday}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1F5AA6] bg-blue-50/50 hover:bg-blue-50 text-[#1F5AA6] font-bold text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Hôm nay
          </button>

          <button
            type="button"
            onClick={handleNextWeek}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Tuần tới
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-[#0F172A] ml-2 px-2.5 py-1 bg-slate-100 rounded-lg">
            {formatDate(dateColumns[0]?.toISOString().slice(0, 10))} &mdash;{' '}
            {formatDate(dateColumns[dateColumns.length - 1]?.toISOString().slice(0, 10))}
          </span>
        </div>

        {/* Floor selector filter (TASK-42) */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-bold text-[#475569] whitespace-nowrap">Lọc tầng:</span>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A] shadow-xs cursor-pointer focus:ring-1 focus:ring-[#1F5AA6]"
          >
            <option value="ALL">Tất cả tầng (60 phòng)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((fl) => (
              <option key={fl} value={fl}>
                Tầng {fl} ({rooms.filter((r) => r.floor === fl).length} phòng)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gantt Timeline Board */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[650px]">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-30">
              <tr className="bg-slate-100 border-b border-[#E2E8F0]">
                <th className="sticky left-0 z-40 bg-slate-200 border-r border-[#E2E8F0] px-4 py-3 text-left w-40 font-bold text-[#0F172A] shadow-xs">
                  Phòng / Hạng ({filteredRooms.length})
                </th>
                {dateColumns.map((date, idx) => {
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const dateIso = date.toISOString().slice(0, 10);
                  const isToday = dateIso === todayStr;

                  return (
                    <th
                      key={idx}
                      className={`px-2 py-2 text-center min-w-[70px] border-r border-slate-200 font-semibold ${
                        isToday
                          ? 'bg-blue-100 text-[#1F5AA6] ring-1 ring-[#1F5AA6] ring-inset'
                          : isWeekend
                          ? 'bg-amber-50/70 text-amber-900'
                          : 'text-slate-700 bg-slate-50'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold">
                        {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </div>
                      <div className="text-xs font-extrabold">{date.getDate()}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                // Find bookings assigned to this room
                const roomBookings = bookings.filter(
                  (b) => b.roomNumber === room.roomNumber || b.roomNumber === room.number
                );

                return (
                  <tr
                    key={room.id}
                    className="border-b border-slate-100 hover:bg-slate-50/60 transition"
                  >
                    {/* Sticky Room Label */}
                    <td className="sticky left-0 z-20 bg-white border-r border-[#E2E8F0] px-3 py-2 font-semibold text-[#0F172A] shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-sm text-[#1F5AA6] block">
                            P.{room.roomNumber}
                          </span>
                          <span className="text-[10px] text-slate-500">Tầng {room.floor}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                          {room.roomTypeCode || 'STD'}
                        </span>
                      </div>
                    </td>

                    {/* Timeline grid cells (TASK-42: Booking bars with guest name and code) */}
                    {dateColumns.map((colDate, idx) => {
                      const dateStr = colDate.toISOString().slice(0, 10);

                      // Check if any booking spans this date
                      const bookingOnDate = roomBookings.find(
                        (b) => dateStr >= b.checkInDate && dateStr < b.checkOutDate
                      );

                      if (bookingOnDate) {
                        const isStart = dateStr === bookingOnDate.checkInDate;
                        const isCheckedIn = bookingOnDate.status === 'CHECKED_IN';
                        const colorClass = isCheckedIn
                          ? 'bg-[#1F5AA6] text-white hover:bg-blue-700'
                          : 'bg-amber-500 text-white hover:bg-amber-600';

                        return (
                          <td
                            key={idx}
                            onClick={() => navigate(`/staff/bookings/${bookingOnDate.id}`)}
                            className="p-1 border-r border-slate-100 cursor-pointer"
                            title={`${bookingOnDate.guestName} (${bookingOnDate.bookingCode}) | ${formatDate(bookingOnDate.checkInDate)} - ${formatDate(bookingOnDate.checkOutDate)}`}
                          >
                            <div
                              className={`h-8 rounded-md px-1.5 flex items-center justify-start text-[11px] font-bold truncate shadow-xs transition ${colorClass}`}
                            >
                              {isStart ? (
                                <span className="truncate">
                                  {bookingOnDate.guestName} &bull; {bookingOnDate.bookingCode}
                                </span>
                              ) : (
                                <span className="text-[10px] opacity-75 truncate">
                                  {bookingOnDate.bookingCode}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      }

                      // Empty slot - click to quick walk-in
                      return (
                        <td
                          key={idx}
                          onClick={() =>
                            navigate(
                              `/staff/walk-in?roomId=${room.id}&roomNumber=${room.roomNumber}&checkIn=${dateStr}`
                            )
                          }
                          className="p-1 border-r border-slate-100 hover:bg-emerald-50/70 cursor-pointer transition text-center group"
                          title={`Phòng ${room.roomNumber} còn trống vào ngày ${formatDate(dateStr)} - Nhấp để đặt phòng Walk-in`}
                        >
                          <div className="h-8 rounded-md group-hover:border-2 border-emerald-400 border-dashed flex items-center justify-center text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition">
                            + Đặt
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend Information */}
      <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#475569]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-[#0F172A]">Chú giải trạng thái:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#1F5AA6]" />
            <span>Khách đang ở (Checked-in)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500" />
            <span>Đã đặt / Chờ nhận phòng (Confirmed)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-emerald-400 border-dashed bg-emerald-50" />
            <span>Phòng trống (Click đặt Walk-in)</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Hiển thị: <strong>{filteredRooms.length} / 60</strong> phòng vật lý
        </div>
      </div>
    </div>
  );
};
