import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, BedDouble, Loader2, CalendarDays, LogIn, LogOut, Users, Calendar, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarRooms, useCalendarReservations, useTodaysSummary } from '@/hooks/useCalendar';
import { useUpdateReservation } from '@/hooks/useReservations';
import { ReservationDetailsModal } from '@/components/calendar/ReservationDetailsModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { parseLocalDate, formatLocalDate, addDays, isInMonth } from '@/lib/dateUtils';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-amber-400', text: 'text-white', label: 'Pending' },
  CONFIRMED: { bg: 'bg-sky-500', text: 'text-white', label: 'Confirmed' },
  CHECKED_IN: { bg: 'bg-emerald-500', text: 'text-white', label: 'In House' },
  CHECKED_OUT: { bg: 'bg-slate-400', text: 'text-white', label: 'Checked Out' },
};

interface ReservationBar {
  id: string;
  guestName: string;
  guestEmail?: string;
  phone?: string;
  roomNumber: string;
  roomId: string | null;
  status: string;
  startDay: number;
  endDay: number;
  startsThisMonth: boolean;
  endsThisMonth: boolean;
  checkIn: string;
  checkOut: string;
  totalAmount?: number;
  nights?: number;
  guests?: number;
  isDayStay?: boolean;
}

interface DragState {
  reservationId: string;
  originalRoomNumber: string;
  originalStartDay: number;
  originalEndDay: number;
  checkIn: string;
  checkOut: string;
  roomId: string | null;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState<ReservationBar | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<{ roomNumber: string; day: number } | null>(null);

  const { data: rooms = [], isLoading: roomsLoading } = useCalendarRooms();
  const { data: reservations = [], isLoading: reservationsLoading } = useCalendarReservations();
  const { data: summary, isLoading: summaryLoading } = useTodaysSummary();
  const updateReservation = useUpdateReservation();

