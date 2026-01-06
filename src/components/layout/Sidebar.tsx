import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@/data/constants';
import { Hotel, LogOut } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileOpenChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, profile, signOut, hasAccess } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Filter navigation items based on user role
  const filteredNavItems = NAVIGATION_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true;
    return hasAccess(item.allowedRoles);
  });

  const NavContent = () => (
    <>
      {/* Logo Area */}
      <div className="flex items-center h-16 px-6 border-b border-border">
        <div className="p-1.5 bg-primary-200 rounded-lg mr-3">
          <Hotel className="w-6 h-6 text-primary-800" />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">Sarbelio</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onMobileOpenChange?.(false)}
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

      {/* User Info & Sign Out */}
      <div className="p-4 border-t border-border space-y-3">
        {profile && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-semibold text-sm">
              {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile.full_name || profile.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        <div className="text-xs text-muted-foreground text-center pt-2">
          © 2024 Sarbelio Inc.
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r border-border">
        <NavContent />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="flex flex-col h-full bg-card">
            <NavContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
