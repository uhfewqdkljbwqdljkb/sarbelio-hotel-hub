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
  nights: number;
  guests: number;
  totalAmount: number;
  status: ReservationStatus;
  source: BookingSource;
  createdAt: string;
  isDayStay?: boolean;
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
