/**
 * ============================================================================
 * TÊN FILE: api.ts
 * VỊ TRÍ: src/services/api.ts
 * PHÂN HỆ: Tầng Giao tiếp Dữ liệu & Kết nối Backend (Data Service & Dual-Mode Connectors)
 * MÃ TASK: TASK-58 (Jira: FE-S4-02) - Sprint 4
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Hiện thực hóa kiến trúc Dual-Mode API thông minh:
 *   1. Chế độ Mock Data (In-Memory Fallback):
 *      Kích hoạt khi VITE_USE_MOCK=true hoặc khi máy chủ Backend chưa bật/offline.
 *      Toàn bộ 27 màn hình vẫn hoạt động 100% trơn tru, không bị gián đoạn hay lỗi trắng trang.
 *   2. Chế độ Real REST API:
 *      Kích hoạt khi VITE_USE_MOCK=false và VITE_API_URL được cấu hình (ví dụ: http://localhost:5000).
 *      Tự động gửi HTTP Requests (Fetch API) với headers xác thực Bearer Token.
 * - Hiện thực đầy đủ 7 services theo chuẩn Definition of Done Sprint 4:
 *   1. authService       : Xác thực, đăng nhập/đăng ký, me, logout, google auth.
 *   2. roomService       : Quản lý loại phòng (RoomType), phòng vật lý (Room), sơ đồ phòng PMS.
 *   3. bookingService    : Khởi tạo đơn, tra cứu PNR, cập nhật trạng thái (Check-in/out, Hủy).
 *   4. customerService   : Danh bạ khách hàng, hồ sơ CRM, lịch sử lưu trú (alias: guestService).
 *   5. shiftService      : Quản lý ca trực lễ tân, mở ca, bàn giao sổ ca, chốt két đóng ca.
 *   6. settingService    : Cài đặt thông số khách sạn (Check-in/out, thuế VAT, phí phục vụ).
 *   7. reportService     : Báo cáo xu hướng doanh thu Recharts, cơ cấu thu theo hạng phòng.
 * ============================================================================
 */

import {
  MOCK_BOOKINGS,
  MOCK_DASHBOARD_METRICS,
  MOCK_GUESTS,
  MOCK_ROOM_TYPES,
  MOCK_ROOMS,
  MOCK_SERVICES,
  MOCK_USERS,
} from '../mocks/data';
import {
  Booking,
  BookingStatus,
  DashboardMetrics,
  Guest,
  HotelService,
  RevenueReportPoint,
  Room,
  RoomStatus,
  RoomType,
  RoomTypeRevenueContribution,
  Shift,
  SystemSettings,
  User,
  UserRole,
} from '../types';

// ============================================================================
// CẤU HÌNH BIẾN MÔI TRƯỜNG & DUAL-MODE SWITCHER
// ============================================================================
export const IS_MOCK_CONFIGURED =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true') ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === true) ||
  !(typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL);

export const API_URL = IS_MOCK_CONFIGURED ? '' : ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '').trim();
const SIMULATED_DELAY = 150;

export const delay = (ms: number = SIMULATED_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Trợ thủ Dual-Mode: Thực thi gọi REST API thật khi có cấu hình Backend,
 * tự động bắt lỗi mạng (Network failure / Backend offline) để fallback In-Memory Mock
 * bảo đảm ứng dụng không bao giờ bị gián đoạn hay crash trắng màn hình.
 */
async function dualModeRequest<T>(
  apiFn: () => Promise<T>,
  mockFn: () => Promise<T> | T
): Promise<T> {
  if (API_URL) {
    try {
      return await apiFn();
    } catch (err: any) {
      const isNetworkFailure =
        err?.name === 'TypeError' ||
        err?.message?.includes('fetch') ||
        err?.message?.includes('Network') ||
        err?.message?.includes('Failed') ||
        err?.message?.includes('connection') ||
        err?.message?.includes('ENOTFOUND') ||
        err?.message?.includes('ECONNREFUSED');

      if (isNetworkFailure) {
        console.warn(`[Dual-Mode API] Backend (${API_URL}) chưa phản hồi: ${err.message}. Tự động chuyển tiếp In-Memory Mock.`);
        await delay();
        return mockFn();
      }
      throw err;
    }
  }

  await delay();
  return mockFn();
}

/**
 * Tạo Headers xác thực Bearer Token cho các REST API có thẩm quyền
 */
/**
 * Hàm hỗ trợ truy xuất localStorage an toàn trên cả Browser và Node/SSR
 */
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof localStorage !== 'undefined') {
      try {
        return safeLocalStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        safeLocalStorage.setItem(key, value);
      } catch {
        // ignore
      }
    }
  },
  removeItem: (key: string): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        safeLocalStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  },
};

