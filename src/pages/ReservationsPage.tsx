import React, { useState } from 'react';
import { useReservations, useCreateReservation, useCancelReservation, useUpdateReservation } from '@/hooks/useReservations';
import { useCancelledReservations } from '@/hooks/useFinancials';
import { useRooms } from '@/hooks/useRooms';
import { useGuests, useCreateGuest } from '@/hooks/useGuests';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { EditAddonsDialog } from '@/components/reservations/EditAddonsDialog';
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
  Moon,
  CheckCircle,
  LogIn,
  LogOut,
  History,
  Download,
  Filter,
  Package
} from 'lucide-react';
import { ReservationStatus, BookingSource, Reservation, Guest } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
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
  const [activeTab, setActiveTab] = useState<'reservations' | 'past' | 'cancellations'>('reservations');
  
  // Date range filters for past reservations
  const [pastDateFrom, setPastDateFrom] = useState('');
  const [pastDateTo, setPastDateTo] = useState('');
  const [pastDateType, setPastDateType] = useState<'check_in' | 'check_out'>('check_in');
  
  const { data: reservations = [], isLoading: reservationsLoading } = useReservations();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: guests = [], isLoading: guestsLoading } = useGuests();
  const { data: cancelledData, isLoading: cancelledLoading } = useCancelledReservations();
  const createReservation = useCreateReservation();
  const createGuest = useCreateGuest();
  const cancelReservation = useCancelReservation();
  const updateReservation = useUpdateReservation();
  
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
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [numGuests, setNumGuests] = useState(1);
  const [source, setSource] = useState<BookingSource>('DIRECT');
  const [status, setStatus] = useState<ReservationStatus>('PENDING');
  const [isDayStay, setIsDayStay] = useState(false);
  const [extraBedCount, setExtraBedCount] = useState(0);
  const [extraWoodCount, setExtraWoodCount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  
  // Edit add-ons dialog state
  const [editAddonsReservation, setEditAddonsReservation] = useState<Reservation | null>(null);
  const [isEditAddonsOpen, setIsEditAddonsOpen] = useState(false);

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
    
    let baseAmount = 0;
    if (isDayStay) {
      baseAmount = room.dayStayPrice || room.price;
    } else {
      baseAmount = room.price * calculateNights();
    }
    
    // Add extras
    const extraBedTotal = extraBedCount * 20; // $20 per extra bed
    const extraWoodTotal = extraWoodCount * 15; // $15 per extra wood
    
    // Apply discount
    const total = baseAmount + extraBedTotal + extraWoodTotal - discountAmount;
    
    return Math.max(0, total); // Ensure total is not negative
  };

  const resetForm = () => {
    setSelectedGuestId('');
    setNewGuest({ firstName: '', lastName: '', email: '', phone: '' });
    setSelectedRoomId('');
    setCheckIn('');
    setCheckOut('');
    setCheckInTime('15:00');
    setCheckOutTime('11:00');
    setNumGuests(1);
    setSource('DIRECT');
    setStatus('PENDING');
    setGuestMode('existing');
    setIsDayStay(false);
    setExtraBedCount(0);
    setExtraWoodCount(0);
    setDiscountAmount(0);
  };

  const handleCreateReservation = async () => {
    // Validation
    if (guestMode === 'existing' && !selectedGuestId) {
      toast.error('Please select a guest');
      return;
    }
    if (guestMode === 'new' && (!newGuest.firstName || !newGuest.lastName)) {
      toast.error('Please fill in guest first and last name');
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
        checkInTime,
        checkOutTime,
        nights: calculateNights(),
        guests: numGuests,
        totalAmount: calculateTotal(),
        status,
        source,
        isDayStay,
        extraBedCount,
        extraWoodCount,
        discountAmount,
      });

      toast.success('Reservation created successfully!');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create reservation');
      console.error(error);
    }
  };

  // Separate active vs past reservations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activeReservations = reservations.filter(res => {
    // Active: not cancelled, not checked out, and check-out is today or future
    const checkOutDate = new Date(res.checkOut);
    checkOutDate.setHours(0, 0, 0, 0);
    const isPast = checkOutDate < today || res.status === 'CHECKED_OUT';
    return res.status !== 'CANCELLED' && !isPast;
  });
  
  const pastReservations = reservations.filter(res => {
    // Past: checked out or check-out date is in the past (excluding cancelled)
    const checkOutDate = new Date(res.checkOut);
    checkOutDate.setHours(0, 0, 0, 0);
    const isPast = checkOutDate < today || res.status === 'CHECKED_OUT';
    return res.status !== 'CANCELLED' && isPast;
  });

  const filteredReservations = activeReservations.filter(res => {
    const matchesSearch = 
      res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      res.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || res.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  const filteredPastReservations = pastReservations.filter(res => {
    const matchesSearch = 
      res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      res.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date range filter
    let matchesDateRange = true;
    if (pastDateFrom || pastDateTo) {
      const dateToCheck = pastDateType === 'check_in' 
        ? new Date(res.checkIn) 
        : new Date(res.checkOut);
      dateToCheck.setHours(0, 0, 0, 0);
      
      if (pastDateFrom) {
        const fromDate = new Date(pastDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (dateToCheck < fromDate) matchesDateRange = false;
      }
      if (pastDateTo) {
        const toDate = new Date(pastDateTo);
        toDate.setHours(0, 0, 0, 0);
        if (dateToCheck > toDate) matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesDateRange;
  });

  // CSV Export function
  const exportToCsv = () => {
    const headers = [
      'Confirmation Code',
      'Guest Name',
      'Room',
      'Check In',
      'Check Out',
      'Nights',
      'Status',
      'Source',
      'Revenue'
    ];
    
    const rows = filteredPastReservations.map(res => [
      res.confirmationCode,
      res.guestName,
      res.roomName || 'Unassigned',
      format(new Date(res.checkIn), 'yyyy-MM-dd'),
      format(new Date(res.checkOut), 'yyyy-MM-dd'),
      res.nights.toString(),
      res.status.replace(/_/g, ' '),
      res.source.replace(/_/g, ' '),
      res.totalAmount.toString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `past-reservations-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredPastReservations.length} reservations to CSV`);
  };

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

  const totalBookings = activeReservations.length;
  const confirmedBookings = activeReservations.filter(r => r.status === 'CONFIRMED').length;
  const pendingBookings = activeReservations.filter(r => r.status === 'PENDING').length;
  const totalRevenue = reservations.filter(r => r.status !== 'CANCELLED').reduce((sum, r) => sum + r.totalAmount, 0);
  const pastCount = pastReservations.length;
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

  const handleStatusChange = async (reservation: Reservation, newStatus: ReservationStatus) => {
    try {
      await updateReservation.mutateAsync({
        id: reservation.id,
        status: newStatus,
      });
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleSaveAddons = async (data: {
    id: string;
    extraBedCount: number;
    extraWoodCount: number;
    discountAmount: number;
    totalAmount: number;
  }) => {
    try {
      await updateReservation.mutateAsync({
        id: data.id,
        extraBedCount: data.extraBedCount,
        extraWoodCount: data.extraWoodCount,
        discountAmount: data.discountAmount,
        totalAmount: data.totalAmount,
      });
      toast.success('Add-ons updated successfully');
    } catch (error) {
      toast.error('Failed to update add-ons');
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
                      <Label>Email (Optional)</Label>
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

              {/* Dates and Times */}
              <div className="space-y-4">
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
                
                {/* Time inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isDayStay ? 'Arrival Time' : 'Check-in Time'}</Label>
                    <Input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isDayStay ? 'Departure Time' : 'Check-out Time'}</Label>
                    <Input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                    />
                  </div>
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

              {/* Extra Charges & Discount */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Add-ons & Discounts</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Extra Bed</span>
                      <span className="text-xs text-muted-foreground">$20 each</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={extraBedCount}
                      onChange={(e) => setExtraBedCount(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>Extra Wood</span>
                      <span className="text-xs text-muted-foreground">$15 each</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={extraWoodCount}
                      onChange={(e) => setExtraWoodCount(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>Discount</span>
                    <span className="text-xs text-muted-foreground">Fixed $ amount</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="0"
                      className="pl-7"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                </div>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isDayStay ? 'Arrival:' : 'Check-in:'}</span>
                    <span>{checkInTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isDayStay ? 'Departure:' : 'Check-out:'}</span>
                    <span>{checkOutTime}</span>
                  </div>
                  
                  {/* Base room cost */}
                  {(() => {
                    const room = rooms.find(r => r.id === selectedRoomId);
                    const baseAmount = isDayStay 
                      ? (room?.dayStayPrice || room?.price || 0)
                      : (room?.price || 0) * calculateNights();
                    return (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Room Rate:</span>
                        <span>${baseAmount.toLocaleString()}</span>
                      </div>
                    );
                  })()}
                  
                  {/* Extra charges breakdown */}
                  {extraBedCount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>+ Extra Bed ({extraBedCount}x $20):</span>
                      <span>+${(extraBedCount * 20).toLocaleString()}</span>
                    </div>
                  )}
                  {extraWoodCount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>+ Extra Wood ({extraWoodCount}x $15):</span>
                      <span>+${(extraWoodCount * 15).toLocaleString()}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>− Discount:</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 mt-2 flex justify-between text-sm font-bold">
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reservations' | 'past' | 'cancellations')}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="reservations">Active Reservations</TabsTrigger>
          <TabsTrigger value="past">
            Past Reservations {pastCount > 0 && <span className="ml-2 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">{pastCount}</span>}
          </TabsTrigger>
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
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              {res.status === 'PENDING' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(res, 'CONFIRMED')}
                                  className="cursor-pointer"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                  Confirm Reservation
                                </DropdownMenuItem>
                              )}
                              {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(res, 'CHECKED_IN')}
                                  className="cursor-pointer"
                                >
                                  <LogIn className="w-4 h-4 mr-2 text-blue-600" />
                                  Check In
                                </DropdownMenuItem>
                              )}
                              {res.status === 'CHECKED_IN' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(res, 'CHECKED_OUT')}
                                  className="cursor-pointer"
                                >
                                  <LogOut className="w-4 h-4 mr-2 text-slate-600" />
                                  Check Out
                                </DropdownMenuItem>
                              )}
                              {res.status === 'CONFIRMED' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(res, 'NO_SHOW')}
                                  className="cursor-pointer"
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                                  Mark No Show
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditAddonsReservation(res);
                                  setIsEditAddonsOpen(true);
                                }}
                                className="cursor-pointer"
                              >
                                <Package className="w-4 h-4 mr-2 text-purple-600" />
                                Edit Add-ons
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
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

        <TabsContent value="past" className="mt-4">
          {/* Search and filters for past reservations */}
          <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="Search past reservations..." 
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              </div>
              
              {/* Export Button */}
              <Button 
                onClick={exportToCsv}
                variant="outline"
                className="flex items-center gap-2"
                disabled={filteredPastReservations.length === 0}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
            
            {/* Date Range Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by:</span>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Date Type</Label>
                <Select value={pastDateType} onValueChange={(v) => setPastDateType(v as 'check_in' | 'check_out')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check_in">Check-in</SelectItem>
                    <SelectItem value="check_out">Check-out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={pastDateFrom}
                  onChange={(e) => setPastDateFrom(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={pastDateTo}
                  onChange={(e) => setPastDateTo(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              
              {(pastDateFrom || pastDateTo) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setPastDateFrom('');
                    setPastDateTo('');
                  }}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredPastReservations.length} of {pastReservations.length} past reservations
            </div>
          </div>

          {filteredPastReservations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No past reservations</p>
              <p className="text-sm">Completed bookings will appear here</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guest</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPastReservations.map((res) => (
                      <tr key={res.id} className="hover:bg-muted/30 transition-colors">
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
                        <td className="px-6 py-4 text-right font-semibold text-green-600">
                          ${res.totalAmount.toLocaleString()}
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

      {/* Edit Add-ons Dialog */}
      <EditAddonsDialog
        reservation={editAddonsReservation}
        open={isEditAddonsOpen}
        onOpenChange={setIsEditAddonsOpen}
        onSave={handleSaveAddons}
        isUpdating={updateReservation.isPending}
        rooms={rooms}
      />
    </div>
  );
};

export default ReservationsPage;
