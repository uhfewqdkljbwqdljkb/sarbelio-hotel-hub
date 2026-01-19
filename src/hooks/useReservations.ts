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
  is_day_stay: boolean | null;
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
  isDayStay: dbRes.is_day_stay ?? false,
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
    mutationFn: async (reservation: {
      confirmationCode: string;
      guestName: string;
      guestEmail?: string;
      phone?: string;
      roomId?: string;
      roomName?: string;
      checkIn: string;
      checkOut: string;
      nights: number;
      guests: number;
      totalAmount: number;
      status?: string;
      source?: string;
      isDayStay?: boolean;
    }) => {
      if (!reservation.guestName || !reservation.checkIn || !reservation.checkOut) {
        throw new Error('Guest name, check-in and check-out dates are required');
      }
      
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          confirmation_code: reservation.confirmationCode,
          guest_name: reservation.guestName,
          guest_email: reservation.guestEmail || null,
          phone: reservation.phone || null,
          room_id: reservation.roomId || null,
          room_name: reservation.roomName || null,
          check_in: reservation.checkIn,
          check_out: reservation.checkOut,
          nights: reservation.nights || 1,
          guests_count: reservation.guests || 1,
          total_amount: reservation.totalAmount || 0,
          status: reservation.status || 'PENDING',
          source: reservation.source || 'DIRECT',
          is_day_stay: reservation.isDayStay || false,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Reservation creation error:', error);
        throw error;
      }
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
      // Build update object with only defined values
      const updateData: Record<string, unknown> = {};
      
      if (updates.guestName !== undefined) updateData.guest_name = updates.guestName;
      if (updates.guestEmail !== undefined) updateData.guest_email = updates.guestEmail;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.roomId !== undefined) updateData.room_id = updates.roomId;
      if (updates.roomName !== undefined) updateData.room_name = updates.roomName;
      if (updates.roomTypeId !== undefined) updateData.room_type_id = updates.roomTypeId;
      if (updates.checkIn !== undefined) updateData.check_in = updates.checkIn;
      if (updates.checkOut !== undefined) updateData.check_out = updates.checkOut;
      if (updates.nights !== undefined) updateData.nights = updates.nights;
      if (updates.guests !== undefined) updateData.guests_count = updates.guests;
      if (updates.totalAmount !== undefined) updateData.total_amount = updates.totalAmount;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.source !== undefined) updateData.source = updates.source;

      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbReservationToReservation(data as DbReservation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['calendar_reservations'] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, roomId }: { id: string; roomId?: string }) => {
      // Update reservation status to CANCELLED
      const { data, error } = await supabase
        .from('reservations')
        .update({ status: 'CANCELLED' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Release the room if it was reserved
      if (roomId) {
        await supabase
          .from('rooms')
          .update({ status: 'AVAILABLE' })
          .eq('id', roomId);
      }
      
      return mapDbReservationToReservation(data as DbReservation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-data'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['combined-transactions'] });
    },
  });
}
