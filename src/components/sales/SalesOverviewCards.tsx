import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  Calendar,
  Percent,
  CreditCard,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SalesStats } from '@/types';

interface SalesOverviewCardsProps {
  stats?: SalesStats;
  isLoading?: boolean;
}

export function SalesOverviewCards({ stats, isLoading }: SalesOverviewCardsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue || 0,
      icon: DollarSign,
      format: 'currency' as const,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      format: 'number' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Commissions Due',
      value: stats?.totalCommissions || 0,
      icon: Percent,
      format: 'currency' as const,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Deposits Collected',
      value: stats?.collectedDeposits || 0,
      icon: CreditCard,
      format: 'currency' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.format === 'currency' 
                ? `$${card.value.toLocaleString()}` 
                : card.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
