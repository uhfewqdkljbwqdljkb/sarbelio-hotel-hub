import React, { useState } from 'react';
import { RESERVATIONS } from '@/data/mockData';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { 
  Search, 
  Plus, 
  Filter,
  Calendar,
  Mail,
  Phone,
  MoreVertical,
  ArrowUpDown
} from 'lucide-react';
import { ReservationStatus, BookingSource } from '@/types';

const ReservationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredReservations = RESERVATIONS.filter(res => {
    const matchesSearch = 
      res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      res.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || res.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CHECKED_IN': return 'bg-blue-100 text-blue-800';
      case 'CHECKED_OUT': return 'bg-muted text-muted-foreground';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSourceBadge = (source: BookingSource) => {
    const sourceColors: Record<BookingSource, string> = {
      'DIRECT': 'bg-primary-100 text-primary-800',
      'WEBSITE': 'bg-blue-50 text-blue-700',
      'BOOKING_COM': 'bg-blue-100 text-blue-800',
      'EXPEDIA': 'bg-yellow-50 text-yellow-700',
      'AIRBNB': 'bg-red-50 text-red-700',
      'WALK_IN': 'bg-muted text-muted-foreground',
    };
    return sourceColors[source] || 'bg-muted text-muted-foreground';
  };

  // Stats
  const totalBookings = RESERVATIONS.length;
  const confirmedBookings = RESERVATIONS.filter(r => r.status === 'CONFIRMED').length;
  const pendingBookings = RESERVATIONS.filter(r => r.status === 'PENDING').length;
  const totalRevenue = RESERVATIONS.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reservations</h2>
          <p className="text-muted-foreground">Manage bookings and guest reservations.</p>
        </div>
        <button className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 shadow-lg flex items-center transition-all hover:scale-[1.02]">
          <Plus className="w-5 h-5 mr-2" />
          New Reservation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-primary-100 text-primary-700 rounded-full mr-4">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-xl font-bold text-foreground">{totalBookings}</p>
          </div>
        </DashboardCard>
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-full mr-4">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <p className="text-xl font-bold text-foreground">{confirmedBookings}</p>
          </div>
        </DashboardCard>
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-yellow-100 text-yellow-700 rounded-full mr-4">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-xl font-bold text-foreground">{pendingBookings}</p>
          </div>
        </DashboardCard>
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-full mr-4">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
          </div>
        </DashboardCard>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Search by guest name or confirmation code..." 
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {['ALL', 'CONFIRMED', 'PENDING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                filterStatus === status 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer hover:text-foreground">
                    Confirmation <ArrowUpDown className="w-3 h-3 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {reservation.confirmationCode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{reservation.guestName}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                        <Mail className="w-3 h-3 mr-1" />
                        {reservation.guestEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">
                      {reservation.roomName || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-foreground">{reservation.checkIn}</p>
                      <p className="text-muted-foreground">to {reservation.checkOut}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {reservation.nights} night{reservation.nights > 1 ? 's' : ''} • {reservation.guests} guest{reservation.guests > 1 ? 's' : ''}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getSourceBadge(reservation.source)}`}>
                      {reservation.source.replace(/_/g, '.')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-foreground">
                      ${reservation.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;
