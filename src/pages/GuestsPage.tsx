import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGuests } from '@/hooks/useGuests';
import { Guest } from '@/types';
import AddGuestDialog from '@/components/guests/AddGuestDialog';
import { Users, Search, Crown, Star, Mail, Phone, Calendar, DollarSign, Loader2, Plus } from 'lucide-react';

const tierColors = {
  STANDARD: 'bg-gray-100 text-gray-700',
  SILVER: 'bg-gray-200 text-gray-800',
  GOLD: 'bg-yellow-100 text-yellow-700',
  PLATINUM: 'bg-purple-100 text-purple-700',
};

const tierIcons = {
  STANDARD: null,
  SILVER: Star,
  GOLD: Star,
  PLATINUM: Crown,
};

export default function GuestsPage() {
  const { data: guests = [], isLoading, error } = useGuests();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const totalGuests = guests.length;
  const platinumGuests = guests.filter(g => g.loyaltyTier === 'PLATINUM').length;
  const totalRevenue = guests.reduce((sum, g) => sum + g.totalSpent, 0);
  const avgStays = guests.length > 0 ? (guests.reduce((sum, g) => sum + g.totalStays, 0) / guests.length).toFixed(1) : '0';

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || guest.loyaltyTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading guests: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Users className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Guests</p>
              <p className="text-2xl font-bold">{totalGuests}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><Crown className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Platinum Members</p>
              <p className="text-2xl font-bold">{platinumGuests}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><DollarSign className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100"><Calendar className="h-5 w-5 text-yellow-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Stays</p>
              <p className="text-2xl font-bold">{avgStays}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex flex-wrap gap-3 mb-6 justify-between">
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search guests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-[300px]" />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Loyalty Tier" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="PLATINUM">Platinum</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No guests found</p>
            <p className="text-sm">Add your first guest to get started</p>
            <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuests.map((guest) => {
              const TierIcon = tierIcons[guest.loyaltyTier];
              return (
                <div key={guest.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{guest.firstName} {guest.lastName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${tierColors[guest.loyaltyTier]}`}>
                          {TierIcon && <TierIcon className="h-3 w-3" />}
                          {guest.loyaltyTier}
                        </span>
                        <span className="text-xs text-muted-foreground">{guest.loyaltyPoints.toLocaleString()} pts</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{guest.email}</span>
                    </div>
                    {guest.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{guest.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Spent</span>
                      <p className="font-semibold text-green-600">€{guest.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">Stays</span>
                      <p className="font-semibold">{guest.totalStays}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddGuestDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
