/**
 * ============================================================================
 * TÊN FILE: index.ts
 * VỊ TRÍ: src/types/index.ts
 * PHÂN HỆ: Định nghĩa Kiểu Dữ liệu Toàn cục (Global Domain Types & Models)
 * ----------------------------------------------------------------------------
 * TỔNG QUAN VÀ NGUYÊN LÝ HOẠT ĐỘNG:
 * - Trung tâm chuẩn hóa dữ liệu (Single Source of Truth) cho toàn bộ dự án Nitro Grand Hotel.
 * - Khai báo hệ thống phân quyền 4 cấp (UserRole): CUSTOMER, FRONT_DESK, MANAGER, ADMIN.
 * - Chuẩn hóa vòng đời Đặt phòng (BookingStatus): PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT.
 * - Chuẩn hóa trạng thái vận hành Phòng (RoomStatus): AVAILABLE, RESERVED, OCCUPIED, CLEANING, MAINTENANCE.
 * - Định nghĩa các thực thể cốt lõi: RoomType (Loại phòng), Room (Phòng vật lý),
 *   Booking (Đơn đặt phòng), Service/Amenity (Dịch vụ gia tăng), User & Customer Profile,
 *   AuditLog (Nhật ký hành động nhân viên), Dashboard/Report Stats (Thống kê quản trị).
 * ============================================================================
 */

// ==========================================
// 1. Phân quyền và Trạng thái Nghiệp vụ
// ==========================================
export type UserRole = 'CUSTOMER' | 'FRONT_DESK' | 'MANAGER' | 'ADMIN';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NO_SHOW';

export type RoomStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'OCCUPIED'
  | 'CLEANING'
  | 'MAINTENANCE';

export type BookingSource = 'WEB' | 'MOBILE' | 'COUNTER' | 'OTA';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'MOMO'
  | 'ZALOPAY'
  | 'VNPAY'
  | 'CASH'
  | 'BANK_TRANSFER'
  | string;

export interface RoomType {
  id: string;
  code: 'STD' | 'SUP' | 'DLX' | 'FAM' | 'EXE' | 'PRE' | string;
  name: string;
  nameEn?: string;
  area: number; // m²
  maxGuests?: number;
  capacityAdults?: number;
  capacityChildren?: number;
  bedType?: string;
  bedTypeEn?: string;
  basePrice: number; // VND per night
  amenities: string[];
  image?: string;
  images: string[];
  description: string;
  descriptionEn?: string;
  totalRooms?: number;
}

export interface Room {
  id: string;
  number: string; // e.g. "101", "302"
  roomNumber?: string; // alias
  floor: number;
  roomTypeId: string;
  roomType?: RoomType;
  roomTypeName?: string;
  roomTypeCode?: string;
  status: RoomStatus;
  isClean?: boolean;
  guestName?: string;
  currentBookingId?: string;
  currentGuestName?: string;
  checkoutTime?: string;
  note?: string;
  updatedAt?: string;
}

export interface ExtraServiceItem {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  quantity?: number;
  unit?: string;
  unitEn?: string;
  calculationType?: 'PER_ROOM' | 'PER_GUEST' | 'PER_NIGHT' | 'PER_TIME';
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. "NTR-260921-0042"
  guestId?: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestIdCard?: string;
  guestNationality?: string;
  roomNumber?: string;
  roomTypeId: string;
  roomTypeName: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  estimatedArrivalTime?: string;
  nights: number;
  adults: number;
  children: number;
  roomsCount?: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
  status: BookingStatus;
  source: BookingSource;
  createdAt: string;
  notes?: string;
  specialRequests?: string;
  extraServices?: ExtraServiceItem[];
  discountCode?: string;
  discountAmount?: number;
  serviceFee?: number;
  vatAmount?: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  cancellationReason?: string;
  refundAmount?: number;
}

export interface Guest {
  id: string;
  name?: string;
  fullName?: string;
  phone: string;
  email: string;
  idCardNumber?: string;
  identityNumber?: string;
  nationality?: string;
  notes?: string;
  totalSpent: number;
  totalStays?: number;
  totalBookings?: number;
  vipTier?: string;
  lastStay?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status?: 'ACTIVE' | 'LOCKED';
  lastLogin?: string;
  avatar?: string;
  password?: string;
}

export interface HotelService {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  unit: string;
  unitEn?: string;
  category?: string;
  description: string;
  descriptionEn?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  isActive?: boolean;
  icon?: string;
}

export type Service = HotelService;

export interface DashboardStats {
  occupancyRate: number;
  occupancyDiff?: number;
  revenue: number;
  revenueDiff?: number;
  totalBookings: number;
  bookingsDiff?: number;
  cancellationRate: number;
  cancellationDiff?: number;
  availableRooms: number;
  totalRooms?: number;
  sourceBreakdown: {
    source: string;
    percentage?: number;
    count: number;
  }[];
  roomStatusCounts: any;
  revenueByDay?: {
    date: string;
    amount: number;
  }[];
  roomTypeRevenue?: {
    name: string;
    revenue: number;
  }[];
  topRoomTypes?: any[];
  dailyOccupancy?: any[];
  dailyRevenue?: any[];
  bookingTrends?: any[];
  [key: string]: any;
}

export interface DashboardMetrics extends DashboardStats {}
