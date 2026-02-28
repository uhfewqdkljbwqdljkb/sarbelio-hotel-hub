import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyCommissions } from '@/hooks/useMyCommissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, DollarSign, CalendarDays, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function MyCommissions() {
  const { user, profile } = useAuth();
  const { data, isLoading } = useMyCommissions(user?.id);

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
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalCommission?.toLocaleString() ?? '0'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">${stats?.pendingCommission?.toLocaleString() ?? '0'}</div>
            <p className="text-xs text-muted-foreground">Paid: ${stats?.paidCommission?.toLocaleString() ?? '0'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reservations found. Create a reservation to start earning commissions.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell className="text-right">${r.commissionAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={r.commissionStatus === 'PAID' ? 'default' : 'secondary'}>
                        {r.commissionStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
