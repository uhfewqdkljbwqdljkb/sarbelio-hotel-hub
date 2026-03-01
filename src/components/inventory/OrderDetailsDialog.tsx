import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrder } from '@/types/inventory';
import { poStatusColors } from './InventoryConstants';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { Package, Truck, Clock, CalendarDays, DollarSign } from 'lucide-react';

interface OrderDetailsDialogProps {
  order: PurchaseOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getLeadTime(order: PurchaseOrder): string | null {
  if (!order.receivedAt) return null;
  const created = new Date(order.createdAt);
  const received = new Date(order.receivedAt);
  const days = differenceInDays(received, created);
  const hours = differenceInHours(received, created) % 24;
  if (days === 0) return `${hours}h`;
  if (hours === 0) return `${days}d`;
  return `${days}d ${hours}h`;
}

function getElapsedTime(order: PurchaseOrder): string {
  const created = new Date(order.createdAt);
  const now = new Date();
  const days = differenceInDays(now, created);
  if (days === 0) {
    const hours = differenceInHours(now, created);
    return `${hours}h ago`;
  }
  return `${days}d ago`;
}

export default function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null;

  const leadTime = getLeadTime(order);
  const isActive = !['RECEIVED', 'CANCELLED'].includes(order.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            {order.orderNumber}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${poStatusColors[order.status]}`}>
              {order.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" />Supplier</p>
              <p className="font-medium text-sm mt-1">{order.supplierName}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Total</p>
              <p className="font-bold text-sm mt-1">${order.totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" />Created</p>
              <p className="font-medium text-sm mt-1">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />
                {leadTime ? 'Lead Time' : isActive ? 'Elapsed' : 'Delivery'}
              </p>
              <p className="font-medium text-sm mt-1">
                {leadTime
                  ? leadTime
                  : isActive
                    ? getElapsedTime(order)
                    : order.expectedDelivery
                      ? format(new Date(order.expectedDelivery), 'MMM d, yyyy')
                      : '-'}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timeline</p>
            <div className="space-y-2 text-sm">
              <TimelineRow label="Created" date={order.createdAt} />
              {order.expectedDelivery && <TimelineRow label="Expected Delivery" date={order.expectedDelivery} />}
              {order.receivedAt && <TimelineRow label="Received" date={order.receivedAt} highlight />}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Items ({order.items.length})
            </p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Item</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Unit Cost</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{item.itemName}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">${item.unitCost.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-medium">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-right font-medium">Grand Total</td>
                    <td className="px-3 py-2 text-right font-bold">${order.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm bg-muted/50 rounded-lg p-3">{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TimelineRow({ label, date, highlight }: { label: string; date: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={highlight ? 'font-medium text-green-600' : 'text-muted-foreground'}>{label}</span>
      <span className={highlight ? 'font-medium' : ''}>{format(new Date(date), 'MMM d, yyyy')}</span>
    </div>
  );
}
