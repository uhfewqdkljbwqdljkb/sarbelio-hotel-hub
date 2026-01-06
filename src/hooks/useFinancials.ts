import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartOfAccount, Invoice, Transaction, RevenueData } from '@/types/financials';
import { format, subDays, parseISO, startOfDay } from 'date-fns';

// Fetch chart of accounts
export function useChartOfAccounts() {
  return useQuery({
    queryKey: ['chart-of-accounts'],
    queryFn: async (): Promise<ChartOfAccount[]> => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('code');
      if (error) throw error;
      return (data || []).map(a => ({
        id: a.id,
        code: a.code,
        name: a.name,
        type: a.account_type as ChartOfAccount['type'],
        balance: Number(a.balance) || 0,
        parentId: a.parent_id || undefined,
        isActive: a.is_active ?? true,
      }));
    },
  });
}

// Fetch invoices
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(i => ({
        id: i.id,
        invoiceNumber: i.invoice_number,
        type: i.invoice_type as 'RECEIVABLE' | 'PAYABLE',
        customerOrVendor: i.customer_or_vendor,
        amount: Number(i.amount),
        dueDate: i.due_date,
        status: i.status as Invoice['status'],
        items: Array.isArray(i.items) ? i.items as Invoice['items'] : [],
        createdAt: i.created_at || '',
        paidAt: i.paid_at || undefined,
      }));
    },
  });
}

// Fetch transactions
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map(t => ({
        id: t.id,
        date: t.date,
        description: t.description,
        accountId: t.account_id || '',
        accountName: t.account_name || '',
        type: t.transaction_type as Transaction['type'],
        amount: Number(t.amount),
        reference: t.reference || undefined,
        category: t.category || '',
      }));
    },
  });
}

// Aggregate revenue data from reservations, restaurant orders, and minimarket sales
export function useRevenueData() {
  return useQuery({
    queryKey: ['revenue-data'],
    queryFn: async (): Promise<RevenueData[]> => {
      const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        return format(date, 'yyyy-MM-dd');
      });

      // Fetch reservations (room revenue)
      const { data: reservations } = await supabase
        .from('reservations')
        .select('check_in, total_amount, status')
        .in('status', ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']);

      // Fetch restaurant orders (F&B revenue)
      const { data: posOrders } = await supabase
        .from('pos_orders')
        .select('created_at, total_amount, status')
        .eq('status', 'PAID');

      // Fetch minimarket sales
      const { data: minimarketSales } = await supabase
        .from('minimarket_sales')
        .select('sold_at, total_price');

      // Fetch service requests with costs (other revenue)
      const { data: serviceRequests } = await supabase
        .from('service_requests')
        .select('completed_at, cost, status')
        .eq('status', 'COMPLETED');

      // Aggregate by date
      const revenueByDate: Record<string, RevenueData> = {};

      last14Days.forEach(date => {
        revenueByDate[date] = {
          date: format(parseISO(date), 'MMM d'),
          rooms: 0,
          restaurant: 0,
          services: 0,
          total: 0,
        };
      });

      // Aggregate room revenue from reservations
      (reservations || []).forEach(r => {
        const checkIn = r.check_in;
        if (checkIn && revenueByDate[checkIn]) {
          revenueByDate[checkIn].rooms += Number(r.total_amount) || 0;
        }
      });

      // Aggregate restaurant revenue
      (posOrders || []).forEach(o => {
        if (o.created_at) {
          const date = format(new Date(o.created_at), 'yyyy-MM-dd');
          if (revenueByDate[date]) {
            revenueByDate[date].restaurant += Number(o.total_amount) || 0;
          }
        }
      });

      // Aggregate minimarket revenue into services
      (minimarketSales || []).forEach(s => {
        if (s.sold_at) {
          const date = format(new Date(s.sold_at), 'yyyy-MM-dd');
          if (revenueByDate[date]) {
            revenueByDate[date].services += Number(s.total_price) || 0;
          }
        }
      });

      // Aggregate service requests revenue
      (serviceRequests || []).forEach(sr => {
        if (sr.completed_at) {
          const date = format(new Date(sr.completed_at), 'yyyy-MM-dd');
          if (revenueByDate[date]) {
            revenueByDate[date].services += Number(sr.cost) || 0;
          }
        }
      });

      // Calculate totals
      return last14Days.map(date => {
        const data = revenueByDate[date];
        data.total = data.rooms + data.restaurant + data.services;
        return data;
      });
    },
  });
}

