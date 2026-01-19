import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BedDouble, Loader2, CalendarDays, LogIn, LogOut, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarRooms, useCalendarReservations, useTodaysSummary } from '@/hooks/useCalendar';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-amber-400', text: 'text-white', label: 'Pending' },
  CONFIRMED: { bg: 'bg-sky-500', text: 'text-white', label: 'Confirmed' },
  CHECKED_IN: { bg: 'bg-emerald-500', text: 'text-white', label: 'In House' },
  CHECKED_OUT: { bg: 'bg-slate-400', text: 'text-white', label: 'Checked Out' },
  CANCELLED: { bg: 'bg-red-400', text: 'text-white', label: 'Cancelled' },
  NO_SHOW: { bg: 'bg-orange-400', text: 'text-white', label: 'No Show' },
};

interface ReservationBar {
  id: string;
  guestName: string;
  status: string;
  startDay: number;
  endDay: number;
  startsThisMonth: boolean;
  endsThisMonth: boolean;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: rooms = [], isLoading: roomsLoading } = useCalendarRooms();
  const { data: reservations = [], isLoading: reservationsLoading } = useCalendarReservations();
  const { data: summary, isLoading: summaryLoading } = useTodaysSummary();

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

  // Calculate reservation bars for each room
  const roomReservationBars = useMemo(() => {
    const result: Record<string, ReservationBar[]> = {};

    rooms.forEach(room => {
      const roomRes = reservations.filter(r => r.roomNumber === room.roomNumber);
      const bars: ReservationBar[] = [];

      roomRes.forEach(res => {
        const checkIn = new Date(res.checkIn);
        const checkOut = new Date(res.checkOut);
        
        // Check if reservation overlaps with current month
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        if (checkOut < monthStart || checkIn > monthEnd) return;

        const startsThisMonth = checkIn.getFullYear() === year && checkIn.getMonth() === month;
        const endsThisMonth = checkOut.getFullYear() === year && checkOut.getMonth() === month;

        const startDay = startsThisMonth ? checkIn.getDate() : 1;
        const endDay = endsThisMonth ? checkOut.getDate() : daysInMonth;

        bars.push({
          id: res.id,
          guestName: res.guestName,
          status: res.status,
          startDay,
          endDay,
          startsThisMonth,
          endsThisMonth,
        });
      });

      result[room.roomNumber] = bars;
    });

    return result;
  }, [rooms, reservations, year, month, daysInMonth]);

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
              <p className="text-sm text-muted-foreground">Manage reservations and availability</p>
            </div>
          </div>
          
          {/* Status Legend */}
          <div className="hidden lg:flex items-center gap-3">
            {Object.entries(statusConfig).slice(0, 4).map(([status, config]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm", config.bg)} />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={prevMonth}
                className="h-8 w-8 rounded-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 min-w-[160px] text-center font-semibold text-foreground">
                {monthName}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={nextMonth}
                className="h-8 w-8 rounded-md"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant={isCurrentMonth ? "secondary" : "outline"} 
              size="sm" 
              onClick={goToToday}
              className="h-8"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Today
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
              {/* Header Row - Day Numbers */}
              <div className="flex border-b border-border/50">
                <div className="w-[120px] flex-shrink-0 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/30 bg-muted/30">
                  Room
                </div>
                <div className="flex-1 flex">
                  {days.map(day => (
                    <div
                      key={day}
                      className={cn(
                        "flex-1 min-w-[40px] py-2 text-center border-r border-border/20 last:border-r-0",
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

                    {/* Days Grid with Reservation Bars */}
                    <div className="flex-1 relative h-[52px]">
                      {/* Background day cells */}
                      <div className="absolute inset-0 flex">
                        {days.map(day => (
                          <div
                            key={day}
                            className={cn(
                              "flex-1 min-w-[40px] border-r border-border/10 last:border-r-0",
                              isWeekend(day) && "bg-muted/20"
                            )}
                          />
                        ))}
                      </div>

                      {/* Reservation Bars */}
                      {bars.map(bar => {
                        const config = statusConfig[bar.status] || statusConfig.PENDING;
                        const startPercent = ((bar.startDay - 1) / daysInMonth) * 100;
                        const widthPercent = ((bar.endDay - bar.startDay + 1) / daysInMonth) * 100;

                        return (
                          <div
                            key={bar.id}
                            className={cn(
                              "absolute top-2 h-8 flex items-center px-2 cursor-pointer transition-opacity hover:opacity-90 shadow-sm",
                              config.bg,
                              config.text,
                              bar.startsThisMonth ? "rounded-l-md" : "rounded-l-none -ml-1",
                              bar.endsThisMonth ? "rounded-r-md" : "rounded-r-none"
                            )}
                            style={{
                              left: `${startPercent}%`,
                              width: `calc(${widthPercent}% ${!bar.startsThisMonth ? '+ 4px' : ''})`,
                            }}
                            title={`${bar.guestName} - ${bar.status}`}
                          >
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
    </div>
  );
}
