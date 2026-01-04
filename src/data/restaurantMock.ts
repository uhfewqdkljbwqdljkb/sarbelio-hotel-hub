import { RestaurantTable, MenuItem, MenuCategory, POSOrder } from '@/types/restaurant';

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'cat_1', name: 'Starters', icon: '🥗' },
  { id: 'cat_2', name: 'Main Course', icon: '🍽️' },
  { id: 'cat_3', name: 'Seafood', icon: '🦐' },
  { id: 'cat_4', name: 'Desserts', icon: '🍰' },
  { id: 'cat_5', name: 'Drinks', icon: '🍹' },
  { id: 'cat_6', name: 'Wine', icon: '🍷' },
];

export const MENU_ITEMS: MenuItem[] = [
  // Starters
  { id: 'mi_1', categoryId: 'cat_1', name: 'Caesar Salad', description: 'Romaine lettuce, parmesan, croutons', price: 14.00, isAvailable: true },
  { id: 'mi_2', categoryId: 'cat_1', name: 'Bruschetta', description: 'Toasted bread with tomatoes & basil', price: 12.00, isAvailable: true },
  { id: 'mi_3', categoryId: 'cat_1', name: 'Soup of the Day', description: 'Chef\'s daily selection', price: 10.00, isAvailable: true },
  { id: 'mi_4', categoryId: 'cat_1', name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, basil', price: 16.00, isAvailable: true },
  
  // Main Course
  { id: 'mi_5', categoryId: 'cat_2', name: 'Wagyu Steak', description: '8oz premium wagyu, seasonal vegetables', price: 58.00, isAvailable: true },
  { id: 'mi_6', categoryId: 'cat_2', name: 'Truffle Risotto', description: 'Arborio rice, black truffle, parmesan', price: 34.00, isAvailable: true },
  { id: 'mi_7', categoryId: 'cat_2', name: 'Lamb Chops', description: 'Herb-crusted, mint sauce', price: 42.00, isAvailable: true },
  { id: 'mi_8', categoryId: 'cat_2', name: 'Chicken Supreme', description: 'Pan-roasted, mushroom sauce', price: 28.00, isAvailable: true },
  
  // Seafood
  { id: 'mi_9', categoryId: 'cat_3', name: 'Grilled Salmon', description: 'Atlantic salmon, lemon butter', price: 32.00, isAvailable: true },
  { id: 'mi_10', categoryId: 'cat_3', name: 'Lobster Tail', description: 'Butter poached, drawn butter', price: 65.00, isAvailable: true },
  { id: 'mi_11', categoryId: 'cat_3', name: 'Seafood Platter', description: 'Prawns, oysters, crab', price: 85.00, isAvailable: false },
  
  // Desserts
  { id: 'mi_12', categoryId: 'cat_4', name: 'Tiramisu', description: 'Classic Italian dessert', price: 12.00, isAvailable: true },
  { id: 'mi_13', categoryId: 'cat_4', name: 'Crème Brûlée', description: 'Vanilla custard, caramelized sugar', price: 14.00, isAvailable: true },
  { id: 'mi_14', categoryId: 'cat_4', name: 'Chocolate Fondant', description: 'Molten center, vanilla ice cream', price: 16.00, isAvailable: true },
  
  // Drinks
  { id: 'mi_15', categoryId: 'cat_5', name: 'Espresso', description: 'Double shot', price: 4.00, isAvailable: true },
  { id: 'mi_16', categoryId: 'cat_5', name: 'Fresh Orange Juice', description: 'Freshly squeezed', price: 6.00, isAvailable: true },
  { id: 'mi_17', categoryId: 'cat_5', name: 'Mojito', description: 'Rum, mint, lime, soda', price: 14.00, isAvailable: true },
  { id: 'mi_18', categoryId: 'cat_5', name: 'Sparkling Water', description: 'San Pellegrino 750ml', price: 8.00, isAvailable: true },
  
  // Wine
  { id: 'mi_19', categoryId: 'cat_6', name: 'House Red', description: 'Cabernet Sauvignon (glass)', price: 12.00, isAvailable: true },
  { id: 'mi_20', categoryId: 'cat_6', name: 'House White', description: 'Chardonnay (glass)', price: 11.00, isAvailable: true },
  { id: 'mi_21', categoryId: 'cat_6', name: 'Champagne', description: 'Moët & Chandon (bottle)', price: 95.00, isAvailable: true },
];

export const TABLES: RestaurantTable[] = [
  // Indoor Tables
  { id: 't_1', number: '1', capacity: 2, status: 'AVAILABLE', zone: 'INDOOR' },
  { id: 't_2', number: '2', capacity: 2, status: 'OCCUPIED', currentOrderId: 'ord_1', zone: 'INDOOR' },
  { id: 't_3', number: '3', capacity: 4, status: 'AVAILABLE', zone: 'INDOOR' },
  { id: 't_4', number: '4', capacity: 4, status: 'OCCUPIED', currentOrderId: 'ord_2', zone: 'INDOOR' },
  { id: 't_5', number: '5', capacity: 6, status: 'RESERVED', zone: 'INDOOR' },
  { id: 't_6', number: '6', capacity: 4, status: 'CLEANING', zone: 'INDOOR' },
  
  // Terrace Tables
  { id: 't_7', number: 'T1', capacity: 2, status: 'AVAILABLE', zone: 'TERRACE' },
  { id: 't_8', number: 'T2', capacity: 4, status: 'OCCUPIED', currentOrderId: 'ord_3', zone: 'TERRACE' },
  { id: 't_9', number: 'T3', capacity: 4, status: 'AVAILABLE', zone: 'TERRACE' },
  { id: 't_10', number: 'T4', capacity: 6, status: 'RESERVED', zone: 'TERRACE' },
  
  // Bar
  { id: 't_11', number: 'B1', capacity: 2, status: 'OCCUPIED', currentOrderId: 'ord_4', zone: 'BAR' },
  { id: 't_12', number: 'B2', capacity: 2, status: 'AVAILABLE', zone: 'BAR' },
];

export const INITIAL_ORDERS: POSOrder[] = [
  {
    id: 'ord_1',
    tableId: 't_2',
    tableNumber: '2',
    items: [
      { id: 'oi_1', menuItemId: 'mi_1', name: 'Caesar Salad', price: 14.00, quantity: 2 },
      { id: 'oi_2', menuItemId: 'mi_5', name: 'Wagyu Steak', price: 58.00, quantity: 1 },
      { id: 'oi_3', menuItemId: 'mi_19', name: 'House Red', price: 12.00, quantity: 2 },
    ],
    status: 'SERVED',
    totalAmount: 96.00,
    openedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    guestCount: 2
  },
  {
    id: 'ord_2',
    tableId: 't_4',
    tableNumber: '4',
    items: [
      { id: 'oi_4', menuItemId: 'mi_6', name: 'Truffle Risotto', price: 34.00, quantity: 2 },
      { id: 'oi_5', menuItemId: 'mi_9', name: 'Grilled Salmon', price: 32.00, quantity: 2 },
      { id: 'oi_6', menuItemId: 'mi_21', name: 'Champagne', price: 95.00, quantity: 1 },
    ],
    status: 'KITCHEN',
    totalAmount: 227.00,
    openedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    guestCount: 4
  },
  {
    id: 'ord_3',
    tableId: 't_8',
    tableNumber: 'T2',
    items: [
      { id: 'oi_7', menuItemId: 'mi_2', name: 'Bruschetta', price: 12.00, quantity: 1 },
      { id: 'oi_8', menuItemId: 'mi_17', name: 'Mojito', price: 14.00, quantity: 2 },
    ],
    status: 'OPEN',
    totalAmount: 40.00,
    openedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    guestCount: 2
  },
  {
    id: 'ord_4',
    tableId: 't_11',
    tableNumber: 'B1',
    items: [
      { id: 'oi_9', menuItemId: 'mi_15', name: 'Espresso', price: 4.00, quantity: 2 },
      { id: 'oi_10', menuItemId: 'mi_12', name: 'Tiramisu', price: 12.00, quantity: 1 },
    ],
    status: 'SERVED',
    totalAmount: 20.00,
    openedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    guestCount: 2
  },
];
