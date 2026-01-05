import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Guest, LoyaltyTier } from '@/types';

interface DbGuest {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  loyalty_tier: string;
  loyalty_points: number;
  total_spent: number;
  total_stays: number;
  last_stay: string | null;
}

const mapDbGuestToGuest = (dbGuest: DbGuest): Guest => ({
  id: dbGuest.id,
  firstName: dbGuest.first_name,
  lastName: dbGuest.last_name,
  email: dbGuest.email || '',
  phone: dbGuest.phone || undefined,
  nationality: dbGuest.nationality || undefined,
  loyaltyTier: dbGuest.loyalty_tier as LoyaltyTier,
  loyaltyPoints: dbGuest.loyalty_points,
  totalSpent: dbGuest.total_spent,
  totalStays: dbGuest.total_stays,
  lastStay: dbGuest.last_stay || undefined,
});

export function useGuests() {
  return useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('last_name');
      
      if (error) throw error;
      return (data as DbGuest[]).map(mapDbGuestToGuest);
    },
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (guest: Partial<Guest>) => {
      const { data, error } = await supabase
        .from('guests')
        .insert({
          first_name: guest.firstName,
          last_name: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          nationality: guest.nationality,
          loyalty_tier: guest.loyaltyTier || 'STANDARD',
          loyalty_points: guest.loyaltyPoints || 0,
          total_spent: guest.totalSpent || 0,
          total_stays: guest.totalStays || 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbGuestToGuest(data as DbGuest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Guest> & { id: string }) => {
      const { data, error } = await supabase
        .from('guests')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
          phone: updates.phone,
          nationality: updates.nationality,
          loyalty_tier: updates.loyaltyTier,
          loyalty_points: updates.loyaltyPoints,
          total_spent: updates.totalSpent,
          total_stays: updates.totalStays,
          last_stay: updates.lastStay,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbGuestToGuest(data as DbGuest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });
}
