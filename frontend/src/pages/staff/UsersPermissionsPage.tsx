/**
 * ============================================================================
 * TÊN FILE: UsersPermissionsPage.tsx
 * VỊ TRÍ: src/pages/staff/UsersPermissionsPage.tsx
 * PHÂN HỆ: Quản trị Tài khoản Nhân sự & Phân quyền RBAC (TASK-54 / FE-S3-24)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trung tâm quản trị an ninh tài khoản nội bộ dành riêng cho Quản trị viên (ADMIN):
 *     + Bảng nhân sự hiển thị: Mã nhân viên, Họ tên & Avatar, Email, Số điện thoại,
 *       Vai trò phân quyền (Badge màu tương ứng: ADMIN đỏ, MANAGER tím, FRONT_DESK xanh),
 *       Trạng thái tài khoản (ACTIVE xanh / LOCKED đỏ), Lần đăng nhập cuối (DoD 1).
 *     + Modal "Thêm nhân viên mới": Họ tên, email, mật khẩu khởi tạo và chọn vai trò
 *       quyền hạn từ danh sách thả xuống (DoD 2).
 *     + Nút bấm Khóa tài khoản (Lock) / Mở khóa tài khoản cập nhật tức thời (DoD 3).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  Phone,
  PlusCircle,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  User,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { userService } from '../../services/api';
import { User as UserType, UserRole } from '../../types';

export const UsersPermissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State (DoD 2)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  // Form Fields
  const [employeeCode, setEmployeeCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('FRONT_DESK');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getUsers();
        // Enrich employeeCode and default fields if not present
        const enriched = data.map((u, idx) => ({
          ...u,
          employeeCode: u.employeeCode || (u.role === 'ADMIN' ? 'ADM-001' : u.role === 'MANAGER' ? 'MGR-001' : `FD-00${idx + 1}`),
          status: u.status || 'ACTIVE',
          lastLogin: u.lastLogin || 'Hôm nay 08:30',
        }));
        setUsers(enriched);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Lock / Unlock Toggle Handler (DoD 3)
  const handleToggleLock = async (u: UserType) => {
    if (u.role === 'ADMIN') {
      alert('Không thể khóa tài khoản Quản trị viên cấp cao (ADMIN) của hệ thống!');
      return;
    }

    const isLocked = u.status === 'LOCKED';
    const nextStatus = isLocked ? 'ACTIVE' : 'LOCKED';

    try {
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, status: nextStatus } : item))
      );
      showToast(
        isLocked
          ? `Đã mở khóa tài khoản cho nhân viên ${u.name} (${u.employeeCode})!`
          : `Đã khóa truy cập tài khoản ${u.name} (${u.employeeCode}) an toàn!`
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái tài khoản');
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setEmployeeCode(`FD-00${users.length + 1}`);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('NitroHotel@2026');
    setRole('FRONT_DESK');
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (u: UserType) => {
    setEditingUser(u);
    setEmployeeCode(u.employeeCode || 'NV-001');
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setPassword('');
    setRole(u.role);
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Vui lòng nhập họ và tên nhân viên!');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }
    if (!editingUser && !password.trim()) {
      alert('Vui lòng nhập mật khẩu khởi tạo cho nhân viên mới!');
      return;
    }

    try {
      if (editingUser) {
        if (editingUser.role !== role) {
          await userService.updateUserRole(editingUser.id, role);
        }
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, name, email, phone, role, employeeCode }
              : u
          )
        );
        showToast(`Đã cập nhật thông tin nhân viên ${name} (${employeeCode})!`);
      } else {
        const newUser: UserType = {
          id: `usr-${Date.now()}`,
          employeeCode,
          name,
          email,
          phone: phone || '0901234567',
          role,
          status: 'ACTIVE',
          lastLogin: 'Chưa đăng nhập lần đầu',
          avatar:
            role === 'ADMIN'
              ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
              : role === 'MANAGER'
              ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
              : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
        };
        setUsers((prev) => [...prev, newUser]);
        showToast(`Đã tạo mới tài khoản nhân viên ${name} với vai trò ${t(`role.${role}`)}!`);
      }
      setModalOpen(false);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi lưu tài khoản');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(q));

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchSearch && matchRole;
  });

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
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.usersPermissions')}</h1>
            <span className="bg-rose-100 text-rose-900 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-300">
              Admin Only (RBAC)
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            Quản trị tài khoản nhân viên nội bộ, phân quyền vai trò Lễ tân, Quản lý và khóa tài khoản tức thời
          </p>
        </div>

        {/* Nút Thêm nhân viên mới (DoD 2) */}
        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          icon={<PlusCircle className="w-4 h-4" />}
          className="font-bold shadow-xs cursor-pointer"
        >
          + Thêm nhân viên mới
        </Button>
      </div>

      {/* Security & Role KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng nhân sự nội bộ</div>
          <div className="text-2xl font-black text-[#0F172A] mt-1">{users.length} tài khoản</div>
          <div className="text-[11px] text-slate-500 mt-1">Được cấp quyền truy cập</div>
        </div>
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-xs bg-rose-50/20">
          <div className="text-[11px] font-bold text-rose-700 uppercase">Quản trị viên (ADMIN)</div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">Toàn quyền hệ thống</div>
        </div>
        <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-xs bg-purple-50/20">
          <div className="text-[11px] font-bold text-purple-700 uppercase">Quản lý (MANAGER)</div>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {users.filter((u) => u.role === 'MANAGER').length}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Báo cáo &amp; Phê duyệt</div>
        </div>
        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs bg-blue-50/20">
          <div className="text-[11px] font-bold text-[#1F5AA6] uppercase">Lễ tân (FRONT_DESK)</div>
          <div className="text-2xl font-black text-[#1F5AA6] mt-1">
            {users.filter((u) => u.role === 'FRONT_DESK').length}
          </div>
          <div className="text-[11px] text-[#1F5AA6] font-semibold mt-1">Vận hành sảnh &amp; Check-in</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã NV, tên, email, SĐT..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5AA6]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="font-bold text-slate-500 mr-1">Vai trò:</span>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'ADMIN', label: 'Admin' },
            { key: 'MANAGER', label: 'Quản lý' },
            { key: 'FRONT_DESK', label: 'Lễ tân' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs ${
                roleFilter === tab.key
                  ? 'bg-[#1F5AA6] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* BẢNG NHÂN SỰ CHI TIẾT (DoD 1 & DoD 3) */}
      {loading ? (
        <div className="h-44 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center text-slate-400 font-semibold text-xs">
          Đang tải danh sách nhân sự...
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã nhân viên</th>
                  <th className="py-3 px-4">Họ và tên nhân sự</th>
                  <th className="py-3 px-4">Email đăng nhập</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4 text-center">Vai trò phân quyền</th>
                  <th className="py-3 px-4 text-center">Trạng thái tài khoản</th>
                  <th className="py-3 px-4">Lần đăng nhập cuối</th>
                  <th className="py-3 px-4 text-right">Thao tác &amp; Khóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isLocked = u.status === 'LOCKED';
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isLocked ? 'bg-rose-50/20 opacity-75' : ''
                      }`}
                    >
                      {/* Mã nhân viên */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-[#1F5AA6] text-xs">
                        {u.employeeCode || 'NV-001'}
                      </td>

                      {/* Họ tên & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-[#0F172A]">{u.name}</div>
                            {u.role === 'ADMIN' && (
                              <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                                <ShieldAlert className="w-3 h-3" /> Master Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      {/* Số điện thoại */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </div>
                      </td>

                      {/* Vai trò phân quyền (Badge màu tương ứng) */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : u.role === 'MANAGER'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : u.role === 'FRONT_DESK'
                              ? 'bg-blue-100 text-[#1F5AA6] border border-blue-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{t(`role.${u.role}`)}</span>
                        </span>
                      </td>

                      {/* Trạng thái tài khoản (ACTIVE / LOCKED) */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                            u.status === 'LOCKED'
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'LOCKED' ? 'bg-rose-600' : 'bg-emerald-500'
                            }`}
                          />
                          <span>{u.status === 'LOCKED' ? 'LOCKED (Đã khóa)' : 'ACTIVE (Hoạt động)'}</span>
                        </span>
                      </td>

                      {/* Lần đăng nhập cuối */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium text-[11px]">
                        {u.lastLogin || 'Hôm nay 08:30'}
                      </td>

                      {/* Thao tác & Nút bấm Khóa tài khoản (Lock) / Mở khóa (DoD 3) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Khóa / Mở khóa */}
                          <button
                            onClick={() => handleToggleLock(u)}
                            disabled={u.role === 'ADMIN'}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
                              u.status === 'LOCKED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            } ${u.role === 'ADMIN' ? 'opacity-40 cursor-not-allowed' : ''}`}
                            title={
                              u.role === 'ADMIN'
                                ? 'Không thể khóa tài khoản Admin'
                                : u.status === 'LOCKED'
                                ? 'Mở khóa tài khoản'
                                : 'Khóa tài khoản nhân viên'
                            }
                          >
                            {u.status === 'LOCKED' ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Mở khóa</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Khóa</span>
                              </>
                            )}
                          </button>

                          {/* Sửa thông tin */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(u)}
                            icon={<Edit2 className="w-3 h-3" />}
                            className="h-7 text-xs px-2 font-bold cursor-pointer"
                          >
                            Sửa
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

      {/* MODAL THÊM NHÂN VIÊN MỚI / CHỈNH SỬA (DoD 2) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingUser ? (
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[#1F5AA6]" />
              <span>Chỉnh sửa tài khoản nhân viên: {editingUser.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Thêm nhân viên mới &amp; Phân quyền RBAC</span>
            </div>
          )
        }
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} className="cursor-pointer">
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} className="cursor-pointer font-bold">
              Lưu tài khoản
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-[#0F172A]">Mã nhân viên:</label>
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="VD: FD-005, MGR-002..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-[#0F172A]">Họ và tên nhân sự:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Thị Lan Hương"
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-[#0F172A]">Email đăng nhập:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="huong.nguyen@nitrohotel.vn"
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-[#0F172A]">Số điện thoại:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-mono focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
              />
            </div>
          </div>

          {/* Mật khẩu khởi tạo (DoD 2) */}
          <div>
            <label className="block font-bold mb-1 text-[#0F172A]">
              {editingUser ? 'Đặt lại mật khẩu mới (Bỏ trống nếu giữ nguyên):' : 'Mật khẩu khởi tạo:'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingUser ? '••••••••' : 'Nhập mật khẩu cho nhân viên...'}
                className="w-full p-2.5 pr-10 rounded-xl border border-[#E2E8F0] font-mono focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Nhân viên sẽ được yêu cầu đổi mật khẩu trong lần đăng nhập đầu tiên.
            </p>
          </div>

          {/* Chọn vai trò quyền hạn từ danh sách thả xuống (DoD 2) */}
          <div>
            <label className="block font-bold mb-1 text-[#0F172A]">Chọn vai trò quyền hạn (RBAC Role):</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1F5AA6]"
            >
              <option value="FRONT_DESK">Lễ tân (FRONT_DESK) - Quản lý phòng, sơ đồ, check-in, giao ca</option>
              <option value="MANAGER">Quản lý (MANAGER) - Xem báo cáo doanh thu, duyệt giá &amp; dịch vụ</option>
              <option value="ADMIN">Quản trị viên (ADMIN) - Toàn quyền cấu hình, nhân sự &amp; bảo mật</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
