/**
 * ============================================================================
 * TÊN FILE: CustomersListPage.tsx
 * VỊ TRÍ: src/pages/staff/CustomersListPage.tsx
 * PHÂN HỆ: Quản trị Hồ sơ Khách hàng & Khách hàng thân thiết (CRM & Loyalty)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trung tâm dữ liệu khách hàng tích hợp CRM của khách sạn:
 *     + Danh sách khách: Họ tên, Số điện thoại, Email, Số CCCD/Passport.
 *     + Thống kê lịch sử: Tổng số lần lưu trú, Tổng doanh thu đã chi tiêu (CLV).
 *     + Hạng thành viên Loyalty: Standard, Silver, Gold, Platinum/VIP.
 *     + Ghi chú sở thích đặc biệt (Preferences/Allergies/Special Requests).
 *     + Drawer xem chi tiết và cập nhật thông tin khách hàng nhanh chóng.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  Check,
  CreditCard,
  Download,
  Mail,
  Phone,
  PlusCircle,
  Search,
  Star,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { guestService } from '../../services/api';
import { Guest } from '../../types';
import { formatCurrency } from '../../utils/format';

export const CustomersListPage: React.FC = () => {
  const { t } = useTranslation();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestNotes, setGuestNotes] = useState('');

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const data = await guestService.getGuests();
        setGuests(data);
      } catch (err) {
        console.error('Failed to load guests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter((g) => {
    const q = search.toLowerCase().trim();
    const guestName = (g.fullName || g.name || '').toLowerCase();
    return (
      guestName.includes(q) ||
      g.phone.includes(q) ||
      g.email.toLowerCase().includes(q)
    );
  });

  const handleOpenGuest = (g: Guest) => {
    setSelectedGuest(g);
    setGuestNotes(g.notes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedGuest) return;
    setGuests(
      guests.map((g) => (g.id === selectedGuest.id ? { ...g, notes: guestNotes } : g))
    );
    setSelectedGuest(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.customersList')}</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Hồ sơ khách hàng, lịch sử chi tiêu và ghi chú chăm sóc cá nhân hóa
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          icon={<Download className="w-4 h-4" />}
        >
          Xuất dữ liệu khách
        </Button>
      </div>

      {/* Search toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, SĐT, email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5AA6]"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
          {filteredGuests.length} hồ sơ khách hàng
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-slate-500 text-sm font-semibold">
          Đang tải danh sách khách hàng...
        </div>
      ) : (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Liên hệ</th>
                <th className="py-3 px-4">Hạng thành viên</th>
                <th className="py-3 px-4">Số lượt đặt</th>
                <th className="py-3 px-4">Tổng chi tiêu</th>
                <th className="py-3 px-4">Ghi chú chăm sóc</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0F172A]">{g.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">CCCD: {g.identityNumber}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono">{g.phone}</div>
                    <div className="text-[11px] text-slate-500">{g.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {(() => {
                      const tier = g.vipTier || 'Thường';
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            tier.includes('Platinum')
                              ? 'bg-purple-100 text-purple-800'
                              : tier.includes('Gold')
                              ? 'bg-amber-100 text-amber-800'
                              : tier.includes('Silver')
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                          {tier}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3.5 px-4 font-bold">{g.totalBookings} lần</td>
                  <td className="py-3.5 px-4 font-extrabold text-[#1F5AA6] tabular-nums">
                    {formatCurrency(g.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate italic">
                    "{g.notes}"
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenGuest(g)}
                      className="h-7 text-xs px-2.5"
                    >
                      Hồ sơ
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Guest Drawer */}
      <Drawer
        isOpen={Boolean(selectedGuest)}
        onClose={() => setSelectedGuest(null)}
        title={selectedGuest ? `Hồ sơ: ${selectedGuest.fullName}` : ''}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setSelectedGuest(null)}>
              Đóng
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveNotes}>
              Lưu ghi chú
            </Button>
          </div>
        }
      >
        {selectedGuest && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span>Số điện thoại:</span>
                <span className="font-mono font-bold text-[#0F172A]">{selectedGuest.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-bold text-[#0F172A]">{selectedGuest.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Số CMND / Hộ chiếu:</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  {selectedGuest.identityNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hạng thành viên:</span>
                <span className="font-bold text-amber-700">{selectedGuest.vipTier}</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng chi tiêu tích lũy:</span>
                <span className="font-extrabold text-[#1F5AA6] text-sm">
                  {formatCurrency(selectedGuest.totalSpent)}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0F172A] mb-1">
                Ghi chú sở thích &amp; Đặc điểm phục vụ:
              </label>
              <textarea
                rows={4}
                value={guestNotes}
                onChange={(e) => setGuestNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-[#E2E8F0]"
                placeholder="Ví dụ: Dị ứng hải sản, thích phòng view Landmark 81, yêu cầu gối lông vũ..."
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
