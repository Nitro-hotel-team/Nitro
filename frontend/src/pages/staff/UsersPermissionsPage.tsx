/**
 * ============================================================================
 * TÊN FILE: UsersPermissionsPage.tsx
 * VỊ TRÍ: src/pages/staff/UsersPermissionsPage.tsx
 * PHÂN HỆ: Quản trị Tài khoản Nhân sự & Phân quyền RBAC (Role-Based Access Control)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Quản trị danh sách nhân sự khách sạn và cấp quyền truy cập hệ thống:
 *     + Bốn cấp độ vai trò:
 *         * ADMIN: Toàn quyền cấu hình phòng, giá, nhân sự, kiểm toán.
 *         * MANAGER: Xem báo cáo doanh thu, duyệt chi phí, quản lý lịch làm việc.
 *         * FRONT_DESK: Đặt phòng, check-in, check-out, sơ đồ phòng, bàn giao ca.
 *         * CUSTOMER: Chỉ xem và quản lý đơn đặt phòng cá nhân.
 *     + Bảng ma trận phân quyền chi tiết (RBAC Permission Matrix) minh bạch.
 *     + Modal thêm mới tài khoản nhân viên hoặc thay đổi vai trò trực tiếp.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Edit2,
  Key,
  Lock,
  PlusCircle,
  Search,
  Shield,
  ShieldCheck,
  User,
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('FRONT_DESK');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('FRONT_DESK');
    setModalOpen(true);
  };

  const handleOpenEdit = (u: UserType) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setRole(u.role);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        if (editingUser.role !== role) {
          await userService.updateUserRole(editingUser.id, role);
        }
        setUsers(
          users.map((u) => (u.id === editingUser.id ? { ...u, name, email, phone, role } : u))
        );
      } else {
        const newUser = await userService.createUser({
          name,
          email,
          phone,
          role,
          password: 'Password@123',
        });
        setUsers([...users, newUser]);
      }
      setModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save user:', error);
      alert(error.message || 'Lỗi khi lưu tài khoản');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.usersPermissions')}</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Quản trị tài khoản nhân viên nội bộ, phân quyền vai trò Lễ tân, Quản lý và Quản trị
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          icon={<PlusCircle className="w-4 h-4" />}
          className="font-bold"
        >
          + Thêm tài khoản mới
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-slate-500 text-sm font-semibold">
          Đang tải danh sách nhân sự...
        </div>
      ) : (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nhân sự</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Vai trò (Role)</th>
                <th className="py-3 px-4">Quyền hạn hệ thống</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-bold text-[#0F172A]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">{u.email}</td>
                  <td className="py-3 px-4 font-mono">{u.phone}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-800'
                          : u.role === 'MANAGER'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-[#1F5AA6]'
                      }`}
                    >
                      {t(`role.${u.role}`)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {u.role === 'ADMIN'
                      ? 'Toàn quyền cấu hình, nhân sự & phân quyền'
                      : u.role === 'MANAGER'
                      ? 'Báo cáo doanh thu, phòng, dịch vụ'
                      : u.role === 'FRONT_DESK'
                      ? 'Check-in, Check-out, sơ đồ phòng, hóa đơn'
                      : 'Người dùng khách (Chỉ xem đơn đặt phòng của mình)'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(u)}
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      className="h-7 text-xs px-2"
                    >
                      Sửa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Chỉnh sửa tài khoản nhân viên' : 'Thêm tài khoản nhân viên'}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Lưu tài khoản
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Họ và tên nhân sự:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Email đăng nhập:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Số điện thoại:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E2E8F0]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Phân quyền vai trò:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-white font-semibold"
            >
              <option value="CUSTOMER" disabled>Khách hàng (Customer) - Người dùng thông thường</option>
              <option value="FRONT_DESK">Lễ tân (Front Desk) - Vận hành ca, check-in, timeline</option>
              <option value="MANAGER">Quản lý (Manager) - Xem báo cáo, doanh thu, quản lý phòng &amp; dịch vụ</option>
              <option value="ADMIN">Quản trị viên (Admin) - Toàn quyền hệ thống</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
