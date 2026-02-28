import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommissionStatus, PaymentStatus } from '@/types';

export interface MyCommissionStats {
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  commissionRate: number;
  totalDepositsCollected: number;
  totalBalanceDue: number;
}

export interface MyReservationRow {
  id: string;
  confirmationCode: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  commissionAmount: number;
  commissionStatus: CommissionStatus;
  depositAmount: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export function useMyCommissions(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-commissions', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: reservations, error: resError } = await supabase
        .from('reservations')
        .select('id, confirmation_code, guest_name, check_in, check_out, total_amount, commission_amount, commission_status, deposit_amount, balance_due, payment_status, created_at, status')
        .eq('created_by_user_id', userId!)
        .not('status', 'in', '("CANCELLED","NO_SHOW")')
        .order('created_at', { ascending: false });

      if (resError) throw resError;

      const { data: profile } = await supabase
        .from('commission_profiles')
        .select('base_commission_rate, is_active')
        .eq('user_id', userId!)
        .eq('is_active', true)
        .maybeSingle();

      const rows: MyReservationRow[] = (reservations || []).map((r) => ({
        id: r.id,
        confirmationCode: r.confirmation_code,
        guestName: r.guest_name,
        checkIn: r.check_in,
        checkOut: r.check_out,
        totalAmount: Number(r.total_amount),
        commissionAmount: Number(r.commission_amount || 0),
        commissionStatus: (r.commission_status as CommissionStatus) || 'PENDING',
        depositAmount: Number(r.deposit_amount || 0),
        balanceDue: Number(r.balance_due ?? r.total_amount),
        paymentStatus: (r.payment_status as PaymentStatus) || 'UNPAID',
        createdAt: r.created_at || '',
      }));

      const totalRevenue = rows.reduce((s, r) => s + r.totalAmount, 0);
      const totalCommission = rows.reduce((s, r) => s + r.commissionAmount, 0);
      const paidCommission = rows
        .filter((r) => r.commissionStatus === 'PAID')
        .reduce((s, r) => s + r.commissionAmount, 0);
      const totalDepositsCollected = rows.reduce((s, r) => s + r.depositAmount, 0);
      const totalBalanceDue = rows.reduce((s, r) => s + r.balanceDue, 0);

      const stats: MyCommissionStats = {
        totalBookings: rows.length,
        totalRevenue,
        totalCommission,
        pendingCommission: totalCommission - paidCommission,
        paidCommission,
        commissionRate: profile?.base_commission_rate ?? 0,
        totalDepositsCollected,
        totalBalanceDue,
      };

      return { stats, reservations: rows };
    },
  });
}
