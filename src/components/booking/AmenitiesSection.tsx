import React from 'react';
import { ChefHat, Tv, Flame, Thermometer, Bath, Zap, Wifi, Droplets, Phone } from 'lucide-react';

const amenities = [
  { icon: ChefHat, title: 'Fully Equipped Kitchen', description: 'Everything you need to prepare your favorite meals' },
  { icon: Tv, title: 'Entertainment', description: 'Cable TV, Netflix, and YouTube ready for your enjoyment' },
  { icon: Flame, title: 'Chimney & BBQ Area', description: 'Cozy fireplace and outdoor grilling space' },
  { icon: Thermometer, title: 'Central Heating', description: 'Chauffage system keeps you warm all winter' },
  { icon: Bath, title: 'Fully Equipped Bathroom', description: 'Modern amenities for your comfort' },
  { icon: Zap, title: 'Electricity All Night', description: 'We provide uninterrupted power throughout the night' },
  { icon: Wifi, title: 'Unlimited Fast WiFi', description: 'High-speed internet throughout your stay' },
  { icon: Droplets, title: 'Running Hot Water', description: 'Hot water available around the clock' },
  { icon: Phone, title: '24/7 Desk Service', description: 'We are here for anything you need during your stay' },
];

export const AmenitiesSection: React.FC = () => {
  return (
    <section id="amenities" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#8c7a6b] uppercase tracking-[0.3em] mb-4 block">
            Chalet Amenities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything You Need
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Sarbelio Chalet Suites offers premium amenities designed to make your mountain stay 
            as comfortable and memorable as possible.
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
