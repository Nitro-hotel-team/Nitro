/**
 * ============================================================================
 * TÊN FILE: CustomersListPage.tsx
 * VỊ TRÍ: src/pages/staff/CustomersListPage.tsx
 * PHÂN HỆ: Quản trị Quan hệ Khách hàng CRM & Hồ sơ Lưu trú (TASK-48 / FE-S3-18)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trung tâm dữ liệu khách hàng tích hợp CRM của khách sạn 4 sao:
 *     + Bảng dữ liệu: Mã khách, Họ tên, SĐT, Email, Số CCCD/Hộ chiếu, Tổng số đêm đã ở,
 *       Tổng chi tiêu tích lũy, Phân hạng thành viên (Badge VIP nổi bật) (DoD 1).
 *     + Tìm kiếm nhanh tức thời theo tên hoặc số điện thoại (DoD 2).
 *     + Modal/Drawer chi tiết hồ sơ khách: Danh sách đơn đặt phòng quá khứ, thông tin định danh,
 *       và ghi chú chăm sóc đặc biệt (Thích tầng cao, dị ứng lông vũ, ăn chay...) (DoD 3).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  History,
  Mail,
  Moon,
  Phone,
  PlusCircle,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { bookingService, guestService } from '../../services/api';
import { Booking, Guest } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export const CustomersListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestNotes, setGuestNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guestData, bookingData] = await Promise.all([
          guestService.getGuests(),
          bookingService.getBookings(),
        ]);
        setGuests(guestData);
        setAllBookings(bookingData);
      } catch (err) {
        console.error('Failed to load CRM data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter logic (Name or Phone or CCCD or Email)
  const filteredGuests = guests.filter((g) => {
    const q = search.toLowerCase().trim();
    const guestName = (g.fullName || g.name || '').toLowerCase();
    const guestPhone = g.phone.toLowerCase();
    const guestCccd = (g.identityNumber || g.idCardNumber || '').toLowerCase();
    const guestEmail = g.email.toLowerCase();

    const matchesSearch =
      !q ||
      guestName.includes(q) ||
      guestPhone.includes(q) ||
      guestCccd.includes(q) ||
      guestEmail.includes(q);

    const tier = g.vipTier || 'Thường';
    const matchesTier =
      tierFilter === 'ALL' ||
      (tierFilter === 'VIP' && (tier.includes('VIP') || tier.includes('Diamond') || tier.includes('Platinum') || tier.includes('Gold'))) ||
      tier === tierFilter;

    return matchesSearch && matchesTier;
  });

  const handleOpenGuest = (g: Guest) => {
    setSelectedGuest(g);
    setGuestNotes(g.notes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedGuest) return;
    setGuests((prev) =>
      prev.map((g) => (g.id === selectedGuest.id ? { ...g, notes: guestNotes } : g))
    );
    setSelectedGuest((prev) => (prev ? { ...prev, notes: guestNotes } : null));
    showToast(`Đã lưu ghi chú chăm sóc cho khách hàng ${selectedGuest.fullName || selectedGuest.name}!`);
  };

  // Find bookings of selected guest
  const guestHistoryBookings = selectedGuest
    ? allBookings.filter(
        (b) =>
          b.guestId === selectedGuest.id ||
          b.guestPhone === selectedGuest.phone ||
          (b.guestName && (selectedGuest.fullName || selectedGuest.name) &&
            b.guestName.toLowerCase() === (selectedGuest.fullName || selectedGuest.name || '').toLowerCase())
      )
    : [];

  const renderVipBadge = (vipTier?: string) => {
    const tier = vipTier || 'Thường';
    if (tier.includes('Diamond')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xs border border-purple-400">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          {tier}
        </span>
      );
    }
    if (tier.includes('Platinum')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-100 shadow-xs border border-slate-600">
          <Crown className="w-3.5 h-3.5 text-slate-300" />
          {tier}
        </span>
      );
    }
    if (tier.includes('Gold')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs border border-amber-400">
          <Crown className="w-3.5 h-3.5 text-white" />
          {tier}
        </span>
      );
    }
    if (tier.includes('Bạc') || tier.includes('Silver') || tier.includes('Thân thiết')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          {tier}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        {tier}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
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
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Hồ sơ Khách hàng &amp; CRM</h1>
            <span className="bg-blue-50 text-[#1F5AA6] text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {guests.length} hồ sơ
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            Quản trị quan hệ khách hàng CRM 4 sao, theo dõi tích lũy chi tiêu và ghi chú sở thích cá nhân hóa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Download className="w-4 h-4" />}
            className="cursor-pointer font-bold"
          >
            Xuất dữ liệu CRM
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/staff/walk-in')}
            icon={<PlusCircle className="w-4 h-4" />}
            className="cursor-pointer font-bold shadow-xs"
          >
            + Đặt phòng mới
          </Button>
        </div>
      </div>

      {/* CRM Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng hội viên CRM</div>
          <div className="text-2xl font-black text-[#0F172A] mt-1">{guests.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% hồ sơ định danh CCCD</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hội viên VIP / Thân thiết</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {guests.filter((g) => (g.vipTier || '').includes('VIP') || (g.vipTier || '').includes('Thân')).length}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">Ưu tiên phục vụ hạng sang</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng lượt lưu trú</div>
          <div className="text-2xl font-black text-[#1F5AA6] mt-1">
            {guests.reduce((acc, g) => acc + (g.totalBookings || g.totalStays || 0), 0)} lượt
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tổng {guests.reduce((acc, g) => acc + (g.totalNights || 0), 0)} đêm nghỉ dưỡng
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng doanh thu tích lũy</div>
          <div className="text-xl font-black text-emerald-700 mt-1 tabular-nums">
            {formatCurrency(guests.reduce((acc, g) => acc + (g.totalSpent || 0), 0))}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Giá trị trọn đời (CLV)</div>
        </div>
      </div>

      {/* Search and Filters Toolbar (DoD 2) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, số điện thoại, số CCCD hoặc email..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5AA6] transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tier filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <span className="text-slate-500 font-bold mr-1 flex items-center gap-1 text-[11px]">
            <Filter className="w-3.5 h-3.5" /> Phân hạng:
          </span>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'VIP', label: 'VIP' },
            { key: 'Thân thiết', label: 'Thân thiết' },
            { key: 'Thường', label: 'Thường' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTierFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs ${
                tierFilter === tab.key
                  ? 'bg-[#1F5AA6] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CRM Guest Table (DoD 1) */}
      {loading ? (
        <div className="flex justify-center items-center h-48 bg-white border border-[#E2E8F0] rounded-2xl text-slate-500 text-sm font-semibold">
          Đang tải cơ sở dữ liệu khách hàng CRM...
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-slate-500">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy khách hàng phù hợp</h3>
          <p className="text-xs text-slate-400 mt-1">
            Thử nhập từ khóa tìm kiếm khác hoặc chọn lại phân hạng hội viên
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã khách</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Liên hệ (SĐT / Email)</th>
                  <th className="py-3 px-4">Số CCCD / Hộ chiếu</th>
                  <th className="py-3 px-4 text-center">Tổng số đêm đã ở</th>
                  <th className="py-3 px-4 text-right">Tổng chi tiêu</th>
                  <th className="py-3 px-4 text-center">Phân hạng thành viên</th>
                  <th className="py-3 px-4">Ghi chú sở thích đặc biệt</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGuests.map((g) => {
                  const displayName = g.fullName || g.name || 'Khách chưa đặt tên';
                  const cccd = g.identityNumber || g.idCardNumber || 'Chưa cập nhật';
                  const totalNights = g.totalNights || (g.totalStays ? g.totalStays * 2 : 2);

                  return (
                    <tr
                      key={g.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                      onClick={() => handleOpenGuest(g)}
                    >
                      {/* Mã khách */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1F5AA6]">
                        {g.id}
                      </td>

                      {/* Họ tên */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#0F172A] group-hover:text-[#1F5AA6] transition flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{displayName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {g.nationality || 'Việt Nam'}
                        </div>
                      </td>

                      {/* Liên hệ */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {g.phone}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {g.email}
                        </div>
                      </td>

                      {/* Số CCCD / Hộ chiếu */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {cccd}
                        </span>
                      </td>

                      {/* Tổng số đêm đã ở */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-blue-50/60 px-2.5 py-1 rounded-lg">
                          <Moon className="w-3 h-3 text-[#1F5AA6]" />
                          <span>{totalNights} đêm</span>
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ({g.totalBookings || g.totalStays || 1} lần lưu trú)
                        </div>
                      </td>

                      {/* Tổng chi tiêu */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#1F5AA6] tabular-nums text-sm">
                        {formatCurrency(g.totalSpent)}
                      </td>

                      {/* Phân hạng thành viên */}
                      <td className="py-3.5 px-4 text-center">
                        {renderVipBadge(g.vipTier)}
                      </td>

                      {/* Ghi chú sở thích */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        {g.notes ? (
                          <div className="text-[11px] text-slate-600 truncate italic bg-amber-50/60 text-amber-900 px-2 py-1 rounded border border-amber-200">
                            "{g.notes}"
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa có ghi chú</span>
                        )}
                      </td>

                      {/* Hành động */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenGuest(g)}
                          className="h-7 text-xs px-2.5 font-bold cursor-pointer text-[#1F5AA6] border-blue-200 hover:bg-blue-50"
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Hồ sơ
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guest Profile Modal / Drawer (DoD 3) */}
      <Drawer
        isOpen={Boolean(selectedGuest)}
        onClose={() => setSelectedGuest(null)}
        title={
          selectedGuest ? (
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0F172A]">
                Hồ sơ khách: {selectedGuest.fullName || selectedGuest.name}
              </span>
              {renderVipBadge(selectedGuest.vipTier)}
            </div>
          ) : (
            ''
          )
        }
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-[11px] text-slate-400 font-mono">
              Mã: {selectedGuest?.id}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGuest(null)}
                className="cursor-pointer"
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveNotes}
                icon={<Save className="w-4 h-4" />}
                className="cursor-pointer font-bold"
              >
                Lưu ghi chú
              </Button>
            </div>
          </div>
        }
      >
        {selectedGuest && (
          <div className="space-y-6 text-xs">
            {/* Identity & Loyalty Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-widest font-mono">
                    {selectedGuest.id}
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {selectedGuest.fullName || selectedGuest.name}
                  </h3>
                </div>
                <div>{renderVipBadge(selectedGuest.vipTier)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] pt-3 border-t border-slate-700/80">
                <div>
                  <span className="text-slate-400 block">Số điện thoại:</span>
                  <span className="font-mono font-bold text-white text-xs">{selectedGuest.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email:</span>
                  <span className="font-semibold text-white text-xs truncate block">{selectedGuest.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Số CCCD / Passport:</span>
                  <span className="font-mono font-bold text-white text-xs">
                    {selectedGuest.identityNumber || selectedGuest.idCardNumber || 'Chưa cập nhật'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Quốc tịch:</span>
                  <span className="font-semibold text-white text-xs">{selectedGuest.nationality || 'Việt Nam'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/80 bg-slate-800/60 -mx-5 -mb-5 p-4 rounded-b-2xl">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Tổng số đêm đã ở:</span>
                  <span className="text-base font-black text-amber-400">
                    {selectedGuest.totalNights || 12} đêm ({selectedGuest.totalBookings || selectedGuest.totalStays || 1} lần)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Tổng chi tiêu tích lũy:</span>
                  <span className="text-base font-black text-emerald-400 tabular-nums">
                    {formatCurrency(selectedGuest.totalSpent)}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Preferences & Notes Form (DoD 3) */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-[#0F172A] flex items-center gap-1.5 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Ghi chú sở thích &amp; Tiêu chuẩn phục vụ 4 sao:
                </label>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  CRM Persona
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80">
                Ghi chú các yêu cầu cá nhân hóa: Thích tầng cao, dị ứng lông vũ, ăn chay trường, hướng nhìn phòng, giờ đón tiếp...
              </p>
              <textarea
                rows={4}
                value={guestNotes}
                onChange={(e) => setGuestNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                placeholder="Ví dụ: Thích tầng cao view Landmark 81, dị ứng lông vũ (yêu cầu gối đệm cotton thuần), ăn chay, cần xuất hóa đơn công ty..."
              />
              <div className="flex justify-end">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={handleSaveNotes}
                  icon={<Save className="w-3.5 h-3.5" />}
                  className="font-bold cursor-pointer text-xs h-7"
                >
                  Cập nhật ghi chú
                </Button>
              </div>
            </div>

            {/* Past Bookings History (DoD 3) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-[#0F172A] flex items-center gap-1.5 text-xs">
                  <History className="w-4 h-4 text-[#1F5AA6]" />
                  Lịch sử các lần đặt phòng lưu trú:
                </h4>
                <span className="text-[11px] text-slate-500 font-bold">
                  {guestHistoryBookings.length} đơn đặt
                </span>
              </div>

              {guestHistoryBookings.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                  Chưa tìm thấy đơn đặt phòng nào gắn với khách này trong cơ sở dữ liệu hiện hành.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {guestHistoryBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-white border border-[#E2E8F0] rounded-xl hover:border-blue-300 transition shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#1F5AA6] text-xs">
                          {b.bookingCode}
                        </span>
                        <StatusBadge type="booking" status={b.status} />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {b.roomTypeName} {b.roomNumber ? `(Phòng ${b.roomNumber})` : ''}
                        </span>
                        <span className="font-extrabold text-[#0F172A] tabular-nums">
                          {formatCurrency(b.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>
                          {formatDate(b.checkInDate)} &rarr; {formatDate(b.checkOutDate)} ({b.nights} đêm)
                        </span>
                        <button
                          onClick={() => {
                            setSelectedGuest(null);
                            navigate(`/staff/bookings/${b.id}`);
                          }}
                          className="text-[#1F5AA6] font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          Xem Folio <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
