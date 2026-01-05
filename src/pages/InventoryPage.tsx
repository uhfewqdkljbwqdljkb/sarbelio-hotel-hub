import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { INVENTORY_ITEMS, SUPPLIERS, PURCHASE_ORDERS } from '@/data/inventoryMock';
import { InventoryItem, Supplier, PurchaseOrder, InventoryCategory, OrderTemplate, PurchaseOrderItem, ItemDestination } from '@/types/inventory';
import { Package, Truck, Users, AlertTriangle, Search, Plus, Star, Bell, Edit, Trash2, FileText, Copy } from 'lucide-react';

const categoryLabels: Record<InventoryCategory, string> = {
  FOOD: 'Food', BEVERAGE: 'Beverage', HOUSEKEEPING: 'Housekeeping',
  LINEN: 'Linen', MAINTENANCE: 'Maintenance', OFFICE: 'Office', AMENITIES: 'Amenities',
  SNACKS: 'Snacks', TOILETRIES: 'Toiletries', SOUVENIRS: 'Souvenirs'
};

const destinationLabels: Record<ItemDestination, string> = {
  RESTAURANT: 'Restaurant', MINIMARKET: 'Minimarket', BOTH: 'Both', INTERNAL: 'Internal Use'
};

const destinationColors: Record<ItemDestination, string> = {
  RESTAURANT: 'bg-orange-100 text-orange-700',
  MINIMARKET: 'bg-blue-100 text-blue-700',
  BOTH: 'bg-purple-100 text-purple-700',
  INTERNAL: 'bg-gray-100 text-gray-700',
};

const statusColors = {
  IN_STOCK: 'bg-green-100 text-green-700',
  LOW_STOCK: 'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
  REORDER: 'bg-orange-100 text-orange-700',
};

const poStatusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ORDERED: 'bg-purple-100 text-purple-700',
  RECEIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const getStockStatus = (quantity: number, minStock: number): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' => {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity <= minStock) return 'LOW_STOCK';
  return 'IN_STOCK';
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [orders, setOrders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Dialog states
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Form states
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', phone: '', address: '', categories: [] as InventoryCategory[], rating: 5 });
  const [newItem, setNewItem] = useState({ name: '', sku: '', category: 'FOOD' as InventoryCategory, quantity: 0, unit: 'pcs', minStock: 10, maxStock: 100, unitCost: 0, sellPrice: 0, location: '', destination: 'INTERNAL' as ItemDestination });
  const [newTemplate, setNewTemplate] = useState({ name: '', supplierId: '', items: [] as { itemId: string; quantity: number }[] });
  const [newOrder, setNewOrder] = useState({ supplierId: '', templateId: '', items: [] as { itemId: string; quantity: number }[] });

  // Low stock alerts
  const lowStockItems = items.filter(i => i.quantity <= i.minStock);
  const hasLowStockAlerts = lowStockItems.length > 0;
  
  useEffect(() => {
    // Show low stock alerts on mount
    if (lowStockItems.length > 0) {
      toast({
        title: `⚠️ Low Stock Alert`,
        description: `${lowStockItems.length} item(s) are below minimum stock levels`,
        variant: "destructive",
      });
    }
  }, []);

  const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'ORDERED').length;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Supplier CRUD
  const handleSaveSupplier = () => {
    if (!newSupplier.name.trim() || !newSupplier.email.trim()) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }
    
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...newSupplier } : s));
      toast({ title: "Supplier Updated", description: `${newSupplier.name} has been updated` });
    } else {
      const supplier: Supplier = { id: `sup_${Date.now()}`, ...newSupplier, totalOrders: 0 };
      setSuppliers(prev => [...prev, supplier]);
      toast({ title: "Supplier Added", description: `${newSupplier.name} has been added` });
    }
    
    setSupplierDialogOpen(false);
    setEditingSupplier(null);
    setNewSupplier({ name: '', email: '', phone: '', address: '', categories: [], rating: 5 });
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast({ title: "Supplier Deleted" });
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({ name: supplier.name, email: supplier.email, phone: supplier.phone, address: supplier.address, categories: supplier.categories, rating: supplier.rating });
    setSupplierDialogOpen(true);
  };

  // Item CRUD
  const handleSaveItem = () => {
    if (!newItem.name.trim() || !newItem.sku.trim()) {
      toast({ title: "Error", description: "Name and SKU are required", variant: "destructive" });
      return;
    }
    
    const status = getStockStatus(newItem.quantity, newItem.minStock);
    
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...newItem, status } : i));
      toast({ title: "Item Updated", description: `${newItem.name} has been updated` });
    } else {
      const item: InventoryItem = { id: `inv_${Date.now()}`, ...newItem, status };
      setItems(prev => [...prev, item]);
      toast({ title: "Item Added", description: `${newItem.name} has been added` });
    }
    
    setItemDialogOpen(false);
    setEditingItem(null);
    setNewItem({ name: '', sku: '', category: 'FOOD', quantity: 0, unit: 'pcs', minStock: 10, maxStock: 100, unitCost: 0, sellPrice: 0, location: '', destination: 'INTERNAL' });
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({ name: item.name, sku: item.sku, category: item.category, quantity: item.quantity, unit: item.unit, minStock: item.minStock, maxStock: item.maxStock, unitCost: item.unitCost, sellPrice: item.sellPrice || 0, location: item.location || '', destination: item.destination });
    setItemDialogOpen(true);
  };

  // Order Templates
  const handleSaveTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.supplierId || newTemplate.items.length === 0) {
      toast({ title: "Error", description: "Name, supplier and at least one item are required", variant: "destructive" });
      return;
    }
    
    const supplier = suppliers.find(s => s.id === newTemplate.supplierId);
    const templateItems: PurchaseOrderItem[] = newTemplate.items.map(ti => {
      const item = items.find(i => i.id === ti.itemId)!;
      return { itemId: ti.itemId, itemName: item.name, quantity: ti.quantity, unitCost: item.unitCost, total: ti.quantity * item.unitCost };
    });
    
    const template: OrderTemplate = {
      id: `tmpl_${Date.now()}`,
      name: newTemplate.name,
      supplierId: newTemplate.supplierId,
      supplierName: supplier?.name || '',
      items: templateItems,
      totalAmount: templateItems.reduce((sum, i) => sum + i.total, 0),
      createdAt: new Date().toISOString(),
    };
    
    setTemplates(prev => [...prev, template]);
    toast({ title: "Template Saved", description: `${newTemplate.name} template has been saved` });
    setTemplateDialogOpen(false);
    setNewTemplate({ name: '', supplierId: '', items: [] });
  };

  const handleCreateOrderFromTemplate = (template: OrderTemplate) => {
    const order: PurchaseOrder = {
      id: `po_${Date.now()}`,
      orderNumber: `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      supplierId: template.supplierId,
      supplierName: template.supplierName,
      items: template.items,
      status: 'DRAFT',
      totalAmount: template.totalAmount,
      createdAt: new Date().toISOString(),
      isTemplate: false,
    };
    
    setOrders(prev => [...prev, order]);
    toast({ title: "Order Created", description: `Order ${order.orderNumber} created from template` });
  };

  // Manual Order Creation
  const handleCreateOrder = () => {
    if (!newOrder.supplierId || newOrder.items.length === 0) {
      toast({ title: "Error", description: "Supplier and at least one item are required", variant: "destructive" });
      return;
    }
    
    const supplier = suppliers.find(s => s.id === newOrder.supplierId);
    const orderItems: PurchaseOrderItem[] = newOrder.items.map(oi => {
      const item = items.find(i => i.id === oi.itemId)!;
      return { itemId: oi.itemId, itemName: item.name, quantity: oi.quantity, unitCost: item.unitCost, total: oi.quantity * item.unitCost };
    });
    
    const order: PurchaseOrder = {
      id: `po_${Date.now()}`,
      orderNumber: `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      supplierId: newOrder.supplierId,
      supplierName: supplier?.name || '',
      items: orderItems,
      status: 'DRAFT',
      totalAmount: orderItems.reduce((sum, i) => sum + i.total, 0),
      createdAt: new Date().toISOString(),
    };
    
    setOrders(prev => [...prev, order]);
    toast({ title: "Order Created", description: `Order ${order.orderNumber} has been created` });
    setOrderDialogOpen(false);
    setNewOrder({ supplierId: '', templateId: '', items: [] });
  };

  const toggleTemplateItem = (itemId: string, forTemplate = true) => {
    if (forTemplate) {
      setNewTemplate(prev => {
        const exists = prev.items.find(i => i.itemId === itemId);
        if (exists) {
          return { ...prev, items: prev.items.filter(i => i.itemId !== itemId) };
        }
        return { ...prev, items: [...prev.items, { itemId, quantity: 1 }] };
      });
    } else {
      setNewOrder(prev => {
        const exists = prev.items.find(i => i.itemId === itemId);
        if (exists) {
          return { ...prev, items: prev.items.filter(i => i.itemId !== itemId) };
        }
        return { ...prev, items: [...prev.items, { itemId, quantity: 1 }] };
      });
    }
  };

  const updateTemplateItemQty = (itemId: string, quantity: number, forTemplate = true) => {
    if (forTemplate) {
      setNewTemplate(prev => ({ ...prev, items: prev.items.map(i => i.itemId === itemId ? { ...i, quantity } : i) }));
    } else {
      setNewOrder(prev => ({ ...prev, items: prev.items.map(i => i.itemId === itemId ? { ...i, quantity } : i) }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alert Banner */}
      {hasLowStockAlerts && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <Bell className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
            <p className="text-sm text-red-700 mb-2">{lowStockItems.length} item(s) need restocking:</p>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 5).map(item => (
                <Badge key={item.id} variant="outline" className="bg-white text-red-700 border-red-300">
                  {item.name}: {item.quantity}/{item.minStock} {item.unit}
                </Badge>
              ))}
              {lowStockItems.length > 5 && <Badge variant="outline" className="bg-white">+{lowStockItems.length - 5} more</Badge>}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Package className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><Package className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">€{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><Truck className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <p className="text-2xl font-bold">{pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-xl border">
        <Tabs defaultValue="inventory">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-14">
              <TabsTrigger value="inventory" className="data-[state=active]:bg-primary-100"><Package className="h-4 w-4 mr-2" />Inventory</TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-primary-100"><Truck className="h-4 w-4 mr-2" />Orders</TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-primary-100"><FileText className="h-4 w-4 mr-2" />Templates</TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:bg-primary-100"><Users className="h-4 w-4 mr-2" />Suppliers</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* INVENTORY TAB */}
            <TabsContent value="inventory" className="mt-0 space-y-4">
              <div className="flex flex-wrap gap-3 justify-between">
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-[250px]" />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={itemDialogOpen} onOpenChange={(open) => { setItemDialogOpen(open); if (!open) { setEditingItem(null); setNewItem({ name: '', sku: '', category: 'FOOD', quantity: 0, unit: 'pcs', minStock: 10, maxStock: 100, unitCost: 0, sellPrice: 0, location: '', destination: 'INTERNAL' }); } }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary-200 text-primary-900 hover:bg-primary-300"><Plus className="h-4 w-4 mr-2" />Add Item</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingItem ? 'Edit Item' : 'Add Inventory Item'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Name *</Label><Input value={newItem.name} onChange={(e) => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="Item name" /></div>
                        <div className="space-y-2"><Label>SKU *</Label><Input value={newItem.sku} onChange={(e) => setNewItem(p => ({ ...p, sku: e.target.value }))} placeholder="SKU-001" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={newItem.category} onValueChange={(v: InventoryCategory) => setNewItem(p => ({ ...p, category: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Unit</Label><Input value={newItem.unit} onChange={(e) => setNewItem(p => ({ ...p, unit: e.target.value }))} placeholder="pcs, kg, liters" /></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={newItem.quantity} onChange={(e) => setNewItem(p => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))} /></div>
                        <div className="space-y-2"><Label>Min Stock *</Label><Input type="number" value={newItem.minStock} onChange={(e) => setNewItem(p => ({ ...p, minStock: parseFloat(e.target.value) || 0 }))} /></div>
                        <div className="space-y-2"><Label>Max Stock</Label><Input type="number" value={newItem.maxStock} onChange={(e) => setNewItem(p => ({ ...p, maxStock: parseFloat(e.target.value) || 0 }))} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Unit Cost (€)</Label><Input type="number" step="0.01" value={newItem.unitCost} onChange={(e) => setNewItem(p => ({ ...p, unitCost: parseFloat(e.target.value) || 0 }))} /></div>
                        <div className="space-y-2"><Label>Sell Price (€)</Label><Input type="number" step="0.01" value={newItem.sellPrice} onChange={(e) => setNewItem(p => ({ ...p, sellPrice: parseFloat(e.target.value) || 0 }))} placeholder="For minimarket/restaurant" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Destination *</Label>
                          <Select value={newItem.destination} onValueChange={(v: ItemDestination) => setNewItem(p => ({ ...p, destination: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(destinationLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Location</Label><Input value={newItem.location} onChange={(e) => setNewItem(p => ({ ...p, location: e.target.value }))} placeholder="Storage room" /></div>
                      </div>
                      <Button onClick={handleSaveItem} className="w-full bg-primary-200 text-primary-900 hover:bg-primary-300">{editingItem ? 'Update Item' : 'Add Item'}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Destination</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Qty / Min</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Cost / Sell</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.map((item) => {
                      const status = getStockStatus(item.quantity, item.minStock);
                      return (
                        <tr key={item.id} className={`hover:bg-muted/30 ${status !== 'IN_STOCK' ? 'bg-red-50/50' : ''}`}>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-muted-foreground text-sm">{item.sku}</td>
                          <td className="px-4 py-3"><Badge variant="outline">{categoryLabels[item.category]}</Badge></td>
                          <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${destinationColors[item.destination]}`}>{destinationLabels[item.destination]}</span></td>
                          <td className="px-4 py-3 text-center">
                            <span className={status !== 'IN_STOCK' ? 'text-red-600 font-semibold' : ''}>{item.quantity}</span>
                            <span className="text-muted-foreground"> / {item.minStock} {item.unit}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-muted-foreground">€{item.unitCost.toFixed(2)}</span>
                            {item.sellPrice && <span className="block font-medium text-green-600">€{item.sellPrice.toFixed(2)}</span>}
                          </td>
                          <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>{status.replace('_', ' ')}</span></td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditItem(item)}><Edit className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* ORDERS TAB */}
            <TabsContent value="orders" className="mt-0 space-y-4">
              <div className="flex justify-end gap-2">
                <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary-200 text-primary-900 hover:bg-primary-300"><Plus className="h-4 w-4 mr-2" />New Order</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Supplier *</Label>
                        <Select value={newOrder.supplierId} onValueChange={(v) => setNewOrder(p => ({ ...p, supplierId: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                          <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      {templates.length > 0 && (
                        <div className="space-y-2">
                          <Label>Use Template (Optional)</Label>
                          <Select value={newOrder.templateId} onValueChange={(v) => {
                            const tmpl = templates.find(t => t.id === v);
                            if (tmpl) {
                              setNewOrder(p => ({ ...p, templateId: v, supplierId: tmpl.supplierId, items: tmpl.items.map(i => ({ itemId: i.itemId, quantity: i.quantity })) }));
                            }
                          }}>
                            <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                            <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name} - {t.supplierName}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Select Items</Label>
                        <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/30">
                              <Checkbox checked={newOrder.items.some(i => i.itemId === item.id)} onCheckedChange={() => toggleTemplateItem(item.id, false)} />
                              <div className="flex-1">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">€{item.unitCost}/{item.unit}</span>
                              </div>
                              {newOrder.items.some(i => i.itemId === item.id) && (
                                <Input type="number" className="w-20" min={1} value={newOrder.items.find(i => i.itemId === item.id)?.quantity || 1} onChange={(e) => updateTemplateItemQty(item.id, parseInt(e.target.value) || 1, false)} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      {newOrder.items.length > 0 && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-medium">Order Total: €{newOrder.items.reduce((sum, oi) => { const item = items.find(i => i.id === oi.itemId); return sum + (item ? item.unitCost * oi.quantity : 0); }, 0).toFixed(2)}</p>
                        </div>
                      )}
                      <Button onClick={handleCreateOrder} className="w-full bg-primary-200 text-primary-900 hover:bg-primary-300">Create Order</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Supplier</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Items</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Expected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                        <td className="px-4 py-3">{order.supplierName}</td>
                        <td className="px-4 py-3 text-center">{order.items.length}</td>
                        <td className="px-4 py-3 text-right font-medium">€{order.totalAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${poStatusColors[order.status]}`}>{order.status}</span></td>
                        <td className="px-4 py-3 text-muted-foreground">{order.expectedDelivery || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* TEMPLATES TAB */}
            <TabsContent value="templates" className="mt-0 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Create reusable order templates for quick reordering from your suppliers.</p>
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary-200 text-primary-900 hover:bg-primary-300"><Plus className="h-4 w-4 mr-2" />New Template</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Create Order Template</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2"><Label>Template Name *</Label><Input value={newTemplate.name} onChange={(e) => setNewTemplate(p => ({ ...p, name: e.target.value }))} placeholder="Weekly Food Order" /></div>
                      <div className="space-y-2">
                        <Label>Supplier *</Label>
                        <Select value={newTemplate.supplierId} onValueChange={(v) => setNewTemplate(p => ({ ...p, supplierId: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                          <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Select Items</Label>
                        <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/30">
                              <Checkbox checked={newTemplate.items.some(i => i.itemId === item.id)} onCheckedChange={() => toggleTemplateItem(item.id, true)} />
                              <div className="flex-1">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">€{item.unitCost}/{item.unit}</span>
                              </div>
                              {newTemplate.items.some(i => i.itemId === item.id) && (
                                <Input type="number" className="w-20" min={1} value={newTemplate.items.find(i => i.itemId === item.id)?.quantity || 1} onChange={(e) => updateTemplateItemQty(item.id, parseInt(e.target.value) || 1, true)} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button onClick={handleSaveTemplate} className="w-full bg-primary-200 text-primary-900 hover:bg-primary-300">Save Template</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No order templates yet. Create one to quickly reorder from suppliers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map(template => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.supplierName}</p>
                        </div>
                        <Badge variant="outline">{template.items.length} items</Badge>
                      </div>
                      <p className="text-lg font-bold text-green-600 mb-3">€{template.totalAmount.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-primary-200 text-primary-900 hover:bg-primary-300" onClick={() => handleCreateOrderFromTemplate(template)}>
                          <Copy className="h-4 w-4 mr-1" />Use Template
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setTemplates(prev => prev.filter(t => t.id !== template.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* SUPPLIERS TAB */}
            <TabsContent value="suppliers" className="mt-0 space-y-4">
              <div className="flex justify-end">
                <Dialog open={supplierDialogOpen} onOpenChange={(open) => { setSupplierDialogOpen(open); if (!open) { setEditingSupplier(null); setNewSupplier({ name: '', email: '', phone: '', address: '', categories: [], rating: 5 }); } }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary-200 text-primary-900 hover:bg-primary-300"><Plus className="h-4 w-4 mr-2" />Add Supplier</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2"><Label>Company Name *</Label><Input value={newSupplier.name} onChange={(e) => setNewSupplier(p => ({ ...p, name: e.target.value }))} placeholder="Supplier name" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Email *</Label><Input type="email" value={newSupplier.email} onChange={(e) => setNewSupplier(p => ({ ...p, email: e.target.value }))} placeholder="supplier@email.com" /></div>
                        <div className="space-y-2"><Label>Phone</Label><Input value={newSupplier.phone} onChange={(e) => setNewSupplier(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555-0100" /></div>
                      </div>
                      <div className="space-y-2"><Label>Address</Label><Textarea value={newSupplier.address} onChange={(e) => setNewSupplier(p => ({ ...p, address: e.target.value }))} placeholder="Full address" /></div>
                      <div className="space-y-2">
                        <Label>Categories</Label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(categoryLabels).map(([k, v]) => (
                            <Badge key={k} variant={newSupplier.categories.includes(k as InventoryCategory) ? "default" : "outline"} className="cursor-pointer" onClick={() => setNewSupplier(p => ({ ...p, categories: p.categories.includes(k as InventoryCategory) ? p.categories.filter(c => c !== k) : [...p.categories, k as InventoryCategory] }))}>
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Rating (1-5)</Label>
                        <Input type="number" min={1} max={5} step={0.1} value={newSupplier.rating} onChange={(e) => setNewSupplier(p => ({ ...p, rating: parseFloat(e.target.value) || 5 }))} />
                      </div>
                      <Button onClick={handleSaveSupplier} className="w-full bg-primary-200 text-primary-900 hover:bg-primary-300">{editingSupplier ? 'Update Supplier' : 'Add Supplier'}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{supplier.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" /><span className="text-sm">{supplier.rating}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{supplier.email}</p>
                      <p>{supplier.phone}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {supplier.categories.map(cat => <Badge key={cat} variant="secondary" className="text-xs">{categoryLabels[cat]}</Badge>)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">{supplier.totalOrders} orders</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditSupplier(supplier)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteSupplier(supplier.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
