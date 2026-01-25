import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, Percent, Edit2, UserPlus } from 'lucide-react';
import { useCommissionProfiles, useUpdateCommissionProfile } from '@/hooks/useSales';
import { useUsers } from '@/hooks/useUsers';
import { toast } from 'sonner';

export function CommissionSettings() {
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [newRate, setNewRate] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserRate, setSelectedUserRate] = useState('5');

  const { data: profiles, isLoading } = useCommissionProfiles();
  const { data: users } = useUsers();
  const updateProfile = useUpdateCommissionProfile();

  // Users who don't have a commission profile yet
  const usersWithoutProfile = users?.filter(
    (u) => !profiles?.some((p) => p.userId === u.user_id) && 
           (u.role === 'reception' || u.role === 'admin')
  );

  const handleUpdateRate = async (profileId: string) => {
    if (!newRate) return;
    
    await updateProfile.mutateAsync({
      profileId,
      baseCommissionRate: parseFloat(newRate),
    });
    
    setEditingProfile(null);
    setNewRate('');
  };

  const handleAddProfile = async () => {
    if (!selectedUserId || !selectedUserRate) {
      toast.error('Please select a user and enter a commission rate');
      return;
    }

    const user = users?.find((u) => u.user_id === selectedUserId);
    
    await updateProfile.mutateAsync({
      userId: selectedUserId,
      userName: user?.full_name || user?.email,
      userEmail: user?.email,
      baseCommissionRate: parseFloat(selectedUserRate),
      isNew: true,
    });

    setIsAddDialogOpen(false);
    setSelectedUserId('');
    setSelectedUserRate('5');
  };

  const handleToggleActive = async (profileId: string, currentState: boolean) => {
    await updateProfile.mutateAsync({
      profileId,
      isActive: !currentState,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Commission Settings
          </CardTitle>
          <CardDescription>
            Configure commission rates for each staff member
          </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Commission Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select a staff member...</option>
                  {usersWithoutProfile?.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name || u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={selectedUserRate}
                    onChange={(e) => setSelectedUserRate(e.target.value)}
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProfile} disabled={updateProfile.isPending}>
                  Add Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : profiles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No commission profiles configured
                  </TableCell>
                </TableRow>
              ) : (
                profiles?.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {profile.userName?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {profile.userName}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {profile.userEmail}
                    </TableCell>
                    <TableCell>
                      {editingProfile === profile.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.5"
                            className="w-20"
                            value={newRate}
                            onChange={(e) => setNewRate(e.target.value)}
                            autoFocus
                          />
                          <span>%</span>
                          <Button size="sm" onClick={() => handleUpdateRate(profile.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingProfile(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          {profile.baseCommissionRate}%
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={profile.isActive}
                          onCheckedChange={() => handleToggleActive(profile.id, profile.isActive)}
                        />
                        <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingProfile(profile.id);
                          setNewRate(profile.baseCommissionRate.toString());
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
