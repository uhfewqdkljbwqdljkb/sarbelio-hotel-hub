import { InventoryItem, Supplier, PurchaseOrder } from '@/types/inventory';

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'inv1', name: 'Coffee Beans (Premium)', sku: 'BEV-001', category: 'BEVERAGE', quantity: 25, unit: 'kg', minStock: 10, maxStock: 50, unitCost: 45.00, sellPrice: 55.00, supplier: 'Global Foods Co.', status: 'IN_STOCK', location: 'Kitchen Storage', destination: 'RESTAURANT' },
  { id: 'inv2', name: 'Olive Oil (Extra Virgin)', sku: 'FOOD-002', category: 'FOOD', quantity: 8, unit: 'liters', minStock: 10, maxStock: 30, unitCost: 18.50, supplier: 'Mediterranean Imports', status: 'LOW_STOCK', location: 'Kitchen Storage', destination: 'RESTAURANT' },
  { id: 'inv3', name: 'Bath Towels (White)', sku: 'LIN-001', category: 'LINEN', quantity: 150, unit: 'pcs', minStock: 100, maxStock: 300, unitCost: 12.00, supplier: 'Hotel Linens Inc.', status: 'IN_STOCK', location: 'Laundry Room', destination: 'INTERNAL' },
  { id: 'inv4', name: 'Hand Soap (Luxury)', sku: 'AME-001', category: 'AMENITIES', quantity: 200, unit: 'bottles', minStock: 150, maxStock: 500, unitCost: 3.50, sellPrice: 8.00, supplier: 'Luxury Amenities Ltd.', status: 'IN_STOCK', location: 'Housekeeping Storage', destination: 'MINIMARKET' },
  { id: 'inv5', name: 'Cleaning Solution (All-Purpose)', sku: 'HK-001', category: 'HOUSEKEEPING', quantity: 45, unit: 'liters', minStock: 20, maxStock: 100, unitCost: 8.00, supplier: 'CleanPro Supplies', status: 'IN_STOCK', location: 'Housekeeping Storage', destination: 'INTERNAL' },
  { id: 'inv6', name: 'Red Wine (House)', sku: 'BEV-010', category: 'BEVERAGE', quantity: 3, unit: 'bottles', minStock: 24, maxStock: 60, unitCost: 25.00, sellPrice: 45.00, supplier: 'Wine Distributors', status: 'OUT_OF_STOCK', location: 'Wine Cellar', destination: 'BOTH' },
  { id: 'inv7', name: 'Printer Paper', sku: 'OFF-001', category: 'OFFICE', quantity: 20, unit: 'reams', minStock: 15, maxStock: 50, unitCost: 6.00, supplier: 'Office Depot', status: 'IN_STOCK', location: 'Front Desk Storage', destination: 'INTERNAL' },
  { id: 'inv8', name: 'Light Bulbs (LED)', sku: 'MAINT-001', category: 'MAINTENANCE', quantity: 50, unit: 'pcs', minStock: 30, maxStock: 100, unitCost: 8.50, supplier: 'Electrical Supplies Co.', status: 'IN_STOCK', location: 'Maintenance Room', destination: 'INTERNAL' },
  { id: 'inv9', name: 'Shampoo (Deluxe)', sku: 'AME-002', category: 'TOILETRIES', quantity: 80, unit: 'bottles', minStock: 100, maxStock: 400, unitCost: 4.00, sellPrice: 12.00, supplier: 'Luxury Amenities Ltd.', status: 'LOW_STOCK', location: 'Housekeeping Storage', destination: 'MINIMARKET' },
  { id: 'inv10', name: 'Fresh Salmon', sku: 'FOOD-015', category: 'FOOD', quantity: 15, unit: 'kg', minStock: 10, maxStock: 30, unitCost: 35.00, supplier: 'Fresh Seafood Market', status: 'IN_STOCK', location: 'Kitchen Cold Storage', destination: 'RESTAURANT' },
  // Minimarket specific items
  { id: 'inv11', name: 'Potato Chips (Assorted)', sku: 'SNK-001', category: 'SNACKS', quantity: 50, unit: 'pcs', minStock: 20, maxStock: 100, unitCost: 1.50, sellPrice: 3.50, supplier: 'Snack Distributors', status: 'IN_STOCK', location: 'Minimarket', destination: 'MINIMARKET' },
  { id: 'inv12', name: 'Chocolate Bars', sku: 'SNK-002', category: 'SNACKS', quantity: 80, unit: 'pcs', minStock: 30, maxStock: 150, unitCost: 1.00, sellPrice: 2.50, supplier: 'Snack Distributors', status: 'IN_STOCK', location: 'Minimarket', destination: 'MINIMARKET' },
  { id: 'inv13', name: 'Bottled Water (500ml)', sku: 'BEV-020', category: 'BEVERAGE', quantity: 200, unit: 'bottles', minStock: 100, maxStock: 500, unitCost: 0.30, sellPrice: 1.50, supplier: 'Global Foods Co.', status: 'IN_STOCK', location: 'Minimarket', destination: 'BOTH' },
  { id: 'inv14', name: 'Energy Drinks', sku: 'BEV-021', category: 'BEVERAGE', quantity: 45, unit: 'cans', minStock: 30, maxStock: 100, unitCost: 1.20, sellPrice: 3.00, supplier: 'Global Foods Co.', status: 'IN_STOCK', location: 'Minimarket', destination: 'MINIMARKET' },
  { id: 'inv15', name: 'Sunscreen SPF50', sku: 'TOI-001', category: 'TOILETRIES', quantity: 25, unit: 'bottles', minStock: 15, maxStock: 50, unitCost: 8.00, sellPrice: 18.00, supplier: 'Luxury Amenities Ltd.', status: 'IN_STOCK', location: 'Minimarket', destination: 'MINIMARKET' },
  { id: 'inv16', name: 'Toothbrush Kit', sku: 'TOI-002', category: 'TOILETRIES', quantity: 40, unit: 'kits', minStock: 20, maxStock: 80, unitCost: 2.00, sellPrice: 5.00, supplier: 'Luxury Amenities Ltd.', status: 'IN_STOCK', location: 'Minimarket', destination: 'MINIMARKET' },
  { id: 'inv17', name: 'Local Souvenir Magnet', sku: 'SOU-001', category: 'SOUVENIRS', quantity: 60, unit: 'pcs', minStock: 20, maxStock: 100, unitCost: 1.50, sellPrice: 6.00, supplier: 'Local Crafts Co.', status: 'IN_STOCK', location: 'Minimarket', destination: 'MINIMARKET' },
  { id: 'inv18', name: 'Postcard Set', sku: 'SOU-002', category: 'SOUVENIRS', quantity: 100, unit: 'sets', minStock: 30, maxStock: 150, unitCost: 0.50, sellPrice: 3.00, supplier: 'Local Crafts Co.', status: 'IN_STOCK', location: 'Minimarket', destination: 'MINIMARKET' },
  { id: 'inv19', name: 'Soft Drinks (Assorted)', sku: 'BEV-022', category: 'BEVERAGE', quantity: 120, unit: 'cans', minStock: 50, maxStock: 200, unitCost: 0.50, sellPrice: 2.00, supplier: 'Global Foods Co.', status: 'IN_STOCK', location: 'Minimarket', destination: 'BOTH' },
  { id: 'inv20', name: 'Nuts & Trail Mix', sku: 'SNK-003', category: 'SNACKS', quantity: 35, unit: 'packs', minStock: 20, maxStock: 80, unitCost: 2.50, sellPrice: 5.50, supplier: 'Snack Distributors', status: 'IN_STOCK', location: 'Minimarket', destination: 'MINIMARKET' },
];

