import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { MINIMARKET_SALES, MinimarketSale, MinimarketSaleItem } from '@/data/minimarketMock';
import { InventoryItem } from '@/types/inventory';
import { ShoppingCart, Package, CreditCard, Banknote, Building, Search, Plus, Minus, Trash2, Receipt, TrendingUp, ShoppingBag, Loader2 } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { useInventoryItems, useUpdateInventoryItem } from '@/hooks/useInventory';

const categoryLabels: Record<string, string> = {
  SNACKS: 'Snacks', BEVERAGE: 'Beverages', TOILETRIES: 'Toiletries',
  SOUVENIRS: 'Souvenirs', AMENITIES: 'Amenities', FOOD: 'Food'
};

export default function MinimarketPage() {
  const { data: rooms = [] } = useRooms();
  const { data: allInventory = [], isLoading } = useInventoryItems();
  const updateItem = useUpdateInventoryItem();
  
  // Filter inventory items that are tagged for minimarket
  const inventory = useMemo(() => 
    allInventory.filter(i => i.destination === 'MINIMARKET' || i.destination === 'BOTH'),
    [allInventory]
  );
  
  const [sales, setSales] = useState<MinimarketSale[]>(MINIMARKET_SALES);
  const [cart, setCart] = useState<MinimarketSaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'ROOM_CHARGE'>('CASH');
  const [roomNumber, setRoomNumber] = useState('');
  const [activeTab, setActiveTab] = useState('pos');

  // Filter rooms that are occupied (guests can charge to room)
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED');

  // Stats
  const todaySales = sales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const itemsSold = sales.reduce((sum, s) => sum + s.items.reduce((isum, i) => isum + i.quantity, 0), 0);
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock).length;

  const categories = [...new Set(inventory.map(i => i.category))];

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory && item.quantity > 0;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const addToCart = (item: InventoryItem) => {
    const existing = cart.find(c => c.itemId === item.id);
    if (existing) {
      if (existing.quantity >= item.quantity) {
        toast({ title: "Not enough stock", variant: "destructive" });
        return;
      }
      setCart(prev => prev.map(c => c.itemId === item.id ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.unitPrice } : c));
    } else {
      setCart(prev => [...prev, { itemId: item.id, itemName: item.name, quantity: 1, unitPrice: item.sellPrice || 0, total: item.sellPrice || 0 }]);
    }
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    const item = inventory.find(i => i.id === itemId);
    setCart(prev => prev.map(c => {
      if (c.itemId !== itemId) return c;
      const newQty = c.quantity + delta;
      if (newQty <= 0) return c;
      if (item && newQty > item.quantity) {
        toast({ title: "Not enough stock", variant: "destructive" });
        return c;
      }
      return { ...c, quantity: newQty, total: newQty * c.unitPrice };
    }).filter(c => c.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.itemId !== itemId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'ROOM_CHARGE' && !roomNumber.trim()) {
      toast({ title: "Room number required", variant: "destructive" });
      return;
    }

    const sale: MinimarketSale = {
      id: `ms_${Date.now()}`,
      items: cart,
      total: cartTotal,
      paymentMethod,
      roomNumber: paymentMethod === 'ROOM_CHARGE' ? roomNumber : undefined,
      createdAt: new Date().toISOString(),
      cashierName: 'Current User',
    };

    // Deduct from inventory in database
    for (const cartItem of cart) {
      const item = inventory.find(i => i.id === cartItem.itemId);
      if (item) {
        const newQty = item.quantity - cartItem.quantity;
        await updateItem.mutateAsync({ id: item.id, quantity: newQty });
      }
    }

    setSales(prev => [sale, ...prev]);
    setCart([]);
    setCheckoutOpen(false);
    setRoomNumber('');
    toast({ title: "Sale completed!", description: `Total: $${cartTotal.toFixed(2)}` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
              <p className="text-2xl font-bold">${todayRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Receipt className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{sales.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><ShoppingBag className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Items Sold</p>
              <p className="text-2xl font-bold">{itemsSold}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100"><Package className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-xl border">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-14">
              <TabsTrigger value="pos" className="data-[state=active]:bg-primary-100"><ShoppingCart className="h-4 w-4 mr-2" />POS</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-primary-100"><Package className="h-4 w-4 mr-2" />Products</TabsTrigger>
              <TabsTrigger value="sales" className="data-[state=active]:bg-primary-100"><Receipt className="h-4 w-4 mr-2" />Sales History</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* POS TAB */}
            <TabsContent value="pos" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Products Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{categoryLabels[cat] || cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className="bg-muted/30 hover:bg-muted/50 border rounded-lg p-3 text-left transition-colors"
                      >
                        <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-primary-700 font-bold">${(item.sellPrice || 0).toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">{item.quantity} left</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">No products found</div>
                  )}
                </div>

                {/* Cart */}
                <div className="bg-muted/30 rounded-lg border p-4 h-fit sticky top-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({cart.length})
                  </h3>

                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {cart.map(item => (
                          <div key={item.itemId} className="flex items-center gap-3 bg-card rounded-lg p-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.itemName}</p>
                              <p className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.itemId, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.itemId, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right min-w-[60px]">
                              <p className="font-bold">${item.total.toFixed(2)}</p>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(item.itemId)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t mt-4 pt-4">
                        <div className="flex justify-between text-lg font-bold mb-4">
                          <span>Total</span>
                          <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button className="w-full bg-primary-200 text-primary-900 hover:bg-primary-300" onClick={() => setCheckoutOpen(true)}>
                          Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* PRODUCTS TAB */}
            <TabsContent value="products" className="mt-0">
              <p className="text-muted-foreground mb-4">Products are managed in the Inventory page. Items assigned to "Minimarket" or "Both" appear here.</p>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Sell Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inventory.map(item => {
                    const margin = item.sellPrice ? ((item.sellPrice - item.unitCost) / item.sellPrice * 100).toFixed(0) : 0;
                    return (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{item.sku}</td>
                        <td className="px-4 py-3"><Badge variant="outline">{categoryLabels[item.category] || item.category}</Badge></td>
                        <td className="px-4 py-3 text-center">
                          <span className={item.quantity <= item.minStock ? 'text-red-600 font-semibold' : ''}>{item.quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">${item.unitCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-medium">${(item.sellPrice || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-green-600">{margin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TabsContent>

            {/* SALES HISTORY TAB */}
            <TabsContent value="sales" className="mt-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date/Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Items</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Room</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cashier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm">{new Date(sale.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {sale.items.slice(0, 2).map(i => <span key={i.itemId} className="block truncate">{i.quantity}x {i.itemName}</span>)}
                          {sale.items.length > 2 && <span className="text-muted-foreground">+{sale.items.length - 2} more</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={sale.paymentMethod === 'ROOM_CHARGE' ? 'default' : 'outline'}>
                          {sale.paymentMethod === 'ROOM_CHARGE' ? <Building className="h-3 w-3 mr-1" /> : sale.paymentMethod === 'CARD' ? <CreditCard className="h-3 w-3 mr-1" /> : <Banknote className="h-3 w-3 mr-1" />}
                          {sale.paymentMethod.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{sale.roomNumber || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold">${sale.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{sale.cashierName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Complete Sale</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">{cart.length} items</p>
              <p className="text-3xl font-bold">${cartTotal.toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v: 'CASH' | 'CARD' | 'ROOM_CHARGE') => setPaymentMethod(v)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30">
                  <RadioGroupItem value="CASH" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1"><Banknote className="h-4 w-4" />Cash</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30">
                  <RadioGroupItem value="CARD" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1"><CreditCard className="h-4 w-4" />Card</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30">
                  <RadioGroupItem value="ROOM_CHARGE" id="room" />
                  <Label htmlFor="room" className="flex items-center gap-2 cursor-pointer flex-1"><Building className="h-4 w-4" />Charge to Room</Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === 'ROOM_CHARGE' && (
              <div className="space-y-2">
                <Label>Select Room *</Label>
                <Select value={roomNumber} onValueChange={setRoomNumber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupiedRooms.length === 0 && rooms.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">No rooms available</div>
                    ) : (
                      <>
                        {occupiedRooms.length > 0 && (
                          <>
                            {occupiedRooms.map(room => (
                              <SelectItem key={room.id} value={room.roomNumber}>
                                Room {room.roomNumber} - {room.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {rooms.filter(r => r.status !== 'OCCUPIED').length > 0 && (
                          <>
                            {occupiedRooms.length > 0 && (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground border-t mt-1">Other Rooms</div>
                            )}
                            {rooms.filter(r => r.status !== 'OCCUPIED').map(room => (
                              <SelectItem key={room.id} value={room.roomNumber}>
                                Room {room.roomNumber} - {room.name} ({room.status})
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {occupiedRooms.length === 0 && (
                  <p className="text-xs text-muted-foreground">No guests currently checked in. All rooms shown.</p>
                )}
              </div>
            )}

            <Button onClick={handleCheckout} className="w-full bg-primary-200 text-primary-900 hover:bg-primary-300">
              Complete Sale
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
