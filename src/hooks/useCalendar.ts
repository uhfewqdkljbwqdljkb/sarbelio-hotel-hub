import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CalendarReservation {
  id: string;
  guestName: string;
  roomNumber: string;
  roomId: string | null;
  checkIn: string;
  checkOut: string;
  status: string;
}

interface Room {
  id: string;
  roomNumber: string;
  name: string | null;
  floor: number;
  status: string;
}

export function useCalendarRooms() {
  return useQuery({
    queryKey: ['calendar_rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, room_number, name, floor, status')
        .order('room_number');
      
      if (error) throw error;
      
      return (data || []).map((room): Room => ({
        id: room.id,
        roomNumber: room.room_number,
        name: room.name,
        floor: room.floor,
        status: room.status || 'AVAILABLE',
      }));
    },
  });
}

export function useCalendarReservations() {
  return useQuery({
    queryKey: ['calendar_reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          guest_name,
          room_id,
          room_name,
          check_in,
          check_out,
          status,
          rooms (
            room_number
          )
        `)
        .order('check_in');
      
      if (error) throw error;
      
      return (data || []).map((r): CalendarReservation => {
        // Handle the rooms relation - can be object, array, or null
        let roomNumber = r.room_name || 'N/A';
        if (r.rooms) {
          if (Array.isArray(r.rooms) && r.rooms.length > 0) {
            roomNumber = r.rooms[0].room_number || roomNumber;
          } else if (typeof r.rooms === 'object' && 'room_number' in r.rooms) {
            roomNumber = (r.rooms as { room_number: string }).room_number || roomNumber;
          }
        }
        return {
          id: r.id,
          guestName: r.guest_name,
          roomId: r.room_id,
          roomNumber,
          checkIn: r.check_in,
          checkOut: r.check_out,
          status: r.status || 'PENDING',
        };
      });
    },
  });
}

function extractRoomNumber(rooms: unknown, fallback: string): string {
  if (!rooms) return fallback;
  if (Array.isArray(rooms) && rooms.length > 0) {
    return rooms[0].room_number || fallback;
  }
  if (typeof rooms === 'object' && rooms !== null && 'room_number' in rooms) {
    return (rooms as { room_number: string }).room_number || fallback;
  }
  return fallback;
}

export function useTodaysSummary() {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['calendar_summary', today],
    queryFn: async () => {
      // Get arrivals today
      const { data: arrivals } = await supabase
        .from('reservations')
        .select(`
          id,
          guest_name,
          room_name,
          rooms (room_number)
        `)
        .eq('check_in', today)
        .limit(5);

      // Get departures today
      const { data: departures } = await supabase
        .from('reservations')
        .select(`
          id,
          guest_name,
          room_name,
          rooms (room_number)
        `)
        .eq('check_out', today)
        .limit(5);

      // Get in-house count
      const { count: inHouseCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'CHECKED_IN');

      return {
        arrivals: (arrivals || []).map(a => ({
          id: a.id,
          guestName: a.guest_name,
          roomNumber: extractRoomNumber(a.rooms, a.room_name || 'N/A'),
        })),
        departures: (departures || []).map(d => ({
          id: d.id,
          guestName: d.guest_name,
          roomNumber: extractRoomNumber(d.rooms, d.room_name || 'N/A'),
        })),
        inHouseCount: inHouseCount || 0,
      };
    },
  });
}
