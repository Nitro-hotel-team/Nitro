/**
 * ============================================================================
 * TÊN FILE: api.ts
 * VỊ TRÍ: src/services/api.ts
 * PHÂN HỆ: Tầng Giao tiếp Dữ liệu & Kết nối Backend (Data Service & Backend Connectors)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ HƯỚNG DẪN KẾT NỐI DÀNH CHO LẬP TRÌNH VIÊN BACKEND:
 * 
 * 1. NƠI CẤU HÌNH API:
 *    - Toàn bộ các hàm giao tiếp mạng của Frontend tập trung duy nhất tại file này.
 *    - Đường dẫn API Backend được đọc tự động từ biến môi trường:
 *      `VITE_API_URL` (ví dụ: http://localhost:5000 hoặc https://api.nitrohotel.com).
 *    - Xem tài liệu đặc tả chi tiết tại file: `BACKEND_API_SPEC.md` ở thư mục gốc.
 * 
 * 2. CƠ CHẾ HOẠT ĐỘNG SONG SONG (DUAL-MODE ARCHITECTURE):
 *    - Khi VITE_API_URL được cấu hình:
 *      Hệ thống sẽ thực hiện gọi mạng thật (HTTP fetch) đến Backend của bạn.
 *    - Khi VITE_API_URL để trống:
 *      Hệ thống tự động sử dụng bộ nhớ giả lập (In-memory mock fallback) để
 *      đảm bảo Frontend chạy ổn định, không bị crash trong quá trình bạn đang dựng Backend.
 * 
 * 3. HƯỚNG DẪN DÀNH CHO BACKEND:
 *    - Mỗi hàm bên dưới đều đã được để sẵn khối gọi REST API thật (HTTP Method, Endpoint, Request Body).
 *    - Có sẵn ghi chú mô tả chính xác: Mục đích API, Dữ liệu gửi đi, Dữ liệu phản hồi mong đợi.
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
  Room,
  RoomStatus,
  RoomType,
  User,
  UserRole,
} from '../types';

// Đọc địa chỉ Backend từ .env hoặc cấu hình Mock Mode
// Nếu VITE_USE_MOCK=true hoặc không thiết lập VITE_API_URL -> luôn chạy Mock Data
const IS_MOCK_CONFIGURED =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  import.meta.env.VITE_USE_MOCK === true ||
  !import.meta.env.VITE_API_URL;

const API_URL = IS_MOCK_CONFIGURED ? '' : (import.meta.env.VITE_API_URL || '').trim();
const SIMULATED_DELAY = 150;

const delay = (ms: number = SIMULATED_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hàm hỗ trợ lấy Token xác thực từ bộ nhớ trình duyệt nếu có
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Dữ liệu In-memory dự phòng (Fallback khi Backend chưa bật)
let roomsState: Room[] = [...MOCK_ROOMS];
let bookingsState: Booking[] = [...MOCK_BOOKINGS];
let guestsState: Guest[] = [...MOCK_GUESTS];
let servicesState: HotelService[] = [...MOCK_SERVICES];
let usersState: User[] = [...MOCK_USERS];

// ============================================================================
// PHÂN HỆ 0: XÁC THỰC & PHÂN QUYỀN (AUTHENTICATION & AUTHORIZATION)
// ============================================================================
export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  /**
   * [API 0.1] Đăng nhập tài khoản (Customer hoặc Staff)
   * -------------------------------------------------------------
   * @route POST /api/auth/login
   * @access Public
   * @body { emailOrPhone: string, password: string }
   * @returns { token: string, user: User }
   */
  async login(credentials: { emailOrPhone: string; password: string }): Promise<LoginResponse> {
    if (API_URL) {
      try {
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
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('nitro_user_role', data.user.role);
        localStorage.setItem('nitro_current_user', JSON.stringify(data.user));
        return data;
      } catch (err: any) {
        // Tự động nhận diện nếu backend chưa bật (Failed to fetch, connection refused)
        const isNetworkFailure =
          err?.name === 'TypeError' ||
          err?.message?.includes('fetch') ||
          err?.message?.includes('Network') ||
          err?.message?.includes('Failed');

        if (isNetworkFailure) {
          console.warn('[API Service] Backend tại ' + API_URL + ' chưa phản hồi (' + err.message + '). Tự động chuyển tiếp đăng nhập bằng Mock Data.');
        } else {
          // Lỗi từ backend trả về (ví dụ sai mật khẩu) thì vẫn báo cho người dùng
          throw err;
        }
      }
    }

    // Mock Mode Fallback khi Backend chưa bật
    await delay();
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
      // Cho phép đăng nhập email tùy ý với vai trò khách hàng nếu có mật khẩu
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
        localStorage.setItem('auth_token', token);
        localStorage.setItem('nitro_user_role', customUser.role);
        localStorage.setItem('nitro_current_user', JSON.stringify(customUser));
        return { token, user: customUser };
      }
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    if (matched.status === 'LOCKED') {
      throw new Error('Tài khoản này hiện đang bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // Tạo giả lập JWT Token cho Mock mode
    const token = `mock-jwt-${matched.role.toLowerCase()}-${Date.now()}`;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('nitro_user_role', matched.role);
    localStorage.setItem('nitro_current_user', JSON.stringify(matched));

    return { token, user: matched };
  },

  /**
   * [API 0.2] Đăng ký tài khoản khách hàng mới
   * -------------------------------------------------------------
   * @route POST /api/auth/register
   * @access Public
   */
  async register(data: { name: string; email: string; phone: string; password: string }): Promise<LoginResponse> {
    if (API_URL) {
      try {
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
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('nitro_user_role', result.user.role);
        localStorage.setItem('nitro_current_user', JSON.stringify(result.user));
        return result;
      } catch (err: any) {
        const isNetworkFailure =
          err?.name === 'TypeError' ||
          err?.message?.includes('fetch') ||
          err?.message?.includes('Network') ||
          err?.message?.includes('Failed');

        if (isNetworkFailure) {
          console.warn('[API Service] Backend chưa bật (' + err.message + '). Tự động chuyển tiếp đăng ký Mock.');
        } else {
          throw err;
        }
      }
    }

    await delay();
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
    localStorage.setItem('auth_token', token);
    localStorage.setItem('nitro_user_role', newUser.role);
    localStorage.setItem('nitro_current_user', JSON.stringify(newUser));
    return { token, user: newUser };
  },

  /**
   * Đăng nhập bằng Google
   * @param credential Token từ Google
   */
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
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('nitro_user_role', data.user.role);
      localStorage.setItem('nitro_current_user', JSON.stringify(data.user));
      return data;
    }
    await delay();
    throw new Error('Chưa hỗ trợ đăng nhập Google ở chế độ Mock');
  },

  /**
   * [API 0.3] Lấy thông tin tài khoản hiện tại từ Token
   * -------------------------------------------------------------
   * @route GET /api/auth/me
   * @access Authenticated
   */
  async getMe(): Promise<User> {
    if (API_URL) {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Phiên đăng nhập đã hết hạn');
        return await res.json();
      } catch (err: any) {
        console.warn('[API Service] Không kết nối được Backend /api/auth/me, sử dụng Mock User.');
      }
    }

    await delay(50);
    const saved = localStorage.getItem('nitro_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const savedRole = localStorage.getItem('nitro_user_role');
    const matched = usersState.find((u) => u.role === savedRole);
    return matched || usersState[0];
  },

  /**
   * [API 0.4] Đăng xuất và xóa phiên làm việc
   * -------------------------------------------------------------
   * @route POST /api/auth/logout
   * @access Authenticated
   */
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nitro_user_role');
    localStorage.removeItem('nitro_current_user');
  },
};

