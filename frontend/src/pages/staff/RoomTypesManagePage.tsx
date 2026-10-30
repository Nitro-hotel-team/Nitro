/**
 * ============================================================================
 * TÊN FILE: RoomTypesManagePage.tsx
 * VỊ TRÍ: src/pages/staff/RoomTypesManagePage.tsx
 * PHÂN HỆ: Quản trị Danh mục Hạng phòng (Room Types) (TASK-49 / FE-S3-19)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Quản trị 6 hạng phòng kinh doanh tiêu chuẩn 4 sao của Nitro Grand Hotel:
 *     + Standard Double (STD), Superior Twin (SUP), Deluxe City View (DLX),
 *       Family Suite (FAM), Executive Suite (EXE), Presidential Suite (PRE).
 *     + Bảng danh mục đầy đủ các cột: Mã hạng, Tên hạng phòng, Giá niêm yết (VND/đêm),
 *       Diện tích (m²), Sức chứa tối đa, Tổng số phòng thực tế (DoD 1).
 *     + Modal Chỉnh sửa: Cập nhật giá niêm yết, mô tả chi tiết, tiện ích đi kèm (amenities),
 *       và URL ảnh đại diện (DoD 2).
 *     + Lưu thay đổi thành công và cập nhật lại bảng dữ liệu trên giao diện tức thời (DoD 3).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  BedDouble,
  Check,
  CheckCircle2,
  DollarSign,
  Edit2,
  Eye,
  Grid,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  List,
  Plus,
  PlusCircle,
  Save,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { roomService } from '../../services/api';
import { Room, RoomType } from '../../types';
import { formatCurrency } from '../../utils/format';

export const RoomTypesManagePage: React.FC = () => {
  const { t } = useTranslation();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit / Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<RoomType | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState(1000000);
  const [area, setArea] = useState(30);
  const [maxGuests, setMaxGuests] = useState(2);
  const [capacityAdults, setCapacityAdults] = useState(2);
  const [capacityChildren, setCapacityChildren] = useState(1);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const [rtData, rData] = await Promise.all([
        roomService.getRoomTypes(),
        roomService.getRooms(),
      ]);
      setRoomTypes(rtData);
      setRooms(rData);
    } catch (e) {
      console.error('Failed to load room types:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedType(null);
    setCode('NEW');
    setName('');
    setBasePrice(1200000);
    setArea(32);
    setMaxGuests(2);
    setCapacityAdults(2);
    setCapacityChildren(1);
    setDescription('');
    setImage('https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80');
    setAmenities(['Wi-Fi tốc độ cao', 'Điều hòa 2 chiều', 'TV thông minh 50"', 'Két sắt mini']);
    setModalOpen(true);
  };

  const handleOpenEdit = (rt: RoomType) => {
    setSelectedType(rt);
    setCode(rt.code);
    setName(rt.name);
    setBasePrice(rt.basePrice);
    setArea(rt.area);
    setMaxGuests(rt.maxGuests || 2);
    setCapacityAdults(rt.capacityAdults ?? rt.maxGuests ?? 2);
    setCapacityChildren(rt.capacityChildren ?? 1);
    setDescription(rt.description);
    setImage(rt.image || '');
    setAmenities([...rt.amenities]);
    setModalOpen(true);
  };

  const handleAddAmenity = () => {
    if (!newAmenity.trim()) return;
    if (!amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
    }
    setNewAmenity('');
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities(amenities.filter((a) => a !== item));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên hạng phòng!');
      return;
    }
    if (basePrice <= 0) {
      alert('Giá niêm yết phải lớn hơn 0 VND!');
      return;
    }
    if (area <= 0) {
      alert('Diện tích phòng phải lớn hơn 0 m²!');
      return;
    }

    try {
      if (selectedType) {
        // Update existing room type
        const updated = await roomService.updateRoomType(selectedType.id, {
          name,
          basePrice,
          area,
          maxGuests,
          capacityAdults,
          capacityChildren,
          description,
          image,
          amenities,
        });

        // Update local state immediately
        setRoomTypes((prev) =>
          prev.map((item) =>
            item.id === selectedType.id
              ? {
                  ...item,
                  name,
                  basePrice,
                  area,
                  maxGuests,
                  capacityAdults,
                  capacityChildren,
                  description,
                  image,
                  amenities,
                }
              : item
          )
        );
        showToast(`Đã cập nhật thành công hạng phòng ${name}!`);
      } else {
        // Create new
        const newRt: RoomType = {
          id: `rt-${Date.now()}`,
          code,
          name,
          nameEn: name,
          basePrice,
          area,
          maxGuests,
          capacityAdults,
          capacityChildren,
          bedType: '1 giường King',
          bedTypeEn: '1 King Bed',
          amenities,
          image,
          images: [image],
          description,
          descriptionEn: description,
          totalRooms: 6,
        };
        setRoomTypes((prev) => [...prev, newRt]);
        showToast(`Đã thêm mới thành công hạng phòng ${name}!`);
      }

      setModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi lưu hạng phòng');
    }
  };

  // Calculate actual rooms count for a room type
  const getActualRoomsCount = (rt: RoomType) => {
    const matching = rooms.filter(
      (r) =>
        r.roomTypeId === rt.id ||
        r.roomTypeCode === rt.code ||
        (r.roomTypeName && r.roomTypeName.toLowerCase().includes(rt.name.toLowerCase()))
    );
    return matching.length > 0 ? matching.length : rt.totalRooms || 10;
  };

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
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.roomTypesManage')}</h1>
            <span className="bg-blue-50 text-[#1F5AA6] text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
              6 hạng phòng chuẩn
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            Quản lý danh mục 6 hạng phòng kinh doanh, giá niêm yết theo đêm, diện tích, sức chứa và tiện nghi 4 sao
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Table / Grid */}
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#1F5AA6] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem dạng Bảng"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Dạng Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#1F5AA6] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem dạng Thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Dạng Thẻ</span>
            </button>
          </div>

          <Button
            variant="gold"
            size="sm"
            onClick={handleOpenAdd}
            icon={<PlusCircle className="w-4 h-4" />}
            className="font-bold shadow-xs cursor-pointer"
          >
            + Thêm hạng phòng
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng số hạng phòng</div>
          <div className="text-2xl font-black text-[#0F172A] mt-1">{roomTypes.length} hạng</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Từ Standard đến Tổng thống</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng quỹ phòng vật lý</div>
          <div className="text-2xl font-black text-[#1F5AA6] mt-1">
            {rooms.length || 60} phòng
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Trải đều 10 tầng lầu</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Giá thấp nhất (STD)</div>
          <div className="text-xl font-black text-slate-800 mt-1 tabular-nums">
            {formatCurrency(Math.min(...roomTypes.map((r) => r.basePrice), 850000))}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Hạng tiêu chuẩn Standard</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Giá cao nhất (PRE)</div>
          <div className="text-xl font-black text-amber-600 mt-1 tabular-nums">
            {formatCurrency(Math.max(...roomTypes.map((r) => r.basePrice), 5500000))}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">Presidential Suite 90m²</div>
        </div>
      </div>

      {/* Content View */}
      {loading ? (
        <div className="h-40 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center text-slate-400 font-semibold text-xs">
          Đang tải dữ liệu danh mục hạng phòng...
        </div>
      ) : viewMode === 'table' ? (
        /* BẢNG DANH MỤC 6 HẠNG PHÒNG (DoD 1) */
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-16">Ảnh</th>
                  <th className="py-3.5 px-4">Mã hạng</th>
                  <th className="py-3.5 px-4">Tên hạng phòng</th>
                  <th className="py-3.5 px-4 text-right">Giá niêm yết (VND/đêm)</th>
                  <th className="py-3.5 px-4 text-center">Diện tích (m²)</th>
                  <th className="py-3.5 px-4 text-center">Sức chứa tối đa</th>
                  <th className="py-3.5 px-4 text-center">Tổng số phòng thực tế</th>
                  <th className="py-3.5 px-4">Tiện nghi tiêu biểu</th>
                  <th className="py-3.5 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roomTypes.map((rt) => {
                  const actualRooms = getActualRoomsCount(rt);
                  return (
                    <tr key={rt.id} className="hover:bg-slate-50/80 transition group">
                      {/* Ảnh thu nhỏ */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-2xs">
                          <img
                            src={rt.image}
                            alt={rt.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                      </td>

                      {/* Mã hạng (STD, DLX...) */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded-md bg-[#0F172A] text-white">
                          {rt.code}
                        </span>
                      </td>

                      {/* Tên hạng phòng */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-sm text-[#0F172A]">{rt.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium italic">{rt.nameEn}</div>
                      </td>

                      {/* Giá niêm yết */}
                      <td className="py-3 px-4 text-right font-black text-sm text-[#1F5AA6] tabular-nums">
                        {formatCurrency(rt.basePrice)}
                      </td>

                      {/* Diện tích */}
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs">
                          {rt.area} m²
                        </span>
                      </td>

                      {/* Sức chứa tối đa */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-blue-50/80 px-2 py-1 rounded text-xs">
                          <Users className="w-3.5 h-3.5 text-[#1F5AA6]" />
                          <span>
                            {rt.capacityAdults ?? rt.maxGuests ?? 2} lớn + {rt.capacityChildren ?? 1} nhỏ
                          </span>
                        </span>
                      </td>

                      {/* Tổng số phòng thực tế */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-extrabold text-slate-900 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
                          <BedDouble className="w-3.5 h-3.5" />
                          <span>{actualRooms} phòng</span>
                        </span>
                      </td>

                      {/* Tiện nghi tiêu biểu */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {rt.amenities.slice(0, 3).map((a, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded truncate max-w-[120px]"
                            >
                              {a}
                            </span>
                          ))}
                          {rt.amenities.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-semibold">
                              +{rt.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Nút bấm Chỉnh sửa */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(rt)}
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          className="h-7 text-xs px-2.5 font-bold cursor-pointer text-[#1F5AA6] border-blue-200 hover:bg-blue-50"
                        >
                          Chỉnh sửa
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DẠNG THẺ (CARD GRID) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((rt) => {
            const actualRooms = getActualRoomsCount(rt);
            return (
              <div
                key={rt.id}
                className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="relative h-44">
                  <img
                    src={rt.image}
                    alt={rt.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#0F172A]/85 text-white backdrop-blur-xs">
                    {rt.code}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-xs flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5" />
                    {actualRooms} phòng
                  </span>
                </div>

                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-[#0F172A]">{rt.name}</h3>
                      <div className="text-xs text-[#475569] flex items-center gap-2 mt-1">
                        <span>{rt.area} m²</span>
                        <span>&bull;</span>
                        <span>
                          {rt.capacityAdults ?? rt.maxGuests ?? 2} lớn + {rt.capacityChildren ?? 1} trẻ
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Niêm yết:</div>
                      <div className="text-base font-black text-[#1F5AA6] tabular-nums">
                        {formatCurrency(rt.basePrice)}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rt.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                    {rt.amenities.slice(0, 4).map((a, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                      >
                        {a}
                      </span>
                    ))}
                    {rt.amenities.length > 4 && (
                      <span className="text-[10px] text-slate-500 px-1 py-0.5 font-bold">
                        +{rt.amenities.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-[#E2E8F0] flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(rt)}
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    className="text-xs font-bold cursor-pointer text-[#1F5AA6] border-blue-200"
                  >
                    Chỉnh sửa thông số
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Room Type Modal (DoD 2 & DoD 3) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          selectedType ? (
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[#1F5AA6]" />
              <span>Chỉnh sửa hạng phòng: {selectedType.name} ({selectedType.code})</span>
            </div>
          ) : (
            'Thêm hạng phòng kinh doanh mới'
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
              icon={<Save className="w-4 h-4" />}
              className="cursor-pointer font-bold"
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Row 1: Code and Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Mã hạng phòng:</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="STD, DLX..."
                className="w-full p-2 rounded-lg border border-[#E2E8F0] font-mono font-bold uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-[#0F172A] mb-1">Tên hạng phòng:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Deluxe City View"
                className="w-full p-2 rounded-lg border border-[#E2E8F0] font-semibold"
              />
            </div>
          </div>

          {/* Row 2: Price and Area */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Giá niêm yết (VND/đêm):</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full p-2 pr-12 rounded-lg border border-[#E2E8F0] font-mono font-bold text-[#1F5AA6]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</span>
              </div>
            </div>
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Diện tích (m²):</label>
              <input
                type="number"
                min="1"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-[#E2E8F0] font-semibold"
              />
            </div>
          </div>

          {/* Row 3: Capacities */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Số người lớn tối đa:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={capacityAdults}
                onChange={(e) => setCapacityAdults(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-[#E2E8F0]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Số trẻ em tối đa:</label>
              <input
                type="number"
                min="0"
                max="6"
                value={capacityChildren}
                onChange={(e) => setCapacityChildren(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-[#E2E8F0]"
              />
            </div>
          </div>

          {/* Row 4: Image URL */}
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">URL Ảnh đại diện:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2 rounded-lg border border-[#E2E8F0] font-mono text-[11px]"
              />
            </div>
            {image && (
              <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-slate-200">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Mô tả chi tiết:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu điểm nổi bật của hạng phòng, view ngắm cảnh..."
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
            />
          </div>

          {/* Row 6: Amenities list & chip tags */}
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Danh mục tiện ích đi kèm:</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                placeholder="Nhập tên tiện ích và bấm Thêm..."
                className="w-full p-2 rounded-lg border border-[#E2E8F0]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAmenity}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="shrink-0 cursor-pointer text-xs"
              >
                Thêm
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {amenities.map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-slate-800 border border-slate-200 shadow-2xs"
                >
                  <span>{a}</span>
                  <button
                    onClick={() => handleRemoveAmenity(a)}
                    className="text-slate-400 hover:text-rose-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
