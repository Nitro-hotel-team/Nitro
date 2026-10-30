/**
 * ============================================================================
 * TÊN FILE: ForbiddenView.tsx
 * VỊ TRÍ: src/components/common/ForbiddenView.tsx
 * PHÂN HỆ: Thành phần Báo lỗi Phân quyền (403 Forbidden Access Guard)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Hiển thị giao diện từ chối quyền truy cập 403 Forbidden trang nhã, đạt chuẩn 4 sao.
 * - Hiển thị vai trò hiện tại, biểu tượng khiên bảo mật màu đỏ/cam.
 * - Cung cấp hai nút bấm hành động: Về Trang Chủ và Đăng nhập tài khoản nội bộ.
 * ============================================================================
 */

import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { UserRole } from '../../types';
import { ROLE_LABELS } from '../../utils/rbac';

interface ForbiddenViewProps {
  currentRole: UserRole;
  requiredRoles?: UserRole[];
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({ currentRole, requiredRoles }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const roleLabel = ROLE_LABELS[currentRole]?.vi || currentRole;

  return (
    <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600 ring-8 ring-rose-50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 mb-3">
          Mã Lỗi: 403 Forbidden
        </div>
        <h1 className="text-2xl font-black text-[#0F172A] mb-2">Từ Chối Quyền Truy Cập</h1>
        <p className="text-xs text-[#475569] leading-relaxed mb-6">
          Tài khoản của bạn đang mang vai trò <span className="font-bold text-[#1F5AA6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{roleLabel}</span> ({currentRole}).
          Trang quản trị nội bộ này chỉ dành cho nhân viên có thẩm quyền
          {requiredRoles && requiredRoles.length > 0 && (
            <span> ({requiredRoles.map((r) => ROLE_LABELS[r]?.vi || r).join(', ')})</span>
          )}.
        </p>

        <div className="flex flex-col gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={<LogIn className="w-4 h-4" />}
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
            className="w-full justify-center font-bold"
          >
            Đăng nhập tài khoản nội bộ
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/')}
            className="w-full justify-center text-slate-700 hover:bg-slate-100"
          >
            Về trang chủ khách hàng
          </Button>
        </div>
      </div>
    </div>
  );
};
