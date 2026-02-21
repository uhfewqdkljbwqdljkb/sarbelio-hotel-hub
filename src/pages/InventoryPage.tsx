import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  useInventoryItems, useCreateInventoryItem, useUpdateInventoryItem,
  useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier,
  usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrderStatus, useOrderStats,
  useOrderTemplates, useCreateOrderTemplate, useDeleteOrderTemplate
} from '@/hooks/useInventory';
import { InventoryItem, Supplier, InventoryCategory, PurchaseOrderStatus } from '@/types/inventory';
import { categoryLabels, destinationLabels, destinationColors, statusColors, getStockStatus } from '@/components/inventory/InventoryConstants';
import ItemFormDialog from '@/components/inventory/ItemFormDialog';
import SupplierFormDialog from '@/components/inventory/SupplierFormDialog';
import OrderFormDialog from '@/components/inventory/OrderFormDialog';
import TemplateFormDialog from '@/components/inventory/TemplateFormDialog';
import SupplierCard from '@/components/inventory/SupplierCard';
import OrdersTab from '@/components/inventory/OrdersTab';
import { Package, Truck, Users, AlertTriangle, Search, Plus, Bell, Edit, FileText, Copy, Trash2, Loader2 } from 'lucide-react';

export default function InventoryPage() {
  const { data: items = [], isLoading: itemsLoading } = useInventoryItems();
  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers();
  const { data: orders = [], isLoading: ordersLoading } = usePurchaseOrders();
  const { data: templates = [], isLoading: templatesLoading } = useOrderTemplates();
  const { data: orderStats } = useOrderStats();
  
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const createOrder = useCreatePurchaseOrder();
  const updateOrderStatus = useUpdatePurchaseOrderStatus();
  const createTemplate = useCreateOrderTemplate();
  const { mutateAsync: deleteTemplate } = useDeleteOrderTemplate();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const lowStockItems = items.filter(i => i.quantity <= i.minStock);
  const isLoading = itemsLoading || suppliersLoading || ordersLoading || templatesLoading;
  
  useEffect(() => {
    if (lowStockItems.length > 0 && !itemsLoading) {
      toast({ title: `⚠️ Low Stock Alert`, description: `${lowStockItems.length} item(s) need restocking`, variant: "destructive" });
    }
  }, [itemsLoading]);

  const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
  const pendingOrders = orders.filter(o => ['PENDING', 'ORDERED', 'DRAFT', 'APPROVED'].includes(o.status)).length;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSaveItem = async (item: Omit<InventoryItem, 'id' | 'status' | 'quantity'>) => {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...item });
        toast({ title: "Item Updated" });
      } else {
        await createItem.mutateAsync(item);
        toast({ title: "Item Added" });
      }
      setEditingItem(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save item", variant: "destructive" });
    }
  };

  const handleSaveSupplier = async (supplier: Omit<Supplier, 'id' | 'totalOrders'>) => {
    try {
      if (editingSupplier) {
        await updateSupplier.mutateAsync({ id: editingSupplier.id, ...supplier });
        toast({ title: "Supplier Updated" });
      } else {
        await createSupplier.mutateAsync(supplier);
        toast({ title: "Supplier Added" });
      }
      setEditingSupplier(null);
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleCreateOrder = async (orderData: { supplierId: string; supplierName: string; items: any[]; totalAmount: number }) => {
    try {
      const orderNumber = `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
      await createOrder.mutateAsync({
        orderNumber,
        ...orderData,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Order Created", description: `Order ${orderNumber} created. Invoice generated automatically.` });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      await createTemplate.mutateAsync(templateData);
      toast({ title: "Template Saved" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleCreateOrderFromTemplate = async (template: any) => {
    try {
      const orderNumber = `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
      await createOrder.mutateAsync({
        orderNumber,
        supplierId: template.supplierId,
        supplierName: template.supplierName,
        items: template.items,
        status: 'PENDING',
        totalAmount: template.totalAmount,
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Order Created from Template" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <Bell className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
            <p className="text-sm text-red-700 mb-2">{lowStockItems.length} item(s) need restocking</p>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 5).map(item => (
                <Badge key={item.id} variant="outline" className="bg-white text-red-700 border-red-300">{item.name}: {item.quantity}/{item.minStock}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100"><Package className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Total Items</p><p className="text-2xl font-bold">{items.length}</p></div></div></div>
        <div className="bg-card rounded-xl border p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-100"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><p className="text-sm text-muted-foreground">Low Stock</p><p className="text-2xl font-bold">{lowStockItems.length}</p></div></div></div>
        <div className="bg-card rounded-xl border p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-100"><Package className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Total Value</p><p className="text-2xl font-bold">${totalValue.toLocaleString()}</p></div></div></div>
        <div className="bg-card rounded-xl border p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-100"><Truck className="h-5 w-5 text-purple-600" /></div><div><p className="text-sm text-muted-foreground">Pending Orders</p><p className="text-2xl font-bold">{pendingOrders}</p></div></div></div>
      </div>

      <div className="bg-card rounded-xl border">
        <Tabs defaultValue="inventory">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-14">
              <TabsTrigger value="inventory"><Package className="h-4 w-4 mr-2" />Inventory</TabsTrigger>
              <TabsTrigger value="orders"><Truck className="h-4 w-4 mr-2" />Orders</TabsTrigger>
              <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-2" />Templates</TabsTrigger>
              <TabsTrigger value="suppliers"><Users className="h-4 w-4 mr-2" />Suppliers</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="inventory" className="mt-0 space-y-4">
              <div className="flex flex-wrap gap-3 justify-between">
                <div className="flex gap-3">
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-[250px]" /></div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
                </div>
                <Button onClick={() => { setEditingItem(null); setItemDialogOpen(true); }} className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Item</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item</th><th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">SKU</th><th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Supplier</th><th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Destination</th><th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Qty / Min</th><th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Cost</th><th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Sell Price</th><th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th><th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Actions</th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.map((item) => {
                      const status = getStockStatus(item.quantity, item.minStock);
                      const supplier = suppliers.find(s => s.id === item.supplierId);
                      return (
                        <tr key={item.id} className={`hover:bg-muted/30 ${status !== 'IN_STOCK' ? 'bg-red-50/50' : ''}`}>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-muted-foreground text-sm">{item.sku}</td>
                          <td className="px-4 py-3 text-sm">{supplier?.name || <span className="text-muted-foreground">-</span>}</td>
                          <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${destinationColors[item.destination]}`}>{destinationLabels[item.destination]}</span></td>
                          <td className="px-4 py-3 text-center"><span className={status !== 'IN_STOCK' ? 'text-red-600 font-semibold' : ''}>{item.quantity}</span><span className="text-muted-foreground"> / {item.minStock}</span></td>
                          <td className="px-4 py-3 text-right">${item.unitCost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{item.sellPrice ? `$${item.sellPrice.toFixed(2)}` : <span className="text-muted-foreground">-</span>}</td>
                          <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>{status.replace('_', ' ')}</span></td>
                          <td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingItem(item); setItemDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <OrdersTab orders={orders} stats={orderStats} onNewOrder={() => setOrderDialogOpen(true)} onUpdateStatus={(id, status) => updateOrderStatus.mutate({ id, status })} />
            </TabsContent>

            <TabsContent value="templates" className="mt-0 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Create reusable order templates for quick reordering.</p>
                <Button onClick={() => setTemplateDialogOpen(true)} className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />New Template</Button>
              </div>
              {templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No templates yet.</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map(template => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3"><div><h3 className="font-semibold">{template.name}</h3><p className="text-sm text-muted-foreground">{template.supplierName}</p></div><Badge variant="outline">{template.items.length} items</Badge></div>
                      <p className="text-lg font-bold text-green-600 mb-3">${template.totalAmount.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-primary text-primary-foreground" onClick={() => handleCreateOrderFromTemplate(template)}><Copy className="h-4 w-4 mr-1" />Quick Order</Button>
                        <Button size="sm" variant="outline" onClick={() => deleteTemplate(template.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="suppliers" className="mt-0 space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => { setEditingSupplier(null); setSupplierDialogOpen(true); }} className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Supplier</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((supplier) => (
                  <SupplierCard key={supplier.id} supplier={supplier} supplierItems={items.filter(i => i.supplierId === supplier.id)} onEdit={(s) => { setEditingSupplier(s); setSupplierDialogOpen(true); }} onDelete={(id) => deleteSupplier.mutate(id)} />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ItemFormDialog open={itemDialogOpen} onOpenChange={setItemDialogOpen} editingItem={editingItem} suppliers={suppliers} onSave={handleSaveItem} onCreateSupplier={async (s) => { const result = await createSupplier.mutateAsync(s); return result; }} />
      <SupplierFormDialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen} editingSupplier={editingSupplier} onSave={handleSaveSupplier} />
      <OrderFormDialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen} items={items} suppliers={suppliers} templates={templates} onCreateOrder={handleCreateOrder} />
      <TemplateFormDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen} items={items} suppliers={suppliers} onSave={handleCreateTemplate} />
    </div>
  );
}
