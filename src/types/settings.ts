export interface HotelProfile {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  currency: string;
  checkInTime: string;
  checkOutTime: string;
  totalRooms: number;
  starRating: number;
}

export interface Integration {
  id: string;
  name: string;
  type: 'OTA' | 'PAYMENT' | 'PMS' | 'CRM' | 'ACCOUNTING' | 'OTHER';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSync?: string;
  config?: Record<string, string>;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
  createdAt: string;
}
