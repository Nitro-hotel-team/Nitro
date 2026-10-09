/**
 * ============================================================================
 * TÊN FILE: BookingsListPage.tsx
 * VỊ TRÍ: src/pages/staff/BookingsListPage.tsx
 * PHÂN HỆ: Quản trị Nghiệp vụ Đặt phòng & Bộ lọc Nâng cao (TASK-43 - FE-S3-13)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trung tâm tra cứu và quản lý toàn bộ hồ sơ lưu trú của khách sạn Nitro Grand:
 *     + Tìm kiếm đa năng thời gian thực: Theo mã PNR, tên khách, số điện thoại, số phòng.
 *     + Bộ lọc Tabs trạng thái 1 chạm: Tất cả, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED kèm số lượng đếm.
 *     + Bảng dữ liệu chi tiết đầy đủ 8 cột nghiệp vụ chuẩn khách sạn 4 sao.
 *     + Phân trang chuyên nghiệp (Pagination): Điều hướng trang, chuyển trang êm ái.
 *     + Tác vụ trực tiếp tại từng dòng: Xem chi tiết Folio, Check-in nhanh, Check-out nhanh.
 *     + Xuất danh sách Excel hoặc in ấn phục vụ kiểm toán ca trực.
 * - Kết nối Backend REST API:
 *     + `GET /api/v1/bookings`: Tải danh sách đơn đặt phòng.
 *     + `PATCH /api/v1/bookings/:id/status`: Cập nhật trạng thái Check-in / Check-out.
 * ============================================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  LogIn,
  LogOut,
  PlusCircle,
  Search,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/StateViews';
import { StatusBadge } from '../../components/common/StatusBadge';
import { bookingService } from '../../services/api';
import { Booking, BookingSource, BookingStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

const PAGE_SIZE = 8;

export const BookingsListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters (TASK-43)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [sourceFilter, setSourceFilter] = useState<BookingSource | 'ALL'>('ALL');

  // Pagination (TASK-43)
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    bookingService.getBookings().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    await bookingService.updateBookingStatus(id, newStatus);
    const updated = await bookingService.getBookings();
    setBookings(updated);
  };

  // Status Tab counts
  const counts = useMemo(() => {
    return {
      ALL: bookings.length,
      CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
      CHECKED_IN: bookings.filter((b) => b.status === 'CHECKED_IN').length,
      CHECKED_OUT: bookings.filter((b) => b.status === 'CHECKED_OUT').length,
      CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
    };
  }, [bookings]);

  // Filtered dataset
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (sourceFilter !== 'ALL' && b.source !== sourceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = b.bookingCode.toLowerCase().includes(q);
        const matchName = b.guestName.toLowerCase().includes(q);
        const matchPhone = b.guestPhone.includes(q);
        const matchRoom = b.roomNumber?.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchPhone && !matchRoom) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, sourceFilter, searchQuery]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sourceFilter, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBookings.slice(start, start + PAGE_SIZE);
  }, [filteredBookings, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredBookings.length);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.bookingsList')}</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Quản lý và tra cứu toàn diện các đơn đặt phòng từ Website, Mobile, Quầy tiếp tân và kênh đối tác OTA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Download className="w-4 h-4" />}
            className="flex-1 sm:flex-initial justify-center cursor-pointer"
          >
            <span className="truncate">Xuất Excel / In</span>
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/staff/walk-in')}
            icon={<PlusCircle className="w-4 h-4" />}
            className="flex-1 sm:flex-initial justify-center font-bold shadow-xs cursor-pointer"
          >
            <span className="truncate">+ Walk-in</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-4">
        {/* Status Tabs Filter (TASK-43) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
          {[
            { id: 'ALL', label: 'Tất cả đơn', count: counts.ALL },
            { id: 'CONFIRMED', label: 'Chờ check-in', count: counts.CONFIRMED },
            { id: 'CHECKED_IN', label: 'Đang ở', count: counts.CHECKED_IN },
            { id: 'CHECKED_OUT', label: 'Đã trả phòng', count: counts.CHECKED_OUT },
            { id: 'CANCELLED', label: 'Đã hủy', count: counts.CANCELLED },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#1F5AA6] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Source filter bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search by PNR / Guest name / Phone / Room */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã PNR, tên khách, SĐT, số phòng..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5AA6]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Source filter */}
          <div className="flex items-center gap-2 w-full md:w-auto text-xs justify-end">
            <span className="text-[#475569] font-semibold whitespace-nowrap">Kênh đặt:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="border border-[#E2E8F0] rounded-xl px-3 py-1.5 bg-slate-50 font-bold text-[#0F172A] cursor-pointer focus:ring-1 focus:ring-[#1F5AA6]"
            >
              <option value="ALL">Tất cả kênh đặt</option>
              <option value="WEB">Website trực tuyến (WEB)</option>
              <option value="MOBILE">Ứng dụng Mobile</option>
              <option value="COUNTER">Tại quầy Lễ tân (COUNTER)</option>
              <option value="OTA">Kênh OTA đối tác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Mã đơn (PNR)</th>
                <th className="py-3 px-4">Khách lưu trú</th>
                <th className="py-3 px-4">SĐT liên hệ</th>
                <th className="py-3 px-4">Số phòng &amp; Hạng</th>
                <th className="py-3 px-4">Lưu trú</th>
                <th className="py-3 px-4 text-center">Đêm</th>
                <th className="py-3 px-4 text-right">Tổng chi phí</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Kênh</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-4">
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </td>
                </tr>
              ) : paginatedBookings.length > 0 ? (
                paginatedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    {/* Booking Code */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#1F5AA6] hover:underline cursor-pointer"
                        onClick={() => navigate(`/staff/bookings/${b.id}`)}
                      >
                        {b.bookingCode}
                      </span>
                    </td>

                    {/* Guest Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F172A]">{b.guestName}</div>
                      {b.guestIdCard && (
                        <div className="text-[10px] text-slate-500 font-mono">CCCD: {b.guestIdCard}</div>
                      )}
                    </td>

                    {/* Phone Number */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {b.guestPhone}
                    </td>

                    {/* Room & Type */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F172A]">
                        {b.roomNumber ? `P.${b.roomNumber}` : <span className="text-amber-600 italic">Chưa xếp</span>}
                      </div>
                      <div className="text-[11px] text-slate-500">{b.roomTypeName}</div>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#0F172A]">{formatDate(b.checkInDate)}</div>
                      <div className="text-[11px] text-slate-500">&rarr; {formatDate(b.checkOutDate)}</div>
                    </td>

                    {/* Nights */}
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {b.nights}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-extrabold text-[#0F172A] tabular-nums">
                      {formatCurrency(b.totalAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={b.status} type="booking" size="sm" />
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={b.source} type="source" size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/staff/bookings/${b.id}`)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                          className="h-7 text-xs px-2"
                        >
                          Chi tiết
                        </Button>

                        {b.status === 'CONFIRMED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(b.id, 'CHECKED_IN')}
                            className="h-7 text-xs px-2.5 bg-[#1F5AA6] font-bold"
                          >
                            Check-in
                          </Button>
                        )}

                        {b.status === 'CHECKED_IN' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUpdateStatus(b.id, 'CHECKED_OUT')}
                            className="h-7 text-xs px-2.5 bg-amber-600 text-white hover:bg-amber-700 font-bold"
                          >
                            Check-out
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">Không tìm thấy đơn đặt phòng nào</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử điều chỉnh từ khóa tìm kiếm hoặc chuyển tab trạng thái khác.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (TASK-43) */}
        {filteredBookings.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              Hiển thị <strong>{startIndex} &mdash; {endIndex}</strong> trên tổng số{' '}
              <strong>{filteredBookings.length}</strong> đơn đặt phòng
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" />
                Trước
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#1F5AA6] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Sau
                <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
