import { AppRole } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BedDouble, 
  SprayCan, 
  Box, 
  CalendarRange, 
  DollarSign, 
  UserCheck,
  UtensilsCrossed,
  Users,
  Settings,
  Store,
  TrendingUp
} from 'lucide-react';
import { NavItem } from '@/types';

export interface NavItemWithRoles extends NavItem {
  allowedRoles?: AppRole[];
}

export const NAVIGATION_ITEMS: NavItemWithRoles[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, allowedRoles: ['admin'] },
  { id: 'reservation', label: 'Reservations', path: '/reservations', icon: CalendarDays, allowedRoles: ['admin', 'reception'] },
  { id: 'rooms', label: 'Rooms', path: '/rooms', icon: BedDouble, allowedRoles: ['admin', 'reception'] },
  { id: 'housekeeping', label: 'Housekeeping', path: '/housekeeping', icon: SprayCan, allowedRoles: ['admin', 'housekeeping'] },
  { id: 'restaurant', label: 'Restaurant', path: '/restaurant', icon: UtensilsCrossed, allowedRoles: ['admin', 'fnb'] },
  { id: 'minimarket', label: 'Minimarket', path: '/minimarket', icon: Store, allowedRoles: ['admin', 'fnb'] },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Box, allowedRoles: ['admin'] },
  { id: 'financials', label: 'Financials', path: '/financials', icon: DollarSign, allowedRoles: ['admin'] },
  { id: 'sales', label: 'Sales', path: '/sales', icon: TrendingUp, allowedRoles: ['admin'] },
  { id: 'calendar', label: 'Calendar', path: '/calendar', icon: CalendarRange, allowedRoles: ['admin', 'reception'] },
  { id: 'concierge', label: 'Concierge', path: '/concierge', icon: UserCheck, allowedRoles: ['admin', 'reception'] },
  { id: 'guests', label: 'Guests', path: '/guests', icon: Users, allowedRoles: ['admin', 'reception'] },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, allowedRoles: ['admin'] },
];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Admin',
  fnb: 'F&B',
  housekeeping: 'Housekeeping',
  reception: 'Reception',
};

export const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  fnb: 'bg-orange-100 text-orange-700',
  housekeeping: 'bg-green-100 text-green-700',
  reception: 'bg-blue-100 text-blue-700',
};

export const MOCK_USER = {
  id: 'u1',
  name: 'Jaylon Dorwart',
  role: 'Admin',
  avatarUrl: 'https://i.pravatar.cc/150?u=jaylon'
};
