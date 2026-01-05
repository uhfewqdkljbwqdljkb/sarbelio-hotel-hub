import { useState } from 'react';
import { ChevronLeft, ChevronRight, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RESERVATIONS, ROOMS } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  PENDING: 'bg-yellow-200',
  CONFIRMED: 'bg-blue-200',
  CHECKED_IN: 'bg-green-200',
  CHECKED_OUT: 'bg-gray-200',
  CANCELLED: 'bg-red-200',
  NO_SHOW: 'bg-orange-200',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 15)); // January 2024

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getReservationsForRoom = (roomNumber: string) => {
    return RESERVATIONS.filter(r => {
      const room = ROOMS.find(rm => rm.id === r.roomId);
      return room?.roomNumber === roomNumber;
    });
  };

  const isDateInRange = (day: number, checkIn: string, checkOut: string) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return date >= start && date < end;
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">{monthName}</h2>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${color}`} />
              <span className="text-muted-foreground text-xs">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase sticky left-0 bg-muted/50 z-10 w-[120px]">Room</th>
                {days.map(day => (
                  <th key={day} className="px-1 py-3 text-center text-xs font-medium text-muted-foreground min-w-[40px]">
                    <div>{day}</div>
                    <div className="text-[10px] opacity-60">
                      {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ROOMS.slice(0, 10).map((room) => {
                const reservations = getReservationsForRoom(room.roomNumber);
                return (
                  <tr key={room.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2 sticky left-0 bg-card z-10 border-r">
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{room.roomNumber}</span>
                      </div>
                    </td>
                    {days.map(day => {
                      const reservation = reservations.find(r => isDateInRange(day, r.checkIn, r.checkOut));
                      const isCheckIn = reservation && new Date(reservation.checkIn).getDate() === day && new Date(reservation.checkIn).getMonth() === currentDate.getMonth();
                      const isCheckOut = reservation && new Date(reservation.checkOut).getDate() === day && new Date(reservation.checkOut).getMonth() === currentDate.getMonth();
                      
                      return (
                        <td key={day} className="px-0 py-1 text-center">
                          {reservation ? (
                            <div 
                              className={`h-8 ${statusColors[reservation.status]} ${isCheckIn ? 'rounded-l-full ml-1' : ''} ${isCheckOut ? 'rounded-r-full mr-1' : ''} flex items-center justify-center`}
                              title={`${reservation.guestName} - ${reservation.status}`}
                            >
                              {isCheckIn && <span className="text-xs font-medium truncate px-1">{reservation.guestName.split(' ')[0]}</span>}
                            </div>
                          ) : (
                            <div className="h-8 bg-green-50 hover:bg-green-100 cursor-pointer transition-colors" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700"><div className="w-3 h-3 rounded-full bg-green-500" />Arrivals Today</h3>
          <div className="space-y-2">
            {RESERVATIONS.filter(r => r.checkIn === '2024-01-15').slice(0, 3).map(r => (
              <div key={r.id} className="flex justify-between text-sm">
                <span>{r.guestName}</span>
                <Badge variant="outline">{ROOMS.find(rm => rm.id === r.roomId)?.roomNumber}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700"><div className="w-3 h-3 rounded-full bg-red-500" />Departures Today</h3>
          <div className="space-y-2">
            {RESERVATIONS.filter(r => r.checkOut === '2024-01-15').slice(0, 3).map(r => (
              <div key={r.id} className="flex justify-between text-sm">
                <span>{r.guestName}</span>
                <Badge variant="outline">{ROOMS.find(rm => rm.id === r.roomId)?.roomNumber}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700"><div className="w-3 h-3 rounded-full bg-blue-500" />In House</h3>
          <div className="text-3xl font-bold">{RESERVATIONS.filter(r => r.status === 'CHECKED_IN').length}</div>
          <p className="text-sm text-muted-foreground">guests currently staying</p>
        </div>
      </div>
    </div>
  );
}
