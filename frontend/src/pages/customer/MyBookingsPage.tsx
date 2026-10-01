/**
 * ============================================================================
 * TÊN FILE: MyBookingsPage.tsx
 * VỊ TRÍ: src/pages/customer/MyBookingsPage.tsx
 * PHÂN HỆ: Cổng Khách hàng - Đặt phòng của tôi (Customer Booking History)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trung tâm tự phục vụ dành cho khách lưu trú:
 *     + Phân loại theo 4 tab trạng thái: Sắp tới (Upcoming), Đang lưu trú (In-House),
 *       Đã hoàn thành (Completed), Đã hủy (Cancelled).
 *     + Thẻ đơn đặt phòng hiển thị: Ảnh phòng, Hạng phòng, Khoảng ngày lưu trú, Tổng tiền, Mã PNR.
 *     + Nút Xem biên nhận xác nhận phòng, Xem mã QR check-in không chạm, In hóa đơn.
 *     + Nút CTA nhanh "+ Đặt thêm phòng mới" chuyển đến bộ sưu tập hạng phòng.
 * - Kết nối Backend REST API:
 *     + `GET /api/v1/bookings`: Tải danh sách đơn đặt phòng của khách.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  DoorOpen,
  Eye,
  MapPin,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { EmptyState, Skeleton } from '../../components/common/StateViews';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { MOCK_ROOM_TYPES } from '../../mocks/data';
import { bookingService } from '../../services/api';
import { Booking, BookingStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const MyBookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { language, currentUser } = useApp();
  const isEn = language === 'en';
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'IN_HOUSE' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    bookingService.getBookings().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  const tabStatuses: Record<string, BookingStatus[]> = {
    UPCOMING: ['CONFIRMED'],
    IN_HOUSE: ['CHECKED_IN'],
    COMPLETED: ['CHECKED_OUT'],
    CANCELLED: ['CANCELLED'],
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesTab = tabStatuses[activeTab]?.includes(b.status);
    const matchesSearch =
      searchQuery.trim() === '' ||
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.roomTypeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.myBookings')}</h1>
          <p className="text-xs text-[#475569] mt-1">
            {t('myBookings.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/rooms')}
        >
          {t('myBookings.newBookingBtn')}
        </Button>
      </div>

      {/* Tabs Bar & Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-xl">
          {[
            { key: 'UPCOMING', label: t('myBookings.tabUpcoming') },
            { key: 'IN_HOUSE', label: t('myBookings.tabInHouse') },
            { key: 'COMPLETED', label: t('myBookings.tabCompleted') },
            { key: 'CANCELLED', label: t('myBookings.tabCancelled') },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-white text-[#1F5AA6] shadow-xs'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('myBookings.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1F5AA6] focus:bg-white"
          />
        </div>
      </div>

      {/* Booking List Cards */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const rt = MOCK_ROOM_TYPES.find((r) => r.id === b.roomTypeId || r.name === b.roomTypeName);
            const localizedRoomName = isEn && rt?.nameEn ? rt.nameEn : b.roomTypeName;

            return (
              <div
                key={b.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#1F5AA6] transition rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EAF2FB] text-[#1F5AA6] flex items-center justify-center shrink-0">
                    <DoorOpen className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#0F172A]">
                        {b.bookingCode}
                      </span>
                      <StatusBadge status={b.status} type="booking" size="sm" />
                    </div>

                    <h3 className="text-base font-bold text-[#1F5AA6]">{localizedRoomName}</h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#475569]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(b.checkInDate)} &rarr; {formatDate(b.checkOutDate)} ({b.nights} {t('search.nights')})
                      </span>
                      <span>
                        {t('myBookings.roomAssignedPrefix')} {b.roomNumber || t('myBookings.roomUnassigned')}
                      </span>
                      <span>
                        {t('myBookings.guestPrefix')} {b.guestName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Details & CTA */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] text-[#94A3B8]">{t('myBookings.totalPayment')}</div>
                    <div className="text-base font-extrabold text-[#0F172A] tabular-nums">
                      {formatCurrency(b.totalAmount, language)}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/my-bookings/${b.id}`)}
                    icon={<Eye className="w-4 h-4" />}
                  >
                    {t('myBookings.detailsBtn')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={t('myBookings.emptyTitle')}
          description={t('myBookings.emptyDesc')}
          actionText={t('myBookings.emptyAction')}
          onAction={() => navigate('/rooms')}
        />
      )}
    </div>
  );
};
