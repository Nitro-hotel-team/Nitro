/**
 * ============================================================================
 * TÊN FILE: RoomsManagePage.tsx
 * VỊ TRÍ: src/pages/staff/RoomsManagePage.tsx
 * PHÂN HỆ: Quản trị Kho phòng Vật lý 10 Tầng (TASK-50 / FE-S3-20)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Quản trị 60 phòng vật lý phân bổ từ Tầng 1 đến Tầng 10 của khách sạn:
 *     + Bảng danh sách phòng chi tiết: Số phòng, Vị trí tầng, Hạng phòng gắn kèm,
 *       Trạng thái vận hành hiện tại (Sẵn sàng / Đang sử dụng / Bảo trì...) (DoD 1).
 *     + Bộ lọc đa năng theo Số tầng và Hạng phòng hoạt động mượt mà (DoD 2).
 *     + Modal "Thêm phòng mới" chọn số phòng, tầng lầu, gán hạng phòng kinh doanh;
 *       kèm nút kích hoạt nhanh chế độ bảo trì phòng (DoD 3).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  DoorOpen,
  Edit2,
  Filter,
  PlusCircle,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { roomService } from '../../services/api';
import { Room, RoomStatus, RoomType } from '../../types';

export const RoomsManagePage: React.FC = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters (DoD 2)
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'ALL'>('ALL');

  // Modal State (DoD 3)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [roomTypeId, setRoomTypeId] = useState<string>('');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const [rData, rtData] = await Promise.all([
        roomService.getRooms(),
        roomService.getRoomTypes(),
      ]);
      setRooms(rData);
      setRoomTypes(rtData);
      if (rtData.length > 0 && !roomTypeId) {
        setRoomTypeId(rtData[0].id);
      }
    } catch (e) {
      console.error('Failed to load room inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Maintenance Toggle (DoD 3)
  const handleToggleMaintenance = async (room: Room) => {
    const isMaint = room.status === 'MAINTENANCE';
    const nextStatus: RoomStatus = isMaint ? 'AVAILABLE' : 'MAINTENANCE';
    
    try {
      await roomService.updateRoomStatus(room.id, nextStatus);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id ? { ...r, status: nextStatus, isClean: isMaint } : r
        )
      );
      showToast(
        isMaint
          ? `Đã mở khóa phòng ${room.roomNumber || room.number} trở lại hoạt động!`
          : `Đã kích hoạt chế độ bảo trì kỹ thuật cho phòng ${room.roomNumber || room.number}!`
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // Quick Cleaning Toggle
  const handleToggleClean = async (room: Room) => {
    if (room.status === 'MAINTENANCE') {
      alert('Phòng đang trong trạng thái bảo trì kỹ thuật, không thể đổi trạng thái dọn.');
      return;
    }
    const nextStatus: RoomStatus = room.status === 'CLEANING' ? 'AVAILABLE' : 'CLEANING';
    const nextClean = nextStatus === 'AVAILABLE';

    try {
      await roomService.updateRoomStatus(room.id, nextStatus);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id ? { ...r, status: nextStatus, isClean: nextClean } : r
        )
      );
      showToast(`Đã chuyển phòng ${room.roomNumber || room.number} sang ${nextClean ? 'Sẵn sàng' : 'Đang dọn dẹp'}!`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đổi trạng thái vệ sinh');
    }
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setFloor(floorFilter !== 'ALL' ? Number(floorFilter) : 1);
    setRoomTypeId(roomTypes.length > 0 ? roomTypes[0].id : '');
    setIsMaintenanceMode(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setEditingRoom(r);
    setRoomNumber(r.roomNumber || r.number || '');
    setFloor(r.floor);
    setRoomTypeId(r.roomTypeId || '');
    setIsMaintenanceMode(r.status === 'MAINTENANCE');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!roomNumber.trim()) {
      alert('Vui lòng nhập số phòng!');
      return;
    }
    if (floor < 1 || floor > 10) {
      alert('Tầng phòng khách sạn hợp lệ từ Tầng 1 đến Tầng 10!');
      return;
    }

    const selectedRt = roomTypes.find((rt) => rt.id === roomTypeId);
    const rtName = selectedRt?.name || 'Standard Double';
    const rtCode = selectedRt?.code || 'STD';

    try {
      if (editingRoom) {
        const nextStatus: RoomStatus = isMaintenanceMode ? 'MAINTENANCE' : (editingRoom.status === 'MAINTENANCE' ? 'AVAILABLE' : editingRoom.status);
        await roomService.updateRoom(editingRoom.id, {
          number: roomNumber,
          floor,
          roomTypeId,
        });

        setRooms((prev) =>
          prev.map((r) =>
            r.id === editingRoom.id
              ? {
                  ...r,
                  number: roomNumber,
                  roomNumber,
                  floor,
                  roomTypeId,
                  roomTypeName: rtName,
                  roomTypeCode: rtCode,
                  status: nextStatus,
                }
              : r
          )
        );
        showToast(`Cập nhật thông tin phòng ${roomNumber} thành công!`);
      } else {
        const nextStatus: RoomStatus = isMaintenanceMode ? 'MAINTENANCE' : 'AVAILABLE';
        const newRoom: Room = {
          id: `room-${roomNumber}`,
          number: roomNumber,
          roomNumber,
          floor,
          roomTypeId,
          roomTypeName: rtName,
          roomTypeCode: rtCode,
          status: nextStatus,
          isClean: !isMaintenanceMode,
        };

        setRooms((prev) => [newRoom, ...prev]);
        showToast(`Thêm mới phòng ${roomNumber} thành công vào Tầng ${floor}!`);
      }

      setModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi lưu phòng');
    }
  };

  const handleDelete = async (r: Room) => {
    const num = r.roomNumber || r.number;
    if (r.status === 'OCCUPIED') {
      alert(`Phòng ${num} đang có khách lưu trú! Vui lòng làm thủ tục Check-out trước khi xóa.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng ${num} khỏi danh mục vận hành?`)) {
      try {
        await roomService.deleteRoom(r.id);
        setRooms((prev) => prev.filter((item) => item.id !== r.id));
        showToast(`Đã xóa phòng ${num} thành công!`);
      } catch (error: any) {
        alert(error.message || 'Không thể xóa phòng');
      }
    }
  };

  // Filter logic (DoD 2)
  const filteredRooms = rooms.filter((r) => {
    // Search
    const rNum = (r.roomNumber || r.number || '').toLowerCase();
    if (search.trim() && !rNum.includes(search.trim().toLowerCase())) return false;

    // Floor filter
    if (floorFilter !== 'ALL' && r.floor !== floorFilter) return false;

    // Room Type filter
    if (typeFilter !== 'ALL') {
      const matchType =
        r.roomTypeId === typeFilter ||
        r.roomTypeCode === typeFilter ||
        (r.roomTypeName && r.roomTypeName.toLowerCase().includes(typeFilter.toLowerCase()));
      if (!matchType) return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

    return true;
  });

  // Inventory KPIs
  const totalCount = rooms.length;
  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;
  const cleaningCount = rooms.filter((r) => r.status === 'CLEANING').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.roomsManage')}</h1>
            <span className="bg-blue-50 text-[#1F5AA6] text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {totalCount} phòng vật lý
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            Quản trị kho 60 phòng vật lý phân bổ 10 tầng lầu, trạng thái kỹ thuật và điều phối buồng phòng
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          icon={<PlusCircle className="w-4 h-4" />}
          className="font-bold shadow-xs cursor-pointer"
        >
          + Thêm phòng vật lý mới
        </Button>
      </div>

      {/* Operational KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Tổng số phòng</div>
          <div className="text-xl font-black text-[#0F172A] mt-0.5">{totalCount} phòng</div>
          <div className="text-[10px] text-slate-400">10 tầng lầu</div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-3 shadow-xs bg-emerald-50/20">
          <div className="text-[10px] font-bold text-emerald-700 uppercase">Sẵn sàng (Available)</div>
          <div className="text-xl font-black text-emerald-700 mt-0.5">{availableCount}</div>
          <div className="text-[10px] text-emerald-600">Đã dọn sạch sẽ</div>
        </div>
        <div className="bg-white border border-blue-200 rounded-xl p-3 shadow-xs bg-blue-50/20">
          <div className="text-[10px] font-bold text-blue-700 uppercase">Đang ở (Occupied)</div>
          <div className="text-xl font-black text-[#1F5AA6] mt-0.5">{occupiedCount}</div>
          <div className="text-[10px] text-blue-600">Khách đang lưu trú</div>
        </div>
        <div className="bg-white border border-purple-200 rounded-xl p-3 shadow-xs bg-purple-50/20">
          <div className="text-[10px] font-bold text-purple-700 uppercase">Đang dọn (Cleaning)</div>
          <div className="text-xl font-black text-purple-700 mt-0.5">{cleaningCount}</div>
          <div className="text-[10px] text-purple-600">Housekeeping xử lý</div>
        </div>
        <div className="bg-white border border-rose-200 rounded-xl p-3 shadow-xs bg-rose-50/20 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-rose-700 uppercase">Bảo trì (Maintenance)</div>
          <div className="text-xl font-black text-rose-700 mt-0.5">{maintenanceCount}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Khóa kỹ thuật</div>
        </div>
      </div>

      {/* Filter Toolbar (DoD 2) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search by room number */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm số phòng (101, 204...)"
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5AA6]"
          />
        </div>

        {/* Filters Group (Floor, Room Type, Status) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Bộ lọc Tầng (DoD 2) */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500">Tầng:</span>
            <select
              value={floorFilter}
              onChange={(e) =>
                setFloorFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="py-1.5 px-2.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tất cả tầng (1 - 10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((f) => (
                <option key={f} value={f}>
                  Tầng {f}
                </option>
              ))}
            </select>
          </div>

          {/* Bộ lọc Hạng phòng (DoD 2) */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500">Hạng:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-1.5 px-2.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tất cả hạng phòng</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name} ({rt.code})
                </option>
              ))}
            </select>
          </div>

          {/* Bộ lọc Trạng thái */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-1.5 px-2.5 border border-[#E2E8F0] rounded-lg bg-slate-50 font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="AVAILABLE">Trống (Sẵn sàng)</option>
              <option value="OCCUPIED">Đang ở (Occupied)</option>
              <option value="RESERVED">Đã đặt (Reserved)</option>
              <option value="CLEANING">Đang dọn (Cleaning)</option>
              <option value="MAINTENANCE">Bảo trì (Maintenance)</option>
            </select>
          </div>

          {(floorFilter !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setFloorFilter('ALL');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
                setSearch('');
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bảng Danh sách Phòng Vật lý Chi tiết (DoD 1) */}
      {loading ? (
        <div className="h-44 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center text-slate-400 font-semibold text-xs">
          Đang tải danh sách 60 phòng vật lý...
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-slate-500">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy phòng phù hợp</h3>
          <p className="text-xs text-slate-400 mt-1">
            Vui lòng thử điều chỉnh lại bộ lọc Tầng, Hạng phòng hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Số phòng</th>
                  <th className="py-3 px-4 text-center">Vị trí tầng</th>
                  <th className="py-3 px-4">Hạng phòng gắn kèm</th>
                  <th className="py-3 px-4 text-center">Trạng thái vận hành</th>
                  <th className="py-3 px-4 text-center">Vệ sinh buồng phòng</th>
                  <th className="py-3 px-4">Khách lưu trú hiện tại</th>
                  <th className="py-3 px-4 text-right">Thao tác &amp; Bảo trì</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room) => {
                  const isMaintenance = room.status === 'MAINTENANCE';
                  const roomNum = room.roomNumber || room.number;

                  return (
                    <tr
                      key={room.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isMaintenance ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Số phòng */}
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-[#0F172A]">
                        {roomNum}
                      </td>

                      {/* Vị trí tầng */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                          Tầng {room.floor}
                        </span>
                      </td>

                      {/* Hạng phòng gắn kèm */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1F5AA6]">
                          {room.roomTypeName || 'Deluxe City View'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Mã: {room.roomTypeCode || 'DLX'}
                        </div>
                      </td>

                      {/* Trạng thái vận hành */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge type="room" status={room.status} />
                      </td>

                      {/* Tình trạng vệ sinh buồng phòng */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleClean(room)}
                          disabled={isMaintenance}
                          title={isMaintenance ? 'Phòng đang bảo trì' : 'Bấm để đổi trạng thái dọn'}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                            room.isClean
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                          } ${isMaintenance ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{room.isClean ? 'Sạch sẽ' : 'Chờ vệ sinh'}</span>
                        </button>
                      </td>

                      {/* Khách đang lưu trú */}
                      <td className="py-3.5 px-4">
                        {room.guestName ? (
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span>{room.guestName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Thao tác & Quick Maintenance Toggle (DoD 3) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Bảo trì nhanh */}
                          <button
                            onClick={() => handleToggleMaintenance(room)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
                              isMaintenance
                                ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={isMaintenance ? 'Bấm để mở khóa phòng' : 'Bấm để khóa bảo trì'}
                          >
                            <Wrench className="w-3 h-3" />
                            <span>{isMaintenance ? 'Mở khóa' : 'Bảo trì'}</span>
                          </button>

                          {/* Sửa */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(room)}
                            className="h-7 text-xs px-2 font-bold cursor-pointer"
                            icon={<Edit2 className="w-3 h-3" />}
                          >
                            Sửa
                          </Button>

                          {/* Xóa */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(room)}
                            className="h-7 text-xs px-2 text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                            icon={<Trash2 className="w-3 h-3" />}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm phòng mới / Chỉnh sửa (DoD 3) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingRoom ? (
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[#1F5AA6]" />
              <span>Chỉnh sửa thông số phòng {editingRoom.roomNumber || editingRoom.number}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Thêm phòng vật lý mới</span>
            </div>
          )
        }
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} className="cursor-pointer">
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="cursor-pointer font-bold"
            >
              Lưu thông tin phòng
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-[#0F172A]">Số phòng (Room Number):</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
                placeholder="VD: 101, 204, 405..."
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-[#0F172A]">Vị trí tầng (1 - 10):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-[#0F172A]">Gán hạng phòng kinh doanh:</label>
            <select
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
            >
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name} ({rt.code}) — {rt.area}m²
                </option>
              ))}
            </select>
          </div>

          {/* Quick Maintenance Switch in Modal (DoD 3) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-rose-600" />
                <span>Kích hoạt chế độ bảo trì kỹ thuật</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Khóa phòng, tạm ngưng nhận khách đặt phòng khi đang sửa chữa thiết bị
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isMaintenanceMode}
                onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};
