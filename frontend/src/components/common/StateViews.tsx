/**
 * ============================================================================
 * TÊN FILE: StateViews.tsx
 * VỊ TRÍ: src/components/common/StateViews.tsx
 * PHÂN HỆ: Thành phần Giao diện Dùng chung (Common UI - State Views: Loading, Empty, Error)
 * MÃ TASK: TASK-60 (Jira: FE-S4-04) - Sprint 4
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Tập hợp các thành phần trực quan hóa trạng thái giao diện người dùng chuẩn 4 sao:
 *     + Skeleton: Khung xương tải trang với hiệu ứng sóng lượn Shimmer Animation
 *       loại bỏ hiện tượng giật cục bố cục (Cumulative Layout Shift - CLS).
 *     + RoomCardSkeleton: Khung xương đặc thù cho danh sách phòng khách sạn.
 *     + StatCardSkeleton: Khung xương cho thẻ chỉ số KPI Dashboard.
 *     + TableSkeleton: Khung xương cho bảng dữ liệu quản trị buồng phòng.
 *     + EmptyState: Trạng thái danh sách rỗng kèm hình minh họa đồ họa tinh tế
 *       (không tìm thấy phòng phù hợp, chưa có đơn đặt phòng nào).
 *     + ErrorState: Trạng thái xảy ra sự cố kèm nút bấm "Thử lại" (Retry Action).
 *     + LoadingOverlay: Lớp phủ mờ toàn màn hình khi đang xử lý dữ liệu.
 * ============================================================================
 */

import React from 'react';
import { AlertCircle, Compass, Hotel, Inbox, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

/**
 * Khung xương tải trang cơ sở hỗ trợ hiệu ứng Shimmer Animation (DoD 3)
 */
export const Skeleton: React.FC<{
  className?: string;
  shimmer?: boolean;
}> = ({ className = '', shimmer = true }) => (
  <div
    className={`bg-slate-200/80 rounded-lg ${
      shimmer ? 'animate-shimmer' : 'animate-pulse'
    } ${className}`}
  />
);

/**
 * Khung xương nạp thẻ phòng khách sạn (Chống giật cục bố cục CLS)
 */
export const RoomCardSkeleton: React.FC<{
  layout?: 'horizontal' | 'grid';
  className?: string;
}> = ({ layout = 'horizontal', className = '' }) => (
  <div
    className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex ${
      layout === 'horizontal' ? 'flex-col md:flex-row' : 'flex-col'
    } ${className}`}
  >
    {/* Left Image Placeholder */}
    <div
      className={`bg-slate-200/90 animate-shimmer shrink-0 ${
        layout === 'horizontal'
          ? 'w-full md:w-[320px] lg:w-[380px] h-[220px] md:h-auto min-h-[220px]'
          : 'h-[220px] w-full'
      }`}
    />

    {/* Right Content Placeholder */}
    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Title & Badge */}
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-48 sm:w-64" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Amenities Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-28 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
      </div>

      {/* Bottom Price & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[#E2E8F0] gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Khung xương cho thẻ chỉ số KPI
 */
export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-9 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
);

/**
 * Khung xương cho bảng biểu danh sách nhân sự / buồng phòng
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  className?: string;
}> = ({ rows = 5, className = '' }) => (
  <div className={`w-full bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden ${className}`}>
    <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex gap-4">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/4" />
    </div>
    <div className="divide-y divide-[#E2E8F0]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex gap-4 items-center">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Trạng thái danh sách rỗng (Empty State) với minh họa chuẩn khách sạn 4 sao (DoD 4)
 */
export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-200 ${className}`}
    >
      {/* 4-Star Luxury Illustration / Icon */}
      <div className="mb-4 relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#1F5AA6]/10 to-[#C9A227]/15 flex items-center justify-center border border-[#1F5AA6]/20 shadow-inner">
          {icon || <Compass className="w-10 h-10 text-[#1F5AA6]" />}
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#C9A227] flex items-center justify-center shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-[#0F172A] mb-1.5">
        {title || t('common.empty')}
      </h3>
      
      {description && (
        <p className="text-sm text-[#475569] max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionText && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          className="shadow-lg shadow-[#1F5AA6]/20 hover-lift"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

/**
 * Trạng thái lỗi và mất kết nối với nút Thử lại
 */
export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title,
  description,
  onRetry,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-10 text-center bg-rose-50/60 rounded-2xl border border-rose-200 animate-in fade-in duration-200 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3 shadow-inner">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-rose-900 mb-1">
        {title || t('common.error')}
      </h3>

      <p className="text-xs sm:text-sm text-rose-700 max-w-md mb-5 leading-relaxed">
        {description || 'Không thể nạp dữ liệu từ máy chủ. Vui lòng kiểm tra lại kết nối mạng.'}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw className="w-4 h-4" />}
          className="border-rose-300 text-rose-800 hover:bg-rose-100 shadow-xs"
        >
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
};

/**
 * Lớp phủ tải dữ liệu mờ toàn vùng (Loading Overlay)
 */
export const LoadingOverlay: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = 'Đang tải dữ liệu...', className = '' }) => (
  <div
    className={`absolute inset-0 z-30 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 animate-in fade-in duration-150 ${className}`}
  >
    <div className="w-10 h-10 rounded-full border-3 border-[#1F5AA6]/20 border-t-[#1F5AA6] animate-spin" />
    <span className="text-xs font-semibold text-[#0F172A]">{message}</span>
  </div>
);
