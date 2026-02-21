import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { useSalesLeaderboard } from '@/hooks/useSales';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRange } from '@/components/shared/DateRangeFilter';

interface SalesLeaderboardProps {
  dateRange: DateRange;
}

export function SalesLeaderboard({ dateRange }: SalesLeaderboardProps) {
  const { data: leaderboard, isLoading } = useSalesLeaderboard(dateRange.from, dateRange.to);

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Sales Leaderboard
        </CardTitle>
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
                <div className="flex items-center gap-4">
                  <div className="w-12 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>
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
