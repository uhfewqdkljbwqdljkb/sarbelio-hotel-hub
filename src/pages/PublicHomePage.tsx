import React from 'react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import HeroSection from '@/components/public/HeroSection';
import RoomsSection from '@/components/public/RoomsSection';
import ExperienceSection from '@/components/public/ExperienceSection';
import LocationSection from '@/components/public/LocationSection';
import TestimonialsSection from '@/components/public/TestimonialsSection';
import ContactSection from '@/components/public/ContactSection';
import BookingSection from '@/components/public/BookingSection';

const PublicHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <HeroSection />
        <RoomsSection />
        <ExperienceSection />
        <TestimonialsSection />
        <LocationSection />
        <BookingSection />
        <ContactSection />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicHomePage;