  const isLoading = roomsLoading || reservationsLoading;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isWeekend = (day: number) => {
    const date = new Date(year, month, day);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  // Filter out CANCELLED and NO_SHOW reservations
  const activeReservations = useMemo(() => {
    return reservations.filter(r => 
      r.status !== 'CANCELLED' && r.status !== 'NO_SHOW'
    );
  }, [reservations]);

  // Calculate reservation bars for each room using local date parsing
  const roomReservationBars = useMemo(() => {
    const result: Record<string, ReservationBar[]> = {};

    rooms.forEach(room => {
      const roomRes = activeReservations.filter(r => r.roomNumber === room.roomNumber);
      const bars: ReservationBar[] = [];

      roomRes.forEach(res => {
        // Use local date parsing to avoid timezone shifts
        const checkIn = parseLocalDate(res.checkIn);
        const checkOut = parseLocalDate(res.checkOut);
        
        // Check if reservation overlaps with current month
        const monthStart = new Date(year, month, 1, 12, 0, 0);
        const monthEnd = new Date(year, month, daysInMonth, 12, 0, 0);

        // Skip if reservation doesn't overlap with this month
        if (checkOut < monthStart || checkIn > monthEnd) return;

        const startsThisMonth = isInMonth(checkIn, year, month);
        const endsThisMonth = isInMonth(checkOut, year, month);

        // startDay is the check-in date (where bar starts)
        const startDay = startsThisMonth ? checkIn.getDate() : 1;
        // endDay is check-out date - 1 (guest leaves on checkout, so bar ends day before)
        // For proper display: if checkout is Jan 23, bar should cover through Jan 22
        const endDay = endsThisMonth ? Math.max(checkOut.getDate() - 1, startDay) : daysInMonth;

        bars.push({
          id: res.id,
          guestName: res.guestName,
          guestEmail: res.guestEmail,
          phone: res.phone,
          roomNumber: res.roomNumber,
          roomId: res.roomId,
          status: res.status,
          startDay,
          endDay,
          startsThisMonth,
          endsThisMonth,
          checkIn: res.checkIn,
          checkOut: res.checkOut,
          totalAmount: res.totalAmount,
          nights: res.nights,
          guests: res.guests,
          isDayStay: res.isDayStay,
        });
      });

      result[room.roomNumber] = bars;
    });

    return result;
  }, [rooms, activeReservations, year, month, daysInMonth]);

  const handleReservationClick = (bar: ReservationBar) => {
    setSelectedReservation(bar);
    setModalOpen(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateReservation.mutateAsync({ id, status: status as any });
      toast.success(`Reservation ${status.toLowerCase().replace('_', ' ')}`);
      setModalOpen(false);
    } catch {
      toast.error('Failed to update reservation');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, bar: ReservationBar) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragState({
      reservationId: bar.id,
      originalRoomNumber: bar.roomNumber,
      originalStartDay: bar.startDay,
      originalEndDay: bar.endDay,
      checkIn: bar.checkIn,
      checkOut: bar.checkOut,
      roomId: bar.roomId,
    });
  };

  const handleDragEnd = () => {
    setDragState(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, roomNumber: string, day: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget({ roomNumber, day });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = async (e: React.DragEvent, targetRoomNumber: string, targetDay: number) => {
    e.preventDefault();
    
    if (!dragState) return;

    const targetRoom = rooms.find(r => r.roomNumber === targetRoomNumber);
    if (!targetRoom) return;

    // Calculate date shift
    const dayShift = targetDay - dragState.originalStartDay;
    const roomChanged = targetRoomNumber !== dragState.originalRoomNumber;

    if (dayShift === 0 && !roomChanged) {
      setDragState(null);
      setDropTarget(null);
      return;
    }

    // Use local date parsing to avoid timezone issues
    const originalCheckIn = parseLocalDate(dragState.checkIn);
    const originalCheckOut = parseLocalDate(dragState.checkOut);
    
    // Add days to get new dates
    const newCheckIn = addDays(originalCheckIn, dayShift);
    const newCheckOut = addDays(originalCheckOut, dayShift);

    try {
      await updateReservation.mutateAsync({
        id: dragState.reservationId,
        checkIn: formatLocalDate(newCheckIn),
        checkOut: formatLocalDate(newCheckOut),
        roomId: roomChanged ? targetRoom.id : dragState.roomId || undefined,
        roomName: roomChanged ? targetRoomNumber : undefined,
      });
      
      const changes = [];
      if (dayShift !== 0) changes.push('dates updated');
      if (roomChanged) changes.push(`moved to room ${targetRoomNumber}`);
      toast.success(`Reservation ${changes.join(' and ')}`);
    } catch {
      toast.error('Failed to update reservation');
    }

    setDragState(null);
    setDropTarget(null);
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth = month === new Date().getMonth() && year === new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Room Calendar</h1>
              <p className="text-sm text-muted-foreground">Drag reservations to change dates or rooms</p>
            </div>
          </div>
          
          {/* Status Legend */}
          <div className="hidden lg:flex items-center gap-3">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm", config.bg)} />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-muted/50 rounded-lg p-1 flex-1 sm:flex-initial">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={prevMonth}
                className="h-8 w-8 rounded-md shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 sm:px-4 min-w-0 sm:min-w-[160px] text-center font-semibold text-foreground text-sm sm:text-base truncate flex-1">
                {monthName}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextMonth}
                className="h-8 w-8 rounded-md shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant={isCurrentMonth ? "secondary" : "outline"} 
              size="sm" 
              onClick={goToToday}
              className="h-8 shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Today</span>
            </Button>
          </div>
          
          {/* Room count */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{rooms.length}</span> rooms
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {rooms.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BedDouble className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No rooms configured</p>
              <p className="text-sm mt-1">Add rooms in the Rooms page to see them here</p>
            </div>
          ) : (
            <div className="min-w-[1200px]">
              {/* Header Row - Day Numbers using CSS Grid */}
              <div className="flex border-b border-border/50">
                <div className="w-[120px] flex-shrink-0 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/30 bg-muted/30">
                  Room
                </div>
                <div 
                  className="flex-1"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${daysInMonth}, minmax(40px, 1fr))`,
                  }}
                >
                  {days.map(day => (
                    <div
                      key={day}
                      className={cn(
                        "py-2 text-center border-r border-border/20 last:border-r-0",
                        isToday(day) && "bg-primary text-primary-foreground",
                        isWeekend(day) && !isToday(day) && "bg-muted/40"
                      )}
                    >
                      <div className={cn(
                        "text-[10px] uppercase tracking-wide",
                        isToday(day) ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                      </div>
                      <div className={cn(
                        "text-sm font-semibold",
                        isToday(day) ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Rows */}
              {rooms.map((room, roomIndex) => {
                const bars = roomReservationBars[room.roomNumber] || [];

                return (
                  <div
                    key={room.id}
                    className={cn(
                      "flex border-b border-border/30 last:border-b-0",
                      roomIndex % 2 === 0 ? "bg-card" : "bg-muted/10"
                    )}
                  >
                    {/* Room Label */}
                    <div className={cn(
                      "w-[120px] flex-shrink-0 px-3 py-2 border-r border-border/30 flex items-center gap-2",
                      roomIndex % 2 === 0 ? "bg-card" : "bg-muted/10"
                    )}>
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                        <BedDouble className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-foreground">{room.roomNumber}</span>
                        {room.name && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[60px]">{room.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Days Grid with CSS Grid for precise positioning */}
                    <div 
                      className="flex-1 relative h-[52px]"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${daysInMonth}, minmax(40px, 1fr))`,
                      }}
                    >
                      {/* Background day cells (drop targets) */}
                      {days.map(day => (
                        <div
                          key={day}
                          className={cn(
                            "border-r border-border/10 last:border-r-0 transition-colors",
                            isWeekend(day) && "bg-muted/20",
                            dropTarget?.roomNumber === room.roomNumber && dropTarget?.day === day && "bg-primary/20"
                          )}
                          onDragOver={(e) => handleDragOver(e, room.roomNumber, day)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, room.roomNumber, day)}
                        />
                      ))}

                      {/* Reservation Bars - positioned absolutely over the grid */}
                      {bars.map(bar => {
                        const config = statusConfig[bar.status] || statusConfig.PENDING;
                        
                        // CSS Grid positioning: gridColumnStart is 1-indexed (day number)
                        // gridColumnEnd is exclusive, so for a bar spanning days 22-22, we use start=22, end=23
                        const gridColumnStart = bar.startDay;
                        const gridColumnEnd = bar.endDay + 1;

                        return (
                          <div
                            key={bar.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, bar)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleReservationClick(bar)}
                            className={cn(
                              "absolute top-2 h-8 flex items-center px-2 cursor-grab active:cursor-grabbing transition-all hover:opacity-90 hover:scale-[1.02] shadow-sm group",
                              config.bg,
                              config.text,
                              bar.startsThisMonth ? "rounded-l-md" : "rounded-l-none",
                              bar.endsThisMonth ? "rounded-r-md" : "rounded-r-none",
                              dragState?.reservationId === bar.id && "opacity-50"
                            )}
                            style={{
                              // Calculate position based on grid columns
                              // Each column = 100% / daysInMonth
                              left: `calc(${(gridColumnStart - 1) / daysInMonth * 100}%)`,
                              width: `calc(${(gridColumnEnd - gridColumnStart) / daysInMonth * 100}%)`,
                              minWidth: '40px',
                            }}
                            title={`${bar.guestName} | ${bar.checkIn} → ${bar.checkOut} | start=${bar.startDay} end=${bar.endDay} | ${config.label}`}
                          >
                            <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-60 flex-shrink-0 mr-1" />
                            <span className="text-xs font-medium truncate">
                              {bar.guestName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Arrivals */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <LogIn className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Arrivals</h3>
              <p className="text-xs text-muted-foreground">Expected today</p>
            </div>
          </div>
          <div className="p-4">
            {summaryLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : summary?.arrivals.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No arrivals today</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary?.arrivals.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-foreground">{a.guestName}</span>
                    <Badge variant="secondary" className="font-mono text-xs">{a.roomNumber}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Departures */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <LogOut className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Departures</h3>
              <p className="text-xs text-muted-foreground">Checking out today</p>
            </div>
          </div>
          <div className="p-4">
            {summaryLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : summary?.departures.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No departures today</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary?.departures.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-foreground">{d.guestName}</span>
                    <Badge variant="secondary" className="font-mono text-xs">{d.roomNumber}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* In House */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">In House</h3>
              <p className="text-xs text-muted-foreground">Currently staying</p>
            </div>
          </div>
          <div className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground mb-1">
                {summary?.inHouseCount || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                {summary?.inHouseCount === 1 ? 'guest' : 'guests'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Details Modal */}
      <ReservationDetailsModal
        reservation={selectedReservation}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onStatusChange={handleStatusChange}
        isUpdating={updateReservation.isPending}
      />
    </div>
  );
}
