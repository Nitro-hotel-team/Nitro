/**
 * ============================================================================
 * TÊN FILE: RoomsManagePage.tsx
 * VỊ TRÍ: src/pages/staff/RoomsManagePage.tsx
 * PHÂN HỆ: Quản trị Danh mục Phòng Vật lý (Room Inventory Management)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Quản trị 60 phòng vật lý thuộc 10 tầng của khách sạn:
 *     + Bảng liệt kê chi tiết: Số phòng, Tầng, Hạng phòng tương ứng, Trạng thái buồng phòng.
 *     + Chức năng gán trạng thái Buồng phòng nhanh (Housekeeping clean toggle).
 *     + Chuyển trạng thái Bảo trì (Maintenance) khi thiết bị hư hỏng.
 *     + Bộ lọc đa năng theo Tầng và Trạng thái phòng.
 * - Kết nối Backend REST API:
 *     + `GET /api/v1/rooms`: Lấy danh sách phòng.
 *     + `PATCH /api/v1/rooms/:id/status`: Cập nhật trạng thái dọn dẹp / bảo trì.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  DoorOpen,
  Edit2,
  Filter,
  PlusCircle,
  Search,
  Sparkles,
  Wrench,
  Trash2,
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
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [roomTypeId, setRoomTypeId] = useState<string>('');

  const loadData = async () => {
    try {
      const [rData, rtData] = await Promise.all([
        roomService.getRooms(),
        roomService.getRoomTypes()
      ]);
      setRooms(rData);
      setRoomTypes(rtData);
      if (rtData.length > 0) setRoomTypeId(rtData[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleClean = async (room: Room) => {
    const updatedStatus: RoomStatus = room.status === 'CLEANING' ? 'AVAILABLE' : 'CLEANING';
    await roomService.updateRoomStatus(room.id, updatedStatus);
    loadData();
  };

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setFloor(1);
    if (roomTypes.length > 0) setRoomTypeId(roomTypes[0].id);
    setModalOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setEditingRoom(r);
    setRoomNumber(r.roomNumber || r.number || '');
    setFloor(r.floor);
    setRoomTypeId(r.roomTypeId || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (floor < 1) {
      return alert('Số tầng không hợp lệ (phải lớn hơn hoặc bằng 1)');
    }
    
    try {
      if (editingRoom) {
        await roomService.updateRoom(editingRoom.id, {
          number: roomNumber,
          floor,
          roomTypeId
        });
        alert('Sửa phòng thành công!');
      } else {
        await roomService.createRoom({
          number: roomNumber,
          floor,
          roomTypeId
        });
        alert('Thêm phòng thành công!');
      }
      setModalOpen(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Lỗi khi lưu phòng');
    }
  };

  const handleDelete = async (r: Room) => {
    if (window.confirm(`Bạn có chắc muốn xóa phòng ${r.roomNumber || r.number}?`)) {
      try {
        await roomService.deleteRoom(r.id);
        alert('Xóa phòng thành công!');
        loadData();
      } catch (error: any) {
        alert(error.message || 'Không thể xóa phòng');
      }
    }
  };

  const filtered = rooms.filter((r) => {
    if (floorFilter !== 'ALL' && r.floor !== floorFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    const roomNum = r.roomNumber || r.number || '';
    if (search.trim() && !roomNum.includes(search.trim())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.roomsManage')}</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Quản lý hiện trạng kỹ thuật, buồng phòng và phân bổ 60 phòng khách sạn
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          icon={<PlusCircle className="w-4 h-4" />}
          className="font-bold"
        >
          + Thêm phòng vật lý mới
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm số phòng (101, 204)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg"
          />
        </div>

        <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
          <select
            value={floorFilter}
            onChange={(e) =>
              setFloorFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="p-1.5 border rounded-lg bg-slate-50 font-semibold"
          >
            <option value="ALL">Tất cả tầng (1 - 10)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((f) => (
              <option key={f} value={f}>
                Tầng {f}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-1.5 border rounded-lg bg-slate-50 font-semibold"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">Trống (AVAILABLE)</option>
            <option value="OCCUPIED">Đang ở (OCCUPIED)</option>
            <option value="RESERVED">Đã đặt (RESERVED)</option>
            <option value="CLEANING">Đang dọn (CLEANING)</option>
            <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Số phòng</th>
                <th className="py-3 px-4">Tầng</th>
                <th className="py-3 px-4">Hạng phòng</th>
                <th className="py-3 px-4">Trạng thái vận hành</th>
                <th className="py-3 px-4">Tình trạng vệ sinh</th>
                <th className="py-3 px-4">Khách đang ở</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-extrabold text-sm text-[#0F172A]">
                    {room.number || room.roomNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-600">Tầng {room.floor}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#1F5AA6]">{room.roomTypeName}</span>
                    <span className="ml-1 text-[10px] text-slate-500">({room.roomTypeCode})</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={room.status} type="room" size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleClean(room)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                        room.isClean
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      {room.isClean ? '✓ Sạch sẽ' : 'Chờ vệ sinh'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {room.guestName || '—'}
                  </td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(room)}
                      className="h-7 text-xs px-2"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(room)}
                      className="h-7 text-xs px-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoom ? 'Sửa thông tin phòng' : 'Thêm phòng vật lý mới'}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>Lưu thông tin</Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1 text-[#0F172A]">Số phòng:</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
              placeholder="VD: 101, 204..."
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-[#0F172A]">Tầng:</label>
            <input
              type="number"
              min="1"
              value={floor}
              onChange={(e) => setFloor(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-[#0F172A]">Hạng phòng:</label>
            <select
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white"
            >
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>{rt.name} ({rt.code})</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
