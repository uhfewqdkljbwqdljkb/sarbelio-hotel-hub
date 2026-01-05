import { ChartOfAccount, Invoice, Transaction, RevenueData } from '@/types/financials';

export const CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  { id: 'acc1', code: '1000', name: 'Cash', type: 'ASSET', balance: 125000.00, isActive: true },
  { id: 'acc2', code: '1100', name: 'Accounts Receivable', type: 'ASSET', balance: 45000.00, isActive: true },
  { id: 'acc3', code: '1200', name: 'Inventory', type: 'ASSET', balance: 32000.00, isActive: true },
  { id: 'acc4', code: '2000', name: 'Accounts Payable', type: 'LIABILITY', balance: 28000.00, isActive: true },
  { id: 'acc5', code: '2100', name: 'Accrued Expenses', type: 'LIABILITY', balance: 12000.00, isActive: true },
  { id: 'acc6', code: '3000', name: 'Owner\'s Equity', type: 'EQUITY', balance: 500000.00, isActive: true },
  { id: 'acc7', code: '4000', name: 'Room Revenue', type: 'REVENUE', balance: 185000.00, isActive: true },
  { id: 'acc8', code: '4100', name: 'F&B Revenue', type: 'REVENUE', balance: 62000.00, isActive: true },
  { id: 'acc9', code: '4200', name: 'Other Revenue', type: 'REVENUE', balance: 15000.00, isActive: true },
  { id: 'acc10', code: '5000', name: 'Salaries & Wages', type: 'EXPENSE', balance: 75000.00, isActive: true },
  { id: 'acc11', code: '5100', name: 'Utilities', type: 'EXPENSE', balance: 18000.00, isActive: true },
  { id: 'acc12', code: '5200', name: 'Supplies', type: 'EXPENSE', balance: 22000.00, isActive: true },
];

export const INVOICES: Invoice[] = [
  { id: 'inv1', invoiceNumber: 'INV-2024-0101', type: 'RECEIVABLE', customerOrVendor: 'Corporate Travel Inc.', amount: 5400.00, dueDate: '2024-01-25', status: 'PENDING', items: [{ description: 'Room Booking (3 nights x 6 rooms)', quantity: 18, unitPrice: 300.00, total: 5400.00 }], createdAt: '2024-01-10' },
  { id: 'inv2', invoiceNumber: 'INV-2024-0102', type: 'PAYABLE', customerOrVendor: 'Global Foods Co.', amount: 2850.00, dueDate: '2024-01-20', status: 'PAID', items: [{ description: 'Monthly Food Supplies', quantity: 1, unitPrice: 2850.00, total: 2850.00 }], createdAt: '2024-01-05', paidAt: '2024-01-15' },
  { id: 'inv3', invoiceNumber: 'INV-2024-0103', type: 'RECEIVABLE', customerOrVendor: 'Wedding Party - Johnson', amount: 12500.00, dueDate: '2024-01-30', status: 'PENDING', items: [{ description: 'Event Venue Rental', quantity: 1, unitPrice: 8000.00, total: 8000.00 }, { description: 'Catering Service', quantity: 1, unitPrice: 4500.00, total: 4500.00 }], createdAt: '2024-01-12' },
  { id: 'inv4', invoiceNumber: 'INV-2024-0104', type: 'PAYABLE', customerOrVendor: 'Utility Company', amount: 4200.00, dueDate: '2024-01-18', status: 'OVERDUE', items: [{ description: 'Electricity - December', quantity: 1, unitPrice: 4200.00, total: 4200.00 }], createdAt: '2024-01-02' },
  { id: 'inv5', invoiceNumber: 'INV-2024-0105', type: 'RECEIVABLE', customerOrVendor: 'Guest - Smith Family', amount: 1850.00, dueDate: '2024-01-22', status: 'PAID', items: [{ description: 'Room Charges', quantity: 5, unitPrice: 320.00, total: 1600.00 }, { description: 'Room Service', quantity: 1, unitPrice: 250.00, total: 250.00 }], createdAt: '2024-01-08', paidAt: '2024-01-20' },
];

