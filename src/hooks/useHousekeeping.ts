import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HousekeepingTask, LaundryItem } from '@/types/housekeeping';

interface DbHousekeepingTask {
  id: string;
  room_id: string | null;
  room_number: string;
  task_type: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  scheduled_for: string | null;
  completed_at: string | null;
  created_at: string;
}

interface DbLaundryItem {
  id: string;
  room_number: string;
  guest_name: string | null;
  item_type: string;
  quantity: number;
  status: string;
  priority: string;
  notes: string | null;
  received_at: string;
  completed_at: string | null;
}

export function useHousekeepingTasks() {
  return useQuery({
    queryKey: ['housekeeping_tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as DbHousekeepingTask[]).map((t): HousekeepingTask => ({
        id: t.id,
        roomId: t.room_id || '',
        roomNumber: t.room_number,
        taskType: t.task_type as HousekeepingTask['taskType'],
        priority: (t.priority === 'NORMAL' ? 'MEDIUM' : t.priority) as HousekeepingTask['priority'],
        status: t.status as HousekeepingTask['status'],
        assignedTo: t.assigned_to || undefined,
        notes: t.notes || undefined,
        completedAt: t.completed_at || undefined,
        createdAt: t.created_at,
        estimatedMinutes: 45,
      }));
    },
  });
}

export function useLaundryItems() {
  return useQuery({
    queryKey: ['laundry_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laundry_items')
        .select('*')
        .order('received_at', { ascending: false });
      
      if (error) throw error;
      return (data as DbLaundryItem[]).map((l): LaundryItem => ({
        id: l.id,
        name: l.item_type,
        category: 'LINENS',
        inStock: l.quantity,
        inLaundry: 0,
        minStock: 10,
        status: l.quantity < 10 ? 'LOW_STOCK' : 'IN_STOCK',
        lastUpdated: l.received_at,
      }));
    },
  });
}

export function useCreateHousekeepingTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: Partial<HousekeepingTask>) => {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .insert({
          room_id: task.roomId || null,
          room_number: task.roomNumber,
          task_type: task.taskType,
          priority: task.priority || 'MEDIUM',
          status: task.status || 'PENDING',
          assigned_to: task.assignedTo,
          notes: task.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping_tasks'] });
    },
  });
}

export function useUpdateHousekeepingTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HousekeepingTask> & { id: string }) => {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update({
          status: updates.status,
          assigned_to: updates.assignedTo,
          notes: updates.notes,
          completed_at: updates.completedAt,
        })
        .eq('id', id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping_tasks'] });
    },
  });
}
