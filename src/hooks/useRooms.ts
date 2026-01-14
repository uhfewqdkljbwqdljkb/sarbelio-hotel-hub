import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Room, RoomType, RoomStatus, CleaningStatus } from '@/types';

interface DbRoom {
  id: string;
  room_number: string;
  floor: number;
  room_type_id: string | null;
  name: string | null;
  description: string | null;
  price: number;
  weekday_price: number | null;
  weekend_price: number | null;
  capacity: number;
  amenities: string[];
  image_url: string | null;
  size: number | null;
  status: string;
  cleaning_status: string;
  next_reservation: string | null;
}

interface DbRoomType {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  max_occupancy: number;
  total_rooms: number;
  amenities: string[];
  image_url: string | null;
}

const mapDbRoomToRoom = (dbRoom: DbRoom): Room => ({
  id: dbRoom.id,
  roomNumber: dbRoom.room_number,
  floor: dbRoom.floor,
  roomTypeId: dbRoom.room_type_id || '',
  name: dbRoom.name || `Room ${dbRoom.room_number}`,
  description: dbRoom.description || '',
  price: dbRoom.price,
  weekdayPrice: dbRoom.weekday_price ?? undefined,
  weekendPrice: dbRoom.weekend_price ?? undefined,
  capacity: dbRoom.capacity,
  amenities: dbRoom.amenities || [],
  imageUrl: dbRoom.image_url || '/placeholder.svg',
  size: dbRoom.size || 0,
  status: dbRoom.status as RoomStatus,
  cleaningStatus: dbRoom.cleaning_status as CleaningStatus,
  nextReservation: dbRoom.next_reservation || undefined,
});

const mapDbRoomTypeToRoomType = (dbRoomType: DbRoomType): RoomType => ({
  id: dbRoomType.id,
  name: dbRoomType.name,
  description: dbRoomType.description || '',
  basePrice: dbRoomType.base_price,
  maxOccupancy: dbRoomType.max_occupancy,
  totalRooms: dbRoomType.total_rooms,
  amenities: dbRoomType.amenities || [],
  imageUrl: dbRoomType.image_url || '/placeholder.svg',
});

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');
      
      if (error) throw error;
      return (data as DbRoom[]).map(mapDbRoomToRoom);
    },
  });
}

export function useRoomTypes() {
  return useQuery({
    queryKey: ['room_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data as DbRoomType[]).map(mapDbRoomTypeToRoomType);
    },
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (room: Partial<Room>) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          room_number: room.roomNumber,
          floor: room.floor,
          room_type_id: room.roomTypeId || null,
          name: room.name,
          description: room.description,
          price: room.price,
          weekday_price: room.weekdayPrice ?? null,
          weekend_price: room.weekendPrice ?? null,
          capacity: room.capacity,
          amenities: room.amenities || [],
          image_url: room.imageUrl,
          size: room.size,
          status: room.status || 'AVAILABLE',
          cleaning_status: room.cleaningStatus || 'CLEAN',
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbRoomToRoom(data as DbRoom);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Room> & { id: string }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update({
          room_number: updates.roomNumber,
          floor: updates.floor,
          room_type_id: updates.roomTypeId || null,
          name: updates.name,
          description: updates.description,
          price: updates.price,
          weekday_price: updates.weekdayPrice ?? null,
          weekend_price: updates.weekendPrice ?? null,
          capacity: updates.capacity,
          amenities: updates.amenities,
          image_url: updates.imageUrl,
          size: updates.size,
          status: updates.status,
          cleaning_status: updates.cleaningStatus,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbRoomToRoom(data as DbRoom);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
