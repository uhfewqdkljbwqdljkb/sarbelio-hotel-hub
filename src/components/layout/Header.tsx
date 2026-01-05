import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, LogOut, User } from 'lucide-react';
import { MOCK_USER } from '@/data/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Format pathname for breadcrumb title
  const title = location.pathname.split('/')[1] || 'Dashboard';
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New reservation', message: 'Room 101 booked for Jan 10-15', time: '5 min ago', read: false },
    { id: 2, title: 'Housekeeping complete', message: 'Room 205 is now clean', time: '1 hour ago', read: false },
    { id: 3, title: 'Low inventory alert', message: 'Towels running low', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for "${searchQuery}"...`);
      // In a real app, this would navigate to a search results page
    }
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
    // In a real app with auth, this would call supabase.auth.signOut()
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-card border-b border-border">
      {/* Title / Breadcrumbs */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground">{formattedTitle}</h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-2 md:space-x-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-4 pr-10"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
        </form>

        {/* Settings */}
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <button 
              className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      toast.info(notification.message);
                      setNotificationsOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-border">
              <button 
                className="w-full text-center text-xs text-primary hover:underline py-1"
                onClick={() => {
                  toast.info('Marked all as read');
                  setNotificationsOpen(false);
                }}
              >
                Mark all as read
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center pl-2 md:pl-4 border-l border-border focus:outline-none">
              <img
                src={MOCK_USER.avatarUrl}
                alt={MOCK_USER.name}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              <div className="ml-3 hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">{MOCK_USER.name}</p>
                <p className="text-xs text-muted-foreground">{MOCK_USER.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="w-4 h-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
