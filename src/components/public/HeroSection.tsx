import React from 'react';
import { ChevronDown, MapPin, Star, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookingWidget from './BookingWidget';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 text-white/10">
        <Snowflake className="w-24 h-24 animate-pulse" />
      </div>
      <div className="absolute bottom-40 right-10 text-white/10">
        <Snowflake className="w-32 h-32 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-24">
        <div className="max-w-4xl mx-auto text-center text-white space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Mzaar Faraya, Mount Lebanon</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Where Mountains Meet
            <span className="block text-primary">Exceptional Hospitality</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Just 5 minutes from the largest ski resort in the Middle East. Experience authentic Lebanese hospitality amidst breathtaking alpine scenery.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5 min</div>
              <div className="text-sm text-white/60">to Mzaar Ski Resort</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1,850m</div>
              <div className="text-sm text-white/60">Altitude</div>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <div className="text-sm text-white/60 mt-1">Guest Rating</div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="pt-8">
            <BookingWidget />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a href="#rooms" className="flex flex-col items-center text-white/60 hover:text-white transition-colors">
            <span className="text-sm mb-2">Explore</span>
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
