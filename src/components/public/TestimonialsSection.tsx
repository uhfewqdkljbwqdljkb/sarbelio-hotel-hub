import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Ahmad Al-Rashid',
    location: 'Dubai, UAE',
    rating: 5,
    text: 'Our family had an incredible ski vacation at Sarbelio Hotel. The proximity to the slopes is unbeatable, and the Lebanese hospitality made us feel right at home. The mountain views from our room were breathtaking!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    date: 'February 2025',
  },
  {
    name: 'Marie Haddad',
    location: 'Beirut, Lebanon',
    rating: 5,
    text: 'Perfect weekend getaway! The staff went above and beyond to arrange our ski passes and equipment. The restaurant serves the most delicious traditional Lebanese breakfast. Already planning our next visit.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    date: 'January 2025',
  },
  {
    name: 'James Morrison',
    location: 'London, UK',
    rating: 5,
    text: 'As someone who has skied in the Alps many times, I was impressed by what Mzaar has to offer. Sarbelio Hotel was the perfect base - comfortable rooms, excellent food, and incredibly friendly staff.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    date: 'December 2024',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 text-foreground">
            What Our Guests Say
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Hear from travelers who have experienced the magic of Sarbelio Hotel.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow"
            >
              {/* Quote Icon */}
              <div className="text-primary/20 mb-4">
                <Quote className="w-10 h-10" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>

              {/* Date */}
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">{testimonial.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">4.9</div>
              <div className="flex gap-1 justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">Guest Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground mt-2">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">95%</div>
              <div className="text-sm text-muted-foreground mt-2">Would Recommend</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">50+</div>
              <div className="text-sm text-muted-foreground mt-2">5-Star Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
