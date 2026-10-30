/**
 * ============================================================================
 * TÊN FILE: Toast.tsx
 * VỊ TRÍ: src/components/common/Toast.tsx
 * PHÂN HỆ: Thành phần Giao diện Dùng chung (Common UI - Toast Notification)
 * MÃ TASK: TASK-60 (Jira: FE-S4-04) - Sprint 4
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Hệ thống thông báo nổi (Toast Notification) thời gian thực chuẩn 4 sao:
 *     + Vị trí nổi bật góc trên bên phải màn hình (Top-Right: fixed top-6 right-6).
 *     + 4 phân loại trực quan:
 *         * success: Màu xanh lá ngọc lục bảo (Emerald Green) kèm biểu tượng CheckCircle2.
 *         * warning: Màu vàng hổ phách (Amber Gold) kèm biểu tượng AlertTriangle.
 *         * error: Màu đỏ ruby (Rose Red) kèm biểu tượng AlertCircle.
 *         * info: Màu xanh dương hoàng gia (Royal Blue) kèm biểu tượng Info.
 *     + Cơ chế tự động biến mất (Auto-dismiss) sau 3 giây (3000ms) chính xác theo DoD.
 *     + Hiệu ứng xuất hiện mượt mà (Fade-in & Slide-in-from-top-4).
 *     + Nút đóng thủ công (Close Button X) cho phép người dùng tắt ngay lập tức.
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastProps {
  id?: string;
  message: string;
  type?: ToastType;
  duration?: number; // mặc định 3000ms (3 giây)
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  className = '',
}) => {
  // Tự động đóng Toast sau duration (mặc định 3s)
  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Cấu hình giao diện theo loại thông báo
  const config = {
    success: {
      bg: 'bg-emerald-600',
      border: 'border-emerald-500',
      shadow: 'shadow-emerald-950/20',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-100 shrink-0" />,
      tag: 'Thành công',
    },
    warning: {
      bg: 'bg-amber-500',
      border: 'border-amber-400',
      shadow: 'shadow-amber-950/20',
      icon: <AlertTriangle className="w-5 h-5 text-amber-100 shrink-0" />,
      tag: 'Cảnh báo',
    },
    error: {
      bg: 'bg-rose-600',
      border: 'border-rose-500',
      shadow: 'shadow-rose-950/20',
      icon: <AlertCircle className="w-5 h-5 text-rose-100 shrink-0" />,
      tag: 'Thất bại',
    },
    info: {
      bg: 'bg-[#1F5AA6]',
      border: 'border-blue-400',
      shadow: 'shadow-blue-950/20',
      icon: <Info className="w-5 h-5 text-blue-100 shrink-0" />,
      tag: 'Thông tin',
    },
  }[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-white text-xs sm:text-sm font-medium shadow-2xl border ${config.bg} ${config.border} ${config.shadow} animate-in fade-in slide-in-from-top-4 duration-300 ease-out min-w-[280px] max-w-md ${className}`}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {config.icon}
        <span className="truncate leading-snug">{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className="w-6 h-6 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer shrink-0 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts?: ToastItem[];
  currentToast?: ToastItem | null;
  onCloseToast?: (id?: string) => void;
  className?: string;
}> = ({ toasts, currentToast, onCloseToast, className = '' }) => {
  const activeList: ToastItem[] = toasts
    ? toasts
    : currentToast
    ? [currentToast]
    : [];

  if (activeList.length === 0) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0 ${className}`}
    >
      {activeList.map((t) => (
        <Toast
          key={t.id}
          id={t.id}
          message={t.message}
          type={t.type || 'success'}
          duration={t.duration ?? 3000}
          onClose={() => onCloseToast && onCloseToast(t.id)}
        />
      ))}
    </div>
  );
};
