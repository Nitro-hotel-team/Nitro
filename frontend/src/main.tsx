/**
 * ============================================================================
 * TÊN FILE: main.tsx
 * VỊ TRÍ: src/main.tsx
 * PHÂN HỆ: Khởi tạo Cốt lõi Ứng dụng (Core Application Entrypoint)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Điểm vào chính (Entrypoint) khởi tạo toàn bộ ứng dụng web trên môi trường trình duyệt.
 * - Nạp cấu hình đa ngôn ngữ i18n (`./i18n`) đồng bộ trước khi cây component React được render,
 *   đảm bảo tất cả nhãn văn bản đa ngữ (VI/EN) hiển thị chuẩn xác ngay từ frame đầu tiên.
 * - Nhập file định kiểu toàn cục Tailwind CSS (`./index.css`).
 * - Gắn kết root component `<App />` vào phần tử DOM `#root` bên trong React `StrictMode`.
 * ============================================================================
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Nạp tài nguyên ngôn ngữ i18n (Tiếng Việt & English) trước khi render
import './i18n';
import App from './App.tsx';
import './index.css';

// Khởi tạo React Virtual DOM gắn kết vào thẻ root HTML
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