export function getAuthHeaders(): Record<string, string> {
  const token = safeLocalStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ============================================================================
// KHO DỮ LIỆU IN-MEMORY MOCK STATE (PHỤC VỤ DUAL-MODE FALLBACK)
// ============================================================================
let roomTypesState: RoomType[] = [...MOCK_ROOM_TYPES];
let roomsState: Room[] = [...MOCK_ROOMS];
let bookingsState: Booking[] = [...MOCK_BOOKINGS];
let guestsState: Guest[] = [...MOCK_GUESTS];
let servicesState: HotelService[] = [...MOCK_SERVICES];
let usersState: User[] = [...MOCK_USERS];

let currentShiftState: Shift = {
  id: 'shift-today-01',
  shiftCode: 'SHF-20261030-01',
  employeeName: 'Đỗ Mai Phương',
  employeeCode: 'FD-001',
  startTime: '2026-10-30 07:00',
  initialCash: 5000000,
  cashRevenue: 12400000,
  transferRevenue: 28600000,
  totalRevenue: 41000000,
  checkInCount: 8,
  checkOutCount: 5,
  status: 'OPEN',
  notes: 'Bàn giao ca sáng ổn định, quỹ tiền mặt 5.000.000đ nguyên vẹn.',
};

let settingsState: SystemSettings = {
  hotelName: 'Nitro Grand Hotel',
  hotline: '1900 1234',
  email: 'contact@nitrohotel.vn',
  address: '24 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  checkInTime: '14:00',
  checkOutTime: '12:00',
  vatRate: 8,
  serviceFeeRate: 5,
  currency: 'VND',
  lateCheckOutPenaltyHourlyRate: 150000,
  cancellationPolicyHours: 48,
};

// ============================================================================
// 1. AUTH SERVICE (XÁC THỰC & PHÂN QUYỀN)
// ============================================================================
export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: { emailOrPhone: string; password: string }): Promise<LoginResponse> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Đăng nhập không thành công');
        }
        const data: LoginResponse = await res.json();
        safeLocalStorage.setItem('auth_token', data.token);
        safeLocalStorage.setItem('nitro_user_role', data.user.role);
        safeLocalStorage.setItem('nitro_user_info', JSON.stringify(data.user));
        safeLocalStorage.setItem('nitro_current_user', JSON.stringify(data.user));
        return data;
      },
      () => {
        const cleanInput = credentials.emailOrPhone.trim().toLowerCase();
        const matched = usersState.find(
          (u) =>
            u.email.toLowerCase() === cleanInput ||
            u.phone === cleanInput ||
            (cleanInput === 'khachhang@nitrohotel.vn' && u.role === 'CUSTOMER') ||
            (cleanInput === 'letan@nitrohotel.vn' && u.role === 'FRONT_DESK') ||
            (cleanInput === 'quanly@nitrohotel.vn' && u.role === 'MANAGER') ||
            (cleanInput === 'admin@nitrohotel.vn' && u.role === 'ADMIN')
        );

        if (!matched) {
          if (credentials.emailOrPhone && credentials.password) {
            const customUser: User = {
              id: `usr-${Date.now()}`,
              name: credentials.emailOrPhone.split('@')[0] || 'Khách hàng',
              email: credentials.emailOrPhone,
              phone: '0900000000',
              role: 'CUSTOMER',
              status: 'ACTIVE',
              lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            };
            const token = `mock-jwt-customer-${Date.now()}`;
            safeLocalStorage.setItem('auth_token', token);
            safeLocalStorage.setItem('nitro_user_role', customUser.role);
            safeLocalStorage.setItem('nitro_user_info', JSON.stringify(customUser));
            safeLocalStorage.setItem('nitro_current_user', JSON.stringify(customUser));
            return { token, user: customUser };
          }
          throw new Error('Email hoặc mật khẩu không chính xác');
        }

        if (matched.status === 'LOCKED') {
          throw new Error('Tài khoản này hiện đang bị khóa. Vui lòng liên hệ quản trị viên.');
        }

        const token = `mock-jwt-${matched.role.toLowerCase()}-${Date.now()}`;
        safeLocalStorage.setItem('auth_token', token);
        safeLocalStorage.setItem('nitro_user_role', matched.role);
        safeLocalStorage.setItem('nitro_user_info', JSON.stringify(matched));
        safeLocalStorage.setItem('nitro_current_user', JSON.stringify(matched));
        return { token, user: matched };
      }
    );
  },

  async register(data: { name: string; email: string; phone: string; password: string }): Promise<LoginResponse> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Đăng ký không thành công');
        }
        const result: LoginResponse = await res.json();
        safeLocalStorage.setItem('auth_token', result.token);
        safeLocalStorage.setItem('nitro_user_role', result.user.role);
        safeLocalStorage.setItem('nitro_user_info', JSON.stringify(result.user));
        safeLocalStorage.setItem('nitro_current_user', JSON.stringify(result.user));
        return result;
      },
      () => {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        };
        usersState = [newUser, ...usersState];
        const token = `mock-jwt-customer-${Date.now()}`;
        safeLocalStorage.setItem('auth_token', token);
        safeLocalStorage.setItem('nitro_user_role', newUser.role);
        safeLocalStorage.setItem('nitro_user_info', JSON.stringify(newUser));
        safeLocalStorage.setItem('nitro_current_user', JSON.stringify(newUser));
        return { token, user: newUser };
      }
    );
  },

  async loginWithGoogle(credential: string): Promise<LoginResponse> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Lỗi đăng nhập bằng Google');
      }
      const data: LoginResponse = await res.json();
      safeLocalStorage.setItem('auth_token', data.token);
      safeLocalStorage.setItem('nitro_user_role', data.user.role);
      safeLocalStorage.setItem('nitro_user_info', JSON.stringify(data.user));
      safeLocalStorage.setItem('nitro_current_user', JSON.stringify(data.user));
      return data;
    }
    await delay();
    throw new Error('Chưa hỗ trợ đăng nhập Google ở chế độ Mock');
  },

  async getMe(): Promise<User> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Không thể xác thực phiên làm việc');
        return await res.json();
      },
      () => {
        const saved = safeLocalStorage.getItem('nitro_user_info') || safeLocalStorage.getItem('nitro_current_user');
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch {
            // ignore
          }
        }
        const savedRole = safeLocalStorage.getItem('nitro_user_role') as UserRole;
        const matched = usersState.find((u) => u.role === savedRole);
        return matched || usersState[0];
      }
    );
  },

  async logout(): Promise<void> {
    if (API_URL) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      } catch {
        // bỏ qua lỗi mạng khi logout
      }
    }
    safeLocalStorage.removeItem('auth_token');
    safeLocalStorage.setItem('nitro_user_role', 'CUSTOMER');
    safeLocalStorage.removeItem('nitro_user_info');
    safeLocalStorage.removeItem('nitro_current_user');
  },
};

