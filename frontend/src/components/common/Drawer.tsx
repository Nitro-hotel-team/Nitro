/**
 * ============================================================================
 * TÊN FILE: Drawer.tsx
 * VỊ TRÍ: src/components/common/Drawer.tsx
 * PHÂN HỆ: Thành phần Giao diện Dùng chung (Common UI - Drawer Component)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Khung trượt từ cạnh phải màn hình (Slide-over Drawer Panel).
 * - Sử dụng phổ biến trong các tác vụ lễ tân và quản lý:
 *     + Xem nhanh chi tiết đơn đặt phòng (Quick Booking Preview)
 *     + Thao tác đổi phòng / đổi trạng thái phòng nhanh trên Sơ đồ phòng
 *     + Xem nhật ký hoạt động hoặc cấu hình nhanh
 * - Hỗ trợ đóng bằng phím ESC, bấm ra ngoài backdrop mờ, và khóa cuộn trang body.
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop (DoD 1: Backdrop Blur & Fade-in) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${widthClass} transform transition ease-out duration-300 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white shrink-0">
            <div className="text-lg font-bold text-[#0F172A]">{title}</div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 hover:rotate-90 cursor-pointer"
              aria-label="Đóng thanh trượt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-slate-50 border-t border-[#E2E8F0] shrink-0 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
