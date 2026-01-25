import React, { useState } from 'react';
import { BookingNavbar } from './BookingNavbar';
import { SocialSidebar } from './SocialSidebar';
import { BookingBar } from './BookingBar';
import heroBackground from '@/assets/faraya-chabrouh.jpg';

interface HeroSectionProps {
  // No special props needed, context is available
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden">
      {/* Background Image - Faraya Chabrouh mountain view */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackground} 
          alt="Sarbelio Hotel mountain view at Faraya Chabrouh"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-slate-900/30"></div>
      </div>

      <BookingNavbar />
      <SocialSidebar />

      {/* Main Content Area */}
      <div className="relative z-10 flex-grow flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20 pb-32">
        <div className="max-w-6xl mx-auto w-full">
          
          {/* Text Content */}
          <div className="mb-16 md:mb-24">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase text-white leading-[1.1] md:leading-[0.95] tracking-tight text-center md:text-left drop-shadow-2xl">
              <span className="block">Where the</span>
              <span className="block md:ml-16">Mountains</span>
              <span className="block md:ml-32">Meet Luxury</span>
            </h1>
            
            <p className="mt-8 text-sm md:text-base lg:text-lg text-white/90 font-light max-w-xl text-center md:text-left mx-auto md:mx-0 md:ml-36 leading-relaxed drop-shadow-lg">
              Premium Chalet Suites in the Heart of Mzaar Faraya. Just 5 minutes from Lebanon's premier ski resort.
            </p>
          </div>

          {/* Booking Bar Wrapper */}
          <div className="w-full">
            <BookingBar />
          </div>
        </div>
      </div>
    </div>
  );
};
