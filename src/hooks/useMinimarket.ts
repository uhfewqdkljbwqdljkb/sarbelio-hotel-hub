import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MinimarketSaleItem } from '@/data/minimarketMock';

interface CreateMinimarketSaleInput {
  items: MinimarketSaleItem[];
  paymentMethod: 'CASH' | 'CARD' | 'ROOM_CHARGE';
  roomNumber?: string;
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
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-data'] });
      queryClient.invalidateQueries({ queryKey: ['combined-transactions'] });
    },
  });
}
