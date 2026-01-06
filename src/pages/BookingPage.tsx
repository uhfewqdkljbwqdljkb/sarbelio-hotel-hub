import React from 'react';
import { HeroSection } from '@/components/booking/HeroSection';
import { RoomsSection } from '@/components/booking/RoomsSection';
import { AmenitiesSection } from '@/components/booking/AmenitiesSection';
import { GallerySection } from '@/components/booking/GallerySection';
import { ContactSection } from '@/components/booking/ContactSection';
import { Footer } from '@/components/booking/Footer';

const BookingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <RoomsSection />
      <AmenitiesSection />
      <GallerySection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default BookingPage;
