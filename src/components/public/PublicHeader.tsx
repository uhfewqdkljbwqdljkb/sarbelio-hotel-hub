import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PublicHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Rooms', href: '#rooms' },
    { label: 'Experience', href: '#experience' },
    { label: 'Location', href: '#location' },
    { label: 'Contact', href: '#contact' },
  ];

  const isHome = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome
          ? 'bg-card/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isScrolled || !isHome ? 'bg-primary' : 'bg-white/10 backdrop-blur-sm'}`}>
              <Mountain className={`w-6 h-6 ${isScrolled || !isHome ? 'text-primary-foreground' : 'text-white'}`} />
            </div>
            <div>
              <span className={`text-xl font-bold tracking-tight ${isScrolled || !isHome ? 'text-foreground' : 'text-white'}`}>
                Sarbelio
              </span>
              <span className={`block text-xs uppercase tracking-widest ${isScrolled || !isHome ? 'text-muted-foreground' : 'text-white/70'}`}>
                Hotel
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isScrolled || !isHome ? 'text-foreground' : 'text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className={isScrolled || !isHome ? '' : 'text-white hover:bg-white/10'}>
                Staff Login
              </Button>
            </Link>
            <a href="#booking">
              <Button size="sm" className="bg-primary hover:bg-primary-600 text-primary-foreground">
                Book Now
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 ${isScrolled || !isHome ? 'text-foreground' : 'text-white'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border">
            <nav className="py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg"
                >
                  {link.label}
                </a>
              ))}
              <div className="px-4 pt-4 space-y-2 border-t border-border mt-4">
                <Link to="/dashboard" className="block">
                  <Button variant="outline" className="w-full">Staff Login</Button>
                </Link>
                <a href="#booking" className="block">
                  <Button className="w-full">Book Now</Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;
