import { 
  LayoutDashboard, 
  CalendarDays, 
  BedDouble, 
  SprayCan, 
  Box, 
  CalendarRange, 
  DollarSign, 
  Megaphone, 
  UserCheck,
  UtensilsCrossed,
  Users,
  Settings
} from 'lucide-react';
import { NavItem } from '@/types';

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'reservation', label: 'Reservations', path: '/reservations', icon: CalendarDays },
  { id: 'rooms', label: 'Rooms', path: '/rooms', icon: BedDouble },
  { id: 'housekeeping', label: 'Housekeeping', path: '/housekeeping', icon: SprayCan },
  { id: 'restaurant', label: 'Restaurant', path: '/restaurant', icon: UtensilsCrossed },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Box },
  { id: 'financials', label: 'Financials', path: '/financials', icon: DollarSign },
  { id: 'crm', label: 'CRM & Marketing', path: '/crm', icon: Megaphone },
  { id: 'calendar', label: 'Calendar', path: '/calendar', icon: CalendarRange },
  { id: 'concierge', label: 'Concierge', path: '/concierge', icon: UserCheck },
  { id: 'guests', label: 'Guests', path: '/guests', icon: Users },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

export const MOCK_USER = {
  id: 'u1',
  name: 'Jaylon Dorwart',
  role: 'Admin',
  avatarUrl: 'https://i.pravatar.cc/150?u=jaylon'
};
