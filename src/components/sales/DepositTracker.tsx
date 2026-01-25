import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Receipt, Search } from 'lucide-react';
import { useDeposits, useRecordDeposit } from '@/hooks/useSales';
import { useReservations } from '@/hooks/useReservations';
import { PaymentMethod } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'WHISH', label: 'Whish' },
  { value: 'OMT', label: 'OMT' },
  { value: 'OTHER', label: 'Other' },
];

export function DepositTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: deposits, isLoading } = useDeposits();
  const { data: reservations } = useReservations();
  const recordDeposit = useRecordDeposit();

  // Filter reservations that aren't fully paid
  const unpaidReservations = reservations?.filter(
    (r) => r.paymentStatus !== 'FULLY_PAID' && r.status !== 'CANCELLED'
  );

  const handleRecordDeposit = async () => {
    if (!selectedReservation || !amount) {
      toast.error('Please select a reservation and enter an amount');
      return;
    }

    const reservation = reservations?.find((r) => r.id === selectedReservation);
    
    await recordDeposit.mutateAsync({
      reservationId: selectedReservation,
      reservationCode: reservation?.confirmationCode,
      guestName: reservation?.guestName,
      amount: parseFloat(amount),
      paymentMethod,
      notes,
    });

    // Reset form
    setSelectedReservation('');
    setAmount('');
    setPaymentMethod('CASH');
    setNotes('');
    setIsDialogOpen(false);
  };

  const filteredDeposits = deposits?.filter((d) =>
    d.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.reservationCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const colors: Record<PaymentMethod, string> = {
      CASH: 'bg-green-100 text-green-800',
      CREDIT_CARD: 'bg-blue-100 text-blue-800',
      BANK_TRANSFER: 'bg-purple-100 text-purple-800',
      WHISH: 'bg-pink-100 text-pink-800',
      OMT: 'bg-orange-100 text-orange-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Deposit Transactions
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Deposit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Deposit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Reservation</Label>
                <Select value={selectedReservation} onValueChange={setSelectedReservation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reservation..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unpaidReservations?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.confirmationCode} - {r.guestName} (${r.balanceDue?.toLocaleString() || r.totalAmount.toLocaleString()} due)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRecordDeposit} disabled={recordDeposit.isPending}>
                  {recordDeposit.isPending ? 'Recording...' : 'Record Deposit'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by guest or reservation..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reservation</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Received By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredDeposits?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No deposits found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeposits?.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      {format(new Date(deposit.transactionDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {deposit.reservationCode}
                    </TableCell>
                    <TableCell>{deposit.guestName}</TableCell>
                    <TableCell className="font-medium">
                      ${deposit.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentMethodBadge(deposit.paymentMethod)}>
                        {deposit.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{deposit.receivedByUserName}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
