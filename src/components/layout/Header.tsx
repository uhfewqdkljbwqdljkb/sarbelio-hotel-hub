import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Settings } from 'lucide-react';
import { MOCK_USER } from '@/data/constants';

const Header: React.FC = () => {
  const location = useLocation();
  
  // Format pathname for breadcrumb title
  const title = location.pathname.split('/')[1] || 'Dashboard';
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border">
      {/* Title / Breadcrumbs */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{formattedTitle}</h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-4 pr-10 py-1.5 bg-secondary border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:outline-none transition-shadow"
          />
          <Search className="absolute right-3 top-1.5 w-4 h-4 text-muted-foreground" />
        </div>

        {/* Icons */}
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center pl-4 border-l border-border">
          <img
            src={MOCK_USER.avatarUrl}
            alt={MOCK_USER.name}
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
          <div className="ml-3 hidden md:block">
            <p className="text-sm font-medium text-foreground">{MOCK_USER.name}</p>
            <p className="text-xs text-muted-foreground">{MOCK_USER.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