export const SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Global Foods Co.', email: 'orders@globalfoods.com', phone: '+1 555-0101', address: '123 Food District', categories: ['FOOD', 'BEVERAGE'], rating: 4.5, totalOrders: 156 },
  { id: 'sup2', name: 'Hotel Linens Inc.', email: 'sales@hotellinens.com', phone: '+1 555-0102', address: '456 Textile Ave', categories: ['LINEN'], rating: 4.8, totalOrders: 89 },
  { id: 'sup3', name: 'Luxury Amenities Ltd.', email: 'info@luxuryamenities.com', phone: '+1 555-0103', address: '789 Luxury Blvd', categories: ['AMENITIES', 'TOILETRIES'], rating: 4.7, totalOrders: 124 },
  { id: 'sup4', name: 'CleanPro Supplies', email: 'orders@cleanpro.com', phone: '+1 555-0104', address: '321 Clean Street', categories: ['HOUSEKEEPING'], rating: 4.3, totalOrders: 67 },
  { id: 'sup5', name: 'Wine Distributors', email: 'wine@winedist.com', phone: '+1 555-0105', address: '555 Vineyard Road', categories: ['BEVERAGE'], rating: 4.6, totalOrders: 45 },
  { id: 'sup6', name: 'Snack Distributors', email: 'orders@snackdist.com', phone: '+1 555-0106', address: '888 Snack Lane', categories: ['SNACKS', 'BEVERAGE'], rating: 4.4, totalOrders: 78 },
  { id: 'sup7', name: 'Local Crafts Co.', email: 'hello@localcrafts.com', phone: '+1 555-0107', address: '999 Artisan Way', categories: ['SOUVENIRS'], rating: 4.9, totalOrders: 34 },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'po1', orderNumber: 'PO-2024-001', supplierId: 'sup1', supplierName: 'Global Foods Co.', items: [{ itemId: 'inv1', itemName: 'Coffee Beans', quantity: 20, unitCost: 45.00, total: 900.00 }], status: 'ORDERED', totalAmount: 900.00, createdAt: '2024-01-10', expectedDelivery: '2024-01-17' },
  { id: 'po2', orderNumber: 'PO-2024-002', supplierId: 'sup5', supplierName: 'Wine Distributors', items: [{ itemId: 'inv6', itemName: 'Red Wine (House)', quantity: 48, unitCost: 25.00, total: 1200.00 }], status: 'PENDING', totalAmount: 1200.00, createdAt: '2024-01-12' },
  { id: 'po3', orderNumber: 'PO-2024-003', supplierId: 'sup3', supplierName: 'Luxury Amenities Ltd.', items: [{ itemId: 'inv9', itemName: 'Shampoo (Deluxe)', quantity: 200, unitCost: 4.00, total: 800.00 }], status: 'APPROVED', totalAmount: 800.00, createdAt: '2024-01-14', expectedDelivery: '2024-01-20' },
  { id: 'po4', orderNumber: 'PO-2024-004', supplierId: 'sup2', supplierName: 'Hotel Linens Inc.', items: [{ itemId: 'inv3', itemName: 'Bath Towels', quantity: 100, unitCost: 12.00, total: 1200.00 }], status: 'RECEIVED', totalAmount: 1200.00, createdAt: '2024-01-05', expectedDelivery: '2024-01-10' },
];
