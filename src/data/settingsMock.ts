import { HotelProfile, Integration, SystemUser } from '@/types/settings';

export const HOTEL_PROFILE: HotelProfile = {
  id: 'hotel1',
  name: 'Sarbelio Grand Hotel',
  address: '123 Luxury Avenue',
  city: 'Barcelona',
  country: 'Spain',
  phone: '+34 93 123 4567',
  email: 'info@sarbelio.com',
  website: 'https://sarbelio.com',
  timezone: 'Europe/Madrid',
  currency: 'EUR',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  totalRooms: 120,
  starRating: 5,
};

export const INTEGRATIONS: Integration[] = [
  { id: 'int1', name: 'Booking.com', type: 'OTA', status: 'CONNECTED', lastSync: '2024-01-15T10:00:00Z' },
  { id: 'int2', name: 'Expedia', type: 'OTA', status: 'CONNECTED', lastSync: '2024-01-15T10:00:00Z' },
  { id: 'int3', name: 'Stripe', type: 'PAYMENT', status: 'CONNECTED', lastSync: '2024-01-15T12:00:00Z' },
  { id: 'int4', name: 'Airbnb', type: 'OTA', status: 'DISCONNECTED' },
  { id: 'int5', name: 'QuickBooks', type: 'ACCOUNTING', status: 'ERROR', lastSync: '2024-01-14T08:00:00Z' },
  { id: 'int6', name: 'Mailchimp', type: 'CRM', status: 'CONNECTED', lastSync: '2024-01-15T09:00:00Z' },
];

export const SYSTEM_USERS: SystemUser[] = [
  { id: 'usr1', name: 'Admin User', email: 'admin@sarbelio.com', role: 'ADMIN', department: 'Management', status: 'ACTIVE', lastLogin: '2024-01-15T08:00:00Z', createdAt: '2023-01-01' },
  { id: 'usr2', name: 'Maria Santos', email: 'maria.s@sarbelio.com', role: 'MANAGER', department: 'Front Office', status: 'ACTIVE', lastLogin: '2024-01-15T07:30:00Z', createdAt: '2023-03-15' },
  { id: 'usr3', name: 'John Smith', email: 'john.s@sarbelio.com', role: 'STAFF', department: 'Housekeeping', status: 'ACTIVE', lastLogin: '2024-01-14T16:00:00Z', createdAt: '2023-06-01' },
  { id: 'usr4', name: 'Elena Rodriguez', email: 'elena.r@sarbelio.com', role: 'MANAGER', department: 'Restaurant', status: 'ACTIVE', lastLogin: '2024-01-15T06:00:00Z', createdAt: '2023-02-20' },
  { id: 'usr5', name: 'Carlos Mendez', email: 'carlos.m@sarbelio.com', role: 'STAFF', department: 'Maintenance', status: 'ACTIVE', lastLogin: '2024-01-13T09:00:00Z', createdAt: '2023-08-10' },
  { id: 'usr6', name: 'Former Employee', email: 'former@sarbelio.com', role: 'VIEWER', department: 'Marketing', status: 'INACTIVE', createdAt: '2023-01-15' },
];
