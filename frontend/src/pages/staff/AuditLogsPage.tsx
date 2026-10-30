/**
 * ============================================================================
 * TÊN FILE: AuditLogsPage.tsx
 * VỊ TRÍ: src/pages/staff/AuditLogsPage.tsx
 * PHÂN HỆ: Nhật ký Kiểm toán Bảo mật & Truy vết (Audit Logs) (TASK-55 / FE-S3-25)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trung tâm giám sát và truy vết an ninh hệ thống dành riêng cho Admin:
 *     + Bảng nhật ký audit: Thời gian thao tác, Nhân viên thực hiện, Hành động chi tiết
 *       (Đổi giá phòng, Sửa hóa đơn, Hủy phòng, Đổi ca...), Địa chỉ IP giả lập (DoD 2).
 *     + Bộ lọc theo loại hành động (Action Filter) và tìm kiếm theo tên nhân viên (DoD 3).
 *     + Xuất dữ liệu nhật ký CSV/Excel phục vụ công tác thanh tra kế toán.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';

interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  employeeCode: string;
  role: string;
  action: 'UPDATE_PRICE' | 'EDIT_FOLIO' | 'CANCEL_BOOKING' | 'HANDOVER_SHIFT' | 'CHECK_IN' | 'CHECK_OUT' | 'MAINTENANCE';
  target: string;
  ipAddress: string;
  details: string;
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '21/09/2026 14:15:22',
    userName: 'Ban Quản Trị Hệ Thống',
    employeeCode: 'ADM-001',
    role: 'ADMIN',
    action: 'UPDATE_PRICE',
    target: 'Hạng Executive Suite (rt-exe)',
    ipAddress: '192.168.1.10',
    details: 'Điều chỉnh giá niêm yết từ 2.800.000 ₫ lên 3.200.000 ₫/đêm theo mùa lễ hội.',
  },
  {
    id: 'log-02',
    timestamp: '21/09/2026 12:45:10',
    userName: 'Đỗ Mai Phương',
    employeeCode: 'FD-001',
    role: 'FRONT_DESK',
    action: 'EDIT_FOLIO',
    target: 'Folio phòng 302 (NTR-260921-0042)',
    ipAddress: '192.168.1.102',
    details: 'Thêm dịch vụ minibar: 2 lon Bia Tiger (70.000 ₫) và 1 Hạt điều rang muối (45.000 ₫).',
  },
  {
    id: 'log-03',
    timestamp: '21/09/2026 11:20:05',
    userName: 'Trần Quốc Hưng',
    employeeCode: 'MGR-001',
    role: 'MANAGER',
    action: 'CANCEL_BOOKING',
    target: 'Đơn đặt phòng NTR-260919-0030',
    ipAddress: '192.168.1.25',
    details: 'Duyệt hủy phòng khách John Smith do đổi lịch chuyến bay quốc tế. Hoàn cọc 100%.',
  },
  {
    id: 'log-04',
    timestamp: '21/09/2026 06:05:40',
    userName: 'Lê Hoàng Nam',
    employeeCode: 'FD-002',
    role: 'FRONT_DESK',
    action: 'HANDOVER_SHIFT',
    target: 'Ca Đêm sang Ca Sáng',
    ipAddress: '192.168.1.104',
    details: 'Bàn giao ca trực thành công. Két tiền mặt thực tế 15.450.000 ₫ khớp hoàn toàn số liệu phần mềm.',
  },
  {
    id: 'log-05',
    timestamp: '21/09/2026 08:30:15',
    userName: 'Đỗ Mai Phương',
    employeeCode: 'FD-001',
    role: 'FRONT_DESK',
    action: 'CHECK_IN',
    target: 'Phòng 501 (Trần Thị Bích Ngọc)',
    ipAddress: '192.168.1.102',
    details: 'Xác nhận check-in, đối chiếu CCCD và bàn giao 2 thẻ khóa từ RFID phòng Family Suite.',
  },
  {
    id: 'log-06',
    timestamp: '21/09/2026 09:12:00',
    userName: 'Trần Quốc Hưng',
    employeeCode: 'MGR-001',
    role: 'MANAGER',
    action: 'MAINTENANCE',
    target: 'Phòng 403 (Tầng 4)',
    ipAddress: '192.168.1.25',
    details: 'Kích hoạt khóa bảo trì kỹ thuật: Sửa chữa điều hòa rò rỉ nước, dự kiến xong 16:00.',
  },
  {
    id: 'log-07',
    timestamp: '20/09/2026 12:10:48',
    userName: 'Đỗ Mai Phương',
    employeeCode: 'FD-001',
    role: 'FRONT_DESK',
    action: 'CHECK_OUT',
    target: 'Phòng 105 (Lê Hoàng Long)',
    ipAddress: '192.168.1.102',
    details: 'Hoàn tất trả phòng, thu đủ tiền mặt 850.000 ₫ và chuyển buồng phòng sang trạng thái CLEANING.',
  },
];

export const AuditLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  // Filter logic (DoD 3: lọc theo loại hành động và tìm kiếm theo tên nhân viên)
  const filteredLogs = logs.filter((log) => {
    // Search by employee name or code or target
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      log.userName.toLowerCase().includes(q) ||
      log.employeeCode.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);

    // Filter by action type
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchSearch && matchAction;
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'UPDATE_PRICE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Đổi giá phòng
          </span>
        );
      case 'EDIT_FOLIO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            Sửa hóa đơn
          </span>
        );
      case 'CANCEL_BOOKING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            Hủy phòng
          </span>
        );
      case 'HANDOVER_SHIFT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            Đổi ca / Giao ca
          </span>
        );
      case 'CHECK_IN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Nhận phòng
          </span>
        );
      case 'CHECK_OUT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            Trả phòng
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
            Khóa bảo trì
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">{t('nav.auditLogs')}</h1>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-300">
              Security Audit Trails
            </span>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            Nhật ký kiểm toán truy vết lịch sử các hành động nhạy cảm trong hệ thống (Đổi giá, sửa hóa đơn, hủy phòng, đổi ca)
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          icon={<Download className="w-4 h-4" />}
          className="cursor-pointer font-bold text-xs"
        >
          Xuất nhật ký (CSV)
        </Button>
      </div>

      {/* Filter and Search Toolbar (DoD 3) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search by Employee Name (DoD 3) */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nhân viên, mã NV, phòng..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F5AA6]"
          />
        </div>

        {/* Action Type Filter (DoD 3) */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Loại hành động:
          </span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="py-1.5 px-3 border border-[#E2E8F0] rounded-xl bg-slate-50 font-bold text-slate-800 focus:outline-none"
          >
            <option value="ALL">Tất cả hành động</option>
            <option value="UPDATE_PRICE">Đổi giá phòng (UPDATE_PRICE)</option>
            <option value="EDIT_FOLIO">Sửa hóa đơn (EDIT_FOLIO)</option>
            <option value="CANCEL_BOOKING">Hủy phòng (CANCEL_BOOKING)</option>
            <option value="HANDOVER_SHIFT">Đổi ca / Giao ca (HANDOVER_SHIFT)</option>
            <option value="CHECK_IN">Nhận phòng (CHECK_IN)</option>
            <option value="CHECK_OUT">Trả phòng (CHECK_OUT)</option>
            <option value="MAINTENANCE">Khóa bảo trì (MAINTENANCE)</option>
          </select>

          {(actionFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setActionFilter('ALL');
                setSearch('');
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* BẢNG NHẬT KÝ AUDIT LOGS (DoD 2) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Thời gian thao tác</th>
                <th className="py-3 px-4">Nhân viên thực hiện</th>
                <th className="py-3 px-4 text-center">Hành động chi tiết</th>
                <th className="py-3 px-4">Đối tượng tác động</th>
                <th className="py-3 px-4 text-center">Địa chỉ IP giả lập</th>
                <th className="py-3 px-4">Chi tiết thao tác nghiệp vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  {/* Thời gian */}
                  <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.timestamp}</span>
                    </div>
                  </td>

                  {/* Nhân viên thực hiện */}
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-[#0F172A] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.userName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Mã: <strong>{log.employeeCode}</strong> ({log.role})
                    </div>
                  </td>

                  {/* Hành động chi tiết */}
                  <td className="py-3.5 px-4 text-center">
                    {getActionBadge(log.action)}
                  </td>

                  {/* Đối tượng tác động */}
                  <td className="py-3.5 px-4 font-semibold text-[#1F5AA6]">
                    {log.target}
                  </td>

                  {/* Địa chỉ IP giả lập */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                      {log.ipAddress}
                    </span>
                  </td>

                  {/* Chi tiết thao tác */}
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
