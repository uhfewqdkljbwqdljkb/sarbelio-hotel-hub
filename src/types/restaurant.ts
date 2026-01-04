// Restaurant & POS Types

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
export type OrderStatus = 'OPEN' | 'KITCHEN' | 'SERVED' | 'PAID';
export type TableZone = 'INDOOR' | 'TERRACE' | 'BAR';

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
}

export interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  zone: TableZone;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface POSOrder {
  id: string;
  tableId: string;
  tableNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  openedAt: string;
  guestCount?: number;
}
