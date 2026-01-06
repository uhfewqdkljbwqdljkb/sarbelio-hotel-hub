import React from 'react';
import { Waves, Utensils, Dumbbell, Wifi, Car, Coffee, Sparkles, Sun } from 'lucide-react';

const amenities = [
  { icon: Waves, title: 'Infinity Pool', description: 'Overlooking the ocean with stunning sunset views' },
  { icon: Utensils, title: 'Fine Dining', description: 'World-class cuisine prepared by expert chefs' },
  { icon: Dumbbell, title: 'Fitness Center', description: 'State-of-the-art equipment open 24/7' },
  { icon: Wifi, title: 'High-Speed WiFi', description: 'Complimentary throughout the entire resort' },
  { icon: Car, title: 'Valet Parking', description: 'Secure parking with 24-hour valet service' },
  { icon: Coffee, title: 'Room Service', description: 'Available around the clock for your convenience' },
  { icon: Sparkles, title: 'Spa & Wellness', description: 'Rejuvenating treatments and massage therapy' },
  { icon: Sun, title: 'Private Beach', description: 'Exclusive beach access for our guests' },
];

export const AmenitiesSection: React.FC = () => {
  return (
    <section id="amenities" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#8c7a6b] uppercase tracking-[0.3em] mb-4 block">
            Hotel Amenities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything You Need
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Sarbelio Hotel offers an array of premium amenities designed to make your stay 
            as comfortable and memorable as possible.
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {amenities.map((amenity, index) => (
            <div 
              key={index}
              className="group p-6 bg-slate-50 rounded-2xl hover:bg-[#8c7a6b] transition-all duration-500 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-5 group-hover:bg-white/20 transition-colors">
                <amenity.icon size={24} className="text-[#8c7a6b] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-white transition-colors">
                {amenity.title}
              </h3>
              <p className="text-sm text-slate-500 group-hover:text-white/80 transition-colors">
                {amenity.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
