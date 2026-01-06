import React, { useState } from 'react';
import { HeroSection } from '@/components/booking/HeroSection';
import { RoomsSection } from '@/components/booking/RoomsSection';
import { AmenitiesSection } from '@/components/booking/AmenitiesSection';
import { GallerySection } from '@/components/booking/GallerySection';
import { ContactSection } from '@/components/booking/ContactSection';
import { Footer } from '@/components/booking/Footer';
import { BookingModal } from '@/components/booking/BookingModal';
import { BookingProvider } from '@/contexts/BookingContext';

const BookingPage: React.FC = () => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  return (
    <BookingProvider>
      <div className="min-h-screen">
        <HeroSection />
        <RoomsSection onBookRoom={() => setBookingModalOpen(true)} />
        <AmenitiesSection />
        <GallerySection />
        <ContactSection />
        <Footer />
        <BookingModal open={bookingModalOpen} onClose={() => setBookingModalOpen(false)} />
      </div>
    </BookingProvider>
  );
};

export default BookingPage;
