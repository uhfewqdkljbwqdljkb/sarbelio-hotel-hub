import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HOTEL_PROFILE, INTEGRATIONS, SYSTEM_USERS } from '@/data/settingsMock';
import { HotelProfile, Integration, SystemUser } from '@/types/settings';
import { Building, Plug, Users, Star, Clock, Globe, Mail, Phone, MapPin, Save, RefreshCw } from 'lucide-react';

const integrationStatusColors = {
  CONNECTED: 'bg-green-100 text-green-700',
  DISCONNECTED: 'bg-gray-100 text-gray-700',
  ERROR: 'bg-red-100 text-red-700',
};

const roleColors = {
  ADMIN: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  STAFF: 'bg-green-100 text-green-700',
  VIEWER: 'bg-gray-100 text-gray-700',
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<HotelProfile>(HOTEL_PROFILE);
  const [integrations] = useState<Integration[]>(INTEGRATIONS);
  const [users] = useState<SystemUser[]>(SYSTEM_USERS);

  const handleProfileChange = (field: keyof HotelProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border">
        <Tabs defaultValue="profile">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-14">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary-100"><Building className="h-4 w-4 mr-2" />Hotel Profile</TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-primary-100"><Plug className="h-4 w-4 mr-2" />Integrations</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary-100"><Users className="h-4 w-4 mr-2" />Users</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="profile" className="mt-0 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary-100">
                    <Building className="h-6 w-6 text-primary-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{profile.name}</h2>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(profile.starRating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                  </div>
                </div>
                <Button className="bg-primary-200 text-primary-900 hover:bg-primary-300"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" />Location</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Hotel Name</Label>
                      <Input value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={profile.address} onChange={(e) => handleProfileChange('address', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>City</Label>
                        <Input value={profile.city} onChange={(e) => handleProfileChange('city', e.target.value)} />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input value={profile.country} onChange={(e) => handleProfileChange('country', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Mail className="h-4 w-4" />Contact</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Email</Label>
                      <Input value={profile.email} onChange={(e) => handleProfileChange('email', e.target.value)} />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={profile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input value={profile.website} onChange={(e) => handleProfileChange('website', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4" />Operations</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Check-in Time</Label>
                        <Input type="time" value={profile.checkInTime} onChange={(e) => handleProfileChange('checkInTime', e.target.value)} />
                      </div>
                      <div>
                        <Label>Check-out Time</Label>
                        <Input type="time" value={profile.checkOutTime} onChange={(e) => handleProfileChange('checkOutTime', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Total Rooms</Label>
                      <Input type="number" value={profile.totalRooms} onChange={(e) => handleProfileChange('totalRooms', parseInt(e.target.value))} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4" />Regional</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Timezone</Label>
                      <Input value={profile.timezone} onChange={(e) => handleProfileChange('timezone', e.target.value)} />
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Input value={profile.currency} onChange={(e) => handleProfileChange('currency', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <Badge variant="outline">{integration.type}</Badge>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${integrationStatusColors[integration.status]}`}>{integration.status}</span>
                    </div>
                    {integration.lastSync && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Last sync: {new Date(integration.lastSync).toLocaleString()}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {integration.status === 'CONNECTED' ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1"><RefreshCw className="h-3 w-3 mr-1" />Sync</Button>
                          <Button variant="outline" size="sm" className="text-red-600">Disconnect</Button>
                        </>
                      ) : (
                        <Button size="sm" className="w-full bg-primary-200 text-primary-900 hover:bg-primary-300">Connect</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <div className="flex justify-end mb-4">
                <Button className="bg-primary-200 text-primary-900 hover:bg-primary-300">Add User</Button>
              </div>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Department</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>{user.role}</span></td>
                      <td className="px-4 py-3">{user.department}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
