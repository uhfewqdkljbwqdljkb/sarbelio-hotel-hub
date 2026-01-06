import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, Supplier, PurchaseOrder, OrderTemplate, InventoryCategory, ItemDestination, StockStatus, PurchaseOrderItem } from '@/types/inventory';

// Transform database row to frontend type
const transformInventoryItem = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  sku: row.sku || '',
  category: (row.category_id ? 'FOOD' : 'FOOD') as InventoryCategory, // Will be updated when we have categories
  quantity: row.quantity || 0,
  unit: row.unit || 'pcs',
  minStock: row.min_quantity || 0,
  maxStock: row.max_quantity || 100,
  unitCost: Number(row.unit_cost) || 0,
  sellPrice: row.sell_price ? Number(row.sell_price) : undefined,
  supplier: row.supplier || undefined,
  status: getStockStatus(row.quantity || 0, row.min_quantity || 0),
  lastRestocked: row.last_restocked,
  location: row.location || undefined,
  destination: (row.destination || 'INTERNAL') as ItemDestination,
  barcode: row.barcode || undefined,
  imageUrl: row.image_url || undefined,
});

const getStockStatus = (quantity: number, minStock: number): StockStatus => {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity <= minStock) return 'LOW_STOCK';
  return 'IN_STOCK';
};

const transformSupplier = (row: any): Supplier => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone || '',
  address: row.address || '',
  categories: (row.categories || []) as InventoryCategory[],
  rating: Number(row.rating) || 5,
  totalOrders: row.total_orders || 0,
});

const transformPurchaseOrder = (row: any, items: PurchaseOrderItem[]): PurchaseOrder => ({
  id: row.id,
  orderNumber: row.order_number,
  supplierId: row.supplier_id || '',
  supplierName: row.supplier_name,
  items,
  status: row.status as PurchaseOrder['status'],
  totalAmount: Number(row.total_amount) || 0,
  createdAt: row.created_at,
  expectedDelivery: row.expected_delivery,
  notes: row.notes,
  isTemplate: row.is_template,
  templateName: row.template_name,
});

const transformOrderTemplate = (row: any, items: PurchaseOrderItem[]): OrderTemplate => ({
  id: row.id,
  name: row.name,
  supplierId: row.supplier_id || '',
  supplierName: row.supplier_name,
  items,
  totalAmount: Number(row.total_amount) || 0,
  createdAt: row.created_at,
});

// Inventory Items Queries
export function useInventoryItems() {
  return useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data || []).map(transformInventoryItem);
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'status'>) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unit: item.unit,
          min_quantity: item.minStock,
          max_quantity: item.maxStock,
          unit_cost: item.unitCost,
          sell_price: item.sellPrice,
          supplier: item.supplier,
          location: item.location,
          destination: item.destination,
          barcode: item.barcode,
          image_url: item.imageUrl,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformInventoryItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<InventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unit: item.unit,
          min_quantity: item.minStock,
          max_quantity: item.maxStock,
          unit_cost: item.unitCost,
          sell_price: item.sellPrice,
          supplier: item.supplier,
          location: item.location,
          destination: item.destination,
          barcode: item.barcode,
          image_url: item.imageUrl,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformInventoryItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
}

// Suppliers Queries
export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data || []).map(transformSupplier);
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'totalOrders'>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          categories: supplier.categories,
          rating: supplier.rating,
        })
        .select()
        .single();
      
      if (error) throw error;
      return transformSupplier(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...supplier }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          categories: supplier.categories,
          rating: supplier.rating,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformSupplier(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

// Purchase Orders Queries
export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data: orders, error: ordersError } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      const { data: orderItems, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('*');
      
      if (itemsError) throw itemsError;
      
      return (orders || []).map(order => {
        const items = (orderItems || [])
          .filter(item => item.order_id === order.id)
          .map(item => ({
            itemId: item.item_id || '',
            itemName: item.item_name,
            quantity: item.quantity,
            unitCost: Number(item.unit_cost),
            total: Number(item.total),
          }));
        return transformPurchaseOrder(order, items);
      });
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<PurchaseOrder, 'id'>) => {
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert({
          order_number: order.orderNumber,
          supplier_id: order.supplierId || null,
          supplier_name: order.supplierName,
          status: order.status,
          total_amount: order.totalAmount,
          expected_delivery: order.expectedDelivery,
          notes: order.notes,
          is_template: order.isTemplate,
          template_name: order.templateName,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      if (order.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(order.items.map(item => ({
            order_id: orderData.id,
            item_id: item.itemId || null,
            item_name: item.itemName,
            quantity: item.quantity,
            unit_cost: item.unitCost,
            total: item.total,
          })));
        
        if (itemsError) throw itemsError;
      }
      
      return transformPurchaseOrder(orderData, order.items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PurchaseOrder['status'] }) => {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

// Order Templates Queries
export function useOrderTemplates() {
  return useQuery({
    queryKey: ['order-templates'],
    queryFn: async () => {
      const { data: templates, error: templatesError } = await supabase
        .from('order_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (templatesError) throw templatesError;
      
      const { data: templateItems, error: itemsError } = await supabase
        .from('order_template_items')
        .select('*');
      
      if (itemsError) throw itemsError;
      
      return (templates || []).map(template => {
        const items = (templateItems || [])
          .filter(item => item.template_id === template.id)
          .map(item => ({
            itemId: item.item_id || '',
            itemName: item.item_name,
            quantity: item.quantity,
            unitCost: Number(item.unit_cost),
            total: Number(item.total),
          }));
        return transformOrderTemplate(template, items);
      });
    },
  });
}

export function useCreateOrderTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Omit<OrderTemplate, 'id' | 'createdAt'>) => {
      const { data: templateData, error: templateError } = await supabase
        .from('order_templates')
        .insert({
          name: template.name,
          supplier_id: template.supplierId || null,
          supplier_name: template.supplierName,
          total_amount: template.totalAmount,
        })
        .select()
        .single();
      
      if (templateError) throw templateError;
      
      if (template.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_template_items')
          .insert(template.items.map(item => ({
            template_id: templateData.id,
            item_id: item.itemId || null,
            item_name: item.itemName,
            quantity: item.quantity,
            unit_cost: item.unitCost,
            total: item.total,
          })));
        
        if (itemsError) throw itemsError;
      }
      
      return transformOrderTemplate(templateData, template.items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-templates'] });
    },
  });
}

export function useDeleteOrderTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('order_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-templates'] });
    },
  });
}