// ============================================================================
// PHÂN HỆ 1: QUẢN LÝ PHÒNG & LOẠI PHÒNG (ROOMS & ROOM TYPES)
// ============================================================================
export const roomService = {
  /**
   * [API 1.1] Lấy danh sách tất cả các loại phòng kinh doanh
   * -------------------------------------------------------------
   * @route GET /api/room-types
   * @access Public
   * @returns Mảng các đối tượng RoomType[] (Bao gồm tên, giá, diện tích, ảnh, tiện ích)
   */
  async getRoomTypes(): Promise<RoomType[]> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/room-types`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Lỗi tải loại phòng: ${res.statusText}`);
      return res.json();
    }
    // Fallback nếu chưa kết nối backend
    await delay();
    return [...MOCK_ROOM_TYPES];
  },

  /**
   * [API 1.2] Lấy thông tin chi tiết một loại phòng
   * -------------------------------------------------------------
   * @route GET /api/room-types/:id
   * @access Public
   * @param id - Mã định danh hoặc mã code loại phòng (ví dụ: 'rt-dlx' hoặc 'DLX')
   * @returns Đối tượng RoomType hoặc null
   */
  async uploadImage(file: File): Promise<{ url: string }> {
    if (API_URL) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        // Notice we don't set Content-Type header manually here so the browser sets it with boundaries
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Không thể tải ảnh lên');
      const data = await res.json();
      return { url: `${API_URL}${data.url}` };
    }
    await delay();
    return { url: URL.createObjectURL(file) };
  },

  async getRoomTypeById(id: string): Promise<RoomType | null> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/room-types/${encodeURIComponent(id)}`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Lỗi lấy loại phòng ${id}`);
      return res.json();
    }
    await delay();
    const rt = MOCK_ROOM_TYPES.find((t) => t.id === id || t.code.toLowerCase() === id.toLowerCase());
    return rt || null;
  },

  async createRoomType(data: Partial<RoomType>): Promise<RoomType> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/room-types`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Không thể tạo hạng phòng');
      }
      return res.json();
    }
    await delay();
    throw new Error('Chưa hỗ trợ tạo hạng phòng ở chế độ Mock');
  },

  async updateRoomType(id: string, data: Partial<RoomType>): Promise<RoomType> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/room-types/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Không thể cập nhật hạng phòng');
      }
      return res.json();
    }
    await delay();
    throw new Error('Chưa hỗ trợ sửa hạng phòng ở chế độ Mock');
  },

  async deleteRoomType(id: string): Promise<boolean> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/room-types/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Không thể xóa hạng phòng');
      }
      return true;
    }
    await delay();
    throw new Error('Chưa hỗ trợ xóa hạng phòng ở chế độ Mock');
  },

  /**
   * [API 1.3] Lấy danh sách tất cả các phòng vật lý trong khách sạn
   * -------------------------------------------------------------
   * @route GET /api/rooms
   * @access Lễ tân (FRONT_DESK), Quản lý (MANAGER), ADMIN
   * @returns Danh sách phòng Room[] (Số phòng, tầng, trạng thái: AVAILABLE, OCCUPIED, CLEANING,...)
   * @note Phục vụ hiển thị Sơ đồ buồng phòng dạng lưới từ Tầng 1 đến Tầng 6
   */
  async getRooms(): Promise<Room[]> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/rooms`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Lỗi tải danh sách phòng: ${res.statusText}`);
      return res.json();
    }
    await delay();
    return [...roomsState];
  },

  /**
   * [API 1.4] Cập nhật trạng thái buồng phòng
   * -------------------------------------------------------------
   * @route PATCH /api/rooms/:roomId/status
   * @access Lễ tân, Quản lý buồng phòng
   * @param roomId - Mã phòng hoặc Số phòng (ví dụ: 'room-101' hoặc '101')
   * @param status - Trạng thái mới: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'RESERVED'
   * @param note - Ghi chú tùy chọn (ví dụ: 'Bảo trì điều hòa tầng 3')
   */
  async updateRoomStatus(roomId: string, status: RoomStatus, note?: string): Promise<Room> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) throw new Error(`Không thể cập nhật trạng thái phòng ${roomId}`);
      return res.json();
    }

    // Fallback logic cập nhật in-memory
    await delay();
    const index = roomsState.findIndex((r) => r.id === roomId || r.number === roomId);
    if (index === -1) throw new Error('Không tìm thấy phòng');
    roomsState[index] = {
      ...roomsState[index],
      status,
      note: note ?? roomsState[index].note,
      updatedAt: new Date().toISOString(),
    };
    return { ...roomsState[index] };
  },

  /**
   * [API 1.5] Kiểm tra phòng trống theo khoảng thời gian
   * -------------------------------------------------------------
   * @route GET /api/rooms/availability?roomTypeId=...&checkIn=...&checkOut=...
   * @access Public
   * @param roomTypeId - Mã loại phòng
   * @param checkIn - Ngày nhận phòng (YYYY-MM-DD)
   * @param checkOut - Ngày trả phòng (YYYY-MM-DD)
   */
  async checkAvailability(
    roomTypeId: string,
    checkIn: string,
    checkOut: string
  ): Promise<{ available: boolean; remainingCount: number; availableRooms: Room[] }> {
    if (API_URL) {
      const query = new URLSearchParams({ roomTypeId, checkIn, checkOut }).toString();
      const res = await fetch(`${API_URL}/api/rooms/availability?${query}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Lỗi kiểm tra tính khả dụng của phòng');
      return res.json();
    }

    await delay();
    const matchingRooms = roomsState.filter(
      (r) => r.roomTypeId === roomTypeId && r.status === 'AVAILABLE'
    );
    return {
      available: matchingRooms.length > 0,
      remainingCount: matchingRooms.length,
      availableRooms: matchingRooms,
    };
  },

  /**
   * Tạo phòng mới (chỉ Admin/Manager)
   */
  async createRoom(data: { roomTypeId: string | number; number: string; floor: number }): Promise<Room> {
    if (API_URL) {
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
    }
    await delay();
    const newRoom = {
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
  },

  /**
   * Cập nhật thông tin phòng (chỉ Admin/Manager)
   */
  async updateRoom(id: string, data: { roomTypeId: string | number; number: string; floor: number }): Promise<Room> {
    if (API_URL) {
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
    }
    await delay();
    const idx = roomsState.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Phòng không tồn tại");
    roomsState[idx] = {
      ...roomsState[idx],
      number: data.number,
      roomNumber: data.number,
      floor: data.floor,
      roomTypeId: String(data.roomTypeId)
    };
    return { ...roomsState[idx] };
  },

  /**
   * Xóa mềm phòng (chỉ Admin)
   */
  async deleteRoom(id: string): Promise<boolean> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/rooms/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Không thể xóa phòng');
      }
      return true;
    }
    await delay();
    roomsState = roomsState.filter(r => r.id !== id);
    return true;
  },
};

