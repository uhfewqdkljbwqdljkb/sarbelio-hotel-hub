import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoomBoard } from '@/components/housekeeping/RoomBoard';
import { TaskList } from '@/components/housekeeping/TaskList';
import { LaundryTracker } from '@/components/housekeeping/LaundryTracker';
import { useRooms, useUpdateRoom } from '@/hooks/useRooms';
import { useHousekeepingTasks, useLaundryItems, useCreateHousekeepingTask, useUpdateHousekeepingTask } from '@/hooks/useHousekeeping';
import { HousekeepingTask, LaundryItem, RoomCleaningStatus, HousekeepingStaff } from '@/types/housekeeping';
import { BedDouble, ClipboardList, Shirt, Users, Loader2 } from 'lucide-react';

// Mock staff for now - will be moved to database later
const MOCK_STAFF: HousekeepingStaff[] = [
  { id: 'staff1', name: 'Maria Garcia', status: 'AVAILABLE', currentTasks: 0, completedToday: 3 },
  { id: 'staff2', name: 'Ana Rodriguez', status: 'AVAILABLE', currentTasks: 0, completedToday: 2 },
  { id: 'staff3', name: 'Carlos Martinez', status: 'AVAILABLE', currentTasks: 0, completedToday: 1 },
];

export default function HousekeepingPage() {
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: tasks = [], isLoading: tasksLoading } = useHousekeepingTasks();
  const { data: laundry = [], isLoading: laundryLoading } = useLaundryItems();
  const updateRoom = useUpdateRoom();
  const createTask = useCreateHousekeepingTask();
  const updateTask = useUpdateHousekeepingTask();
  
  const [staff] = useState<HousekeepingStaff[]>(MOCK_STAFF);

  const isLoading = roomsLoading || tasksLoading || laundryLoading;

  // Convert rooms to RoomCleaningStatus format
  const roomCleaningStatus: RoomCleaningStatus[] = rooms.map(room => ({
    roomId: room.id,
    roomNumber: room.roomNumber,
    floor: room.floor,
    cleaningStatus: room.cleaningStatus,
    roomStatus: room.status,
    priority: 'MEDIUM' as const,
    lastCleaned: undefined,
    assignedTo: undefined,
  }));

  // Stats
  const dirtyRooms = roomCleaningStatus.filter(r => r.cleaningStatus === 'DIRTY').length;
  const inProgressRooms = roomCleaningStatus.filter(r => r.cleaningStatus === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
  const lowStockItems = laundry.filter(l => l.inStock < l.minStock).length;
  const availableStaff = staff.filter(s => s.status === 'AVAILABLE').length;

  const handleAssignStaff = async (roomId: string, staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    const room = roomCleaningStatus.find(r => r.roomId === roomId);
    if (!room) return;

    try {
      await updateRoom.mutateAsync({
        id: roomId,
        cleaningStatus: 'IN_PROGRESS',
      });

      await createTask.mutateAsync({
        roomId: room.roomId,
        roomNumber: room.roomNumber,
        taskType: 'CHECKOUT_CLEAN',
        priority: room.priority,
        status: 'IN_PROGRESS',
        assignedTo: staffMember.name,
      });
    } catch (error) {
      console.error('Failed to assign staff:', error);
    }
  };

  const handleUpdateRoomStatus = async (roomId: string, status: RoomCleaningStatus['cleaningStatus']) => {
    try {
      await updateRoom.mutateAsync({
        id: roomId,
        cleaningStatus: status,
      });
    } catch (error) {
      console.error('Failed to update room status:', error);
    }
  };

  const handleAddTask = async (taskData: Omit<HousekeepingTask, 'id' | 'createdAt'>) => {
    try {
      await createTask.mutateAsync(taskData);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<HousekeepingTask>) => {
    try {
      await updateTask.mutateAsync({ id: taskId, ...updates });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleUpdateLaundry = (itemId: string, updates: Partial<LaundryItem>) => {
    // Will implement with real database later
    console.log('Update laundry:', itemId, updates);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <BedDouble className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dirty Rooms</p>
              <p className="text-2xl font-bold">{dirtyRooms}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <BedDouble className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{inProgressRooms}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <ClipboardList className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
              <p className="text-2xl font-bold">{pendingTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Shirt className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Staff</p>
              <p className="text-2xl font-bold">{availableStaff}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-xl border">
        <Tabs defaultValue="rooms" className="w-full">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-14">
              <TabsTrigger value="rooms" className="data-[state=active]:bg-primary-100 data-[state=active]:text-primary-900">
                <BedDouble className="h-4 w-4 mr-2" />
                Room Board
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-primary-100 data-[state=active]:text-primary-900">
                <ClipboardList className="h-4 w-4 mr-2" />
                Task List
              </TabsTrigger>
              <TabsTrigger value="laundry" className="data-[state=active]:bg-primary-100 data-[state=active]:text-primary-900">
                <Shirt className="h-4 w-4 mr-2" />
                Laundry
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <TabsContent value="rooms" className="mt-0">
              {roomCleaningStatus.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BedDouble className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No rooms found</p>
                  <p className="text-sm">Add rooms first to manage housekeeping</p>
                </div>
              ) : (
                <RoomBoard 
                  rooms={roomCleaningStatus} 
                  staff={staff}
                  onAssignStaff={handleAssignStaff}
                  onUpdateStatus={handleUpdateRoomStatus}
                />
              )}
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-0">
              <TaskList 
                tasks={tasks}
                staff={staff}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
              />
            </TabsContent>
            
            <TabsContent value="laundry" className="mt-0">
              <LaundryTracker 
                items={laundry}
                onUpdateItem={handleUpdateLaundry}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
