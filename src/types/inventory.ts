export type InventoryCategory = 'FOOD' | 'BEVERAGE' | 'HOUSEKEEPING' | 'LINEN' | 'MAINTENANCE' | 'OFFICE' | 'AMENITIES';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER';
export type PurchaseOrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  unitCost: number;
  supplier?: string;
  status: StockStatus;
  lastRestocked?: string;
  location?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  categories: InventoryCategory[];
  rating: number;
  totalOrders: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  totalAmount: number;
  createdAt: string;
  expectedDelivery?: string;
  notes?: string;
  isTemplate?: boolean;
  templateName?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface OrderTemplate {
  id: string;
  name: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  createdAt: string;
}
