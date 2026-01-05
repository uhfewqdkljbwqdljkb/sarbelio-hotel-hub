import { InventoryItem } from '@/types/inventory';

export interface MinimarketSale {
  id: string;
  items: MinimarketSaleItem[];
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'ROOM_CHARGE';
  roomNumber?: string;
  createdAt: string;
  cashierName: string;
}

export interface MinimarketSaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const MINIMARKET_SALES: MinimarketSale[] = [
  {
    id: 'ms1',
    items: [
      { itemId: 'inv11', itemName: 'Potato Chips', quantity: 2, unitPrice: 3.50, total: 7.00 },
      { itemId: 'inv13', itemName: 'Bottled Water', quantity: 3, unitPrice: 1.50, total: 4.50 },
    ],
    total: 11.50,
    paymentMethod: 'ROOM_CHARGE',
    roomNumber: '205',
    createdAt: '2024-01-15T10:30:00Z',
    cashierName: 'Maria Santos',
  },
  {
    id: 'ms2',
    items: [
      { itemId: 'inv15', itemName: 'Sunscreen SPF50', quantity: 1, unitPrice: 18.00, total: 18.00 },
    ],
    total: 18.00,
    paymentMethod: 'CARD',
    createdAt: '2024-01-15T11:45:00Z',
    cashierName: 'John Smith',
  },
  {
    id: 'ms3',
    items: [
      { itemId: 'inv17', itemName: 'Local Souvenir Magnet', quantity: 3, unitPrice: 6.00, total: 18.00 },
      { itemId: 'inv18', itemName: 'Postcard Set', quantity: 2, unitPrice: 3.00, total: 6.00 },
    ],
    total: 24.00,
    paymentMethod: 'CASH',
    createdAt: '2024-01-15T14:20:00Z',
    cashierName: 'Maria Santos',
  },
];
