import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppRole } from '@/contexts/AuthContext';

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  role: AppRole | null;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async (): Promise<UserWithRole[]> => {
      // Use RPC function to get all users with roles (bypasses RLS issues)
      const { data, error } = await supabase.rpc('get_all_users_with_roles');

      if (error) throw error;

      return (data || []).map((user: {
        id: string;
        user_id: string;
        full_name: string | null;
        email: string;
        avatar_url: string | null;
        created_at: string;
        role: AppRole | null;
      }) => ({
        id: user.id,
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        role: user.role,
      }));
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      fullName,
      role,
    }: {
      email: string;
      password: string;
      fullName: string;
      role: AppRole;
    }) => {
      // Use edge function to create user and assign role
      // This preserves the admin's session and uses service role for creation
      const { data, error } = await supabase.functions.invoke('create-staff-user', {
        body: { email, password, fullName, role },
      });

      if (error) throw new Error(error.message || 'Failed to create user');
      if (data?.error) throw new Error(data.error);
      if (!data?.success) throw new Error('User creation failed');

      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Check if role exists
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete role first (cascade should handle this, but being explicit)
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('User removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
