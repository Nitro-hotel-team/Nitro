/**
 * ============================================================================
 * TÊN FILE: security.ts
 * VỊ TRÍ: src/utils/security.ts
 * PHÂN HỆ: Rà soát & Tăng cường An toàn Thông tin Frontend (Security & Sanitization)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Module bảo mật chuyên trách bảo vệ tầng Frontend theo tiêu chuẩn OWASP:
 *     1. Phòng chống tấn công XSS (Cross-Site Scripting) qua HTML Escaping & Strip Tags.
 *     2. Kiểm định và làm sạch đầu vào người dùng (Sanitize User Input).
 *     3. Kiểm tra tính an toàn của liên kết điều hướng (Safe URL Verification).
 *     4. Che dấu dữ liệu nhạy cảm (Data Masking) phòng ngừa rò rỉ thông tin riêng tư.
 *     5. Rà soát Console Log và LocalStorage ngăn chặn lưu lộ mật khẩu / Private Token.
 * ============================================================================
 */

/**
 * Mã hóa an toàn các ký tự đặc biệt HTML (HTML Entity Escaping)
 * Ngăn chặn tuyệt đối việc chèn mã kịch bản lạ <script> hoặc thuộc tính độc hại.
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Loại bỏ hoàn toàn tất cả các thẻ HTML (Strip HTML Tags)
 */
export function stripTags(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/<\/?[^>]+(>|$)/g, '').trim();
}

/**
 * Làm sạch chuỗi nhập liệu của người dùng trước khi lưu trữ hoặc hiển thị:
 * - Triệt tiêu các giao thức nguy hiểm (javascript:, data:, vbscript:)
 * - Loại bỏ các bộ lắng nghe sự kiện inline (onerror=, onclick=, onload=...)
 * - Loại bỏ các thẻ script, iframe, object độc hại
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let sanitized = input;

  // Loại bỏ các thẻ kịch bản thực thi độc hại
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

  // Vô hiệu hóa event handlers inline nguy hiểm
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^>\s]+/gi, '');

  // Vô hiệu hóa giao thức javascript:
  sanitized = sanitized.replace(/javascript:/gi, 'blocked-javascript:');
  sanitized = sanitized.replace(/vbscript:/gi, 'blocked-vbscript:');

  return sanitized.trim();
}

/**
 * Kiểm tra xem một URL có an toàn để điều hướng hay không (Chống Open Redirect / JS Injection)
 */
export function isSafeUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  // Chặn tuyệt đối các giao thức nguy hiểm
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('data:')
  ) {
    return false;
  }

  // Cho phép URL nội bộ (bắt đầu bằng / hoặc #) hoặc HTTPS / HTTP hợp lệ
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  return trimmed.startsWith('https://') || trimmed.startsWith('http://');
}

/**
 * Danh sách các trường dữ liệu nhạy cảm tuyệt đối không được ghi ra log hoặc lưu trữ công khai
 */
const SENSITIVE_KEYS = [
  'password',
  'currentpassword',
  'newpassword',
  'confirm',
  'confirmpassword',
  'cardnumber',
  'cvv',
  'cvc',
  'privatetoken',
  'secret',
  'refreshtoken',
];

/**
 * Làm sạch hoặc che dấu dữ liệu nhạy cảm trong đối tượng trước khi xử lý
 */
export function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  const masked: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
      masked[key] = '***[PROTECTED]***';
    } else if (value && typeof value === 'object') {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Kiểm tra an toàn cho bộ lưu trữ LocalStorage:
 * Đảm bảo không chứa mật khẩu thô hoặc dữ liệu thẻ tín dụng chưa mã hóa.
 */
export function auditStorageSecurity(storage: Storage = localStorage): {
  secure: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;

      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((sk) => lowerKey.includes(sk))) {
        issues.push(`Khóa "${key}" chứa tên dữ liệu nhạy cảm trong LocalStorage`);
      }

      const val = storage.getItem(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === 'object') {
            for (const nestedKey of Object.keys(parsed)) {
              if (SENSITIVE_KEYS.some((sk) => nestedKey.toLowerCase().includes(sk))) {
                issues.push(`Khóa "${key}" chứa trường nhạy cảm "${nestedKey}"`);
              }
            }
          }
        } catch {
          // Không phải JSON, bỏ qua
        }
      }
    }
  } catch (err) {
    // Handle error in restricted environments
  }

  return {
    secure: issues.length === 0,
    issues,
  };
}

/**
 * Bộ lọc Console log môi trường Production:
 * Tự động chặn và che dấu các bản ghi chứa từ khóa mật khẩu hoặc thông tin thẻ.
 */
export function setupConsoleSanitizer(): void {
  if (typeof window === 'undefined') return;

  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = function (...args: any[]) {
    const sanitizedArgs = args.map((arg) => (typeof arg === 'object' ? maskSensitiveData(arg) : arg));
    originalLog.apply(console, sanitizedArgs);
  };

  console.warn = function (...args: any[]) {
    const sanitizedArgs = args.map((arg) => (typeof arg === 'object' ? maskSensitiveData(arg) : arg));
    originalWarn.apply(console, sanitizedArgs);
  };
}
