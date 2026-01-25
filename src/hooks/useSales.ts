import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CommissionProfile, 
  DepositTransaction, 
  SalesLeaderboardEntry,
  SalesStats,
  SalesRecord,
  PaymentMethod,
  CommissionStatus
} from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Sales Stats Hook
export function useSalesStats() {
  return useQuery({
    queryKey: ['sales-stats'],
    queryFn: async (): Promise<SalesStats> => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      // Get reservations for this month - exclude CANCELLED and NO_SHOW
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('total_amount, commission_amount, deposit_amount, payment_status, status')
        .gte('created_at', startOfMonth.toISOString())
        .in('status', ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']);
      
      if (error) throw error;
      
      const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
      const totalBookings = reservations?.length || 0;
      const totalCommissions = reservations?.reduce((sum, r) => sum + (r.commission_amount || 0), 0) || 0;
      const collectedDeposits = reservations?.reduce((sum, r) => sum + (r.deposit_amount || 0), 0) || 0;
      const pendingDeposits = totalRevenue - collectedDeposits;
      
      return {
        totalRevenue,
        totalBookings,
        totalCommissions,
        pendingDeposits,
        collectedDeposits,
        averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      };
    },
  });
}

// Sales Leaderboard Hook
export function useSalesLeaderboard(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['sales-leaderboard', startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<SalesLeaderboardEntry[]> => {
      const { data, error } = await supabase.rpc('get_sales_leaderboard', {
        p_start_date: format(startDate, 'yyyy-MM-dd'),
        p_end_date: format(endDate, 'yyyy-MM-dd'),
      });
      
      if (error) throw error;
      
      return (data || []).map((entry: {
        rank: number;
        user_id: string;
        user_name: string;
        avatar_url: string | null;
        total_bookings: number;
        total_revenue: number;
        total_commission: number;
      }) => ({
        rank: entry.rank,
        userId: entry.user_id,
        userName: entry.user_name,
        avatarUrl: entry.avatar_url,
        totalBookings: entry.total_bookings,
        totalRevenue: Number(entry.total_revenue),
        totalCommission: Number(entry.total_commission),
      }));
    },
  });
}

// Deposits Hook
export function useDeposits() {
  return useQuery({
    queryKey: ['deposit-transactions'],
    queryFn: async (): Promise<DepositTransaction[]> => {
      const { data, error } = await supabase
        .from('deposit_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((d: {
        id: string;
        reservation_id: string;
        reservation_code: string | null;
        guest_name: string | null;
        amount: number;
        payment_method: string;
        received_by_user_id: string;
        received_by_user_name: string | null;
        transaction_date: string;
        notes: string | null;
        receipt_number: string | null;
        created_at: string;
      }) => ({
        id: d.id,
        reservationId: d.reservation_id,
        reservationCode: d.reservation_code,
        guestName: d.guest_name,
        amount: Number(d.amount),
        paymentMethod: d.payment_method as PaymentMethod,
        receivedByUserId: d.received_by_user_id,
        receivedByUserName: d.received_by_user_name,
        transactionDate: d.transaction_date,
        notes: d.notes,
        receiptNumber: d.receipt_number,
        createdAt: d.created_at,
      }));
    },
  });
}

