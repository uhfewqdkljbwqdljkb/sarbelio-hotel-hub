import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
}

// Room Types
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_ORDER' | 'OUT_OF_SERVICE';
export type CleaningStatus = 'CLEAN' | 'DIRTY' | 'IN_PROGRESS' | 'INSPECTED';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  name: string;
  description: string;
  price: number;
  weekdayPrice?: number;
  weekendPrice?: number;
  dayStayPrice?: number;
  capacity: number;
  amenities: string[];
  imageUrl: string;
  images?: RoomImage[];
  size: number;
  status: RoomStatus;
  cleaningStatus: CleaningStatus;
  nextReservation?: string;
}

export interface RoomImage {
  id: string;
  roomId: string;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  totalRooms: number;
  amenities: string[];
  imageUrl: string;
}

// Reservation Types
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
export type BookingSource = 'DIRECT' | 'WEBSITE' | 'BOOKING_COM' | 'EXPEDIA' | 'AIRBNB' | 'WALK_IN';

// Sales & Commission Types
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'DEPOSIT_PAID' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'WHISH' | 'OMT' | 'OTHER';

export interface Reservation {
  id: string;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
  phone?: string;
  roomId?: string;
  roomName?: string;
  roomTypeId?: string;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  nights: number;
  guests: number;
  totalAmount: number;
  status: ReservationStatus;
  source: BookingSource;
  createdAt: string;
  isDayStay?: boolean;
  extraBedCount?: number;
  extraWoodCount?: number;
  discountAmount?: number;
  topUpAmount?: number;
  
  // Sales & Commission Tracking
  createdByUserId?: string;
  createdByUserName?: string;
  commissionRate?: number;
  commissionAmount?: number;
  commissionStatus?: CommissionStatus;
  
  // Deposit Tracking
  depositAmount?: number;
  depositDate?: string;
  depositMethod?: PaymentMethod;
  depositReceivedBy?: string;
  balanceDue?: number;
  paymentStatus?: PaymentStatus;
}

export interface CommissionProfile {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  baseCommissionRate: number;
  tieredRates?: CommissionTier[];
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionTier {
  minSalesAmount: number;
  commissionRate: number;
}

export interface DepositTransaction {
  id: string;
  reservationId: string;
  reservationCode?: string;
  guestName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receivedByUserId: string;
  receivedByUserName?: string;
  transactionDate: string;
  notes?: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface SalesRecord {
  id: string;
  userId: string;
  userName: string;
  period: string;
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  commissionStatus: CommissionStatus;
  paidDate?: string;
}

export interface SalesLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  conversionRate?: number;
}

export interface SalesStats {
  totalRevenue: number;
  totalBookings: number;
  totalCommissions: number;
  pendingDeposits: number;
  collectedDeposits: number;
  averageBookingValue: number;
}

// Guest Types
export type LoyaltyTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  totalSpent: number;
  totalStays: number;
  lastStay?: string;
}

// Review Types
export interface ReviewStat {
  date: string;
  positive: number;
  negative: number;
}

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  avatar: string;
  text: string;
}

export interface RatingBreakdown {
  label: string;
  score: number;
}
