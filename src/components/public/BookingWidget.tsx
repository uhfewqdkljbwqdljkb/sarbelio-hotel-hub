import React, { useState } from 'react';
import { CalendarDays, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';

const BookingWidget: React.FC = () => {
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 2));
  const [guests, setGuests] = useState(2);

  const handleSearch = () => {
    const section = document.getElementById('rooms');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Check-in */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-left">
              <CalendarDays className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Check-in</div>
                <div className="text-white font-medium">
                  {checkIn ? format(checkIn, 'MMM dd, yyyy') : 'Select date'}
                </div>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={setCheckIn}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Check-out */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-left">
              <CalendarDays className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Check-out</div>
                <div className="text-white font-medium">
                  {checkOut ? format(checkOut, 'MMM dd, yyyy') : 'Select date'}
                </div>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => date <= (checkIn || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-left">
              <Users className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Guests</div>
                <div className="text-white font-medium">{guests} Guest{guests > 1 ? 's' : ''}</div>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Guests</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                >
                  -
                </button>
                <span className="w-6 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(10, guests + 1))}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                >
                  +
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          className="h-full bg-primary hover:bg-primary-600 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          <span>Check Availability</span>
        </Button>
      </div>
    </div>
  );
};

export default BookingWidget;
