import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoomImage } from '@/types';

interface DbRoomImage {
  id: string;
  room_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

const mapDbToRoomImage = (db: DbRoomImage): RoomImage => ({
  id: db.id,
  roomId: db.room_id,
  imageUrl: db.image_url,
  displayOrder: db.display_order,
  isPrimary: db.is_primary,
});

export function useRoomImages(roomId: string | undefined) {
  return useQuery({
    queryKey: ['room_images', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from('room_images')
        .select('*')
        .eq('room_id', roomId)
        .order('display_order');
      
      if (error) throw error;
      return (data as DbRoomImage[]).map(mapDbToRoomImage);
    },
    enabled: !!roomId,
  });
}

export function useCreateRoomImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ roomId, imageUrl, displayOrder, isPrimary }: {
      roomId: string;
      imageUrl: string;
      displayOrder: number;
      isPrimary: boolean;
    }) => {
      const { data, error } = await supabase
        .from('room_images')
        .insert({
          room_id: roomId,
          image_url: imageUrl,
          display_order: displayOrder,
          is_primary: isPrimary,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToRoomImage(data as DbRoomImage);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['room_images', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useDeleteRoomImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, roomId }: { id: string; roomId: string }) => {
      const { error } = await supabase
        .from('room_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id, roomId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['room_images', variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoomImageOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ images, roomId }: { images: { id: string; displayOrder: number; isPrimary: boolean }[]; roomId: string }) => {
      const updates = images.map((img) =>
        supabase
          .from('room_images')
          .update({ display_order: img.displayOrder, is_primary: img.isPrimary })
          .eq('id', img.id)
      );
      
      await Promise.all(updates);
      return roomId;
    },
    onSuccess: (roomId) => {
      queryClient.invalidateQueries({ queryKey: ['room_images', roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export async function uploadRoomImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `rooms/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('room-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('room-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
