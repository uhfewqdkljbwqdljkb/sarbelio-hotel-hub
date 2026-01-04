import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@/data/constants';
import { Hotel } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r border-border">
      {/* Logo Area */}
      <div className="flex items-center h-16 px-6 border-b border-border">
        <div className="p-1.5 bg-primary-200 rounded-lg mr-3">
          <Hotel className="w-6 h-6 text-primary-800" />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">Sarbelio</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary-200 text-primary-900' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className="flex items-center">
                <Icon className={`w-5 h-5 mr-3 transition-colors ${
                  isActive ? 'text-primary-800' : 'text-muted-foreground group-hover:text-foreground'
                }`} />
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          © 2024 Sarbelio Inc.
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
