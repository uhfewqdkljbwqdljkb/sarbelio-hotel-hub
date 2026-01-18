import React, { useState } from 'react';
import { useReservations, useCreateReservation, useCancelReservation } from '@/hooks/useReservations';
import { useCancelledReservations } from '@/hooks/useFinancials';
import { useRooms } from '@/hooks/useRooms';
import { useGuests, useCreateGuest } from '@/hooks/useGuests';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { 
  Search, 
  Plus, 
  Calendar,
  Mail,
  MoreVertical,
  ArrowUpDown,
  UserPlus,
  X,
  Loader2,
  Ban,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { ReservationStatus, BookingSource, Reservation, Guest } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { differenceInDays, format } from 'date-fns';

const ReservationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [guestMode, setGuestMode] = useState<'existing' | 'new'>('existing');
  const [activeTab, setActiveTab] = useState<'reservations' | 'cancellations'>('reservations');
  
  const { data: reservations = [], isLoading: reservationsLoading } = useReservations();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: guests = [], isLoading: guestsLoading } = useGuests();
  const { data: cancelledData, isLoading: cancelledLoading } = useCancelledReservations();
  const createReservation = useCreateReservation();
  const createGuest = useCreateGuest();
  const cancelReservation = useCancelReservation();
  
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
  const [isDayStay, setIsDayStay] = useState(false);

  const availableRooms = rooms.filter(room => 
    room.status === 'AVAILABLE' || room.status === 'RESERVED'
  );

  const calculateNights = () => {
    if (isDayStay) return 1; // Day stay counts as 1 unit
    if (!checkIn || !checkOut) return 0;
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    return nights > 0 ? nights : 0;
  };

  const calculateTotal = () => {
    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room) return 0;
    
    if (isDayStay) {
      // Use day stay price if available, otherwise use base price
      return room.dayStayPrice || room.price;
    }
    
    return room.price * calculateNights();
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
    setIsDayStay(false);
  };

  const handleCreateReservation = async () => {
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
    if (!checkIn) {
      toast.error('Please select check-in date');
      return;
    }
    if (!isDayStay && !checkOut) {
      toast.error('Please select check-out date');
      return;
    }
    if (!isDayStay && calculateNights() <= 0) {
      toast.error('Check-out must be after check-in');
      return;
    }

    try {
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
        const createdGuest = await createGuest.mutateAsync({
          firstName: newGuest.firstName,
          lastName: newGuest.lastName,
          email: newGuest.email,
          phone: newGuest.phone,
        });
        guestName = `${newGuest.firstName} ${newGuest.lastName}`;
        guestEmail = newGuest.email;
      }

      const room = rooms.find(r => r.id === selectedRoomId);
      
      // For day stay, use same date for check-in and check-out
      const effectiveCheckOut = isDayStay ? checkIn : checkOut;
      
      await createReservation.mutateAsync({
        confirmationCode: `CNF-${Date.now().toString(36).toUpperCase()}`,
        guestName,
        guestEmail,
        roomId: selectedRoomId,
        roomName: room?.name,
        checkIn,
        checkOut: effectiveCheckOut,
        nights: calculateNights(),
        guests: numGuests,
        totalAmount: calculateTotal(),
        status,
        source,
        isDayStay,
      });

      toast.success('Reservation created successfully!');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create reservation');
      console.error(error);
    }
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

  const totalBookings = reservations.filter(r => r.status !== 'CANCELLED').length;
  const confirmedBookings = reservations.filter(r => r.status === 'CONFIRMED').length;
  const pendingBookings = reservations.filter(r => r.status === 'PENDING').length;
  const totalRevenue = reservations.filter(r => r.status !== 'CANCELLED').reduce((sum, r) => sum + r.totalAmount, 0);
  const cancelledCount = cancelledData?.count || 0;
  const lostRevenue = cancelledData?.totalLostRevenue || 0;

  const handleCancelReservation = async (reservation: Reservation) => {
    try {
      await cancelReservation.mutateAsync({
        id: reservation.id,
        roomId: reservation.roomId,
      });
      toast.success('Reservation cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel reservation');
      console.error(error);
    }
  };

  const isLoading = reservationsLoading || roomsLoading || guestsLoading || cancelledLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                    {guests.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">No guests found. Create a new guest.</p>
                    )}
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
                        {room.roomNumber} - {room.name} (${isDayStay ? (room.dayStayPrice || room.price) : room.price}/{isDayStay ? 'day' : 'night'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableRooms.length === 0 && (
                  <p className="text-sm text-muted-foreground">No rooms available. Add rooms first.</p>
                )}
              </div>

              {/* Day Stay Toggle */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  {isDayStay ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-blue-500" />
                  )}
                  <div>
                    <Label className="text-base font-medium cursor-pointer">
                      {isDayStay ? 'Day Stay' : 'Night Stay'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isDayStay 
                        ? 'Daytime booking (no overnight)' 
                        : 'Standard overnight reservation'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDayStay}
                  onCheckedChange={setIsDayStay}
                />
              </div>

              {/* Dates */}
              <div className={`grid gap-4 ${isDayStay ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="space-y-2">
                  <Label>{isDayStay ? 'Date *' : 'Check-in Date *'}</Label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                {!isDayStay && (
                  <div className="space-y-2">
                    <Label>Check-out Date *</Label>
                    <Input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                )}
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
              {selectedRoomId && checkIn && (isDayStay || (checkOut && calculateNights() > 0)) && (
                <div className="bg-secondary p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    Reservation Summary
                    {isDayStay && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Day Stay
                      </span>
                    )}
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Room:</span>
                    <span>{rooms.find(r => r.id === selectedRoomId)?.name}</span>
                  </div>
                  {isDayStay ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{format(new Date(checkIn), 'MMM d, yyyy')}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nights:</span>
                      <span>{calculateNights()}</span>
                    </div>
                  )}
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
                <Button 
                  className="flex-1" 
                  onClick={handleCreateReservation}
                  disabled={createReservation.isPending}
                >
                  {createReservation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Create Reservation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <DashboardCard className="flex items-center p-4">
          <div className="p-3 bg-red-100 text-red-700 rounded-full mr-4">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lost Revenue</p>
            <p className="text-xl font-bold text-red-600">${lostRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{cancelledCount} cancelled</p>
          </div>
        </DashboardCard>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reservations' | 'cancellations')}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="reservations">Active Reservations</TabsTrigger>
          <TabsTrigger value="cancellations">
            Cancellations {cancelledCount > 0 && <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">{cancelledCount}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="space-y-4 mt-4">

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
          {['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === status 
                  ? 'bg-foreground text-background' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No reservations found</p>
          <p className="text-sm">Create your first reservation to get started</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{res.guestName}</div>
                        <div className="text-xs text-muted-foreground">{res.confirmationCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{res.roomName || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(res.checkIn), 'MMM d')} - {format(new Date(res.checkOut), 'MMM d, yyyy')}
                      <div className="text-xs">{res.nights} nights</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(res.status)}`}>
                        {res.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getSourceBadge(res.source)}`}>
                        {res.source.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground">
                      ${res.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {res.status !== 'CANCELLED' && res.status !== 'CHECKED_OUT' && (
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600 cursor-pointer">
                                  <Ban className="w-4 h-4 mr-2" />
                                  Cancel Reservation
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Cancel Reservation
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel the reservation for <strong>{res.guestName}</strong>? 
                                This will remove <strong>${res.totalAmount.toLocaleString()}</strong> from your revenue.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelReservation(res)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {cancelReservation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                Cancel Reservation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </TabsContent>

        <TabsContent value="cancellations" className="mt-4">
          {cancelledData?.cancellations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
              <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No cancelled reservations</p>
              <p className="text-sm">Cancelled bookings will appear here</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-red-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guest</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Original Dates</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-red-700 uppercase tracking-wider">Lost Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cancelledData?.cancellations.map((res: any) => (
                      <tr key={res.id} className="hover:bg-red-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-foreground">{res.guest_name}</div>
                            <div className="text-xs text-muted-foreground">{res.confirmation_code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{res.room_name || 'Unassigned'}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {format(new Date(res.check_in), 'MMM d')} - {format(new Date(res.check_out), 'MMM d, yyyy')}
                          <div className="text-xs">{res.nights} nights</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${getSourceBadge(res.source)}`}>
                            {res.source.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-red-600">
                          -${Number(res.total_amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-red-50 border-t-2 border-red-200">
                      <td colSpan={4} className="px-6 py-4 text-right font-semibold text-foreground">
                        Total Lost Revenue:
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-600 text-lg">
                        -${lostRevenue.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReservationsPage;
