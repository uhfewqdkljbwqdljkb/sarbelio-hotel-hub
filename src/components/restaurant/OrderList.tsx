import React from 'react';
import { POSOrder, OrderStatus } from '@/types/restaurant';
import { Clock, Users, ChefHat, Check, CreditCard, Car, User } from 'lucide-react';

interface OrderListProps {
  orders: POSOrder[];
  onOrderClick: (order: POSOrder) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onOrderClick }) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'OPEN':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: <Clock className="w-4 h-4" />,
          label: 'Open'
        };
      case 'KITCHEN':
        return { 
          color: 'bg-orange-100 text-orange-800 border-orange-200', 
          icon: <ChefHat className="w-4 h-4" />,
          label: 'In Kitchen'
        };
      case 'SERVED':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: <Check className="w-4 h-4" />,
          label: 'Served'
        };
      case 'PAID':
        return { 
          color: 'bg-muted text-muted-foreground border-border', 
          icon: <CreditCard className="w-4 h-4" />,
          label: 'Paid'
        };
      default:
        return { 
          color: 'bg-muted text-muted-foreground border-border', 
          icon: null,
          label: status
        };
    }
  };

  const getElapsedTime = (openedAt: string) => {
    const diff = Date.now() - new Date(openedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  const activeOrders = orders.filter(o => o.status !== 'PAID');

  if (activeOrders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No active orders</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeOrders.map(order => {
        const statusConfig = getStatusConfig(order.status);
        const isDriveThru = order.orderType === 'DRIVE_THRU';
        
        return (
          <button
            key={order.id}
            onClick={() => onOrderClick(order)}
            className={`bg-card p-4 rounded-xl border hover:shadow-md transition-all text-left ${
              isDriveThru ? 'border-amber-300 hover:border-amber-400' : 'border-border hover:border-primary'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {isDriveThru ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                      <Car className="w-3 h-3" />
                      Drive-Thru
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {order.tableNumber}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-foreground">
                    Table {order.tableNumber}
                  </span>
                )}
                {!isDriveThru && (
                  <div className="ml-2 flex items-center text-muted-foreground text-sm">
                    <Users className="w-3 h-3 mr-1" />
                    {order.guestCount}
                  </div>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center border ${statusConfig.color}`}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </span>
            </div>

            {/* Customer Name for Drive-Thru */}
            {isDriveThru && order.guestName && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <User className="w-3 h-3" />
                {order.guestName}
              </div>
            )}

            {/* Items */}
            <div className="space-y-1 mb-3">
              {order.items.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-foreground font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {getElapsedTime(order.openedAt)}
              </span>
              <span className="font-bold text-foreground">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default OrderList;
