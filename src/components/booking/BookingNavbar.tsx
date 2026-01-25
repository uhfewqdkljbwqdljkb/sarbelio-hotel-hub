import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Rooms', href: '#rooms' },
  { label: 'Amenities', href: '#amenities' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export const BookingNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center">
      {/* Logo */}
      <div className="flex flex-col z-50">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter leading-none text-white">SARBELIO</h1>
        <span className="text-xs tracking-[0.3em] uppercase opacity-80 text-white/80">PREMIUM SERVICED RESIDENCE</span>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-12 absolute left-1/2 -translate-x-1/2 text-sm font-medium tracking-wide">
        {navLinks.map((link) => (
          <a 
            key={link.label} 
            href={link.href}
            className="text-white/80 hover:text-white transition-colors duration-300 uppercase text-xs"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* CTA Button (Desktop) & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard"
          className="hidden md:block px-6 py-2 border border-white/30 rounded-sm text-xs font-semibold tracking-wider hover:bg-white hover:text-slate-900 transition-all duration-300 backdrop-blur-sm bg-white/5 text-white"
        >
          STAFF LOGIN
        </Link>

        <button 
          className="md:hidden z-50 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href}
              className="text-2xl font-light tracking-widest uppercase text-white hover:text-[#8c7a6b] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link 
            to="/dashboard"
            className="mt-8 px-8 py-3 bg-white text-slate-900 font-bold uppercase tracking-widest text-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Staff Login
          </Link>
        </div>
      </div>
    </nav>
  );
};
