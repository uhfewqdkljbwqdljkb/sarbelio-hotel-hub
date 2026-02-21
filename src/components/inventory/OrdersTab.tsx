import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PurchaseOrder, OrderStats, PurchaseOrderStatus } from '@/types/inventory';
import { poStatusColors } from './InventoryConstants';
import { Plus, TrendingUp, Package, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface OrdersTabProps {
  orders: PurchaseOrder[];
  stats: OrderStats | undefined;
  onNewOrder: () => void;
  onUpdateStatus: (id: string, status: PurchaseOrderStatus) => void;
}

export default function OrdersTab({
  orders,
  stats,
  onNewOrder,
  onUpdateStatus,
}: OrdersTabProps) {
  const pendingOrders = orders.filter(o => ['DRAFT', 'PENDING', 'APPROVED', 'ORDERED'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'RECEIVED');
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="h-4 w-4" />
            <span className="text-xs">Total Orders</span>
          </div>
          <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">Received</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats?.receivedOrders || 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Total Spent</span>
          </div>
          <p className="text-2xl font-bold">${(stats?.totalSpent || 0).toLocaleString()}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Avg Order</span>
          </div>
          <p className="text-2xl font-bold">${(stats?.averageOrderValue || 0).toFixed(0)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Package className="h-4 w-4" />
            <span className="text-xs">This Month</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats?.ordersThisMonth || 0}</p>
          <p className="text-xs text-muted-foreground">${(stats?.spentThisMonth || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* New Order Button */}
      <div className="flex justify-end">
        <Button onClick={onNewOrder} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />New Order
        </Button>
      </div>

      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            Pending Orders ({pendingOrders.length})
          </h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Supplier</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Items</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.supplierName}</td>
                    <td className="px-4 py-3 text-center">{order.items.length}</td>
                    <td className="px-4 py-3 text-right font-medium">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${poStatusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Select value={order.status} onValueChange={(v: PurchaseOrderStatus) => onUpdateStatus(order.id, v)}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="ORDERED">Ordered</SelectItem>
                          <SelectItem value="RECEIVED">Received</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order History */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Order History
        </h3>
        {completedOrders.length === 0 && cancelledOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            No completed orders yet
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Supplier</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Items</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ordered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...completedOrders, ...cancelledOrders].map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.supplierName}</td>
                    <td className="px-4 py-3 text-center">{order.items.length}</td>
                    <td className="px-4 py-3 text-right font-medium">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${poStatusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.receivedAt ? format(new Date(order.receivedAt), 'MMM d, yyyy') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
