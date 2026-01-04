import React, { useState } from 'react';
import { RestaurantTable, POSOrder, MenuItem, MenuCategory, OrderItem } from '@/types/restaurant';
import { MENU_CATEGORIES, MENU_ITEMS } from '@/data/restaurantMock';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CreditCard,
  Users,
  X,
  Check,
  ChefHat
} from 'lucide-react';

interface POSInterfaceProps {
  table: RestaurantTable;
  existingOrder?: POSOrder;
  onClose: () => void;
  onSaveOrder: (order: POSOrder) => void;
}

const POSInterface: React.FC<POSInterfaceProps> = ({ 
  table, 
  existingOrder, 
  onClose, 
  onSaveOrder 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(MENU_CATEGORIES[0].id);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(existingOrder?.items || []);
  const [guestCount, setGuestCount] = useState(existingOrder?.guestCount || table.capacity);

  const filteredMenuItems = MENU_ITEMS.filter(item => item.categoryId === activeCategory);

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

  return (
    <div className="flex h-full bg-background rounded-xl overflow-hidden border border-border">
      {/* Left Side - Menu */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <button 
            onClick={onClose}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Floor
          </button>
          <div className="flex items-center">
            <div className="text-lg font-bold text-foreground">Table {table.number}</div>
            <div className="ml-4 flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              <input
                type="number"
                min="1"
                max={table.capacity}
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="w-12 text-center bg-secondary rounded px-2 py-1 text-sm"
              />
              <span className="ml-1 text-sm">guests</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto p-3 gap-2 border-b border-border bg-card scrollbar-hide">
          {MENU_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${activeCategory === category.id 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}
              `}
            >
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-secondary/30">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => item.isAvailable && addItem(item)}
                disabled={!item.isAvailable}
                className={`
                  p-4 rounded-xl text-left transition-all
                  ${item.isAvailable 
                    ? 'bg-card border border-border hover:border-primary hover:shadow-md active:scale-[0.98]' 
                    : 'bg-muted/50 opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="font-medium text-foreground text-sm mb-1">{item.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-700">${item.price.toFixed(2)}</span>
                  {!item.isAvailable && (
                    <span className="text-xs text-destructive">Sold out</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Order */}
      <div className="w-80 lg:w-96 flex flex-col bg-card border-l border-border">
        {/* Order Header */}
        <div className="p-4 border-b border-border">
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
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 rounded-full bg-card border border-border hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded-full bg-card border border-border hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 ml-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
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
    </div>
  );
};

export default POSInterface;
