import React from 'react';
import { Snowflake, Mountain, UtensilsCrossed, Sparkles, Car, Dumbbell } from 'lucide-react';

interface Experience {
  icon: React.ReactNode;
  title: string;
  description: string;
  season?: string;
}

const experiences: Experience[] = [
  {
    icon: <Snowflake className="w-8 h-8" />,
    title: 'World-Class Skiing',
    description: 'Just 5 minutes from Mzaar Ski Resort with 80+ km of trails. We arrange ski passes and equipment rentals.',
    season: 'Winter',
  },
  {
    icon: <Mountain className="w-8 h-8" />,
    title: 'Mountain Adventures',
    description: 'Explore breathtaking hiking trails, mountain biking routes, and paragliding experiences in summer.',
    season: 'Summer',
  },
  {
    icon: <UtensilsCrossed className="w-8 h-8" />,
    title: 'Lebanese Cuisine',
    description: 'Savor authentic Lebanese dishes and international favorites at our on-site restaurant and après-ski lounge.',
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Wellness & Relaxation',
    description: 'Unwind with fresh alpine air, stunning scenery, and serene mountain wellness experiences.',
  },
  {
    icon: <Car className="w-8 h-8" />,
    title: 'Concierge Services',
    description: 'From airport transfers to local tours, our team ensures seamless arrangements for every need.',
  },
  {
    icon: <Dumbbell className="w-8 h-8" />,
    title: 'Ski Equipment Storage',
    description: 'Secure storage for your ski and snowboard equipment, with rental assistance available.',
  },
];

const ExperienceSection: React.FC = () => {
  return (
    <section id="experience" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Experiences</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 text-foreground">
            Year-Round Mountain Magic
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Whether you're chasing powder in winter or alpine adventures in summer, Sarbelio Hotel is your gateway to unforgettable experiences.
          </p>
        </div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="group bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {exp.icon}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-foreground">{exp.title}</h3>
                {exp.season && (
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {exp.season}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{exp.description}</p>
            </div>
          ))}
        </div>

        {/* Seasonal Highlights */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Winter Card */}
          <div className="relative overflow-hidden rounded-2xl h-80">
            <img
              src="https://images.unsplash.com/photo-1551524559-8af4e6624178?q=80&w=2026&auto=format&fit=crop"
              alt="Winter skiing"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-4">
                <Snowflake className="w-4 h-4" />
                December - April
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">Winter Season</h3>
              <p className="text-white/80">
                Experience the thrill of Lebanon's premier ski destination with slope-side accommodation and après-ski relaxation.
              </p>
            </div>
          </div>

          {/* Summer Card */}
          <div className="relative overflow-hidden rounded-2xl h-80">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
              alt="Summer mountains"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-4">
                <Mountain className="w-4 h-4" />
                June - September
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">Summer Escape</h3>
              <p className="text-white/80">
                Escape the heat with cool mountain air, hiking trails, and breathtaking panoramic views.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
