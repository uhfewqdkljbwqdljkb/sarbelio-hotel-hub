import React from 'react';
import { Users, Maximize, Wifi, Mountain, Coffee, Snowflake, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: number;
  image: string;
  amenities: string[];
  featured?: boolean;
}

const roomTypes: RoomType[] = [
  {
    id: '1',
    name: 'Classic Mountain Room',
    description: 'Cozy room with stunning mountain views, perfect for couples or solo travelers seeking comfort.',
    price: 120,
    capacity: 2,
    size: 28,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop',
    amenities: ['Mountain View', 'Free WiFi', 'Heating', 'Room Service'],
  },
  {
    id: '2',
    name: 'Superior Alpine Suite',
    description: 'Spacious suite with separate living area, private balcony, and panoramic mountain vistas.',
    price: 195,
    capacity: 3,
    size: 45,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074&auto=format&fit=crop',
    amenities: ['Balcony', 'Living Area', 'Free WiFi', 'Mini Bar'],
    featured: true,
  },
  {
    id: '3',
    name: 'Family Mountain Lodge',
    description: 'Perfect for families, featuring connecting rooms and ample space for unforgettable memories.',
    price: 280,
    capacity: 5,
    size: 65,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2074&auto=format&fit=crop',
    amenities: ['2 Bedrooms', 'Kids Welcome', 'Free WiFi', 'Kitchen'],
  },
  {
    id: '4',
    name: 'Deluxe Ski Chalet',
    description: 'Premium accommodation with fireplace, hot tub access, and ski-in convenience.',
    price: 350,
    capacity: 4,
    size: 80,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop',
    amenities: ['Fireplace', 'Hot Tub', 'Ski Storage', 'Butler Service'],
    featured: true,
  },
];

const amenityIcons: Record<string, React.ReactNode> = {
  'Mountain View': <Mountain className="w-4 h-4" />,
  'Free WiFi': <Wifi className="w-4 h-4" />,
  'Room Service': <Coffee className="w-4 h-4" />,
  'Heating': <Snowflake className="w-4 h-4" />,
};

const RoomsSection: React.FC = () => {
  return (
    <section id="rooms" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Accommodations</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 text-foreground">
            Find Your Perfect Mountain Retreat
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            From cozy rooms to luxurious chalets, discover accommodations designed for ultimate comfort after a day on the slopes.
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roomTypes.map((room) => (
            <div
              key={room.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {room.featured && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <div className="absolute bottom-4 right-4 bg-foreground/90 text-background px-4 py-2 rounded-lg">
                  <span className="text-2xl font-bold">${room.price}</span>
                  <span className="text-sm opacity-70">/night</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{room.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{room.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Up to {room.capacity} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4" />
                    <span>{room.size} m²</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {room.amenities.slice(0, 4).map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                    >
                      {amenityIcons[amenity] || null}
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Button className="w-full group/btn" variant="outline">
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Rooms */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-primary hover:bg-primary-600 text-primary-foreground">
            View All Rooms
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;
