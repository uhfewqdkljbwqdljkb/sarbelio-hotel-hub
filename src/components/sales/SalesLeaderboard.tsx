import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Medal, Award } from 'lucide-react';
import { useSalesLeaderboard } from '@/hooks/useSales';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function SalesLeaderboard() {
  const [period, setPeriod] = useState('this-month');
  
  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'this-month':
        return { start: startOfMonth(now), end: now };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'this-year':
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return { start: startOfMonth(now), end: now };
    }
  };

  const { start, end } = getDateRange();
  const { data: leaderboard, isLoading } = useSalesLeaderboard(start, end);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-background border-border';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Sales Leaderboard
        </CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : leaderboard?.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No sales data for this period
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard?.map((entry, index) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-4 rounded-lg border ${getRankBgColor(index + 1)}`}
              >
                {/* Rank */}
                <div className="flex items-center gap-4">
                  <div className="w-12 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar & Name */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatarUrl} />
                    <AvatarFallback>
                      {entry.userName?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{entry.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.totalBookings} booking{entry.totalBookings !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="text-lg font-bold">${entry.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-emerald-600">
                    +${entry.totalCommission.toLocaleString()} commission
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
