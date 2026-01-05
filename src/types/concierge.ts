export type ServiceCategory = 'TRANSPORT' | 'SPA' | 'TOUR' | 'RESTAURANT' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'OTHER';
export type RequestStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type RequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface ServiceRequest {
  id: string;
  guestName: string;
  roomNumber: string;
  category: ServiceCategory;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  requestedAt: string;
  scheduledFor?: string;
  completedAt?: string;
  assignedTo?: string;
  notes?: string;
  cost?: number;
}

export interface ConciergeService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  duration?: number;
  isAvailable: boolean;
}