export const TRANSACTIONS: Transaction[] = [
  { id: 'tr1', date: '2024-01-15', description: 'Room Revenue - Walk-in Guest', accountId: 'acc7', accountName: 'Room Revenue', type: 'CREDIT', amount: 450.00, reference: 'RES-2024-0156', category: 'Revenue' },
  { id: 'tr2', date: '2024-01-15', description: 'Restaurant Sales', accountId: 'acc8', accountName: 'F&B Revenue', type: 'CREDIT', amount: 1250.00, reference: 'POS-2024-0892', category: 'Revenue' },
  { id: 'tr3', date: '2024-01-14', description: 'Supplier Payment - Global Foods', accountId: 'acc4', accountName: 'Accounts Payable', type: 'DEBIT', amount: 2850.00, reference: 'PAY-2024-0045', category: 'Expense' },
  { id: 'tr4', date: '2024-01-14', description: 'Staff Payroll', accountId: 'acc10', accountName: 'Salaries & Wages', type: 'DEBIT', amount: 18500.00, reference: 'PAY-2024-0044', category: 'Expense' },
  { id: 'tr5', date: '2024-01-13', description: 'Corporate Booking Deposit', accountId: 'acc2', accountName: 'Accounts Receivable', type: 'CREDIT', amount: 5400.00, reference: 'DEP-2024-0012', category: 'Revenue' },
  { id: 'tr6', date: '2024-01-12', description: 'Utility Bill Payment', accountId: 'acc11', accountName: 'Utilities', type: 'DEBIT', amount: 3200.00, reference: 'PAY-2024-0043', category: 'Expense' },
  { id: 'tr7', date: '2024-01-12', description: 'Spa Services Revenue', accountId: 'acc9', accountName: 'Other Revenue', type: 'CREDIT', amount: 680.00, reference: 'SPA-2024-0089', category: 'Revenue' },
  { id: 'tr8', date: '2024-01-11', description: 'Housekeeping Supplies', accountId: 'acc12', accountName: 'Supplies', type: 'DEBIT', amount: 890.00, reference: 'PO-2024-0078', category: 'Expense' },
];

export const REVENUE_DATA: RevenueData[] = [
  { date: 'Jan 1', rooms: 4500, restaurant: 1800, services: 450, total: 6750 },
  { date: 'Jan 2', rooms: 5200, restaurant: 2100, services: 320, total: 7620 },
  { date: 'Jan 3', rooms: 4800, restaurant: 1950, services: 580, total: 7330 },
  { date: 'Jan 4', rooms: 6100, restaurant: 2400, services: 720, total: 9220 },
  { date: 'Jan 5', rooms: 7200, restaurant: 2800, services: 890, total: 10890 },
  { date: 'Jan 6', rooms: 7800, restaurant: 3100, services: 950, total: 11850 },
  { date: 'Jan 7', rooms: 6500, restaurant: 2600, services: 680, total: 9780 },
  { date: 'Jan 8', rooms: 5100, restaurant: 2000, services: 420, total: 7520 },
  { date: 'Jan 9', rooms: 4900, restaurant: 1850, services: 380, total: 7130 },
  { date: 'Jan 10', rooms: 5600, restaurant: 2200, services: 520, total: 8320 },
  { date: 'Jan 11', rooms: 6200, restaurant: 2500, services: 650, total: 9350 },
  { date: 'Jan 12', rooms: 6800, restaurant: 2700, services: 780, total: 10280 },
  { date: 'Jan 13', rooms: 7500, restaurant: 3000, services: 920, total: 11420 },
  { date: 'Jan 14', rooms: 7100, restaurant: 2850, services: 850, total: 10800 },
];
