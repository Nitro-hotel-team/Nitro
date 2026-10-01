/**
 * ============================================================================
 * TÊN FILE: ServicesManagePage.tsx
 * VỊ TRÍ: src/pages/staff/ServicesManagePage.tsx
 * PHÂN HỆ: Quản trị Dịch vụ Gia tăng & Phụ phí (Ancillary Services Management)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Quản lý danh mục các dịch vụ bổ trợ khách sạn cung cấp:
 *     + Ẩm thực (F&B): Buffet sáng, Tiệc trà chiều, Rượu vang đón tiếp.
 *     + Vận chuyển: Xe đưa đón sân bay Tân Sơn Nhất hai chiều.
 *     + Spa & Chăm sóc sức khỏe: Liệu trình massage đá nóng, xông hơi thảo dược.
 *     + Buồng phòng & Tiện ích: Kê thêm giường phụ (Extra bed), Giặt là nhanh 4h.
 *     + Thao tác: Bật/tắt trạng thái kinh doanh, chỉnh sửa đơn giá/đơn vị tính, thêm mới dịch vụ.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Car,
  Coffee,
  Edit2,
  PlusCircle,
  Sparkles,
  Tag,
  Trash2,
  Utensils,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { hotelServiceService } from '../../services/api';
import { Service } from '../../types';
import { formatCurrency } from '../../utils/format';

export const ServicesManagePage: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState(100000);
  const [unit, setUnit] = useState('lượt');
  const [category, setCategory] = useState('F&B');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setPrice(150000);
    setUnit('lượt');
    setCategory('F&B');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setPrice(srv.price);
    setUnit(srv.unit);
    setCategory(srv.category || 'F&B');
    setDescription(srv.description || '');
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await hotelServiceService.getServices();
        setServices(data.map(d => ({
          ...d,
          isActive: d.status === 'ACTIVE'
        })));
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await hotelServiceService.toggleService(id);
      setServices(services.map((s) => 
        s.id === id ? { ...s, isActive: !s.isActive, status: s.isActive ? 'INACTIVE' : 'ACTIVE' } : s
      ));
    } catch (error) {
      console.error('Failed to toggle service', error);
    }
  };

  const handleSave = () => {
    if (editingService) {
      setServices(
        services.map((s) =>
          s.id === editingService.id
            ? { ...s, name, price, unit, category, description }
            : s
        )
      );
    } else {
      setServices([
        ...services,
        {
          id: `srv-${Date.now()}`,
          name,
          price,
          unit,
          category,
          description,
          isActive: true,
        },
      ]);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.servicesManage')}</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Bảng giá dịch vụ phụ thu, ăn uống, spa và tiện ích khách sạn
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          icon={<PlusCircle className="w-4 h-4" />}
          className="font-bold"
        >
          + Thêm dịch vụ mới
        </Button>
      </div>

      {/* Grid of Services */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-slate-500 text-sm font-semibold">
          Đang tải danh sách dịch vụ...
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1F5AA6] border border-blue-200">
                  {srv.category}
                </span>
                <span className="text-sm font-extrabold text-[#1F5AA6] tabular-nums">
                  {formatCurrency(srv.price)} / {srv.unit}
                </span>
              </div>

              <h3 className="font-bold text-base text-[#0F172A]">{srv.name}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{srv.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleToggle(srv.id)}
                className={`text-xs font-semibold px-2 py-0.5 rounded cursor-pointer transition ${
                  srv.isActive
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {srv.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(srv)}
                icon={<Edit2 className="w-3.5 h-3.5" />}
                className="h-7 text-xs px-2.5"
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Lưu dịch vụ
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Tên dịch vụ:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
              placeholder="VD: Trọn gói ăn sáng..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Giá phụ thu (₫):</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Đơn vị tính:</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
                placeholder="VD: lượt, khách, suất..."
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Phân loại danh mục:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white"
            >
              <option value="F&B">Ẩm thực &amp; Đồ uống (F&amp;B)</option>
              <option value="Vận chuyển">Vận chuyển &amp; Xe đón tiễn</option>
              <option value="Chăm sóc sức khỏe">Spa &amp; Thư giãn</option>
              <option value="Tiện ích">Tiện ích phòng</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Mô tả chi tiết:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
