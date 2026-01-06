import React, { useState } from 'react';
import { Heart, Users, Star, Maximize, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Room } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useBooking } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  image: string;
  hasDateSelected: boolean;
  onBook?: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ 
  room,
  image, 
  hasDateSelected,
  onBook 
}) => {
  const { name, roomNumber, capacity, size, price, amenities } = room;
  const rating = 4.8;
  const { bookingData, setDates } = useBooking();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: bookingData.checkIn || undefined,
    to: bookingData.checkOut || undefined,
  });

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setDateRange({ from: range.from, to: range.to });
      if (range.from && range.to) {
        setDates(range.from, range.to);
        setIsCalendarOpen(false);
      }
    }
  };

  return (
    <div className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <button className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-all duration-300">
          <Heart size={18} fill="none" className="hover:fill-current" />
        </button>
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-slate-900">{rating}</span>
        </div>
      </div>
      
      <div className="flex flex-col p-5 flex-grow">
        <span className="text-xs font-medium text-[#8c7a6b] uppercase tracking-wider mb-1">Room {roomNumber}</span>
        <h3 className="font-bold text-slate-900 text-lg mb-3 group-hover:text-[#8c7a6b] transition-colors">{name}</h3>
        
        <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>{capacity} Guests</span>
          </div>
          {size && (
            <div className="flex items-center gap-1.5">
              <Maximize size={14} />
              <span>{size} m²</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(amenities.length > 0 ? amenities : ['WiFi', 'AC', 'TV']).slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {amenity}
            </span>
          ))}
          {amenities.length > 3 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              +{amenities.length - 3} more
            </span>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-slate-900">${price}</span>
            <span className="text-sm text-slate-400 ml-1">/ night</span>
          </div>
          {hasDateSelected ? (
            <Button 
              onClick={onBook}
              className="bg-[#8c7a6b] hover:bg-[#7a6a5d] text-white text-xs font-semibold px-5"
            >
              Book Now
            </Button>
          ) : (
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="text-xs font-semibold px-5 border-[#8c7a6b] text-[#8c7a6b] hover:bg-[#8c7a6b] hover:text-white"
                >
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  Select Dates
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
                {dateRange.from && dateRange.to && (
                  <div className="px-4 pb-3 text-sm text-muted-foreground text-center border-t pt-2">
                    {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};
