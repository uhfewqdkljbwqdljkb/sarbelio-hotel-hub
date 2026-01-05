import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, ReservationStatus, BookingSource } from '@/types';

interface DbReservation {
  id: string;
  confirmation_code: string;
  guest_id: string | null;
  guest_name: string;
  guest_email: string | null;
  phone: string | null;
  room_id: string | null;
  room_name: string | null;
  room_type_id: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  total_amount: number;
  status: string;
  source: string;
  notes: string | null;
  created_at: string;
}

const mapDbReservationToReservation = (dbRes: DbReservation): Reservation => ({
  id: dbRes.id,
  confirmationCode: dbRes.confirmation_code,
  guestName: dbRes.guest_name,
  guestEmail: dbRes.guest_email || '',
  phone: dbRes.phone || undefined,
  roomId: dbRes.room_id || undefined,
  roomName: dbRes.room_name || undefined,
  roomTypeId: dbRes.room_type_id || undefined,
  checkIn: dbRes.check_in,
  checkOut: dbRes.check_out,
  nights: dbRes.nights,
  guests: dbRes.guests_count,
  totalAmount: dbRes.total_amount,
  status: dbRes.status as ReservationStatus,
  source: dbRes.source as BookingSource,
  createdAt: dbRes.created_at,
});

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('check_in', { ascending: false });
      
      if (error) throw error;
      return (data as DbReservation[]).map(mapDbReservationToReservation);
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservation: Partial<Reservation>) => {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          confirmation_code: reservation.confirmationCode || `CNF-${Math.floor(10000 + Math.random() * 90000)}`,
          guest_name: reservation.guestName,
          guest_email: reservation.guestEmail,
          phone: reservation.phone,
          room_id: reservation.roomId,
          room_name: reservation.roomName,
          room_type_id: reservation.roomTypeId,
          check_in: reservation.checkIn,
          check_out: reservation.checkOut,
          nights: reservation.nights,
          guests_count: reservation.guests,
          total_amount: reservation.totalAmount,
          status: reservation.status || 'PENDING',
          source: reservation.source || 'DIRECT',
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbReservationToReservation(data as DbReservation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reservation> & { id: string }) => {
      const { data, error } = await supabase
        .from('reservations')
        .update({
          guest_name: updates.guestName,
          guest_email: updates.guestEmail,
          phone: updates.phone,
          room_id: updates.roomId,
          room_name: updates.roomName,
          room_type_id: updates.roomTypeId,
          check_in: updates.checkIn,
          check_out: updates.checkOut,
          nights: updates.nights,
          guests_count: updates.guests,
          total_amount: updates.totalAmount,
          status: updates.status,
          source: updates.source,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbReservationToReservation(data as DbReservation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
