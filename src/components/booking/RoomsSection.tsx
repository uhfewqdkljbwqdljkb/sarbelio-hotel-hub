import React, { useMemo } from 'react';
import { RoomCard } from './RoomCard';
import { useRooms } from '@/hooks/useRooms';
import { useBooking } from '@/contexts/BookingContext';
import { useCalendarReservations } from '@/hooks/useCalendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Room } from '@/types';
import { format } from 'date-fns';

interface RoomsSectionProps {
  onBookRoom: () => void;
}

const roomImages: Record<string, string> = {
  'bedroom': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop',
  'suite': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop',
  'deluxe': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop',
  'penthouse': 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?q=80&w=1974&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop',
};

export const RoomsSection: React.FC<RoomsSectionProps> = ({ onBookRoom }) => {
  const { data: rooms, isLoading } = useRooms();
  const { data: reservations } = useCalendarReservations();
  const { bookingData, setSelectedRoom } = useBooking();

  const totalGuests = bookingData.adults + bookingData.children;
  const { checkIn, checkOut } = bookingData;

  // Check if a room is available for the selected dates
  const isRoomAvailableForDates = (roomId: string): boolean => {
    if (!checkIn || !checkOut || !reservations) return true;
    
    const checkInStr = format(checkIn, 'yyyy-MM-dd');
    const checkOutStr = format(checkOut, 'yyyy-MM-dd');
    
    // Check for overlapping reservations
    const hasOverlap = reservations.some(res => {
      if (res.roomId !== roomId) return false;
      if (['CANCELLED', 'NO_SHOW', 'CHECKED_OUT'].includes(res.status)) return false;
      
      // Date overlap check: new check-in is before existing check-out AND new check-out is after existing check-in
      return checkInStr < res.checkOut && checkOutStr > res.checkIn;
    });
    
    return !hasOverlap;
  };

  // Filter rooms by status, capacity, and availability for selected dates
  const filteredRooms = useMemo(() => {
    const baseRooms = rooms?.filter(room => room.status === 'AVAILABLE') || [];
    const capacityFiltered = baseRooms.filter(room => room.capacity >= totalGuests);
    
    // If dates are selected, also filter by date availability
    if (checkIn && checkOut) {
      return capacityFiltered.filter(room => isRoomAvailableForDates(room.id));
    }
    
    return capacityFiltered;
  }, [rooms, totalGuests, checkIn, checkOut, reservations]);

  const getImageForRoom = (name: string) => {
    const lowerName = name.toLowerCase();
    for (const key of Object.keys(roomImages)) {
      if (lowerName.includes(key)) {
        return roomImages[key];
      }
    }
    return roomImages.default;
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    onBookRoom();
  };

  const hasDateSelected = bookingData.checkIn && bookingData.checkOut;

  return (
    <section id="rooms" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#8c7a6b] uppercase tracking-[0.3em] mb-4 block">
            Accommodations
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Our Luxurious Rooms
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Each room at Sarbelio Hotel is designed to provide the ultimate comfort and relaxation, 
            featuring stunning views and world-class amenities.
          </p>
          {totalGuests > 1 && (
            <p className="text-[#8c7a6b] mt-4 font-medium">
              Showing rooms for {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Room Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">
              {rooms?.length === 0 
                ? 'No rooms available at the moment. Please check back later.'
                : checkIn && checkOut
                  ? 'No rooms available for the selected dates and guest count. Please try different dates.'
                  : `No rooms available for ${totalGuests} guests. Please adjust your guest count.`
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                image={room.imageUrl !== '/placeholder.svg' ? room.imageUrl : getImageForRoom(room.name)}
                hasDateSelected={!!hasDateSelected}
                onBook={() => handleBookRoom(room)}
              />
            ))}
          </div>
        )}

        {!hasDateSelected && filteredRooms.length > 0 && (
          <p className="text-center text-slate-500 mt-8">
            Please select your dates above to book a room
          </p>
        )}
      </div>
    </section>
  );
};
