import React, { useMemo } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useRooms } from '@/hooks/useRooms';
import { useGuests } from '@/hooks/useGuests';
import { useFinancialSummary } from '@/hooks/useFinancials';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ChevronDown, Calendar, Users, Home, DollarSign, Loader2 } from 'lucide-react';
import { format, subDays, parseISO, startOfDay, isWithinInterval } from 'date-fns';

const Dashboard: React.FC = () => {
  const { data: reservations = [], isLoading: resLoading } = useReservations();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: guests = [], isLoading: guestsLoading } = useGuests();
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();

  const isLoading = resLoading || roomsLoading || guestsLoading || summaryLoading;

  // Calculate stats from real data
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
  const totalGuests = guests.length;
  // Use financial summary for accurate total revenue (rooms + restaurant + minimarket + services)
  const totalRevenue = summary?.totalRevenue || 0;
  const pendingReservations = reservations.filter(r => r.status === 'PENDING').length;
  const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED').length;

  // Create chart data from real reservations (last 7 days)
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayLabel = format(date, 'EEE');
      
      // Count reservations created on this day
      const count = reservations.filter(res => {
        const createdAt = res.createdAt ? startOfDay(parseISO(res.createdAt)) : null;
        return createdAt && format(createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      }).length;
      
      days.push({ date: dayLabel, reservations: count });
    }
    
    return days;
  }, [reservations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Rooms</p>
            <p className="text-2xl font-bold text-foreground">{totalRooms}</p>
            <p className="text-xs text-muted-foreground">{occupiedRooms} occupied</p>
          </div>
        </DashboardCard>
        
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full mr-4">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reservations</p>
            <p className="text-2xl font-bold text-foreground">{reservations.length}</p>
            <p className="text-xs text-muted-foreground">{pendingReservations} pending</p>
          </div>
        </DashboardCard>
        
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Guests</p>
            <p className="text-2xl font-bold text-foreground">{totalGuests}</p>
          </div>
        </DashboardCard>
        
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
          </div>
        </DashboardCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservations Chart */}
        <DashboardCard 
          className="lg:col-span-2" 
          title="Weekly Overview" 
          action={
            <button className="flex items-center text-xs font-medium bg-primary-100 text-primary-800 px-3 py-1 rounded-full hover:bg-primary-200 transition-colors">
              Last 7 Days <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          }
        >
          {reservations.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reservation data yet</p>
                <p className="text-sm">Create reservations to see analytics</p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--secondary))' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      backgroundColor: 'hsl(var(--card))'
                    }}
                  />
                  <Bar dataKey="reservations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardCard>

        {/* Quick Stats */}
        <DashboardCard title="Quick Stats">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">Occupancy Rate</span>
              <span className="font-bold text-foreground">
                {totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">Confirmed Bookings</span>
              <span className="font-bold text-foreground">{confirmedReservations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">Avg. Revenue/Booking</span>
              <span className="font-bold text-foreground">
                ${reservations.length > 0 ? Math.round(totalRevenue / reservations.length).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <span className="text-sm text-muted-foreground">Available Rooms</span>
              <span className="font-bold text-foreground">
                {rooms.filter(r => r.status === 'AVAILABLE').length}
              </span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Recent Activity */}
      <DashboardCard title="Recent Reservations">
        {reservations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reservations yet</p>
            <p className="text-sm">Go to Reservations to create your first booking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.slice(0, 5).map((res) => (
              <div key={res.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{res.guestName}</p>
                  <p className="text-xs text-muted-foreground">{res.confirmationCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${res.totalAmount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {res.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default Dashboard;
