import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Room } from '@/types';

export interface BookingData {
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  selectedRoom: Room | null;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    specialRequests: string;
  };
}

interface BookingContextType {
  bookingData: BookingData;
  setDates: (checkIn: Date | null, checkOut: Date | null) => void;
  setGuests: (adults: number, children: number) => void;
  setSelectedRoom: (room: Room | null) => void;
  setGuestInfo: (info: Partial<BookingData['guestInfo']>) => void;
  resetBooking: () => void;
  nights: number;
  totalPrice: number;
}

const initialBookingData: BookingData = {
  checkIn: null,
  checkOut: null,
  adults: 2,
  children: 0,
  selectedRoom: null,
  guestInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    specialRequests: '',
  },
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);

  const setDates = (checkIn: Date | null, checkOut: Date | null) => {
    setBookingData(prev => ({ ...prev, checkIn, checkOut }));
  };

  const setGuests = (adults: number, children: number) => {
    setBookingData(prev => ({ ...prev, adults, children }));
  };

  const setSelectedRoom = (room: Room | null) => {
    setBookingData(prev => ({ ...prev, selectedRoom: room }));
  };

  const setGuestInfo = (info: Partial<BookingData['guestInfo']>) => {
    setBookingData(prev => ({
      ...prev,
      guestInfo: { ...prev.guestInfo, ...info },
    }));
  };

  const resetBooking = () => {
    setBookingData(initialBookingData);
  };

  const nights = bookingData.checkIn && bookingData.checkOut
    ? Math.ceil((bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = bookingData.selectedRoom
    ? bookingData.selectedRoom.price * nights
    : 0;

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        setDates,
        setGuests,
        setSelectedRoom,
        setGuestInfo,
        resetBooking,
        nights,
        totalPrice,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