// Record Deposit Mutation
export function useRecordDeposit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (deposit: {
      reservationId: string;
      reservationCode?: string;
      guestName?: string;
      amount: number;
      paymentMethod: string;
      notes?: string;
    }) => {
      // Get current user's name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user?.id)
        .single();
      
      const { data, error } = await supabase
        .from('deposit_transactions')
        .insert({
          reservation_id: deposit.reservationId,
          reservation_code: deposit.reservationCode,
          guest_name: deposit.guestName,
          amount: deposit.amount,
          payment_method: deposit.paymentMethod,
          received_by_user_id: user?.id,
          received_by_user_name: profile?.full_name || user?.email,
          notes: deposit.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposit-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['sales-stats'] });
      toast.success('Deposit recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Commission Profiles Hook
export function useCommissionProfiles() {
  return useQuery({
    queryKey: ['commission-profiles'],
    queryFn: async (): Promise<CommissionProfile[]> => {
      const { data, error } = await supabase
        .from('commission_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((p: {
        id: string;
        user_id: string;
        user_name: string | null;
        user_email: string | null;
        base_commission_rate: number;
        tiered_rates: unknown;
        is_active: boolean;
        effective_from: string;
        effective_to: string | null;
        created_at: string;
        updated_at: string;
      }) => ({
        id: p.id,
        userId: p.user_id,
        userName: p.user_name,
        userEmail: p.user_email,
        baseCommissionRate: Number(p.base_commission_rate),
        tieredRates: p.tiered_rates as CommissionProfile['tieredRates'],
        isActive: p.is_active,
        effectiveFrom: p.effective_from,
        effectiveTo: p.effective_to,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    },
  });
}

// Update Commission Profile Mutation
export function useUpdateCommissionProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (update: {
      profileId?: string;
      userId?: string;
      userName?: string;
      userEmail?: string;
      baseCommissionRate?: number;
      isActive?: boolean;
      isNew?: boolean;
    }) => {
      if (update.isNew && update.userId) {
        // Create new profile
        const { data, error } = await supabase
          .from('commission_profiles')
          .insert({
            user_id: update.userId,
            user_name: update.userName,
            user_email: update.userEmail,
            base_commission_rate: update.baseCommissionRate || 5,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else if (update.profileId) {
        // Update existing profile
        const updateData: Record<string, unknown> = {};
        if (update.baseCommissionRate !== undefined) {
          updateData.base_commission_rate = update.baseCommissionRate;
        }
        if (update.isActive !== undefined) {
          updateData.is_active = update.isActive;
        }
        updateData.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('commission_profiles')
          .update(updateData)
          .eq('id', update.profileId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-profiles'] });
      toast.success('Commission profile updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Commission Report Hook
export function useCommissionReport(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['commission-report', startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<SalesRecord[]> => {
      const periodStr = format(startDate, 'yyyy-MM');
      
      // First try to get from sales_records
      const { data: existingRecords, error: recordsError } = await supabase
        .from('sales_records')
        .select('*')
        .eq('period', periodStr)
        .eq('period_type', 'MONTHLY');
      
      if (recordsError) throw recordsError;
      
      if (existingRecords && existingRecords.length > 0) {
        return existingRecords.map((r: {
          id: string;
          user_id: string;
          user_name: string;
          period: string;
          period_type: string;
          total_bookings: number;
          total_revenue: number;
          total_commission: number;
          commission_status: string;
          paid_date: string | null;
        }) => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          period: r.period,
          periodType: r.period_type as SalesRecord['periodType'],
          totalBookings: r.total_bookings,
          totalRevenue: Number(r.total_revenue),
          totalCommission: Number(r.total_commission),
          commissionStatus: r.commission_status as CommissionStatus,
          paidDate: r.paid_date,
        }));
      }
      
      // If no records, calculate from reservations
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('created_by_user_id, created_by_user_name, total_amount, commission_amount, commission_status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('status', 'in', '("CANCELLED","NO_SHOW")')
        .not('created_by_user_id', 'is', null);
      
      if (error) throw error;
      
      // Group by user
      const byUser = new Map<string, {
        userName: string;
        totalBookings: number;
        totalRevenue: number;
        totalCommission: number;
      }>();
      
      (reservations || []).forEach((r: {
        created_by_user_id: string;
        created_by_user_name: string;
        total_amount: number;
        commission_amount: number;
      }) => {
        const existing = byUser.get(r.created_by_user_id) || {
          userName: r.created_by_user_name,
          totalBookings: 0,
          totalRevenue: 0,
          totalCommission: 0,
        };
        existing.totalBookings++;
        existing.totalRevenue += Number(r.total_amount);
        existing.totalCommission += Number(r.commission_amount);
        byUser.set(r.created_by_user_id, existing);
      });
      
      return Array.from(byUser.entries()).map(([userId, data]) => ({
        id: `temp-${userId}`,
        userId,
        userName: data.userName,
        period: periodStr,
        periodType: 'MONTHLY' as const,
        totalBookings: data.totalBookings,
        totalRevenue: data.totalRevenue,
        totalCommission: data.totalCommission,
        commissionStatus: 'PENDING' as CommissionStatus,
        paidDate: undefined,
      }));
    },
  });
}

// Mark Commission as Paid
export function useMarkCommissionPaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, period }: { userId: string; period: string }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('sales_records')
        .select('id')
        .eq('user_id', userId)
        .eq('period', period)
        .single();
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('sales_records')
          .update({
            commission_status: 'PAID',
            paid_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Get data from reservations and create record
        const startDate = new Date(period + '-01');
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        
        const { data: reservations, error: resError } = await supabase
          .from('reservations')
          .select('created_by_user_name, total_amount, commission_amount')
          .eq('created_by_user_id', userId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .not('status', 'in', '("CANCELLED","NO_SHOW")');
        
        if (resError) throw resError;
        
        const totalBookings = reservations?.length || 0;
        const totalRevenue = reservations?.reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;
        const totalCommission = reservations?.reduce((sum, r) => sum + Number(r.commission_amount), 0) || 0;
        const userName = reservations?.[0]?.created_by_user_name || 'Unknown';
        
        const { error } = await supabase
          .from('sales_records')
          .insert({
            user_id: userId,
            user_name: userName,
            period,
            period_type: 'MONTHLY',
            total_bookings: totalBookings,
            total_revenue: totalRevenue,
            total_commission: totalCommission,
            commission_status: 'PAID',
            paid_date: new Date().toISOString(),
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-report'] });
      queryClient.invalidateQueries({ queryKey: ['sales-stats'] });
      toast.success('Commission marked as paid');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
