import React from 'react';
import { RestaurantTable, POSOrder, TableStatus } from '@/types/restaurant';
import { Users, Clock, Utensils } from 'lucide-react';

interface TableGridProps {
  tables: RestaurantTable[];
  orders: POSOrder[];
  onTableClick: (table: RestaurantTable) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ tables, orders, onTableClick }) => {
  const getTableOrder = (tableId: string) => {
    return orders.find(o => o.tableId === tableId && o.status !== 'PAID');
  };

  const getStatusStyles = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-50 border-green-200 hover:border-green-400 hover:bg-green-100';
      case 'OCCUPIED':
        return 'bg-red-50 border-red-200 hover:border-red-400 hover:bg-red-100';
      case 'RESERVED':
        return 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100';
      case 'CLEANING':
        return 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-100';
      default:
        return 'bg-muted border-border';
    }
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'OCCUPIED': return 'bg-red-500';
      case 'RESERVED': return 'bg-blue-500';
      case 'CLEANING': return 'bg-yellow-500';
      default: return 'bg-muted-foreground';
    }
  };

  const getElapsedTime = (openedAt: string) => {
    const diff = Date.now() - new Date(openedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  if (tables.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No tables configured</p>
        <p className="text-sm mt-1">Go to Settings to add tables to your floor plan</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {tables.map(table => {
        const order = getTableOrder(table.id);
        
        return (
          <button
            key={table.id}
            onClick={() => onTableClick(table)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${getStatusStyles(table.status)}
              hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
            `}
          >
            {/* Status indicator */}
            <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${getStatusColor(table.status)}`} />
            
            {/* Table number */}
            <div className="text-2xl font-bold text-foreground mb-2">
              {table.number}
            </div>
            
            {/* Capacity */}
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Users className="w-3 h-3 mr-1" />
              {table.capacity} seats
            </div>
            
            {/* Order info if occupied */}
            {order && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {getElapsedTime(order.openedAt)}
                  </span>
                  <span className="font-semibold text-foreground">
                    ${order.totalAmount.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Utensils className="w-3 h-3 mr-1" />
                  {order.items.length} items
                </div>
              </div>
            )}
            
            {/* Status label */}
            <div className={`
              mt-2 text-xs font-semibold uppercase tracking-wide
              ${table.status === 'AVAILABLE' ? 'text-green-700' : ''}
              ${table.status === 'OCCUPIED' ? 'text-red-700' : ''}
              ${table.status === 'RESERVED' ? 'text-blue-700' : ''}
              ${table.status === 'CLEANING' ? 'text-yellow-700' : ''}
            `}>
              {table.status}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TableGrid;
