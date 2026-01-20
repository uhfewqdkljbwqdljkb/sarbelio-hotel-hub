import { format } from 'date-fns';
import { Calendar, User, BedDouble, Phone, Mail, CreditCard, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ReservationDetails {
  id: string;
  guestName: string;
  guestEmail?: string;
  phone?: string;
  roomNumber: string;
  roomId: string | null;
  checkIn: string;
  checkOut: string;
  status: string;
  totalAmount?: number;
  nights?: number;
  guests?: number;
  isDayStay?: boolean;
}

interface ReservationDetailsModalProps {
  reservation: ReservationDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: string) => void;
  isUpdating?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-amber-400', text: 'text-white', label: 'Pending' },
  CONFIRMED: { bg: 'bg-sky-500', text: 'text-white', label: 'Confirmed' },
  CHECKED_IN: { bg: 'bg-emerald-500', text: 'text-white', label: 'Checked In' },
  CHECKED_OUT: { bg: 'bg-slate-400', text: 'text-white', label: 'Checked Out' },
  CANCELLED: { bg: 'bg-red-400', text: 'text-white', label: 'Cancelled' },
  NO_SHOW: { bg: 'bg-orange-400', text: 'text-white', label: 'No Show' },
};

export function ReservationDetailsModal({
  reservation,
  open,
  onOpenChange,
  onStatusChange,
  isUpdating = false,
}: ReservationDetailsModalProps) {
  if (!reservation) return null;

  const config = statusConfig[reservation.status] || statusConfig.PENDING;

  const getAvailableActions = () => {
    switch (reservation.status) {
      case 'PENDING':
        return [
          { label: 'Confirm', status: 'CONFIRMED', variant: 'default' as const },
          { label: 'No Show', status: 'NO_SHOW', variant: 'outline' as const },
          { label: 'Cancel', status: 'CANCELLED', variant: 'destructive' as const },
        ];
      case 'CONFIRMED':
        return [
          { label: 'Check In', status: 'CHECKED_IN', variant: 'default' as const },
          { label: 'No Show', status: 'NO_SHOW', variant: 'outline' as const },
          { label: 'Cancel', status: 'CANCELLED', variant: 'destructive' as const },
        ];
      case 'CHECKED_IN':
        return [
          { label: 'Check Out', status: 'CHECKED_OUT', variant: 'default' as const },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Reservation Details</span>
            <Badge className={cn(config.bg, config.text, 'ml-2')}>
              {config.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Guest Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{reservation.guestName}</p>
                <p className="text-xs text-muted-foreground">Guest</p>
              </div>
            </div>

            {reservation.guestEmail && (
              <div className="flex items-center gap-3 pl-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{reservation.guestEmail}</span>
              </div>
            )}

            {reservation.phone && (
              <div className="flex items-center gap-3 pl-1">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{reservation.phone}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Room & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BedDouble className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{reservation.roomNumber}</p>
                <p className="text-xs text-muted-foreground">Room</p>
              </div>
            </div>

            {reservation.totalAmount !== undefined && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">${reservation.totalAmount}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{format(new Date(reservation.checkIn), 'MMM d, yyyy')}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{format(new Date(reservation.checkOut), 'MMM d, yyyy')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {reservation.isDayStay ? 'Day Stay' : `${reservation.nights || 1} night(s)`}
                {reservation.guests && ` • ${reservation.guests} guest(s)`}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          {actions.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.status}
                    variant={action.variant}
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => onStatusChange(reservation.id, action.status)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
