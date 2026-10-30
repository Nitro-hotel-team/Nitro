/**
 * ============================================================================
 * TÊN FILE: Modal.tsx
 * VỊ TRÍ: src/components/common/Modal.tsx
 * PHÂN HỆ: Thành phần Giao diện Dùng chung (Common UI - Dialog Modal Component)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Hộp thoại cửa sổ bật lên trung tâm màn hình (Dialog Modal).
 * - Sử dụng cho các tác vụ xác nhận quan trọng: Xác nhận Check-in/Check-out, Hủy đơn đặt phòng,
 *   thêm phòng/dịch vụ mới, xem trước hóa đơn thanh toán.
 * - Hỗ trợ hoạt ảnh hiển thị mượt mà (`zoom-in-95`, `fade-in`), phím tắt ESC và khóa cuộn nền.
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
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

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop (DoD 1: Backdrop Blur & Fade-in) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Center container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full my-8 ${maxWidthClass} border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-200 ease-out`}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div className="text-lg font-bold text-[#0F172A]">{title}</div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 hover:rotate-90 cursor-pointer"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(100vh-14rem)] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-[#E2E8F0]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
