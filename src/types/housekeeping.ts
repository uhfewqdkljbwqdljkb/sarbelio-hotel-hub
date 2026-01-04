export type TaskType = 'CHECKOUT_CLEAN' | 'STAY_OVER' | 'DEEP_CLEAN' | 'TURNDOWN' | 'INSPECTION';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
export type LaundryCategory = 'LINENS' | 'TOWELS' | 'UNIFORMS' | 'GUEST_ITEMS';
export type LaundryStatus = 'IN_STOCK' | 'IN_LAUNDRY' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  roomId: string;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  assignedToId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  estimatedMinutes: number;
}

export interface HousekeepingStaff {
  id: string;
  name: string;
  avatar?: string;
  currentTasks: number;
  completedToday: number;
  status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
}

export interface LaundryItem {
  id: string;
  name: string;
  category: LaundryCategory;
  inStock: number;
  inLaundry: number;
  minStock: number;
  status: LaundryStatus;
  lastUpdated: string;
}

export interface RoomCleaningStatus {
  roomId: string;
  roomNumber: string;
  floor: number;
  cleaningStatus: 'CLEAN' | 'DIRTY' | 'IN_PROGRESS' | 'INSPECTED';
  roomStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_ORDER' | 'OUT_OF_SERVICE';
  lastCleaned?: string;
  assignedTo?: string;
  guestCheckout?: string;
  priority: TaskPriority;
}
