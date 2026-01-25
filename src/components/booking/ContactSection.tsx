import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you for your message! We will get back to you shortly.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <span className="text-xs font-semibold text-[#8c7a6b] uppercase tracking-[0.3em] mb-4 block">
              Contact Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Get In Touch
            </h2>
            <p className="text-slate-500 text-lg mb-10">
              Have questions or ready to book your stay? Our team is here to help 
              make your experience at Sarbelio Hotel unforgettable.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#8c7a6b]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-[#8c7a6b]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Address</h4>
                  <p className="text-slate-500">Sarbelio Mzaar Kfardebian<br />Faraya Mount Lebanon, Lebanon</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#8c7a6b]/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-[#8c7a6b]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Phone</h4>
                  <p className="text-slate-500">+961 71 67 71 68</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#8c7a6b]/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-[#8c7a6b]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                  <p className="text-slate-500">sarbeliomzaar@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#8c7a6b]/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-[#8c7a6b]" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Front Desk</h4>
                  <p className="text-slate-500">Open 24 hours, 7 days a week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 border-slate-200 focus:border-[#8c7a6b] focus:ring-[#8c7a6b]"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 border-slate-200 focus:border-[#8c7a6b] focus:ring-[#8c7a6b]"
                  required
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 border-slate-200 focus:border-[#8c7a6b] focus:ring-[#8c7a6b]"
                />
              </div>
              <div>
                <Textarea
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[120px] border-slate-200 focus:border-[#8c7a6b] focus:ring-[#8c7a6b] resize-none"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="w-full h-12 bg-[#8c7a6b] hover:bg-[#7a6a5d] text-white font-semibold"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