// ============================================================================
// PHÂN HỆ 2: ĐẶT PHÒNG & QUY TRÌNH THANH TOÁN (BOOKINGS & CHECKOUT)
// ============================================================================
export const bookingService = {
  /**
   * [API 2.1] Lấy danh sách các đơn đặt phòng
   * -------------------------------------------------------------
   * @route GET /api/bookings
   * @access Lễ tân, Quản lý
   * @returns Mảng Booking[]
   * @note Hỗ trợ tìm kiếm theo từ khóa mã đơn, tên khách, ngày nhận phòng
   */
  async getBookings(): Promise<Booking[]> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/bookings`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Không thể tải danh sách đơn đặt phòng');
      return res.json();
    }
    await delay();
    return [...bookingsState];
  },

  /**
   * [API 2.2] Lấy chi tiết đơn đặt phòng theo ID hoặc Mã Booking Code
   * -------------------------------------------------------------
   * @route GET /api/bookings/:id
   * @access Public (Khách tra cứu đơn) hoặc Nhân viên
   * @param id - Booking ID hoặc Mã code (Ví dụ: 'NTR-20261001-8892')
   */
  async getBookingById(id: string): Promise<Booking | null> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/bookings/${encodeURIComponent(id)}`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Không thể tải chi tiết đặt phòng');
      return res.json();
    }

    await delay();
    const booking = bookingsState.find(
      (b) => b.id === id || b.bookingCode.toLowerCase() === id.toLowerCase()
    );
    return booking ? { ...booking } : null;
  },

  /**
   * [API 2.3] Tạo mới đơn đặt phòng (Khách đặt qua Web hoặc Lễ tân tạo tại Quầy)
   * -------------------------------------------------------------
   * @route POST /api/bookings
   * @access Public / Staff
   * @param data - Thông tin đặt phòng: roomTypeId, checkIn, checkOut, thông tin khách, thanh toán
   * @returns Đối tượng Booking hoàn chỉnh kèm `bookingCode` sinh tự động
   * @note Backend cần:
   *       1. Kiểm tra phòng còn trống để tránh đặt trùng (Double Booking).
   *       2. Sinh mã bookingCode định dạng 'NTR-YYYYMMDD-XXXX'.
   *       3. Khóa phòng tương ứng sang trạng thái RESERVED hoặc OCCUPIED.
   */
  async createBooking(data: Partial<Booking>): Promise<Booking> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const detail = errorData.detail || errorData.message || 'Không thể khởi tạo đơn đặt phòng trên hệ thống';
        throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      }
      return res.json();
    }

    // Fallback logic mô phỏng
    await delay();
    const roomType = MOCK_ROOM_TYPES.find((rt) => rt.id === data.roomTypeId) || MOCK_ROOM_TYPES[0];
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
  },

  /**
   * [API 2.4] Cập nhật trạng thái đặt phòng (Check-in, Check-out, Hủy đơn)
   * -------------------------------------------------------------
   * @route PATCH /api/bookings/:bookingId/status
   * @access Lễ tân, Quản trị viên
   * @param bookingId - ID của đơn đặt phòng
   * @param status - 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'
   * @param additionalData - Các trường phụ (ví dụ: ghi chú nhận phòng, tiền thanh toán thêm)
   */
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    additionalData?: Partial<Booking>
  ): Promise<Booking> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, ...additionalData }),
      });
      if (!res.ok) throw new Error(`Không thể cập nhật trạng thái đơn ${bookingId}`);
      return res.json();
    }

    await delay();
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
  },

  /**
   * [API 2.5] Hủy đơn đặt phòng và tính tiền hoàn lại
   * -------------------------------------------------------------
   * @route POST /api/bookings/:bookingId/cancel
   * @access Khách hàng hoặc Lễ tân
   * @param bookingId - ID đơn phòng cần hủy
   * @param reason - Lý do hủy
   * @param refundAmount - Số tiền hoàn lại dự kiến
   */
  async cancelBooking(
    bookingId: string,
    reason: string,
    refundAmount?: number
  ): Promise<Booking> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason, refundAmount: refundAmount ?? 0 }),
      });
      if (!res.ok) throw new Error('Lỗi xử lý hủy đặt phòng');
      return res.json();
    }

    return this.updateBookingStatus(bookingId, 'CANCELLED', {
      cancellationReason: reason,
      refundAmount: refundAmount ?? 0,
    });
  },
};

