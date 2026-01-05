import React, { useState } from 'react';
import { RestaurantTable, POSOrder, MenuItem, MenuCategory, OrderItem } from '@/types/restaurant';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CreditCard,
  Users,
  ChefHat,
  ShoppingCart,
  X
} from 'lucide-react';

interface POSInterfaceProps {
  table: RestaurantTable;
  existingOrder?: POSOrder;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  onClose: () => void;
  onSaveOrder: (order: POSOrder) => void;
}

const POSInterface: React.FC<POSInterfaceProps> = ({ 
  table, 
  existingOrder,
  categories,
  menuItems,
  onClose, 
  onSaveOrder 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');
  const [orderItems, setOrderItems] = useState<OrderItem[]>(existingOrder?.items || []);
  const [guestCount, setGuestCount] = useState(existingOrder?.guestCount || table.capacity);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => item.categoryId === activeCategory && item.isAvailable);

  const addItem = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(i => i.menuItemId === menuItem.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: `oi_${Date.now()}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSendToKitchen = () => {
    const order: POSOrder = {
      id: existingOrder?.id || `ord_${Date.now()}`,
      tableId: table.id,
      tableNumber: table.number,
      items: orderItems,
      status: 'KITCHEN',
      totalAmount,
      openedAt: existingOrder?.openedAt || new Date().toISOString(),
      guestCount,
    };
    onSaveOrder(order);
  };

  const handlePayment = () => {
    const order: POSOrder = {
      id: existingOrder?.id || `ord_${Date.now()}`,
      tableId: table.id,
      tableNumber: table.number,
      items: orderItems,
      status: 'PAID',
      totalAmount,
      openedAt: existingOrder?.openedAt || new Date().toISOString(),
      guestCount,
    };
    onSaveOrder(order);
  };

  // Order Panel Component (shared between mobile and desktop)
  const OrderPanel = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col bg-card ${isMobile ? 'h-full' : 'border-l border-border'}`}>
      {/* Order Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground flex items-center">
            <ChefHat className="w-5 h-5 mr-2 text-primary" />
            Current Order
          </h3>
          {existingOrder && (
            <span className={`
              mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full
              ${existingOrder.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : ''}
              ${existingOrder.status === 'KITCHEN' ? 'bg-orange-100 text-orange-800' : ''}
              ${existingOrder.status === 'SERVED' ? 'bg-green-100 text-green-800' : ''}
            `}>
              {existingOrder.status}
            </span>
          )}
        </div>
        {isMobile && (
          <button 
            onClick={() => setMobileCartOpen(false)}
            className="p-2 hover:bg-secondary rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {orderItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-4xl mb-2">🍽️</div>
            <p>No items yet</p>
            <p className="text-sm">Tap menu items to add</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderItems.map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 ml-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1.5 rounded-full bg-card border border-border hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-semibold text-foreground">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1.5 rounded-full bg-card border border-border hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 ml-1 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Footer */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span className="font-medium text-foreground">${(totalAmount * 0.1).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-lg pt-2 border-t border-border">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-primary-700">${(totalAmount * 1.1).toFixed(2)}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleSendToKitchen}
            disabled={orderItems.length === 0}
            className="flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </button>
          <button
            onClick={handlePayment}
            disabled={orderItems.length === 0}
            className="flex items-center justify-center px-4 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-full bg-background rounded-xl overflow-hidden border border-border">
      {/* Left Side - Menu */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-border bg-card">
          <button 
            onClick={onClose}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Back to Floor</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-base md:text-lg font-bold text-foreground">Table {table.number}</div>
            <div className="flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              <input
                type="number"
                min="1"
                max={table.capacity}
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="w-10 md:w-12 text-center bg-secondary rounded px-1 md:px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto p-2 md:p-3 gap-2 border-b border-border bg-card scrollbar-hide">
          {categories.length === 0 ? (
            <div className="text-sm text-muted-foreground px-4">
              No menu categories. Go to Settings to add categories.
            </div>
          ) : (
            categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all
                  ${activeCategory === category.id 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}
                `}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))
          )}
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-secondary/30 pb-24 md:pb-4">
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No items in this category</p>
              <p className="text-sm mt-1">Add items in Settings → Menu Management</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {filteredMenuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addItem(item)}
                  className="p-3 md:p-4 rounded-xl text-left transition-all bg-card border border-border hover:border-primary hover:shadow-md active:scale-[0.98]"
                >
                  <div className="font-medium text-foreground text-xs md:text-sm mb-1 line-clamp-2">{item.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 md:line-clamp-2 mb-2 hidden sm:block">{item.description}</div>
                  <div className="font-bold text-primary-700 text-sm md:text-base">${item.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Order (Desktop only) */}
      <div className="hidden md:flex w-80 lg:w-96">
        <OrderPanel />
      </div>

      {/* Mobile Cart Button - Fixed at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-card border-t border-border safe-area-bottom">
        <button
          onClick={() => setMobileCartOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-xl font-medium"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-background text-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </div>
            <span>View Order</span>
          </div>
          <span className="font-bold">${(totalAmount * 1.1).toFixed(2)}</span>
        </button>
      </div>

      {/* Mobile Cart Slide-up Panel */}
      {mobileCartOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileCartOpen(false)}
          />
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-card rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-300 pb-[30px]">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
            <OrderPanel isMobile />
          </div>
        </div>
      )}
    </div>
  );
};

export default POSInterface;
