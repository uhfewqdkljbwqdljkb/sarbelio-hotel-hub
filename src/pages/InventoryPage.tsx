import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { INVENTORY_ITEMS, SUPPLIERS, PURCHASE_ORDERS } from '@/data/inventoryMock';
import { InventoryItem, Supplier, PurchaseOrder } from '@/types/inventory';
import { Package, Truck, Users, AlertTriangle, Search, Plus, Star } from 'lucide-react';

const categoryLabels = {
  FOOD: 'Food', BEVERAGE: 'Beverage', HOUSEKEEPING: 'Housekeeping',
  LINEN: 'Linen', MAINTENANCE: 'Maintenance', OFFICE: 'Office', AMENITIES: 'Amenities'
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

export default function InventoryPage() {
  const [items] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [suppliers] = useState<Supplier[]>(SUPPLIERS);
  const [orders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const lowStockItems = items.filter(i => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK').length;
  const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'ORDERED').length;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
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
              <p className="text-2xl font-bold">{lowStockItems}</p>
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
              <TabsTrigger value="orders" className="data-[state=active]:bg-primary-100"><Truck className="h-4 w-4 mr-2" />Purchase Orders</TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:bg-primary-100"><Users className="h-4 w-4 mr-2" />Suppliers</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
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
                <Button className="bg-primary-200 text-primary-900 hover:bg-primary-300"><Plus className="h-4 w-4 mr-2" />Add Item</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Unit Cost</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{item.sku}</td>
                        <td className="px-4 py-3"><Badge variant="outline">{categoryLabels[item.category]}</Badge></td>
                        <td className="px-4 py-3 text-center">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3 text-right">€{item.unitCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>{item.status.replace('_', ' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-0 space-y-4">
              <div className="flex justify-end">
                <Button className="bg-primary-200 text-primary-900 hover:bg-primary-300"><Plus className="h-4 w-4 mr-2" />New Order</Button>
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

            <TabsContent value="suppliers" className="mt-0">
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
                    <p className="text-xs text-muted-foreground mt-3">{supplier.totalOrders} orders</p>
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