// ============================================================================
// PHÂN HỆ 3: HỒ SƠ KHÁCH HÀNG (GUESTS & CRM)
// ============================================================================
export const guestService = {
  /**
   * [API 3.1] Lấy danh bạ khách hàng
   * -------------------------------------------------------------
   * @route GET /api/guests
   * @access Lễ tân, Quản lý
   */
  async getGuests(): Promise<Guest[]> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/guests`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Không thể tải danh sách khách hàng');
      return res.json();
    }
    await delay();
    return [...guestsState];
  },

  /**
   * [API 3.2] Lấy hồ sơ khách hàng theo ID hoặc Số điện thoại
   * -------------------------------------------------------------
   * @route GET /api/guests/:id
   * @access Staff
   */
  async getGuestById(id: string): Promise<Guest | null> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/guests/${encodeURIComponent(id)}`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Không thể tìm thấy khách hàng');
      return res.json();
    }
    await delay();
    const g = guestsState.find((guest) => guest.id === id || guest.phone === id);
    return g ? { ...g } : null;
  },

  /**
   * [API 3.3] Tạo mới hồ sơ khách hàng
   * -------------------------------------------------------------
   * @route POST /api/guests
   * @access Lễ tân
   */
  async createGuest(data: Partial<Guest>): Promise<Guest> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/guests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Không thể tạo hồ sơ khách hàng');
      return res.json();
    }

    await delay();
    const newGuest: Guest = {
      id: `guest-${Date.now()}`,
      name: data.name || 'Khách Hàng',
      phone: data.phone || '',
      email: data.email || '',
      idCardNumber: data.idCardNumber,
      nationality: data.nationality || 'Việt Nam',
      notes: data.notes,
      totalSpent: 0,
      totalStays: 1,
    };
    guestsState = [newGuest, ...guestsState];
    return newGuest;
  },
};

