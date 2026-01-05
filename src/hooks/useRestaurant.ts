import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RestaurantTable, POSOrder, MenuCategory, MenuItem, OrderItem, TableStatus, OrderStatus, TableZone } from '@/types/restaurant';

interface DbTable {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  zone: string;
  current_order_id: string | null;
}

interface DbOrder {
  id: string;
  table_id: string;
  table_number: string;
  status: string;
  total_amount: number;
  guest_count: number;
  opened_at: string;
}

interface DbOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string | null;
}

interface DbMenuCategory {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

interface DbMenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  is_available: boolean;
}

export function useRestaurantTables() {
  return useQuery({
    queryKey: ['restaurant_tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number');
      
      if (error) throw error;
      return (data as DbTable[]).map((t): RestaurantTable => ({
        id: t.id,
        number: t.table_number,
        capacity: t.capacity,
        status: t.status as TableStatus,
        zone: t.zone as TableZone,
        currentOrderId: t.current_order_id || undefined,
      }));
    },
  });
}

export function usePosOrders() {
  return useQuery({
    queryKey: ['pos_orders'],
    queryFn: async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from('pos_orders')
        .select('*')
        .order('opened_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      const orders = ordersData as DbOrder[];
      const orderIds = orders.map(o => o.id);
      
      if (orderIds.length === 0) return [];
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      
      if (itemsError) throw itemsError;
      
      const itemsMap = new Map<string, OrderItem[]>();
      (itemsData as DbOrderItem[]).forEach(item => {
        const existing = itemsMap.get(item.order_id) || [];
        existing.push({
          id: item.id,
          menuItemId: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          notes: item.notes || undefined,
        });
        itemsMap.set(item.order_id, existing);
      });
      
      return orders.map((o): POSOrder => ({
        id: o.id,
        tableId: o.table_id,
        tableNumber: o.table_number,
        status: o.status as OrderStatus,
        totalAmount: o.total_amount,
        guestCount: o.guest_count,
        openedAt: o.opened_at,
        items: itemsMap.get(o.id) || [],
      }));
    },
  });
}

export function useMenuCategories() {
  return useQuery({
    queryKey: ['menu_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return (data as DbMenuCategory[]).map((c): MenuCategory => ({
        id: c.id,
        name: c.name,
        icon: c.icon || '🍽️',
      }));
    },
  });
}

export function useMenuItems() {
  return useQuery({
    queryKey: ['menu_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data as DbMenuItem[]).map((m): MenuItem => ({
        id: m.id,
        categoryId: m.category_id || '',
        name: m.name,
        description: m.description || '',
        price: m.price,
        image: m.image || undefined,
        isAvailable: m.is_available,
      }));
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<POSOrder, 'id'>) => {
      const { data: orderData, error: orderError } = await supabase
        .from('pos_orders')
        .insert({
          table_id: order.tableId,
          table_number: order.tableNumber,
          status: order.status,
          total_amount: order.totalAmount,
          guest_count: order.guestCount || 1,
          opened_at: order.openedAt,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      if (order.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(order.items.map(item => ({
            order_id: orderData.id,
            menu_item_id: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes,
          })));
        
        if (itemsError) throw itemsError;
      }
      
      // Update table status
      await supabase
        .from('restaurant_tables')
        .update({ 
          status: order.status === 'PAID' ? 'CLEANING' : 'OCCUPIED',
          current_order_id: order.status === 'PAID' ? null : orderData.id 
        })
        .eq('id', order.tableId);
      
      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos_orders'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant_tables'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<POSOrder> & { id: string }) => {
      const { error } = await supabase
        .from('pos_orders')
        .update({
          status: updates.status,
          total_amount: updates.totalAmount,
          guest_count: updates.guestCount,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      if (updates.status === 'PAID' && updates.tableId) {
        await supabase
          .from('restaurant_tables')
          .update({ status: 'CLEANING', current_order_id: null })
          .eq('id', updates.tableId);
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos_orders'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant_tables'] });
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RestaurantTable> & { id: string }) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({
          table_number: updates.number,
          capacity: updates.capacity,
          status: updates.status,
          zone: updates.zone,
        })
        .eq('id', id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant_tables'] });
    },
  });
}
