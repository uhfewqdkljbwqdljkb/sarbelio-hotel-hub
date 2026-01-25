import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useCommissionReport, useMarkCommissionPaid } from '@/hooks/useSales';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CommissionStatus } from '@/types';

export function CommissionReport() {
  const [period, setPeriod] = useState('this-month');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CommissionStatus>('ALL');

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'this-month':
        return { start: startOfMonth(now), end: now };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      default:
        return { start: startOfMonth(now), end: now };
    }
  };

  const { start, end } = getDateRange();
  const { data: report, isLoading } = useCommissionReport(start, end);
  const markPaid = useMarkCommissionPaid();

  const filteredReport = report?.filter(
    (r) => statusFilter === 'ALL' || r.commissionStatus === statusFilter
  );

  const getStatusBadge = (status: CommissionStatus) => {
    const config = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      PAID: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const { color, icon: Icon } = config[status];
    return (
      <Badge className={color}>
        <Icon className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const handleMarkPaid = async (userId: string, periodStr: string) => {
    await markPaid.mutateAsync({ userId, period: periodStr });
  };

  const totalPending = filteredReport
    ?.filter((r) => r.commissionStatus === 'PENDING')
    .reduce((sum, r) => sum + r.totalCommission, 0) || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Commission Report
          </CardTitle>
          {totalPending > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              ${totalPending.toLocaleString()} in pending commissions
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead className="text-center">Bookings</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredReport?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No commission data for this period
                  </TableCell>
                </TableRow>
              ) : (
                filteredReport?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {record.userName?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {record.userName}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{record.totalBookings}</TableCell>
                    <TableCell className="text-right">${record.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      ${record.totalCommission.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.commissionStatus)}</TableCell>
                    <TableCell>
                      {record.commissionStatus === 'PENDING' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkPaid(record.userId, record.period)}
                          disabled={markPaid.isPending}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {record.commissionStatus === 'PAID' && record.paidDate && (
                        <span className="text-sm text-muted-foreground">
                          Paid {format(new Date(record.paidDate), 'MMM d')}
                        </span>
                      )}
                    </TableCell>
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
