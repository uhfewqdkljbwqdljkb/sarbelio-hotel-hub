import React, { useState, useEffect, useRef } from 'react';
import { Users, Calendar, ChevronDown, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingBarProps {
  onSearch?: (data: { adults: number; children: number; startDate: Date | null; endDate: Date | null }) => void;
}

export const BookingBar: React.FC<BookingBarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<'guests' | 'calendar' | null>(null);
  
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateGuests = (type: 'adults' | 'children', operation: 'increment' | 'decrement') => {
    if (type === 'adults') {
      setAdults(prev => operation === 'increment' ? prev + 1 : Math.max(1, prev - 1));
    } else {
      setChildren(prev => operation === 'increment' ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const isBefore = (d1: Date, d2: Date) => {
    return new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()) < 
           new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBefore(clickedDate, startDate)) {
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
        setActiveDropdown(null);
      }
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newDate);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ adults, children, startDate, endDate });
    }
    // Scroll to rooms section
    const roomsSection = document.getElementById('rooms');
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderCalendar = () => {
    const { days, firstDay } = getDaysInMonth(currentMonth);
    const grid = [];
    
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= days; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelectedStart = isSameDay(date, startDate);
      const isSelectedEnd = isSameDay(date, endDate);
      const isInRange = startDate && endDate && date > startDate && date < endDate;
      const isHoverInRange = startDate && !endDate && hoverDate && date > startDate && date <= hoverDate;
      const isPast = isBefore(date, new Date(new Date().setHours(0,0,0,0)));

      let bgClass = "hover:bg-white/10 text-white";
      if (isPast) {
        bgClass = "text-white/20 cursor-not-allowed hover:bg-transparent";
      } else if (isSelectedStart || isSelectedEnd) {
        bgClass = "bg-[#8c7a6b] text-white shadow-lg scale-105";
      } else if (isInRange || isHoverInRange) {
        bgClass = "bg-[#8c7a6b]/30 text-white/90";
      }

      grid.push(
        <button
          key={day}
          disabled={isPast}
          onClick={() => !isPast && handleDateClick(day)}
          onMouseEnter={() => !isPast && setHoverDate(date)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${bgClass}`}
        >
          {day}
        </button>
      );
    }
    return grid;
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-xl shadow-2xl flex flex-col md:flex-row z-30">
      
      {/* Guests Input */}
      <div 
        className={`flex-1 p-5 md:p-6 border-b md:border-b-0 md:border-r border-white/10 relative cursor-pointer transition-colors ${activeDropdown === 'guests' ? 'bg-white/10' : 'hover:bg-white/5'}`}
        onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full border border-white/20">
            <Users size={18} className="text-white/90" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-white/60 mb-1">Guests</span>
            <span className="text-sm font-medium text-white flex items-center gap-2">
              {adults} Adults, {children} Children
            </span>
          </div>
          <ChevronDown size={14} className={`ml-auto text-white/50 transition-transform duration-300 ${activeDropdown === 'guests' ? 'rotate-180' : ''}`} />
        </div>

        {activeDropdown === 'guests' && (
          <div className="absolute bottom-full left-0 mb-4 w-full md:w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-6 shadow-2xl z-50" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">Adults</span>
                  <span className="text-xs text-white/50">Ages 13+</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => updateGuests('adults', 'decrement')}
                    className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 text-white disabled:opacity-30"
                    disabled={adults <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center text-white">{adults}</span>
                  <button 
                    onClick={() => updateGuests('adults', 'increment')}
                    className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 text-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              
              <div className="h-[1px] w-full bg-white/10"></div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">Children</span>
                  <span className="text-xs text-white/50">Ages 0-12</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => updateGuests('children', 'decrement')}
                    className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 text-white disabled:opacity-30"
                    disabled={children <= 0}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center text-white">{children}</span>
                  <button 
                    onClick={() => updateGuests('children', 'increment')}
                    className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 text-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Date Input */}
      <div 
        className={`flex-1 p-5 md:p-6 border-b md:border-b-0 md:border-r border-white/10 relative cursor-pointer transition-colors ${activeDropdown === 'calendar' ? 'bg-white/10' : 'hover:bg-white/5'}`}
        onClick={() => setActiveDropdown(activeDropdown === 'calendar' ? null : 'calendar')}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full border border-white/20">
            <Calendar size={18} className="text-white/90" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-white/60 mb-1">Arrival & Departure</span>
            <span className="text-sm font-medium text-white flex items-center gap-2">
              {startDate ? formatDate(startDate) : 'Select Date'} 
              <span className="mx-1 text-white/40">—</span> 
              {endDate ? formatDate(endDate) : 'Select Date'}
            </span>
          </div>
          <ChevronDown size={14} className={`ml-auto text-white/50 transition-transform duration-300 ${activeDropdown === 'calendar' ? 'rotate-180' : ''}`} />
        </div>

        {activeDropdown === 'calendar' && (
          <div className="absolute bottom-full left-0 md:left-auto md:-translate-x-1/4 mb-4 w-[340px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-6 shadow-2xl z-50" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-medium text-white">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-xs font-medium text-white/40 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 place-items-center">
              {renderCalendar()}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => { setStartDate(null); setEndDate(null); }}
                className="text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider font-medium"
              >
                Clear Dates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="p-3 md:p-3 flex items-center justify-center md:w-auto">
        <button 
          onClick={handleSearch}
          className="w-full md:w-auto px-8 py-4 md:py-0 h-full bg-[#8c7a6b] hover:bg-[#7a6a5d] text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap active:scale-95"
        >
          Check Availability
        </button>
      </div>
    </div>
  );
};
