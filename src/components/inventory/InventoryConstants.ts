import { InventoryCategory, ItemDestination, StockStatus, PurchaseOrderStatus } from '@/types/inventory';

export const categoryLabels: Record<InventoryCategory, string> = {
  FOOD: 'Food', 
  BEVERAGE: 'Beverage', 
  HOUSEKEEPING: 'Housekeeping',
  LINEN: 'Linen', 
  MAINTENANCE: 'Maintenance', 
  OFFICE: 'Office', 
  AMENITIES: 'Amenities',
  SNACKS: 'Snacks', 
  TOILETRIES: 'Toiletries', 
  SOUVENIRS: 'Souvenirs'
};

export const destinationLabels: Record<ItemDestination, string> = {
  RESTAURANT: 'Restaurant', 
  MINIMARKET: 'Minimarket', 
  BOTH: 'Both', 
  INTERNAL: 'Internal Use'
};

export const destinationColors: Record<ItemDestination, string> = {
  RESTAURANT: 'bg-orange-100 text-orange-700',
  MINIMARKET: 'bg-blue-100 text-blue-700',
  BOTH: 'bg-purple-100 text-purple-700',
  INTERNAL: 'bg-gray-100 text-gray-700',
};

export const statusColors: Record<StockStatus, string> = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
  REORDER: 'bg-orange-100 text-orange-700',
};

export const poStatusColors: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ORDERED: 'bg-purple-100 text-purple-700',
  RECEIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export const getStockStatus = (quantity: number, minStock: number): StockStatus => {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity <= minStock) return 'LOW_STOCK';
  return 'IN_STOCK';
};
