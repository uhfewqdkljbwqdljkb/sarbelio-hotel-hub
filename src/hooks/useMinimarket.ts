import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MinimarketSaleItem } from '@/data/minimarketMock';
import { format } from 'date-fns';

interface CreateMinimarketSaleInput {
  items: MinimarketSaleItem[];
  paymentMethod: 'CASH' | 'CARD' | 'ROOM_CHARGE';
  roomNumber?: string;
}

export interface DbMinimarketSale {
  id: string;
  item_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  payment_method: string | null;
  room_number: string | null;
  sold_at: string | null;
}

export function useMinimarketSales() {
  return useQuery({
    queryKey: ['minimarket-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minimarket_sales')
        .select('*')
        .order('sold_at', { ascending: false });

      if (error) throw error;
      return (data || []) as DbMinimarketSale[];
    },
  });
}

export function useCreateMinimarketSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, paymentMethod, roomNumber }: CreateMinimarketSaleInput) => {
      const soldAt = new Date().toISOString();

      const { error } = await supabase.from('minimarket_sales').insert(
        items.map((item) => ({
          product_id: null,
          item_name: item.itemName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.total,
          payment_method: paymentMethod,
          room_number: paymentMethod === 'ROOM_CHARGE' ? roomNumber ?? null : null,
          sold_at: soldAt,
        }))
      );

      if (error) throw error;

      return soldAt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minimarket-sales'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-data'] });
      queryClient.invalidateQueries({ queryKey: ['combined-transactions'] });
    },
  });
}
