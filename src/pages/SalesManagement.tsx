import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  Settings,
  Receipt,
  DollarSign
} from 'lucide-react';
import { SalesLeaderboard } from '@/components/sales/SalesLeaderboard';
import { CommissionSettings } from '@/components/sales/CommissionSettings';
import { DepositTracker } from '@/components/sales/DepositTracker';
import { CommissionReport } from '@/components/sales/CommissionReport';
import { SalesOverviewCards } from '@/components/sales/SalesOverviewCards';
import { useSalesStats } from '@/hooks/useSales';
import { DateRangeFilter, DateRange } from '@/components/shared/DateRangeFilter';
import { startOfMonth } from 'date-fns';

export default function SalesManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading } = useSalesStats();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
          </div>
          <p className="text-muted-foreground">
            Track bookings, commissions, and deposits
          </p>
        </div>
        <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Overview Stats Cards */}
      <SalesOverviewCards stats={stats} isLoading={isLoading} />

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="deposits" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Deposits</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Commissions</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SalesLeaderboard dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="deposits">
          <DepositTracker />
        </TabsContent>

        <TabsContent value="commissions">
          <CommissionReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="settings">
          <CommissionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