// ============================================================================
// 2. ROOM SERVICE (QUẢN LÝ PHÒNG & LOẠI PHÒNG)
// ============================================================================
export const roomService = {
  async getRoomTypes(): Promise<RoomType[]> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/room-types`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`Lỗi tải loại phòng: ${res.statusText}`);
        return res.json();
      },
      () => [...roomTypesState]
    );
  },

  async getRoomTypeById(id: string): Promise<RoomType | null> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/room-types/${encodeURIComponent(id)}`, { headers: getAuthHeaders() });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Lỗi lấy loại phòng ${id}`);
        return res.json();
      },
      () => {
        const rt = roomTypesState.find((t) => t.id === id || t.code.toLowerCase() === id.toLowerCase());
        return rt ? { ...rt } : null;
      }
    );
  },

  async createRoomType(data: Partial<RoomType>): Promise<RoomType> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/room-types`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Không thể tạo hạng phòng');
        }
        return res.json();
      },
      () => {
        const newType: RoomType = {
          id: `rt-${Date.now()}`,
          code: data.code || 'DLX',
          name: data.name || 'Hạng phòng mới',
          nameEn: data.nameEn || 'New Room Type',
          area: data.area || 35,
          basePrice: data.basePrice || 1500000,
          capacityAdults: data.capacityAdults || 2,
          capacityChildren: data.capacityChildren || 1,
          bedType: data.bedType || '1 Giường đôi King',
          description: data.description || 'Tiêu chuẩn tiện nghi khách sạn 4 sao.',
          amenities: data.amenities || ['Wifi', 'Điều hòa', 'TV 55 inch', 'Bồn tắm'],
          images: data.images || [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          ],
        };
        roomTypesState = [...roomTypesState, newType];
        return newType;
      }
    );
  },

  async updateRoomType(id: string, data: Partial<RoomType>): Promise<RoomType> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/room-types/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Không thể cập nhật hạng phòng');
        }
        return res.json();
      },
      () => {
        const idx = roomTypesState.findIndex((r) => r.id === id);
        if (idx === -1) throw new Error('Hạng phòng không tồn tại');
        roomTypesState[idx] = { ...roomTypesState[idx], ...data };
        return { ...roomTypesState[idx] };
      }
    );
  },

  async deleteRoomType(id: string): Promise<boolean> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/room-types/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Không thể xóa hạng phòng');
        }
        return true;
      },
      () => {
        roomTypesState = roomTypesState.filter((r) => r.id !== id);
        return true;
      }
    );
  },

  async getRooms(): Promise<Room[]> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/rooms`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`Lỗi tải danh sách phòng: ${res.statusText}`);
        return res.json();
      },
      () => [...roomsState]
    );
  },

  async getRoomById(id: string): Promise<Room | null> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/rooms/${id}`, { headers: getAuthHeaders() });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Không thể tải chi tiết phòng');
        return res.json();
      },
      () => {
        const room = roomsState.find((r) => r.id === id || r.number === id);
        return room ? { ...room } : null;
      }
    );
  },

  async updateRoomStatus(roomId: string, status: RoomStatus, note?: string): Promise<Room> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/rooms/${roomId}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status, note }),
        });
        if (!res.ok) throw new Error(`Không thể cập nhật trạng thái phòng ${roomId}`);
        return res.json();
      },
      () => {
        const index = roomsState.findIndex((r) => r.id === roomId || r.number === roomId);
        if (index === -1) throw new Error('Không tìm thấy phòng');
        roomsState[index] = {
          ...roomsState[index],
          status,
          note: note ?? roomsState[index].note,
          updatedAt: new Date().toISOString(),
        };
        return { ...roomsState[index] };
      }
    );
  },

  async checkAvailability(
    roomTypeId: string,
    checkIn: string,
    checkOut: string
  ): Promise<{ available: boolean; remainingCount: number; availableRooms: Room[] }> {
    return dualModeRequest(
      async () => {
        const query = new URLSearchParams({ roomTypeId, checkIn, checkOut }).toString();
        const res = await fetch(`${API_URL}/api/rooms/availability?${query}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Lỗi kiểm tra tính khả dụng của phòng');
        return res.json();
      },
      () => {
        const matchingRooms = roomsState.filter(
          (r) => r.roomTypeId === roomTypeId && r.status === 'AVAILABLE'
        );
        return {
          available: matchingRooms.length > 0,
          remainingCount: matchingRooms.length,
          availableRooms: matchingRooms,
        };
      }
    );
  },

  async createRoom(data: { roomTypeId: string | number; number: string; floor: number }): Promise<Room> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/rooms`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Không thể tạo phòng');
        }
        return res.json();
      },
      () => {
        const newRoom: Room = {
          id: `room-${Date.now()}`,
          number: data.number,
          roomNumber: data.number,
          floor: data.floor,
          roomTypeId: String(data.roomTypeId),
          status: 'AVAILABLE' as RoomStatus,
          isClean: true,
          roomTypeName: 'Phòng Mới',
          roomTypeCode: 'NEW',
        };
        roomsState = [...roomsState, newRoom];
        return newRoom;
      }
    );
  },

  async updateRoom(id: string, data: { roomTypeId: string | number; number: string; floor: number }): Promise<Room> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/rooms/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Không thể cập nhật phòng');
        }
        return res.json();
      },
      () => {
        const idx = roomsState.findIndex((r) => r.id === id);
        if (idx === -1) throw new Error('Phòng không tồn tại');
        roomsState[idx] = {
          ...roomsState[idx],
          number: data.number,
          roomNumber: data.number,
          floor: data.floor,
          roomTypeId: String(data.roomTypeId),
        };
        return { ...roomsState[idx] };
      }
    );
  },

  async deleteRoom(id: string): Promise<boolean> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/rooms/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Không thể xóa phòng');
        }
        return true;
      },
      () => {
        roomsState = roomsState.filter((r) => r.id !== id);
        return true;
      }
    );
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    if (API_URL) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${safeLocalStorage.getItem('auth_token')}` },
          body: formData,
        });
        if (!res.ok) throw new Error('Không thể tải ảnh lên');
        const data = await res.json();
        return { url: `${API_URL}${data.url}` };
      } catch (err) {
        console.warn('[Dual-Mode API] Upload ảnh thất bại, fallback URL cục bộ.');
      }
    }
    await delay();
    return { url: URL.createObjectURL(file) };
  },
};

// ============================================================================
// 3. BOOKING SERVICE (ĐẶT PHÒNG & CHECKOUT)
// ============================================================================
export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/bookings`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Không thể tải danh sách đơn đặt phòng');
        return res.json();
      },
      () => [...bookingsState]
    );
  },

  async getBookingById(id: string): Promise<Booking | null> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/bookings/${encodeURIComponent(id)}`, { headers: getAuthHeaders() });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Không thể tải chi tiết đặt phòng');
        return res.json();
      },
      () => {
        const booking = bookingsState.find(
          (b) => b.id === id || b.bookingCode.toLowerCase() === id.toLowerCase()
        );
        return booking ? { ...booking } : null;
      }
    );
  },

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/bookings`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const detail = errorData.detail || errorData.message || 'Không thể khởi tạo đơn đặt phòng';
          throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
        }
        return res.json();
      },
      () => {
        const roomType = roomTypesState.find((rt) => rt.id === data.roomTypeId) || roomTypesState[0];
        let bookingCode = data.bookingCode;
        if (!bookingCode) {
          if (data.source === 'COUNTER') {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            bookingCode = `WK-${randomNum}`;
          } else {
            const timestamp = Date.now().toString().slice(-4);
            const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
            bookingCode = `NTR-${dateCode}-${timestamp}`;
          }
        }

        const newBooking: Booking = {
          id: `bk-${Date.now()}`,
          bookingCode,
          guestId: data.guestId || 'guest-001',
          guestName: data.guestName || 'Khách vãng lai',
          guestPhone: data.guestPhone || '0900000000',
          guestEmail: data.guestEmail || 'customer@example.com',
          guestIdCard: data.guestIdCard,
          roomNumber: data.roomNumber || '301',
          roomTypeId: roomType.id,
          roomTypeName: roomType.name,
          checkInDate: data.checkInDate || new Date().toISOString().slice(0, 10),
          checkOutDate: data.checkOutDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          nights: data.nights || 1,
          adults: data.adults || 2,
          children: data.children || 0,
          totalAmount: data.totalAmount || roomType.basePrice,
          paidAmount: data.paidAmount || 0,
          status: data.status || 'CONFIRMED',
          source: data.source || 'WEB',
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          specialRequests: data.specialRequests,
          paymentMethod: data.paymentMethod || 'VNPAY',
          extraServices: data.extraServices || [],
        };

        bookingsState = [newBooking, ...bookingsState];

        if (newBooking.roomNumber) {
          const roomIdx = roomsState.findIndex(
            (r) => r.number === newBooking.roomNumber || r.roomNumber === newBooking.roomNumber || r.id === newBooking.roomNumber
          );
          if (roomIdx !== -1) {
            roomsState[roomIdx] = {
              ...roomsState[roomIdx],
              status: newBooking.status === 'CHECKED_IN' ? 'OCCUPIED' : 'RESERVED',
              currentGuestName: newBooking.guestName,
            };
          }
        }

        return newBooking;
      }
    );
  },

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    additionalData?: Partial<Booking>
  ): Promise<Booking> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status, ...additionalData }),
        });
        if (!res.ok) throw new Error(`Không thể cập nhật trạng thái đơn ${bookingId}`);
        return res.json();
      },
      () => {
        const index = bookingsState.findIndex(
          (b) => b.id === bookingId || b.bookingCode === bookingId
        );
        if (index === -1) throw new Error('Không tìm thấy đơn đặt phòng');

        bookingsState[index] = {
          ...bookingsState[index],
          status,
          ...additionalData,
        };

        const b = bookingsState[index];
        const roomIdx = roomsState.findIndex((r) => r.number === b.roomNumber);
        if (roomIdx !== -1) {
          if (status === 'CHECKED_IN') {
            roomsState[roomIdx].status = 'OCCUPIED';
            roomsState[roomIdx].currentGuestName = b.guestName;
          } else if (status === 'CHECKED_OUT') {
            roomsState[roomIdx].status = 'CLEANING';
            roomsState[roomIdx].currentGuestName = undefined;
          } else if (status === 'CANCELLED') {
            roomsState[roomIdx].status = 'AVAILABLE';
            roomsState[roomIdx].currentGuestName = undefined;
          }
        }

        return { ...bookingsState[index] };
      }
    );
  },

  async cancelBooking(bookingId: string, reason: string, refundAmount?: number): Promise<Booking> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ reason, refundAmount: refundAmount ?? 0 }),
        });
        if (!res.ok) throw new Error('Lỗi xử lý hủy đặt phòng');
        return res.json();
      },
      () => {
        return this.updateBookingStatus(bookingId, 'CANCELLED', {
          cancellationReason: reason,
          refundAmount: refundAmount ?? 0,
        });
      }
    );
  },
};

