import { useState } from 'react';
import { ChevronLeft, ChevronRight, BedDouble, Loader2, CalendarDays, LogIn, LogOut, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarRooms, useCalendarReservations, useTodaysSummary } from '@/hooks/useCalendar';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
  CONFIRMED: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Confirmed' },
  CHECKED_IN: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'In House' },
  CHECKED_OUT: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Checked Out' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Cancelled' },
  NO_SHOW: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: 'No Show' },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: rooms = [], isLoading: roomsLoading } = useCalendarRooms();
  const { data: reservations = [], isLoading: reservationsLoading } = useCalendarReservations();
  const { data: summary, isLoading: summaryLoading } = useTodaysSummary();

  const isLoading = roomsLoading || reservationsLoading;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getReservationsForRoom = (roomNumber: string) => {
    return reservations.filter(r => r.roomNumber === roomNumber);
  };

  const isDateInRange = (day: number, checkIn: string, checkOut: string) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return date >= start && date < end;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth = 
    currentDate.getMonth() === new Date().getMonth() && 
    currentDate.getFullYear() === new Date().getFullYear();

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
                <div className={cn("w-2.5 h-2.5 rounded-full", config.bg, "border", config.border)} />
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
            <table className="w-full min-w-[1400px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0 bg-card z-10 w-[140px] border-r border-border/30">
                    Room
                  </th>
                  {days.map(day => {
                    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                      .toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <th 
                        key={day} 
                        className={cn(
                          "px-0.5 py-2 text-center min-w-[44px] transition-colors",
                          isToday(day) && "bg-primary",
                          isWeekend(day) && !isToday(day) && "bg-muted/30"
                        )}
                      >
                        <div className={cn(
                          "text-[10px] uppercase tracking-wide mb-0.5",
                          isToday(day) ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {dayOfWeek.slice(0, 2)}
                        </div>
                        <div className={cn(
                          "text-sm font-semibold",
                          isToday(day) ? "text-primary-foreground" : "text-foreground"
                        )}>
                          {day}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, roomIndex) => {
                  const roomReservations = getReservationsForRoom(room.roomNumber);
                  return (
                    <tr 
                      key={room.id} 
                      className={cn(
                        "group transition-colors",
                        roomIndex % 2 === 0 ? "bg-card" : "bg-muted/20"
                      )}
                    >
                      <td className={cn(
                        "px-4 py-1.5 sticky left-0 z-10 border-r border-border/30",
                        roomIndex % 2 === 0 ? "bg-card" : "bg-muted/20"
                      )}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BedDouble className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-foreground">{room.roomNumber}</span>
                            {room.name && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[80px]">{room.name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {days.map(day => {
                        const reservation = roomReservations.find(r => 
                          isDateInRange(day, r.checkIn, r.checkOut)
                        );
                        const isCheckIn = reservation && 
                          new Date(reservation.checkIn).getDate() === day && 
                          new Date(reservation.checkIn).getMonth() === currentDate.getMonth();
                        const isCheckOut = reservation && 
                          new Date(reservation.checkOut).getDate() === day && 
                          new Date(reservation.checkOut).getMonth() === currentDate.getMonth();
                        
                        const config = reservation ? statusConfig[reservation.status] || statusConfig.PENDING : null;
                        
                        return (
                          <td 
                            key={day} 
                            className={cn(
                              "px-0 py-1 text-center relative",
                              isWeekend(day) && "bg-muted/20"
                            )}
                          >
                            {reservation && config ? (
                              <div 
                                className={cn(
                                  "h-9 flex items-center cursor-pointer transition-all hover:opacity-90",
                                  config.bg,
                                  "border-y",
                                  config.border,
                                  isCheckIn && "rounded-l-lg ml-0.5 border-l",
                                  isCheckOut && "rounded-r-lg mr-0.5 border-r",
                                  !isCheckIn && !isCheckOut && "border-transparent"
                                )}
                                title={`${reservation.guestName} - ${reservation.status}`}
                              >
                                {isCheckIn && (
                                  <span className={cn(
                                    "text-xs font-medium truncate px-2",
                                    config.text
                                  )}>
                                    {reservation.guestName.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div 
                                className={cn(
                                  "h-9 cursor-pointer transition-colors",
                                  "hover:bg-primary/5",
                                  isToday(day) && "bg-primary/5"
                                )} 
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
