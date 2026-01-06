import React from 'react';
import { RoomCard } from './RoomCard';
import { useRooms } from '@/hooks/useRooms';
import { Skeleton } from '@/components/ui/skeleton';

const roomImages: Record<string, string> = {
  'bedroom': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop',
  'suite': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop',
  'deluxe': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop',
  'penthouse': 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?q=80&w=1974&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop',
};

export const RoomsSection: React.FC = () => {
  const { data: rooms, isLoading } = useRooms();

  // Only show available rooms
  const availableRooms = rooms?.filter(room => room.status === 'AVAILABLE') || [];

  const getImageForRoom = (name: string) => {
    const lowerName = name.toLowerCase();
    for (const key of Object.keys(roomImages)) {
      if (lowerName.includes(key)) {
        return roomImages[key];
      }
    }
    return roomImages.default;
  };

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
        ) : availableRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No rooms available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableRooms.map((room) => (
              <RoomCard
                key={room.id}
                image={room.imageUrl !== '/placeholder.svg' ? room.imageUrl : getImageForRoom(room.name)}
                name={room.name}
                type={`Room ${room.roomNumber}`}
                capacity={room.capacity}
                price={room.price}
                amenities={room.amenities.length > 0 ? room.amenities : ['WiFi', 'AC', 'TV']}
                onBook={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};