// ============================================================================
// 4. CUSTOMER SERVICE (HỒ SƠ KHÁCH HÀNG & CRM - ALIAS: guestService)
// ============================================================================
export const customerService = {
  async getCustomers(): Promise<Guest[]> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/customers`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Không thể tải danh sách khách hàng');
        return res.json();
      },
      () => [...guestsState]
    );
  },

  async getCustomerById(id: string): Promise<Guest | null> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/customers/${encodeURIComponent(id)}`, { headers: getAuthHeaders() });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Không thể tìm thấy khách hàng');
        return res.json();
      },
      () => {
        const g = guestsState.find((guest) => guest.id === id || guest.phone === id);
        return g ? { ...g } : null;
      }
    );
  },

  async createCustomer(data: Partial<Guest>): Promise<Guest> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/customers`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Không thể tạo hồ sơ khách hàng');
        return res.json();
      },
      () => {
        const newGuest: Guest = {
          id: `guest-${Date.now()}`,
          name: data.name || data.fullName || 'Khách Hàng',
          fullName: data.fullName || data.name || 'Khách Hàng',
          phone: data.phone || '',
          email: data.email || '',
          idCardNumber: data.idCardNumber || data.identityNumber,
          identityNumber: data.identityNumber || data.idCardNumber,
          nationality: data.nationality || 'Việt Nam',
          notes: data.notes,
          totalSpent: 0,
          totalStays: 1,
          vipTier: 'SILVER',
        };
        guestsState = [newGuest, ...guestsState];
        return newGuest;
      }
    );
  },

  async updateCustomer(id: string, data: Partial<Guest>): Promise<Guest> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/customers/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Không thể cập nhật hồ sơ khách hàng');
        return res.json();
      },
      () => {
        const idx = guestsState.findIndex((g) => g.id === id);
        if (idx === -1) throw new Error('Khách hàng không tồn tại');
        guestsState[idx] = { ...guestsState[idx], ...data };
        return { ...guestsState[idx] };
      }
    );
  },

  async deleteCustomer(id: string): Promise<boolean> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/customers/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Không thể xóa khách hàng');
        return true;
      },
      () => {
        guestsState = guestsState.filter((g) => g.id !== id);
        return true;
      }
    );
  },

  // Tương thích ngược với guestService
  getGuests() {
    return this.getCustomers();
  },
  getGuestById(id: string) {
    return this.getCustomerById(id);
  },
  createGuest(data: Partial<Guest>) {
    return this.createCustomer(data);
  },
};

export const guestService = customerService;

// ============================================================================
// 5. SHIFT SERVICE (QUẢN LÝ CA TRỰC LỄ TÂN)
// ============================================================================
export const shiftService = {
  async getCurrentShift(): Promise<Shift> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/shifts/current`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Không thể tải thông tin ca trực hiện tại');
        return res.json();
      },
      () => ({ ...currentShiftState })
    );
  },

  async openShift(initialCash: number, notes?: string): Promise<Shift> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/shifts/open`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ initialCash, notes }),
        });
        if (!res.ok) throw new Error('Không thể mở ca trực mới');
        return res.json();
      },
      () => {
        currentShiftState = {
          id: `shift-${Date.now()}`,
          shiftCode: `SHF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-02`,
          employeeName: 'Đỗ Mai Phương',
          employeeCode: 'FD-001',
          startTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
          initialCash,
          cashRevenue: 0,
          transferRevenue: 0,
          totalRevenue: 0,
          checkInCount: 0,
          checkOutCount: 0,
          status: 'OPEN',
          notes: notes || 'Ca trực mới khởi tạo thành công.',
        };
        return { ...currentShiftState };
      }
    );
  },

  async closeShift(actualCash: number, handoverNotes?: string): Promise<Shift> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/shifts/close`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ actualCash, handoverNotes }),
        });
        if (!res.ok) throw new Error('Không thể kết thúc ca trực');
        return res.json();
      },
      () => {
        const expectedCash = currentShiftState.initialCash + currentShiftState.cashRevenue;
        const discrepancy = actualCash - expectedCash;
        currentShiftState = {
          ...currentShiftState,
          endTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'CLOSED',
          actualCash,
          discrepancy,
          notes: handoverNotes ? `${currentShiftState.notes || ''} | Bàn giao: ${handoverNotes}` : currentShiftState.notes,
        };
        return { ...currentShiftState };
      }
    );
  },

  async getShiftSummary(): Promise<{
    checkInCount: number;
    checkOutCount: number;
    totalCash: number;
    totalTransfer: number;
    totalRevenue: number;
  }> {
    const shift = await this.getCurrentShift();
    return {
      checkInCount: shift.checkInCount,
      checkOutCount: shift.checkOutCount,
      totalCash: shift.initialCash + shift.cashRevenue,
      totalTransfer: shift.transferRevenue,
      totalRevenue: shift.totalRevenue,
    };
  },
};

