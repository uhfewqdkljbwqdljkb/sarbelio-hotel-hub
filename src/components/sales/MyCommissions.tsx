import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyCommissions, MyReservationRow } from '@/hooks/useMyCommissions';
import { useRecordDeposit } from '@/hooks/useSales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, TrendingUp, DollarSign, CalendarDays, Loader2, Receipt, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { PaymentMethod, PaymentStatus } from '@/types';
import { toast } from 'sonner';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'WHISH', label: 'Whish' },
  { value: 'OMT', label: 'OMT' },
  { value: 'OTHER', label: 'Other' },
];

const paymentStatusColors: Record<string, string> = {
  UNPAID: 'bg-destructive/10 text-destructive',
  DEPOSIT_PAID: 'bg-amber-100 text-amber-800',
  FULLY_PAID: 'bg-emerald-100 text-emerald-800',
};

export function MyCommissions() {
  const { user, profile } = useAuth();
  const { data, isLoading } = useMyCommissions(user?.id);
  const recordDeposit = useRecordDeposit();

  const [depositDialog, setDepositDialog] = useState<MyReservationRow | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>('CASH');
  const [depositNotes, setDepositNotes] = useState('');

  const handleRecordDeposit = async () => {
    if (!depositDialog || !depositAmount) {
      toast.error('Please enter an amount');
      return;
    }

    await recordDeposit.mutateAsync({
      reservationId: depositDialog.id,
      reservationCode: depositDialog.confirmationCode,
      guestName: depositDialog.guestName,
      amount: parseFloat(depositAmount),
      paymentMethod: depositMethod,
      notes: depositNotes || undefined,
    });

    setDepositDialog(null);
    setDepositAmount('');
    setDepositMethod('CASH');
    setDepositNotes('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = data?.stats;
  const reservations = data?.reservations || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">My Commissions</h1>
        </div>
        <p className="text-muted-foreground">
          {profile?.full_name || user?.email} — Commission Rate: {stats?.commissionRate ?? 0}%
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() ?? '0'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposits Collected</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalDepositsCollected?.toLocaleString() ?? '0'}</div>
            <p className="text-xs text-muted-foreground">Balance due: ${stats?.totalBalanceDue?.toLocaleString() ?? '0'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalCommission?.toLocaleString() ?? '0'}</div>
            <p className="text-xs text-muted-foreground">
              Pending: ${stats?.pendingCommission?.toLocaleString() ?? '0'} · Paid: ${stats?.paidCommission?.toLocaleString() ?? '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Reservations & Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reservations found. Create a reservation to start earning commissions.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Deposit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.confirmationCode}</TableCell>
                      <TableCell>{r.guestName}</TableCell>
                      <TableCell>{format(new Date(r.checkIn), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(new Date(r.checkOut), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">${r.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${r.depositAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${r.balanceDue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentStatusColors[r.paymentStatus] || 'bg-muted text-muted-foreground'}>
                          {r.paymentStatus === 'DEPOSIT_PAID' ? 'Partial' : r.paymentStatus === 'FULLY_PAID' ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${r.commissionAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        {r.paymentStatus !== 'FULLY_PAID' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositDialog(r)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Deposit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Deposit Dialog */}
      <Dialog open={!!depositDialog} onOpenChange={(open) => !open && setDepositDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Deposit</DialogTitle>
          </DialogHeader>
          {depositDialog && (
            <div className="space-y-4 py-2">
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p><span className="font-medium">Reservation:</span> {depositDialog.confirmationCode}</p>
                <p><span className="font-medium">Guest:</span> {depositDialog.guestName}</p>
                <p><span className="font-medium">Total:</span> ${depositDialog.totalAmount.toLocaleString()}</p>
                <p><span className="font-medium">Already Paid:</span> ${depositDialog.depositAmount.toLocaleString()}</p>
                <p><span className="font-medium">Balance Due:</span> ${depositDialog.balanceDue.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={depositMethod} onValueChange={(v) => setDepositMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Any additional notes..."
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDepositDialog(null)}>Cancel</Button>
                <Button onClick={handleRecordDeposit} disabled={recordDeposit.isPending}>
                  {recordDeposit.isPending ? 'Recording...' : 'Record Deposit'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
