import React, { useState } from 'react';
import { RESERVATIONS, ROOMS, GUESTS } from '@/data/mockData';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { 
  Search, 
  Plus, 
  Calendar,
  Mail,
  MoreVertical,
  ArrowUpDown,
  UserPlus,
  X
} from 'lucide-react';
import { ReservationStatus, BookingSource, Reservation, Guest } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { differenceInDays, format } from 'date-fns';

const ReservationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [reservations, setReservations] = useState<Reservation[]>(RESERVATIONS);
  const [guests, setGuests] = useState<Guest[]>(GUESTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guestMode, setGuestMode] = useState<'existing' | 'new'>('existing');
  
  // Form state for new reservation
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [source, setSource] = useState<BookingSource>('DIRECT');
  const [status, setStatus] = useState<ReservationStatus>('PENDING');

  const availableRooms = ROOMS.filter(room => 
    room.status === 'AVAILABLE' || room.status === 'RESERVED'
  );

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    return nights > 0 ? nights : 0;
  };

  const calculateTotal = () => {
    const room = ROOMS.find(r => r.id === selectedRoomId);
    if (!room) return 0;
    return room.price * calculateNights();
  };

  const generateConfirmationCode = () => {
    return `CNF-${Math.floor(10000 + Math.random() * 90000)}`;
  };

  const resetForm = () => {
    setSelectedGuestId('');
    setNewGuest({ firstName: '', lastName: '', email: '', phone: '' });
    setSelectedRoomId('');
    setCheckIn('');
    setCheckOut('');
    setNumGuests(1);
    setSource('DIRECT');
    setStatus('PENDING');
    setGuestMode('existing');
  };

  const handleCreateReservation = () => {
    // Validation
    if (guestMode === 'existing' && !selectedGuestId) {
      toast.error('Please select a guest');
      return;
    }
    if (guestMode === 'new' && (!newGuest.firstName || !newGuest.lastName || !newGuest.email)) {
      toast.error('Please fill in guest details');
      return;
    }
    if (!selectedRoomId) {
      toast.error('Please select a room');
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (calculateNights() <= 0) {
      toast.error('Check-out must be after check-in');
      return;
    }

    // Get or create guest
    let guestName = '';
    let guestEmail = '';
    
    if (guestMode === 'existing') {
      const guest = guests.find(g => g.id === selectedGuestId);
      if (guest) {
        guestName = `${guest.firstName} ${guest.lastName}`;
        guestEmail = guest.email;
      }
    } else {
      // Create new guest
      const newGuestId = `gst_${Date.now()}`;
      const createdGuest: Guest = {
        id: newGuestId,
        firstName: newGuest.firstName,
        lastName: newGuest.lastName,
        email: newGuest.email,
        phone: newGuest.phone,
        loyaltyTier: 'STANDARD',
        loyaltyPoints: 0,
        totalSpent: 0,
        totalStays: 0
      };
      setGuests([...guests, createdGuest]);
      guestName = `${newGuest.firstName} ${newGuest.lastName}`;
      guestEmail = newGuest.email;
    }

    const room = ROOMS.find(r => r.id === selectedRoomId);
    
    const newReservation: Reservation = {
      id: `res_${Date.now()}`,
      confirmationCode: generateConfirmationCode(),
      guestName,
      guestEmail,
      roomId: selectedRoomId,
      roomName: room?.name,
      checkIn,
      checkOut,
      nights: calculateNights(),
      guests: numGuests,
      totalAmount: calculateTotal(),
      status,
      source,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    };

    setReservations([newReservation, ...reservations]);
    toast.success(`Reservation ${newReservation.confirmationCode} created successfully!`);
    setIsDialogOpen(false);
    resetForm();
  };

  const filteredReservations = reservations.filter(res => {
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

  const totalBookings = reservations.length;
  const confirmedBookings = reservations.filter(r => r.status === 'CONFIRMED').length;
  const pendingBookings = reservations.filter(r => r.status === 'PENDING').length;
  const totalRevenue = reservations.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reservations</h2>
          <p className="text-muted-foreground">Manage bookings and guest reservations.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 shadow-lg flex items-center transition-all hover:scale-[1.02]">
              <Plus className="w-5 h-5 mr-2" />
              New Reservation
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Reservation</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Guest Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Guest Information</Label>
                <Tabs value={guestMode} onValueChange={(v) => setGuestMode(v as 'existing' | 'new')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing">Existing Guest</TabsTrigger>
                    <TabsTrigger value="new">New Guest</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="existing" className="mt-4">
                    <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a guest..." />
                      </SelectTrigger>
                      <SelectContent>
                        {guests.map(guest => (
                          <SelectItem key={guest.id} value={guest.id}>
                            {guest.firstName} {guest.lastName} - {guest.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TabsContent>
                  
                  <TabsContent value="new" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name *</Label>
                        <Input
                          value={newGuest.firstName}
                          onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name *</Label>
                        <Input
                          value={newGuest.lastName}
                          onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={newGuest.email}
                        onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                        placeholder="john.doe@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={newGuest.phone}
                        onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                        placeholder="+1 555-0123"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Room Selection */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Room</Label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.roomNumber} - {room.name} (${room.price}/night)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date *</Label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date *</Label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              {/* Number of Guests */}
              <div className="space-y-2">
                <Label>Number of Guests</Label>
                <Input
                  type="number"
                  min="1"
                  value={numGuests}
                  onChange={(e) => setNumGuests(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Source and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Booking Source</Label>
                  <Select value={source} onValueChange={(v) => setSource(v as BookingSource)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIRECT">Direct</SelectItem>
                      <SelectItem value="WEBSITE">Website</SelectItem>
                      <SelectItem value="BOOKING_COM">Booking.com</SelectItem>
                      <SelectItem value="EXPEDIA">Expedia</SelectItem>
                      <SelectItem value="AIRBNB">Airbnb</SelectItem>
                      <SelectItem value="WALK_IN">Walk-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ReservationStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary */}
              {selectedRoomId && checkIn && checkOut && calculateNights() > 0 && (
                <div className="bg-secondary p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Reservation Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Room:</span>
                    <span>{ROOMS.find(r => r.id === selectedRoomId)?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nights:</span>
                    <span>{calculateNights()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Total:</span>
                    <span>${calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreateReservation}>
                  Create Reservation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
