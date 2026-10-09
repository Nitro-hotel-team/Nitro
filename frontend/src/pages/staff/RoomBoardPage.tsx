/**
 * ============================================================================
 * TÊN FILE: RoomBoardPage.tsx
 * VỊ TRÍ: src/pages/staff/RoomBoardPage.tsx
 * PHÂN HỆ: Nghiệp vụ Lễ tân & Buồng phòng (Front Desk Room Matrix & Housekeeping)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Hiển thị sơ đồ ma trận 60 phòng thuộc 10 tầng của khách sạn Nitro Grand:
 *     + Mã màu trực quan phân loại 5 trạng thái phòng: Trống (Xanh lá), Đang ở (Xanh dương),
 *       Đã đặt trước (Vàng hổ phách), Đang dọn dẹp (Tím), Bảo trì (Đỏ).
 *     + Thanh lọc nhanh số lượng phòng theo trạng thái, lọc theo tầng (1 - 10) và hạng phòng.
 *     + Thao tác nhanh (Quick Actions) qua Drawer trượt:
 *         * Check-in khách đã đặt trước hoặc Walk-in phòng trống.
 *         * Check-out trả phòng, in hóa đơn.
 *         * Chuyển trạng thái dọn buồng phòng (Housekeeping Cleaned).
 *         * Đổi phòng khẩn cấp cho khách (Room Change).
 * - Kết nối Backend REST API:
 *     + `GET /api/v1/rooms`: Lấy danh sách trạng thái phòng.
 *     + `PATCH /api/v1/rooms/:id/status`: Cập nhật trạng thái phòng (Housekeeping, Maintenance).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BedDouble,
  Check,
  CheckCircle2,
  Clock,
  DoorOpen,
  Filter,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { bookingService, roomService } from '../../services/api';
import { Booking, Room, RoomStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const RoomBoardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'ALL'>('ALL');
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>('ALL');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Room for Drawer
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    Promise.all([roomService.getRooms(), bookingService.getBookings()]).then(
      ([rData, bData]) => {
        setRooms(rData);
        setBookings(bData);
        setLoading(false);
      }
    );
  }, []);

  const handleUpdateRoomStatus = async (roomId: string, newStatus: RoomStatus) => {
    await roomService.updateRoomStatus(roomId, newStatus);
    const updated = await roomService.getRooms();
    setRooms(updated);
    if (selectedRoom && selectedRoom.id === roomId) {
      setSelectedRoom({ ...selectedRoom, status: newStatus });
    }
  };

  // Status counts
  const counts = {
    ALL: rooms.length,
    AVAILABLE: rooms.filter((r) => r.status === 'AVAILABLE').length,
    OCCUPIED: rooms.filter((r) => r.status === 'OCCUPIED').length,
    RESERVED: rooms.filter((r) => r.status === 'RESERVED').length,
    CLEANING: rooms.filter((r) => r.status === 'CLEANING').length,
    MAINTENANCE: rooms.filter((r) => r.status === 'MAINTENANCE').length,
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (floorFilter !== 'ALL' && r.floor !== floorFilter) return false;
    if (roomTypeFilter !== 'ALL' && (r.roomTypeCode || r.roomType?.code) !== roomTypeFilter) return false;
    const num = r.roomNumber || r.number || '';
    if (searchQuery.trim() && !num.includes(searchQuery.trim())) return false;
    return true;
  });

  // Group rooms by floor (10 floors down)
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => b - a);

  // Find related booking for selected room
  const activeBooking = selectedRoom
    ? bookings.find(
        (b) =>
          b.roomNumber === (selectedRoom.roomNumber || selectedRoom.number) &&
          (b.status === 'CHECKED_IN' || b.status === 'CONFIRMED')
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Page Title & Fast Walk-in */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.roomBoard')}</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Sơ đồ trực quan 60 phòng thuộc 10 tầng khách sạn Nitro Grand
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/staff/timeline')}
            icon={<Clock className="w-4 h-4" />}
            className="flex-1 sm:flex-initial justify-center"
          >
            <span className="truncate">Lịch Timeline</span>
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/staff/walk-in')}
            icon={<PlusCircle className="w-4 h-4" />}
            className="flex-1 sm:flex-initial justify-center font-bold"
          >
            <span className="truncate">+ Walk-in</span>
          </Button>
        </div>
      </div>

      {/* 5+1 Interactive StatCards for PMS status overview (TASK-35) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'ALL', label: 'Tổng số phòng', count: counts.ALL, icon: <DoorOpen className="w-5 h-5 text-slate-700" />, bgActive: 'ring-2 ring-slate-800 bg-slate-50', textColor: 'text-slate-900' },
          { key: 'AVAILABLE', label: 'Sẵn sàng đón', count: counts.AVAILABLE, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, bgActive: 'ring-2 ring-emerald-600 bg-emerald-50', textColor: 'text-emerald-700' },
          { key: 'OCCUPIED', label: 'Đang có khách', count: counts.OCCUPIED, icon: <User className="w-5 h-5 text-blue-600" />, bgActive: 'ring-2 ring-blue-600 bg-blue-50', textColor: 'text-blue-700' },
          { key: 'RESERVED', label: 'Đã đặt trước', count: counts.RESERVED, icon: <Clock className="w-5 h-5 text-amber-600" />, bgActive: 'ring-2 ring-amber-600 bg-amber-50', textColor: 'text-amber-700' },
          { key: 'CLEANING', label: 'Chờ dọn dẹp', count: counts.CLEANING, icon: <Sparkles className="w-5 h-5 text-purple-600" />, bgActive: 'ring-2 ring-purple-600 bg-purple-50', textColor: 'text-purple-700' },
          { key: 'MAINTENANCE', label: 'Khóa bảo trì', count: counts.MAINTENANCE, icon: <Wrench className="w-5 h-5 text-rose-600" />, bgActive: 'ring-2 ring-rose-600 bg-rose-50', textColor: 'text-rose-700' },
        ].map((item) => {
          const active = statusFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key as any)}
              className={`p-3 rounded-2xl bg-white border text-left transition transform hover:-translate-y-0.5 shadow-xs cursor-pointer flex flex-col justify-between ${
                active ? item.bgActive + ' shadow-md' : 'border-[#E2E8F0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-slate-50 border border-slate-100">{item.icon}</span>
                <span className={`text-2xl font-black tabular-nums ${item.textColor}`}>{item.count}</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#475569] truncate">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {Math.round((item.count / (counts.ALL || 1)) * 100)}% tổng kho
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Controls Row */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          {/* Floor filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#475569] font-semibold">Tầng:</span>
            <select
              value={floorFilter}
              onChange={(e) =>
                setFloorFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-slate-50 font-semibold text-[#0F172A]"
            >
              <option value="ALL">Tất cả tầng (1 - 10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((fl) => (
                <option key={fl} value={fl}>
                  Tầng {fl}
                </option>
              ))}
            </select>
          </div>

          {/* Room Type filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#475569] font-semibold">Hạng:</span>
            <select
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
              className="border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-slate-50 font-semibold text-[#0F172A]"
            >
              <option value="ALL">Tất cả hạng phòng</option>
              <option value="STD">Standard (STD)</option>
              <option value="SUP">Superior (SUP)</option>
              <option value="DLX">Deluxe (DLX)</option>
              <option value="FAM">Family Suite (FAM)</option>
              <option value="EXE">Executive Suite (EXE)</option>
              <option value="PRE">Presidential (PRE)</option>
            </select>
          </div>
        </div>

        {/* Room Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm số phòng (VD: 302)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5AA6]"
          />
        </div>
      </div>

      {/* Room Grid by Floors */}
      <div className="space-y-6">
        {floors
          .filter((f) => floorFilter === 'ALL' || floorFilter === f)
          .map((floor) => {
            const floorRooms = filteredRooms.filter((r) => r.floor === floor);
            if (floorRooms.length === 0) return null;

            return (
              <div key={floor} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
                  <span className="font-extrabold text-sm text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-[#1F5AA6]" />
                    Tầng {floor} ({floorRooms.length} phòng)
                  </span>
                  <span className="text-[11px] text-[#475569]">
                    {floor === 10
                      ? 'Tầng Tổng Thống & Executive'
                      : floor >= 7
                      ? 'Tầng Cao View Toàn Cảnh'
                      : 'Tầng Tiêu Chuẩn'}
                  </span>
                </div>

                {/* 6 Rooms Grid per floor */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {floorRooms.map((room) => {
                    const isOccupied = room.status === 'OCCUPIED';
                    const isAvailable = room.status === 'AVAILABLE';
                    const isReserved = room.status === 'RESERVED';
                    const isCleaning = room.status === 'CLEANING';
                    const isMaintenance = room.status === 'MAINTENANCE';

                    const borderBg = isAvailable
                      ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                      : isOccupied
                      ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'
                      : isReserved
                      ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50'
                      : isCleaning
                      ? 'border-purple-200 bg-purple-50/40 hover:bg-purple-50'
                      : 'border-rose-200 bg-rose-50/40 hover:bg-rose-50';

                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`p-3 rounded-xl border-2 transition transform hover:-translate-y-0.5 cursor-pointer shadow-2xs flex flex-col justify-between min-h-[105px] ${borderBg}`}
                      >
                        {/* Header: Room Number & Type Code */}
                        <div className="flex items-start justify-between">
                          <span className="font-mono font-extrabold text-lg text-[#0F172A]">
                            {room.roomNumber}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/90 text-slate-700 shadow-2xs border border-slate-200">
                            {room.roomTypeCode}
                          </span>
                        </div>

                        {/* Status badge & detail */}
                        <div>
                          <StatusBadge status={room.status} type="room" size="sm" />
                          {isOccupied && (
                            <div className="mt-1">
                              <div className="text-[11px] font-bold text-[#0F172A] truncate flex items-center gap-1">
                                <User className="w-3 h-3 text-blue-600 shrink-0" />
                                <span className="truncate">{room.guestName || 'Khách lưu trú'}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{room.checkoutTime || 'Trả: 12:00'}</span>
                              </div>
                            </div>
                          )}
                          {isReserved && (
                            <div className="mt-1">
                              <div className="text-[11px] font-bold text-[#0F172A] truncate">
                                {room.guestName || 'Đã đặt trước'}
                              </div>
                              <div className="text-[10px] text-amber-700 font-semibold">Chờ nhận phòng</div>
                            </div>
                          )}
                          {isCleaning && (
                            <div className="text-[10px] text-purple-700 flex items-center gap-1 mt-1 font-semibold">
                              <Sparkles className="w-3 h-3" /> Chờ buồng dọn
                            </div>
                          )}
                          {isMaintenance && (
                            <div className="text-[10px] text-rose-700 flex items-center gap-1 mt-1 font-semibold">
                              <Wrench className="w-3 h-3" /> Bảo trì thiết bị
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Room Action Slide-over Drawer */}
      <Drawer
        isOpen={Boolean(selectedRoom)}
        onClose={() => setSelectedRoom(null)}
        title={
          selectedRoom ? (
            <div className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-[#1F5AA6]" />
              <span>Phòng {selectedRoom.roomNumber}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1F5AA6] border border-blue-200">
                {selectedRoom.roomTypeName}
              </span>
            </div>
          ) : (
            'Chi tiết phòng'
          )
        }
        footer={
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRoom(null)}
            >
              Đóng
            </Button>
            {selectedRoom?.status === 'AVAILABLE' && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  navigate(`/staff/walk-in?roomId=${selectedRoom.id}&roomNumber=${selectedRoom.roomNumber}`);
                }}
              >
                + Đặt phòng Walk-in
              </Button>
            )}
          </div>
        }
      >
        {selectedRoom && (
          <div className="space-y-6 text-xs">
            {/* Status overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#475569]">Trạng thái hiện tại:</span>
                <StatusBadge status={selectedRoom.status} type="room" size="md" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#475569]">Tầng:</span>
                <span className="font-bold text-[#0F172A]">Tầng {selectedRoom.floor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#475569]">Hạng phòng:</span>
                <span className="font-bold text-[#1F5AA6]">
                  {selectedRoom.roomTypeName} ({selectedRoom.roomTypeCode})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#475569]">Tình trạng vệ sinh:</span>
                <span
                  className={`font-bold ${
                    selectedRoom.isClean ? 'text-emerald-700' : 'text-purple-700'
                  }`}
                >
                  {selectedRoom.isClean ? '✓ Đã sạch sẽ' : 'Chờ vệ sinh'}
                </span>
              </div>
            </div>

            {/* Quick Status Control Buttons */}
            <div>
              <span className="block font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                Chuyển trạng thái nhanh:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateRoomStatus(selectedRoom.id, 'AVAILABLE')}
                  className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  ✓ Trống (Sẵn sàng)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateRoomStatus(selectedRoom.id, 'CLEANING')}
                  className="text-purple-700 border-purple-200 hover:bg-purple-50"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Chờ dọn phòng
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateRoomStatus(selectedRoom.id, 'MAINTENANCE')}
                  className="text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  <Wrench className="w-3.5 h-3.5 mr-1" /> Bảo trì thiết bị
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateRoomStatus(selectedRoom.id, 'OCCUPIED')}
                  className="text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  Đang có khách ở
                </Button>
              </div>
            </div>

            {/* In-House or Reserved Booking details */}
            {activeBooking ? (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                  <span className="font-bold text-[#0F172A]">Thông tin khách lưu trú:</span>
                  <StatusBadge status={activeBooking.status} type="booking" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Mã đặt phòng:</span>
                  <span className="font-mono font-bold text-[#1F5AA6]">
                    {activeBooking.bookingCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Khách hàng:</span>
                  <span className="font-bold text-[#0F172A]">{activeBooking.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Số điện thoại:</span>
                  <span className="font-mono text-[#0F172A]">{activeBooking.guestPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Lưu trú:</span>
                  <span>
                    {formatDate(activeBooking.checkInDate)} &rarr;{' '}
                    {formatDate(activeBooking.checkOutDate)}
                  </span>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/staff/bookings/${activeBooking.id}`)}
                  >
                    Xem chi tiết hồ sơ &amp; Hóa đơn
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[#475569]">
                Hiện không có lượt khách nào đang gán vào phòng này.
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
