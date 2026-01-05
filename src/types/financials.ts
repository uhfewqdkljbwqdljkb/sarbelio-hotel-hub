export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type TransactionType = 'CREDIT' | 'DEBIT';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  parentId?: string;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'RECEIVABLE' | 'PAYABLE';
  customerOrVendor: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  createdAt: string;
  paidAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  accountId: string;
  accountName: string;
  type: TransactionType;
  amount: number;
  reference?: string;
  category: string;
}

export interface RevenueData {
  date: string;
  rooms: number;
  restaurant: number;
  services: number;
  total: number;
}