// ============================================================================
// 6. SETTING SERVICE (CÀI ĐẶT CẤU HÌNH HỆ THỐNG)
// ============================================================================
export const settingService = {
  async getSettings(): Promise<SystemSettings> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/settings`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Không thể tải cấu hình khách sạn');
        return res.json();
      },
      () => ({ ...settingsState })
    );
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/settings`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Không thể cập nhật cấu hình khách sạn');
        return res.json();
      },
      () => {
        settingsState = { ...settingsState, ...data };
        return { ...settingsState };
      }
    );
  },
};

// ============================================================================
// 7. REPORT SERVICE (BÁO CÁO TÀI CHÍNH & XU HƯỚNG RECHARTS)
// ============================================================================
export const reportService = {
  async getRevenueReport(timeRange: 'today' | '7days' | 'month' = '7days'): Promise<RevenueReportPoint[]> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/reports/revenue?timeRange=${timeRange}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Không thể tải báo cáo doanh thu');
        return res.json();
      },
      () => {
        if (timeRange === 'today') {
          return [
            { time: '06:00', revenue: 1200000, roomRevenue: 850000, serviceRevenue: 350000 },
            { time: '08:00', revenue: 4500000, roomRevenue: 3800000, serviceRevenue: 700000 },
            { time: '10:00', revenue: 8900000, roomRevenue: 7200000, serviceRevenue: 1700000 },
            { time: '12:00', revenue: 14200000, roomRevenue: 11500000, serviceRevenue: 2700000 },
            { time: '14:00', revenue: 21600000, roomRevenue: 18000000, serviceRevenue: 3600000 },
            { time: '16:00', revenue: 27400000, roomRevenue: 22800000, serviceRevenue: 4600000 },
            { time: '18:00', revenue: 32800000, roomRevenue: 27100000, serviceRevenue: 5700000 },
            { time: '20:00', revenue: 38500000, roomRevenue: 31500000, serviceRevenue: 7000000 },
          ];
        }
        if (timeRange === 'month') {
          return [
            { time: 'Tuần 1 (01-07)', revenue: 198000000, roomRevenue: 162000000, serviceRevenue: 36000000 },
            { time: 'Tuần 2 (08-14)', revenue: 225000000, roomRevenue: 186000000, serviceRevenue: 39000000 },
            { time: 'Tuần 3 (15-21)', revenue: 279600000, roomRevenue: 232000000, serviceRevenue: 47600000 },
            { time: 'Tuần 4 (22-30)', revenue: 215000000, roomRevenue: 178000000, serviceRevenue: 37000000 },
          ];
        }
        return [
          { time: '15/10', revenue: 32500000, roomRevenue: 26800000, serviceRevenue: 5700000 },
          { time: '16/10', revenue: 28900000, roomRevenue: 23500000, serviceRevenue: 5400000 },
          { time: '17/10', revenue: 35400000, roomRevenue: 29200000, serviceRevenue: 6200000 },
          { time: '18/10', revenue: 41200000, roomRevenue: 34100000, serviceRevenue: 7100000 },
          { time: '19/10', revenue: 48900000, roomRevenue: 40500000, serviceRevenue: 8400000 },
          { time: '20/10', revenue: 54200000, roomRevenue: 45000000, serviceRevenue: 9200000 },
          { time: 'Hôm nay', revenue: 38500000, roomRevenue: 31500000, serviceRevenue: 7000000 },
        ];
      }
    );
  },

  async getRoomTypeRevenue(): Promise<RoomTypeRevenueContribution[]> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/reports/room-types`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Không thể tải cơ cấu doanh thu theo hạng phòng');
        return res.json();
      },
      () => [
        { code: 'DLX', name: 'Deluxe City View', revenue: 168000000, percentage: 38, color: '#1F5AA6' },
        { code: 'PRE', name: 'Presidential Suite', revenue: 112000000, percentage: 25, color: '#C9A227' },
        { code: 'EXE', name: 'Executive Suite', revenue: 75000000, percentage: 17, color: '#0F172A' },
        { code: 'FAM', name: 'Family Connecting', revenue: 44000000, percentage: 10, color: '#059669' },
        { code: 'SUP', name: 'Superior King', revenue: 27000000, percentage: 6, color: '#D97706' },
        { code: 'STD', name: 'Standard Twin', revenue: 18000000, percentage: 4, color: '#64748B' },
      ]
    );
  },

  async exportReport(format: 'json' | 'csv' = 'json'): Promise<{ success: boolean; data?: any }> {
    const reportData = await this.getRevenueReport('month');
    const roomTypes = await this.getRoomTypeRevenue();
    return {
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        hotel: 'Nitro Grand Hotel 4-Star',
        format,
        revenueTrend: reportData,
        roomTypeContribution: roomTypes,
      },
    };
  },
};

// ============================================================================
// CÁC SERVICES BỔ TRỢ KHÁC (GIỮ NGUYÊN TƯƠNG THÍCH TOÀN HỆ THỐNG)
// ============================================================================
export const hotelServiceService = {
  async getServices(): Promise<HotelService[]> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/services`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Không thể tải danh sách dịch vụ');
        return res.json();
      },
      () => [...servicesState]
    );
  },

  async toggleService(id: string): Promise<HotelService> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/services/${id}/toggle`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Không thể đổi trạng thái dịch vụ');
        return res.json();
      },
      () => {
        const idx = servicesState.findIndex((s) => s.id === id);
        if (idx === -1) throw new Error('Không tìm thấy dịch vụ');
        servicesState[idx].status = servicesState[idx].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...servicesState[idx] };
      }
    );
  },
};

export const dashboardService = {
  async getMetrics(period: 'day' | 'week' | 'month' = 'month'): Promise<DashboardMetrics> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/dashboard/metrics?period=${period}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Lỗi lấy chỉ số thống kê Dashboard');
        return res.json();
      },
      () => {
        if (period === 'day') {
          return { ...MOCK_DASHBOARD_METRICS, revenue: 15600000, totalBookings: 14, occupancyRate: 70.0 };
        }
        if (period === 'week') {
          return { ...MOCK_DASHBOARD_METRICS, revenue: 104200000, totalBookings: 79, occupancyRate: 74.8 };
        }
        return { ...MOCK_DASHBOARD_METRICS };
      }
    );
  },

  async getStats(period: 'day' | 'week' | 'month' = 'month'): Promise<DashboardMetrics> {
    return this.getMetrics(period);
  },
};

export const userService = {
  async getUsers(): Promise<User[]> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/users`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
        return res.json();
      },
      () => [...usersState]
    );
  },

  async createUser(data: Partial<User>): Promise<User> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Không thể tạo người dùng mới');
        return res.json();
      },
      () => {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'FRONT_DESK',
          status: 'ACTIVE',
          lastLogin: 'Chưa đăng nhập',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        };
        usersState = [newUser, ...usersState];
        return newUser;
      }
    );
  },

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ role }),
        });
        if (!res.ok) throw new Error(`Không thể cập nhật quyền cho người dùng ${userId}`);
        return res.json();
      },
      () => {
        const idx = usersState.findIndex((u) => u.id === userId);
        if (idx === -1) throw new Error('Không tìm thấy người dùng');
        usersState[idx].role = role;
        return { ...usersState[idx] };
      }
    );
  },

  async toggleUserStatus(userId: string): Promise<User> {
    return dualModeRequest(
      async () => {
        const res = await fetch(`${API_URL}/api/users/${userId}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Không thể thay đổi trạng thái người dùng');
        return res.json();
      },
      () => {
        const idx = usersState.findIndex((u) => u.id === userId);
        if (idx === -1) throw new Error('Không tìm thấy người dùng');
        usersState[idx].status = usersState[idx].status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        return { ...usersState[idx] };
      }
    );
  },
};
