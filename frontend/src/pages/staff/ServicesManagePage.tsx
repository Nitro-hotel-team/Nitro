/**
 * ============================================================================
 * TÊN FILE: ServicesManagePage.tsx
 * VỊ TRÍ: src/pages/staff/ServicesManagePage.tsx
 * PHÂN HỆ: Quản trị Menu & Bảng giá Dịch vụ Gia tăng (TASK-51 / FE-S3-21)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Quản trị danh mục dịch vụ gia tăng 4 sao (F&B, Minibar, Laundry, Spa, Transport):
 *     + Bảng danh mục dịch vụ đầy đủ: Tên dịch vụ, Nhóm danh mục, Đơn vị tính,
 *       Đơn giá niêm yết, Trạng thái (Hoạt động / Tạm ngưng) (DoD 1).
 *     + Công tắc Toggle Switch bật/tắt kinh doanh dịch vụ tức thời (DoD 2).
 *     + Modal Thêm mới và Chỉnh sửa dịch vụ: Tên, đơn giá, đơn vị tính, mô tả (DoD 3).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Car,
  CheckCircle2,
  Coffee,
  DollarSign,
  Edit2,
  Filter,
  PlusCircle,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Utensils,
  Wine,
  Shirt,
  X,
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
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State (DoD 3)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState(150000);
  const [unit, setUnit] = useState('Lượt');
  const [category, setCategory] = useState('F&B');
  const [description, setDescription] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await hotelServiceService.getServices();
        setServices(
          data.map((d) => ({
            ...d,
            isActive: d.status === 'ACTIVE' || d.isActive !== false,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Toggle Switch Handler (DoD 2)
  const handleToggle = async (id: string) => {
    const srv = services.find((s) => s.id === id);
    if (!srv) return;
    const nextActive = !srv.isActive;

    try {
      await hotelServiceService.toggleService(id);
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, isActive: nextActive, status: nextActive ? 'ACTIVE' : 'INACTIVE' }
            : s
        )
      );
      showToast(
        `Đã ${nextActive ? 'kích hoạt kinh doanh' : 'tạm ngưng phục vụ'} dịch vụ "${srv.name}"!`
      );
    } catch (error) {
      console.error('Failed to toggle service', error);
      alert('Không thể cập nhật trạng thái dịch vụ');
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setPrice(200000);
    setUnit('Lượt');
    setCategory('F&B');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setPrice(srv.price);
    setUnit(srv.unit || 'Lượt');
    setCategory(srv.category || 'F&B');
    setDescription(srv.description || '');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên dịch vụ!');
      return;
    }
    if (price <= 0) {
      alert('Đơn giá niêm yết phải lớn hơn 0 VND!');
      return;
    }

    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? { ...s, name, price, unit, category, description }
            : s
        )
      );
      showToast(`Đã cập nhật bảng giá dịch vụ "${name}" thành công!`);
    } else {
      const newSrv: Service = {
        id: `srv-${Date.now()}`,
        name,
        price,
        unit,
        category,
        description,
        isActive: true,
        status: 'ACTIVE',
      };
      setServices((prev) => [newSrv, ...prev]);
      showToast(`Đã thêm dịch vụ mới "${name}" vào danh mục!`);
    }
    setModalOpen(false);
  };

  const handleDelete = (srv: Service) => {
    if (window.confirm(`Bạn có chắc muốn xóa dịch vụ "${srv.name}" khỏi menu?`)) {
      setServices((prev) => prev.filter((s) => s.id !== srv.id));
      showToast(`Đã xóa dịch vụ "${srv.name}"!`);
    }
  };

  const filteredServices = services.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q);

    const matchCategory =
      categoryFilter === 'ALL' ||
      s.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchSearch && matchCategory;
  });

  const getCategoryIcon = (cat?: string) => {
    const c = (cat || '').toUpperCase();
    if (c.includes('F&B') || c.includes('ẨM THỰC')) return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
    if (c.includes('MINIBAR')) return <Wine className="w-3.5 h-3.5 text-purple-600" />;
    if (c.includes('LAUNDRY') || c.includes('GIẶT')) return <Shirt className="w-3.5 h-3.5 text-blue-600" />;
    if (c.includes('SPA') || c.includes('WELLNESS')) return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
    if (c.includes('TRANSPORT') || c.includes('XE')) return <Car className="w-3.5 h-3.5 text-indigo-600" />;
    return <Tag className="w-3.5 h-3.5 text-slate-500" />;
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
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.servicesManage')}</h1>
            <span className="bg-blue-50 text-[#1F5AA6] text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {services.length} dịch vụ
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            Quản trị danh mục dịch vụ gia tăng 4 sao: Ẩm thực F&amp;B, Minibar, Giặt là, Spa thư giãn, Đưa đón sân bay
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          icon={<PlusCircle className="w-4 h-4" />}
          className="font-bold shadow-xs cursor-pointer"
        >
          + Thêm dịch vụ mới
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng số dịch vụ</div>
          <div className="text-2xl font-black text-[#0F172A] mt-1">{services.length} món</div>
          <div className="text-[11px] text-slate-500 mt-1">Phục vụ khách lưu trú</div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs bg-emerald-50/20">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Đang kinh doanh</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {services.filter((s) => s.isActive).length}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Khả dụng cho Folio</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs bg-slate-50/40">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Tạm ngưng phục vụ</div>
          <div className="text-2xl font-black text-slate-600 mt-1">
            {services.filter((s) => !s.isActive).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Đang khóa tạm thời</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Nhóm danh mục</div>
          <div className="text-2xl font-black text-[#1F5AA6] mt-1">5 nhóm</div>
          <div className="text-[11px] text-slate-500 mt-1">F&amp;B, Minibar, Spa, Giặt, Xe</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên dịch vụ, mô tả..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5AA6]"
          />
        </div>

        {/* Category Tabs Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'F&B', label: 'F&B Ẩm thực' },
            { key: 'Minibar', label: 'Minibar' },
            { key: 'Laundry', label: 'Giặt là' },
            { key: 'Wellness', label: 'Spa & Wellness' },
            { key: 'Transport', label: 'Đưa đón xe' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs shrink-0 ${
                categoryFilter.toUpperCase() === cat.key.toUpperCase()
                  ? 'bg-[#1F5AA6] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng Danh mục Dịch vụ (DoD 1 & DoD 2) */}
      {loading ? (
        <div className="h-40 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center text-slate-400 font-semibold text-xs">
          Đang tải danh mục dịch vụ...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-slate-500">
          <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy dịch vụ nào</h3>
          <p className="text-xs text-slate-400 mt-1">
            Vui lòng thử điều chỉnh lại bộ lọc nhóm danh mục hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tên dịch vụ</th>
                  <th className="py-3 px-4">Nhóm danh mục</th>
                  <th className="py-3 px-4 text-center">Đơn vị tính</th>
                  <th className="py-3 px-4 text-right">Đơn giá niêm yết</th>
                  <th className="py-3 px-4 text-center">Trạng thái kinh doanh (Toggle)</th>
                  <th className="py-3 px-4">Mô tả chi tiết</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/80 transition group">
                    {/* Tên dịch vụ */}
                    <td className="py-3.5 px-4 font-bold text-sm text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(srv.category)}
                        <span>{srv.name}</span>
                      </div>
                    </td>

                    {/* Nhóm danh mục */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-[#1F5AA6] border border-blue-200">
                        {srv.category || 'F&B'}
                      </span>
                    </td>

                    {/* Đơn vị tính */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {srv.unit || 'Lượt'}
                      </span>
                    </td>

                    {/* Đơn giá niêm yết */}
                    <td className="py-3.5 px-4 text-right font-black text-sm text-[#1F5AA6] tabular-nums">
                      {formatCurrency(srv.price)}
                    </td>

                    {/* Trạng thái kinh doanh & Toggle Switch (DoD 2) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={srv.isActive}
                            onChange={() => handleToggle(srv.id)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                        <span
                          className={`text-[11px] font-bold ${
                            srv.isActive ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {srv.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </div>
                    </td>

                    {/* Mô tả chi tiết */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="text-[11px] text-slate-500 truncate" title={srv.description}>
                        {srv.description || 'Chưa có mô tả chi tiết'}
                      </p>
                    </td>

                    {/* Thao tác (Sửa, Xóa) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(srv)}
                          className="h-7 text-xs px-2 font-bold cursor-pointer text-[#1F5AA6] border-blue-200 hover:bg-blue-50"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(srv)}
                          className="h-7 text-xs px-2 text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm mới / Chỉnh sửa Dịch vụ (DoD 3) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? `Chỉnh sửa dịch vụ: ${editingService.name}` : 'Thêm dịch vụ gia tăng mới'}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} className="cursor-pointer">
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} className="cursor-pointer font-bold">
              Lưu thông tin dịch vụ
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1 text-[#0F172A]">Tên dịch vụ:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Rượu vang đón tiếp, Buffet sáng cao cấp..."
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-[#0F172A]">Nhóm danh mục:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-white font-semibold"
              >
                <option value="F&B">F&B (Ẩm thực &amp; Đồ uống)</option>
                <option value="Minibar">Minibar trong phòng</option>
                <option value="Laundry">Giặt là nhanh</option>
                <option value="Wellness">Spa &amp; Massage</option>
                <option value="Transport">Đưa đón sân bay</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1 text-[#0F172A]">Đơn vị tính:</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Lượt, Set, Chai, Giờ..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-[#0F172A]">Đơn giá niêm yết (VND):</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 pr-12 rounded-xl border border-[#E2E8F0] font-mono font-bold text-[#1F5AA6]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</span>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-[#0F172A]">Mô tả chi tiết:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quy cách phục vụ, thời gian áp dụng, chính sách tính tiền..."
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
