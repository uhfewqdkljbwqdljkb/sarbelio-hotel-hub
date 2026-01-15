import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, Supplier, PurchaseOrder, OrderTemplate, InventoryCategory, ItemDestination, StockStatus, PurchaseOrderItem, OrderStats } from '@/types/inventory';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Transform database row to frontend type
const transformInventoryItem = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  sku: row.sku || '',
  category: (row.category_id ? 'FOOD' : 'FOOD') as InventoryCategory,
  quantity: row.quantity || 0,
  unit: row.unit || 'pcs',
  minStock: row.min_quantity || 0,
  maxStock: row.max_quantity || 100,
  unitCost: Number(row.unit_cost) || 0,
  sellPrice: row.sell_price ? Number(row.sell_price) : undefined,
  supplier: row.supplier || undefined,
  supplierId: row.supplier_id || undefined,
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
  receivedAt: row.received_at,
  notes: row.notes,
  isTemplate: row.is_template,
  templateName: row.template_name,
  invoiceId: row.invoice_id,
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
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'status' | 'quantity'>) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name: item.name,
          sku: item.sku,
          quantity: 0, // Quantity starts at 0, only updated via orders
          unit: item.unit,
          min_quantity: item.minStock,
          max_quantity: item.maxStock,
          unit_cost: item.unitCost,
          sell_price: item.sellPrice,
          supplier: item.supplier,
          supplier_id: item.supplierId || null,
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
      const updateData: Record<string, any> = {};
      
      if (item.name !== undefined) updateData.name = item.name;
      if (item.sku !== undefined) updateData.sku = item.sku;
      if (item.unit !== undefined) updateData.unit = item.unit;
      if (item.minStock !== undefined) updateData.min_quantity = item.minStock;
      if (item.maxStock !== undefined) updateData.max_quantity = item.maxStock;
      if (item.unitCost !== undefined) updateData.unit_cost = item.unitCost;
      if (item.sellPrice !== undefined) updateData.sell_price = item.sellPrice;
      if (item.supplier !== undefined) updateData.supplier = item.supplier;
      if (item.supplierId !== undefined) updateData.supplier_id = item.supplierId || null;
      if (item.location !== undefined) updateData.location = item.location;
      if (item.destination !== undefined) updateData.destination = item.destination;
      if (item.barcode !== undefined) updateData.barcode = item.barcode;
      if (item.imageUrl !== undefined) updateData.image_url = item.imageUrl;
      
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updateData)
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

export function useOrderStats() {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async (): Promise<OrderStats> => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
      
      const { data: orders, error } = await supabase
        .from('purchase_orders')
        .select('*');
      
      if (error) throw error;
      
      const allOrders = orders || [];
      const receivedOrders = allOrders.filter(o => o.status === 'RECEIVED');
      const pendingOrders = allOrders.filter(o => ['DRAFT', 'PENDING', 'APPROVED', 'ORDERED'].includes(o.status || ''));
      const cancelledOrders = allOrders.filter(o => o.status === 'CANCELLED');
      
      const thisMonthOrders = allOrders.filter(o => {
        const orderDate = o.created_at?.split('T')[0];
        return orderDate && orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const totalSpent = receivedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const spentThisMonth = thisMonthOrders
        .filter(o => o.status === 'RECEIVED')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      
      return {
        totalOrders: allOrders.length,
        pendingOrders: pendingOrders.length,
        receivedOrders: receivedOrders.length,
        cancelledOrders: cancelledOrders.length,
        totalSpent,
        averageOrderValue: receivedOrders.length > 0 ? totalSpent / receivedOrders.length : 0,
        ordersThisMonth: thisMonthOrders.length,
        spentThisMonth,
      };
    },
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<PurchaseOrder, 'id'>) => {
      // Create the purchase order
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
      
      // Create invoice for this order (PAYABLE type)
      const invoiceNumber = `INV-${order.orderNumber}`;
      const dueDate = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'); // 30 days from now
      
      const invoiceItems = order.items.map(item => ({
        description: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitCost,
        total: item.total,
      }));
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          invoice_type: 'PAYABLE',
          customer_or_vendor: order.supplierName,
          amount: order.totalAmount,
          due_date: dueDate,
          status: 'PENDING',
          items: invoiceItems,
        })
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Link invoice to purchase order
      await supabase
        .from('purchase_orders')
        .update({ invoice_id: invoiceData.id })
        .eq('id', orderData.id);
      
      // Update supplier's total orders count
      if (order.supplierId) {
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('total_orders')
          .eq('id', order.supplierId)
          .single();
        
        if (supplier) {
          await supabase
            .from('suppliers')
            .update({ total_orders: (supplier.total_orders || 0) + 1 })
            .eq('id', order.supplierId);
        }
      }
      
      return transformPurchaseOrder(orderData, order.items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['combined-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
    },
  });
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PurchaseOrder['status'] }) => {
      const updateData: Record<string, any> = { status };
      
      if (status === 'RECEIVED') {
        updateData.received_at = new Date().toISOString();
        
        // Get order items and update inventory quantities
        const { data: orderItems } = await supabase
          .from('purchase_order_items')
          .select('*')
          .eq('order_id', id);
        
        if (orderItems) {
          for (const item of orderItems) {
            if (item.item_id) {
              const { data: inventoryItem } = await supabase
                .from('inventory_items')
                .select('quantity')
                .eq('id', item.item_id)
                .single();
              
              if (inventoryItem) {
                await supabase
                  .from('inventory_items')
                  .update({ 
                    quantity: (inventoryItem.quantity || 0) + item.quantity,
                    last_restocked: new Date().toISOString(),
                  })
                  .eq('id', item.item_id);
              }
            }
          }
        }
        
        // Update the invoice status to PAID when order is received
        const { data: order } = await supabase
          .from('purchase_orders')
          .select('invoice_id')
          .eq('id', id)
          .single();
        
        if (order?.invoice_id) {
          await supabase
            .from('invoices')
            .update({ 
              status: 'PAID',
              paid_at: new Date().toISOString(),
            })
            .eq('id', order.invoice_id);
        }
      }
      
      const { error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['combined-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
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

// Get items by supplier
export function useItemsBySupplier(supplierId: string | null) {
  const { data: items = [] } = useInventoryItems();
  
  if (!supplierId) return [];
  return items.filter(item => item.supplierId === supplierId);
}