// ============================================================================
// PHÂN HỆ 4: DỊCH VỤ & TIỆN NGHI KHÁCH SẠN (SERVICES & AMENITIES)
// ============================================================================
export const hotelServiceService = {
  /**
   * [API 4.1] Lấy danh sách dịch vụ gia tăng (Đưa đón sân bay, Bữa sáng, Spa,...)
   * -------------------------------------------------------------
   * @route GET /api/services
   * @access Public / Staff
   */
  async getServices(): Promise<HotelService[]> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/services`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Không thể tải danh sách dịch vụ');
      return res.json();
    }
    await delay();
    return [...servicesState];
  },

  /**
   * [API 4.2] Bật/Tắt trạng thái hoạt động của dịch vụ (ACTIVE / INACTIVE)
   * -------------------------------------------------------------
   * @route PATCH /api/services/:id/toggle
   * @access Quản lý, ADMIN
   */
  async toggleService(id: string): Promise<HotelService> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/services/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Không thể đổi trạng thái dịch vụ');
      return res.json();
    }

    await delay();
    const idx = servicesState.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Không tìm thấy dịch vụ');
    servicesState[idx].status =
      servicesState[idx].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return { ...servicesState[idx] };
  },
};

// ============================================================================
// PHÂN HỆ 5: BÁO CÁO & THỐNG KÊ DOANH THU (DASHBOARD & METRICS)
// ============================================================================
export const dashboardService = {
  /**
   * [API 5.1] Lấy báo cáo chỉ số kinh doanh & tỷ lệ lấp đầy
   * -------------------------------------------------------------
   * @route GET /api/dashboard/metrics?period=day|week|month
   * @access Quản lý, Giám đốc, ADMIN
   * @param period - Kỳ báo cáo: 'day' (theo ngày), 'week' (tuần), 'month' (tháng)
   * @returns DashboardMetrics: Doanh thu, Tỷ lệ lấp đầy, RevPAR, ADR, Tỷ lệ hủy
   */
  async getMetrics(period: 'day' | 'week' | 'month' = 'month'): Promise<DashboardMetrics> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/dashboard/metrics?period=${period}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Lỗi lấy chỉ số thống kê Dashboard');
      return res.json();
    }

    await delay();
    if (period === 'day') {
      return {
        ...MOCK_DASHBOARD_METRICS,
        revenue: 15600000,
        totalBookings: 14,
        occupancyRate: 70.0,
      };
    }
    if (period === 'week') {
      return {
        ...MOCK_DASHBOARD_METRICS,
        revenue: 104200000,
        totalBookings: 79,
        occupancyRate: 74.8,
      };
    }
    return { ...MOCK_DASHBOARD_METRICS };
  },

  async getStats(period: 'day' | 'week' | 'month' = 'month'): Promise<DashboardMetrics> {
    return this.getMetrics(period);
  },
};

// ============================================================================
// PHÂN HỆ 6: QUẢN TRỊ NGƯỜI DÙNG & PHÂN QUYỀN (USERS & RBAC)
// ============================================================================
export const userService = {
  /**
   * [API 6.1] Lấy danh sách tài khoản nhân viên
   * -------------------------------------------------------------
   * @route GET /api/users
   * @access ADMIN
   */
  async getUsers(): Promise<User[]> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
      return res.json();
    }
    await delay();
    return [...usersState];
  },

  /**
   * [API 6.2] Tạo tài khoản nhân viên mới
   * -------------------------------------------------------------
   * @route POST /api/users
   * @access ADMIN
   */
  async createUser(data: Partial<User>): Promise<User> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Không thể tạo người dùng mới');
      return res.json();
    }

    await delay();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      role: data.role || 'FRONT_DESK',
      status: 'ACTIVE',
      lastLogin: 'Chưa đăng nhập',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    };
    usersState = [newUser, ...usersState];
    return newUser;
  },

  /**
   * [API 6.3] Phân quyền vai trò người dùng (CUSTOMER, FRONT_DESK, MANAGER, ADMIN)
   * -------------------------------------------------------------
   * @route PATCH /api/users/:userId/role
   * @access ADMIN
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error(`Không thể cập nhật quyền cho người dùng ${userId}`);
      return res.json();
    }

    await delay();
    const idx = usersState.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Không tìm thấy người dùng');
    usersState[idx].role = role;
    return { ...usersState[idx] };
  },

  /**
   * [API 6.4] Khóa hoặc mở khóa tài khoản nhân viên (ACTIVE / LOCKED)
   * -------------------------------------------------------------
   * @route PATCH /api/users/:userId/status
   * @access ADMIN
   */
  async toggleUserStatus(userId: string): Promise<User> {
    if (API_URL) {
      const res = await fetch(`${API_URL}/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Không thể thay đổi trạng thái người dùng');
      return res.json();
    }

    await delay();
    const idx = usersState.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Không tìm thấy người dùng');
    usersState[idx].status =
      usersState[idx].status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    return { ...usersState[idx] };
  },
};
