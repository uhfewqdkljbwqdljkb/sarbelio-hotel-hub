import React from 'react';
import { Mountain, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Mountain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold">Sarbelio</span>
                <span className="block text-xs uppercase tracking-widest text-background/60">Hotel</span>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Where the mountains meet exceptional hospitality. Your premier destination in Mzaar Faraya, Lebanon.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li><a href="#rooms" className="hover:text-primary transition-colors">Our Rooms</a></li>
              <li><a href="#experience" className="hover:text-primary transition-colors">Experiences</a></li>
              <li><a href="#location" className="hover:text-primary transition-colors">Location</a></li>
              <li><a href="#booking" className="hover:text-primary transition-colors">Book Now</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li>Ski Equipment Storage</li>
              <li>Airport Transfers</li>
              <li>Restaurant & Bar</li>
              <li>Concierge Services</li>
              <li>Room Service</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-background/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Mzaar Faraya, Mount Lebanon, Lebanon</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span>+961 XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>info@sarbeliohotel.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50">
            <p>© 2026 Sarbelio Hotel. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
