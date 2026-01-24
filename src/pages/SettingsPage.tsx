import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HOTEL_PROFILE, INTEGRATIONS } from '@/data/settingsMock';
import { ROLE_LABELS, ROLE_COLORS } from '@/data/constants';
import { HotelProfile, Integration } from '@/types/settings';
import { AppRole } from '@/contexts/AuthContext';
import { useUsers, useUpdateUserRole, useDeleteUser } from '@/hooks/useUsers';
import AddUserDialog from '@/components/settings/AddUserDialog';
import ChangePasswordDialog from '@/components/settings/ChangePasswordDialog';
import { Building, Plug, Users, Star, Clock, Globe, Mail, Phone, MapPin, Save, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const integrationStatusColors = {
  CONNECTED: 'bg-green-100 text-green-700',
  DISCONNECTED: 'bg-gray-100 text-gray-700',
  ERROR: 'bg-red-100 text-red-700',
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<HotelProfile>(HOTEL_PROFILE);
  const [integrations] = useState<Integration[]>(INTEGRATIONS);
  
  const { data: users, isLoading: usersLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const handleProfileChange = (field: keyof HotelProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (userId: string, newRole: AppRole) => {
    updateRole.mutate({ userId, role: newRole });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border">
        <Tabs defaultValue="profile">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-14">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary-100"><Building className="h-4 w-4 mr-2" />Hotel Profile</TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-primary-100"><Plug className="h-4 w-4 mr-2" />Integrations</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary-100"><Users className="h-4 w-4 mr-2" />Users & Roles</TabsTrigger>
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Staff Members</h2>
                  <p className="text-sm text-muted-foreground">Manage user accounts and role assignments</p>
                </div>
                <AddUserDialog />
              </div>

              {/* Role Legend */}
              <div className="flex flex-wrap gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground mr-2">Roles:</span>
                {(Object.keys(ROLE_LABELS) as AppRole[]).map((role) => (
                  <div key={role} className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role]}`}>
                      {ROLE_LABELS[role]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {role === 'admin' && '(Full Access)'}
                      {role === 'fnb' && '(Restaurant, Minimarket)'}
                      {role === 'housekeeping' && '(Housekeeping)'}
                      {role === 'reception' && '(Rooms, Reservations, Guests, Concierge)'}
                    </span>
                  </div>
                ))}
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users?.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold text-sm">
                              {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                            <span className="font-medium">{user.full_name || 'No name'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <Select
                            value={user.role || undefined}
                            onValueChange={(value) => handleRoleChange(user.user_id, value as AppRole)}
                          >
                            <SelectTrigger className="w-[140px] mx-auto">
                              <SelectValue placeholder="Assign role">
                                {user.role && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                                    {ROLE_LABELS[user.role]}
                                  </span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(ROLE_LABELS) as AppRole[]).map((role) => (
                                <SelectItem key={role} value={role}>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role]}`}>
                                    {ROLE_LABELS[role]}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ChangePasswordDialog 
                              userId={user.user_id} 
                              userName={user.full_name || user.email} 
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {user.full_name || user.email}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser.mutate(user.user_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!users || users.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          No users found. Add your first staff member to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