// Financial summary combining all sources
export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      // Revenue from reservations
      const { data: reservations } = await supabase
        .from('reservations')
        .select('total_amount, status')
        .in('status', ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']);
      const roomRevenue = (reservations || []).reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);

      // Revenue from restaurant
      const { data: posOrders } = await supabase
        .from('pos_orders')
        .select('total_amount, status')
        .eq('status', 'PAID');
      const restaurantRevenue = (posOrders || []).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      // Revenue from minimarket
      const { data: minimarketSales } = await supabase
        .from('minimarket_sales')
        .select('total_price');
      const minimarketRevenue = (minimarketSales || []).reduce((sum, s) => sum + (Number(s.total_price) || 0), 0);

      // Revenue from services
      const { data: serviceRequests } = await supabase
        .from('service_requests')
        .select('cost, status')
        .eq('status', 'COMPLETED');
      const servicesRevenue = (serviceRequests || []).reduce((sum, s) => sum + (Number(s.cost) || 0), 0);

      // Expenses from purchase orders
      const { data: purchaseOrders } = await supabase
        .from('purchase_orders')
        .select('total_amount, status')
        .in('status', ['RECEIVED', 'ORDERED']);
      const purchaseExpenses = (purchaseOrders || []).reduce((sum, po) => sum + (Number(po.total_amount) || 0), 0);

      // Invoices summary
      const { data: invoices } = await supabase
        .from('invoices')
        .select('amount, status, invoice_type');

      const pendingReceivables = (invoices || [])
        .filter(i => i.invoice_type === 'RECEIVABLE' && i.status === 'PENDING')
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

      const overduePayables = (invoices || [])
        .filter(i => i.status === 'OVERDUE')
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

      const totalRevenue = roomRevenue + restaurantRevenue + minimarketRevenue + servicesRevenue;
      const totalExpenses = purchaseExpenses;

      return {
        totalRevenue,
        totalExpenses,
        pendingReceivables,
        overduePayables,
        breakdown: {
          roomRevenue,
          restaurantRevenue,
          minimarketRevenue,
          servicesRevenue,
          purchaseExpenses,
        },
      };
    },
  });
}

// Generate combined transactions from all sources
export function useCombinedTransactions() {
  return useQuery({
    queryKey: ['combined-transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const allTransactions: Transaction[] = [];

      // Fetch existing transactions
      const { data: dbTransactions } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      (dbTransactions || []).forEach(t => {
        allTransactions.push({
          id: t.id,
          date: t.date,
          description: t.description,
          accountId: t.account_id || '',
          accountName: t.account_name || '',
          type: t.transaction_type as Transaction['type'],
          amount: Number(t.amount),
          reference: t.reference || undefined,
          category: t.category || '',
        });
      });

      // Add reservation revenue as transactions
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .in('status', ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'])
        .order('created_at', { ascending: false })
        .limit(50);

      (reservations || []).forEach(r => {
        allTransactions.push({
          id: `res-${r.id}`,
          date: r.check_in,
          description: `Room Booking - ${r.guest_name} (${r.room_name || 'Room'})`,
          accountId: '',
          accountName: 'Room Revenue',
          type: 'CREDIT',
          amount: Number(r.total_amount) || 0,
          reference: r.confirmation_code,
          category: 'Room Revenue',
        });
      });

      // Add restaurant orders as transactions
      const { data: posOrders } = await supabase
        .from('pos_orders')
        .select('*')
        .eq('status', 'PAID')
        .order('created_at', { ascending: false })
        .limit(50);

      (posOrders || []).forEach(o => {
        allTransactions.push({
          id: `pos-${o.id}`,
          date: format(new Date(o.created_at || new Date()), 'yyyy-MM-dd'),
          description: `Restaurant - Table ${o.table_number}`,
          accountId: '',
          accountName: 'F&B Revenue',
          type: 'CREDIT',
          amount: Number(o.total_amount) || 0,
          reference: o.id.slice(0, 8).toUpperCase(),
          category: 'Restaurant Revenue',
        });
      });

      // Add minimarket sales as transactions
      const { data: minimarketSales } = await supabase
        .from('minimarket_sales')
        .select('*')
        .order('sold_at', { ascending: false })
        .limit(50);

      (minimarketSales || []).forEach(s => {
        allTransactions.push({
          id: `mini-${s.id}`,
          date: format(new Date(s.sold_at || new Date()), 'yyyy-MM-dd'),
          description: `Minimarket Sale${s.room_number ? ` - Room ${s.room_number}` : ''}`,
          accountId: '',
          accountName: 'Minimarket Revenue',
          type: 'CREDIT',
          amount: Number(s.total_price) || 0,
          reference: s.id.slice(0, 8).toUpperCase(),
          category: 'Minimarket Revenue',
        });
      });

      // Add purchase orders as expenses
      const { data: purchaseOrders } = await supabase
        .from('purchase_orders')
        .select('*')
        .in('status', ['ORDERED', 'RECEIVED'])
        .order('created_at', { ascending: false })
        .limit(50);

      (purchaseOrders || []).forEach(po => {
        allTransactions.push({
          id: `po-${po.id}`,
          date: format(new Date(po.created_at || new Date()), 'yyyy-MM-dd'),
          description: `Supplier Purchase - ${po.supplier_name}`,
          accountId: '',
          accountName: 'Inventory Expenses',
          type: 'DEBIT',
          amount: Number(po.total_amount) || 0,
          reference: po.order_number,
          category: 'Inventory',
        });
      });

      // Sort by date descending
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return allTransactions.slice(0, 100);
    },
  });
}

// Get cancelled reservations for lost revenue tracking
export function useCancelledReservations() {
  return useQuery({
    queryKey: ['cancelled-reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('status', 'CANCELLED')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      const totalLostRevenue = (data || []).reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
      
      return {
        cancellations: data || [],
        totalLostRevenue,
        count: data?.length || 0,
      };
    },
  });
}
