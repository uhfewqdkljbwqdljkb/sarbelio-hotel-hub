import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, Search, Settings, LogOut, User, LayoutDashboard, CalendarDays, 
  BedDouble, SprayCan, UtensilsCrossed, Box, DollarSign, Megaphone, 
  CalendarRange, UserCheck, Users, LucideIcon, Menu, Store
} from 'lucide-react';
import { ROLE_LABELS } from '@/data/constants';
import { useAuth, AppRole } from '@/contexts/AuthContext';
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

interface SearchItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  keywords: string[];
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, keywords: ['home', 'overview', 'main'] },
  { id: 'reservations', label: 'Reservations', path: '/reservations', icon: CalendarDays, keywords: ['booking', 'reserve', 'book'] },
  { id: 'rooms', label: 'Rooms', path: '/rooms', icon: BedDouble, keywords: ['room', 'accommodation', 'bed'] },
  { id: 'housekeeping', label: 'Housekeeping', path: '/housekeeping', icon: SprayCan, keywords: ['clean', 'cleaning', 'laundry', 'tasks'] },
  { id: 'restaurant', label: 'Restaurant', path: '/restaurant', icon: UtensilsCrossed, keywords: ['food', 'menu', 'dining', 'pos', 'orders'] },
  { id: 'minimarket', label: 'Minimarket', path: '/minimarket', icon: Store, keywords: ['shop', 'store', 'products', 'sales'] },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Box, keywords: ['stock', 'supplies', 'items'] },
  { id: 'financials', label: 'Financials', path: '/financials', icon: DollarSign, keywords: ['money', 'finance', 'reports', 'revenue', 'expenses'] },
  { id: 'crm', label: 'CRM & Marketing', path: '/crm', icon: Megaphone, keywords: ['marketing', 'customer', 'campaign'] },
  { id: 'calendar', label: 'Calendar', path: '/calendar', icon: CalendarRange, keywords: ['schedule', 'events', 'dates'] },
  { id: 'concierge', label: 'Concierge', path: '/concierge', icon: UserCheck, keywords: ['service', 'request', 'help'] },
  { id: 'guests', label: 'Guests', path: '/guests', icon: Users, keywords: ['customer', 'visitor', 'people'] },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, keywords: ['config', 'preferences', 'profile', 'hotel'] },
];

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Format pathname for breadcrumb title
  const title = location.pathname.split('/')[1] || 'Dashboard';
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  // Get user display info
  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const userInitial = userName[0]?.toUpperCase() || 'U';
  const userRole = role ? ROLE_LABELS[role] : 'Staff';

  // Filter search items based on query
  const filteredItems = searchQuery.trim() 
    ? SEARCH_ITEMS.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : SEARCH_ITEMS;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleNavigate(filteredItems[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsSearchOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleNavigate = (item: SearchItem) => {
    navigate(item.path);
    setSearchQuery('');
    setIsSearchOpen(false);
    toast.success(`Navigated to ${item.label}`);
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New reservation', message: 'Room 101 booked for Jan 10-15', time: '5 min ago', read: false },
    { id: 2, title: 'Housekeeping complete', message: 'Room 205 is now clean', time: '1 hour ago', read: false },
    { id: 3, title: 'Low inventory alert', message: 'Towels running low', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Logged out successfully');
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-card border-b border-border">
      {/* Left Side - Menu + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-foreground">{formattedTitle}</h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-2 md:space-x-6">
        {/* Search with Dropdown */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-64 pl-4 pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          
          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No results found
                </div>
              ) : (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pages
                  </div>
                  {filteredItems.map((item, index) => {
                    const Icon = item.icon;
                    const isSelected = index === selectedIndex;
                    const isCurrent = location.pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                        } ${isCurrent ? 'text-primary' : 'text-foreground'}`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{item.label}</span>
                        {isCurrent && (
                          <span className="ml-auto text-xs text-muted-foreground">Current</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
                <span>Navigate</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] ml-2">↵</kbd>
                <span>Select</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] ml-2">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          )}
        </div>

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
              <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-semibold text-sm border border-border">
                {userInitial}
              </div>
              <div className="ml-3 hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
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
