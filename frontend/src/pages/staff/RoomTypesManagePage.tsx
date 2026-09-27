/**
 * ============================================================================
 * TÊN FILE: RoomTypesManagePage.tsx
 * VỊ TRÍ: src/pages/staff/RoomTypesManagePage.tsx
 * PHÂN HỆ: Quản trị Hạng phòng & Giá niêm yết (Room Types & Tariff Management)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Quản lý cấu hình 5 hạng phòng tiêu chuẩn của khách sạn (Deluxe, Executive, Suite, Penthouse, Family):
 *     + Xem danh sách hạng phòng: Giá cơ sở/đêm, Diện tích m², Sức chứa người lớn/trẻ em, Tiện nghi.
 *     + Drawer chỉnh sửa giá bán theo mùa, cập nhật hình ảnh đại diện, mô tả chi tiết.
 *     + Thêm hạng phòng mới hoặc tắt/bật kinh doanh hạng phòng.
 * - Kết nối Backend REST API:
 *     + `GET /api/v1/room-types`: Tải danh sách cấu hình hạng phòng.
 *     + `PUT /api/v1/room-types/:id`: Cập nhật giá bán và thông số kỹ thuật.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  BedDouble,
  Check,
  Edit2,
  Image as ImageIcon,
  PlusCircle,
  Trash2,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { roomService } from '../../services/api';
import { RoomType } from '../../types';
import { formatCurrency } from '../../utils/format';

export const RoomTypesManagePage: React.FC = () => {
  const { t } = useTranslation();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedType, setSelectedType] = useState<RoomType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [capacityAdults, setCapacityAdults] = useState(2);
  const [capacityChildren, setCapacityChildren] = useState(1);
  const [area, setArea] = useState(30);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    try {
      const data = await roomService.getRoomTypes();
      setRoomTypes(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedType(null);
    setName('');
    setBasePrice(1000000);
    setCapacityAdults(2);
    setCapacityChildren(1);
    setArea(30);
    setDescription('');
    setImage('');
    setIsEditing(true);
  };

  const handleOpenEdit = (rt: RoomType) => {
    setSelectedType(rt);
    setName(rt.name);
    setBasePrice(rt.basePrice);
    setCapacityAdults(rt.capacityAdults ?? rt.maxGuests ?? 2);
    setCapacityChildren(rt.capacityChildren ?? 1);
    setArea(rt.area);
    setDescription(rt.description);
    setImage(rt.image || '');
    setIsEditing(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const { url } = await roomService.uploadImage(file);
      setImage(url);
    } catch (error: any) {
      alert(error.message || 'Lỗi tải ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (basePrice < 0) return alert('Giá cơ bản không được âm');
    if (area < 1) return alert('Diện tích phải lớn hơn hoặc bằng 1 m²');
    if (capacityAdults < 1) return alert('Số người lớn tối đa phải từ 1 trở lên');
    if (capacityChildren < 0) return alert('Số trẻ em tối đa không được âm');
    
    try {
      if (selectedType) {
        await roomService.updateRoomType(selectedType.id, {
          name,
          basePrice,
          capacityAdults,
          capacityChildren,
          area,
          description,
          image,
        });
        alert('Cập nhật hạng phòng thành công!');
      } else {
        await roomService.createRoomType({
          name,
          basePrice,
          capacityAdults,
          capacityChildren,
          area,
          description,
          image,
        });
        alert('Tạo hạng phòng thành công!');
      }
      setIsEditing(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Lỗi khi lưu hạng phòng');
    }
  };

  const handleDelete = async (rt: RoomType) => {
    if (window.confirm(`Bạn có chắc muốn xóa hạng phòng ${rt.name}?`)) {
      try {
        await roomService.deleteRoomType(rt.id);
        alert('Xóa hạng phòng thành công!');
        loadData();
      } catch (error: any) {
        alert(error.message || 'Không thể xóa hạng phòng');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.roomTypesManage')}</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Quản lý 6 hạng phòng chuẩn, định mức giá niêm yết, tiện nghi và sức chứa
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          icon={<PlusCircle className="w-4 h-4" />}
          className="font-bold"
        >
          + Thêm hạng phòng mới
        </Button>
      </div>

      {/* Grid of Room Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.map((rt) => (
          <div
            key={rt.id}
            className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="relative h-44">
              <img
                src={rt.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'}
                alt={rt.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#0F172A]/80 text-white backdrop-blur-xs">
                {rt.code}
              </span>
            </div>

            <div className="p-5 space-y-3 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">{rt.name}</h3>
                  <div className="text-xs text-[#475569] flex items-center gap-3 mt-1">
                    <span>{rt.area} m²</span>
                    <span>•</span>
                    <span>
                      {rt.capacityAdults} người lớn, {rt.capacityChildren} trẻ
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Giá niêm yết:</div>
                  <div className="text-sm font-extrabold text-[#1F5AA6] tabular-nums">
                    {formatCurrency(rt.basePrice)}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{rt.description}</p>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                {rt.amenities.slice(0, 4).map((a, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                  >
                    {a}
                  </span>
                ))}
                {rt.amenities.length > 4 && (
                  <span className="text-[10px] text-slate-500 px-1 py-0.5">
                    +{rt.amenities.length - 4}
                  </span>
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-[#E2E8F0] flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(rt)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Xóa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(rt)}
                icon={<Edit2 className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Drawer */}
      <Drawer
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={selectedType ? `Chỉnh sửa hạng phòng: ${selectedType.name}` : 'Thêm hạng phòng mới'}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Tên hạng phòng:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Ảnh đại diện:</label>
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="w-full p-1.5 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {isUploading && <span className="text-blue-600 font-medium text-xs">Đang tải...</span>}
            </div>
            {image && (
              <div className="mt-2 relative w-32 h-20 rounded-md overflow-hidden border border-slate-200">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Giá cơ bản (₫/đêm):</label>
              <input
                type="number"
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Diện tích (m²):</label>
              <input
                type="number"
                min="1"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Số người lớn tối đa:</label>
              <input
                type="number"
                min="1"
                value={capacityAdults}
                onChange={(e) => setCapacityAdults(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Số trẻ em tối đa:</label>
              <input
                type="number"
                min="0"
                value={capacityChildren}
                onChange={(e) => setCapacityChildren(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Mô tả chi tiết:</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
};
