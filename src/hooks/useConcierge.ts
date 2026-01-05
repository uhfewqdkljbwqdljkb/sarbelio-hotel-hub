import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceRequest, ConciergeService, ServiceCategory, RequestStatus, RequestPriority } from '@/types/concierge';

interface DbServiceRequest {
  id: string;
  title: string;
  description: string | null;
  guest_name: string;
  room_number: string;
  category: string;
  priority: string;
  status: string;
  scheduled_for: string | null;
  completed_at: string | null;
  cost: number | null;
  assigned_to: string | null;
  notes: string | null;
  requested_at: string;
}

interface DbConciergeService {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  duration: number | null;
  is_available: boolean;
}

const mapDbToServiceRequest = (db: DbServiceRequest): ServiceRequest => ({
  id: db.id,
  title: db.title,
  description: db.description || '',
  guestName: db.guest_name,
  roomNumber: db.room_number,
  category: db.category as ServiceCategory,
  priority: db.priority as RequestPriority,
  status: db.status as RequestStatus,
  scheduledFor: db.scheduled_for || undefined,
  completedAt: db.completed_at || undefined,
  cost: db.cost || undefined,
  assignedTo: db.assigned_to || undefined,
  notes: db.notes || undefined,
  requestedAt: db.requested_at,
});

const mapDbToConciergeService = (db: DbConciergeService): ConciergeService => ({
  id: db.id,
  name: db.name,
  description: db.description || '',
  category: db.category as ServiceCategory,
  price: db.price,
  duration: db.duration || undefined,
  isAvailable: db.is_available,
});

export function useServiceRequests() {
  return useQuery({
    queryKey: ['service_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      return (data as DbServiceRequest[]).map(mapDbToServiceRequest);
    },
  });
}

export function useConciergeServices() {
  return useQuery({
    queryKey: ['concierge_services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concierge_services')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data as DbConciergeService[]).map(mapDbToConciergeService);
    },
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: Partial<ServiceRequest>) => {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          title: request.title,
          description: request.description,
          guest_name: request.guestName,
          room_number: request.roomNumber,
          category: request.category || 'OTHER',
          priority: request.priority || 'NORMAL',
          status: request.status || 'PENDING',
          scheduled_for: request.scheduledFor,
          cost: request.cost,
          assigned_to: request.assignedTo,
          notes: request.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToServiceRequest(data as DbServiceRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_requests'] });
    },
  });
}

export function useUpdateServiceRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('service_requests')
        .update({
          title: updates.title,
          description: updates.description,
          guest_name: updates.guestName,
          room_number: updates.roomNumber,
          category: updates.category,
          priority: updates.priority,
          status: updates.status,
          scheduled_for: updates.scheduledFor,
          completed_at: updates.completedAt,
          cost: updates.cost,
          assigned_to: updates.assignedTo,
          notes: updates.notes,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToServiceRequest(data as DbServiceRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_requests'] });
    },
  });
}

export function useCreateConciergeService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (service: Partial<ConciergeService>) => {
      const { data, error } = await supabase
        .from('concierge_services')
        .insert({
          name: service.name,
          description: service.description,
          category: service.category || 'OTHER',
          price: service.price || 0,
          duration: service.duration,
          is_available: service.isAvailable ?? true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToConciergeService(data as DbConciergeService);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concierge_services'] });
    },
  });
}
