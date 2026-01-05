import React from 'react';
import { MapPin, Clock, Plane, Mountain, Car } from 'lucide-react';

const LocationSection: React.FC = () => {
  const locationFeatures = [
    {
      icon: <Mountain className="w-6 h-6" />,
      title: '5 min to Ski Resort',
      description: 'Mzaar Ski Resort - the largest in the Middle East',
    },
    {
      icon: <Car className="w-6 h-6" />,
      title: '1 hour from Beirut',
      description: 'Just 45 km from the capital city',
    },
    {
      icon: <Plane className="w-6 h-6" />,
      title: '50 km from Airport',
      description: 'Rafic Hariri International Airport',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '1,850m Altitude',
      description: 'Fresh alpine air and stunning views',
    },
  ];

  return (
    <section id="location" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Location</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 text-foreground">
              Your Gateway to Mzaar Faraya
            </h2>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              Strategically positioned in the heart of Lebanon's most renowned ski region, Sarbelio Hotel offers unparalleled access to world-class winter sports while providing year-round mountain retreat experiences.
            </p>

            {/* Location Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
              {locationFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="mt-10 p-6 bg-muted rounded-xl">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Hotel Address</h4>
                  <p className="text-muted-foreground mt-1">
                    Mzaar Faraya, Mount Lebanon<br />
                    Kfardebian Municipality, Lebanon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="relative h-[500px] rounded-2xl overflow-hidden border border-border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13228.397082947682!2d35.84536537139893!3d33.97459839999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f3e4e32f7b72d%3A0x3a8d5c0c69ca05d4!2sMzaar%20Kfardebian!5e0!3m2!1sen!2slb!4v1704900000000!5m2!1sen!2slb"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sarbelio Hotel Location"
            />
            {/* Overlay Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Sarbelio Hotel</h4>
                  <p className="text-sm text-muted-foreground">Mzaar Faraya, Lebanon</p>
                </div>
                <a
                  href="https://www.google.com/maps/dir//Mzaar+Kfardebian"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
