import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoomBoard } from '@/components/housekeeping/RoomBoard';
import { TaskList } from '@/components/housekeeping/TaskList';
import { LaundryTracker } from '@/components/housekeeping/LaundryTracker';
import { 
  HOUSEKEEPING_STAFF, 
  HOUSEKEEPING_TASKS, 
  LAUNDRY_INVENTORY, 
  ROOM_CLEANING_STATUS 
} from '@/data/housekeepingMock';
import { HousekeepingTask, LaundryItem, RoomCleaningStatus, HousekeepingStaff } from '@/types/housekeeping';
import { BedDouble, ClipboardList, Shirt, Users } from 'lucide-react';

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<RoomCleaningStatus[]>(ROOM_CLEANING_STATUS);
  const [tasks, setTasks] = useState<HousekeepingTask[]>(HOUSEKEEPING_TASKS);
  const [laundry, setLaundry] = useState<LaundryItem[]>(LAUNDRY_INVENTORY);
  const [staff, setStaff] = useState<HousekeepingStaff[]>(HOUSEKEEPING_STAFF);

  // Stats
  const dirtyRooms = rooms.filter(r => r.cleaningStatus === 'DIRTY').length;
  const inProgressRooms = rooms.filter(r => r.cleaningStatus === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
  const lowStockItems = laundry.filter(l => l.inStock < l.minStock).length;
  const availableStaff = staff.filter(s => s.status === 'AVAILABLE').length;

  const handleAssignStaff = (roomId: string, staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    setRooms(prev => prev.map(room => 
      room.roomId === roomId 
        ? { ...room, cleaningStatus: 'IN_PROGRESS' as const, assignedTo: staffMember.name }
        : room
    ));

    setStaff(prev => prev.map(s =>
      s.id === staffId
        ? { ...s, currentTasks: s.currentTasks + 1, status: 'BUSY' as const }
        : s
    ));

    // Create a task for this assignment
    const room = rooms.find(r => r.roomId === roomId);
    if (room) {
      const newTask: HousekeepingTask = {
        id: `ht_${Date.now()}`,
        roomNumber: room.roomNumber,
        roomId: room.roomId,
        taskType: 'CHECKOUT_CLEAN',
        priority: room.priority,
        status: 'IN_PROGRESS',
        assignedTo: staffMember.name,
        assignedToId: staffId,
        createdAt: new Date().toISOString(),
        estimatedMinutes: 45,
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const handleUpdateRoomStatus = (roomId: string, status: RoomCleaningStatus['cleaningStatus']) => {
    setRooms(prev => prev.map(room => {
      if (room.roomId !== roomId) return room;
      
      const updates: Partial<RoomCleaningStatus> = { cleaningStatus: status };
      
      if (status === 'CLEAN' || status === 'INSPECTED') {
        updates.lastCleaned = new Date().toISOString();
        updates.assignedTo = undefined;
        
        // Update staff member
        if (room.assignedTo) {
          setStaff(prev => prev.map(s =>
            s.name === room.assignedTo
              ? { ...s, currentTasks: Math.max(0, s.currentTasks - 1), completedToday: s.completedToday + 1 }
              : s
          ));
        }
      }
      
      return { ...room, ...updates };
    }));
  };

  const handleAddTask = (taskData: Omit<HousekeepingTask, 'id' | 'createdAt'>) => {
    const newTask: HousekeepingTask = {
      ...taskData,
      id: `ht_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);

    // Update staff if assigned
    if (taskData.assignedToId) {
      setStaff(prev => prev.map(s =>
        s.id === taskData.assignedToId
          ? { ...s, currentTasks: s.currentTasks + 1, status: 'BUSY' as const }
          : s
      ));
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<HousekeepingTask>) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      
      const updatedTask = { ...task, ...updates };
      
      // Update room status if task completed
      if (updates.status === 'COMPLETED' && task.status !== 'COMPLETED') {
        setRooms(prev => prev.map(room =>
          room.roomId === task.roomId
            ? { ...room, cleaningStatus: 'CLEAN' as const, lastCleaned: new Date().toISOString() }
            : room
        ));
      }
      
      // Update staff stats
      if (updates.status === 'COMPLETED' && task.assignedToId) {
        setStaff(prev => prev.map(s =>
          s.id === task.assignedToId
            ? { ...s, currentTasks: Math.max(0, s.currentTasks - 1), completedToday: s.completedToday + 1 }
            : s
        ));
      }
      
      return updatedTask;
    }));
  };

  const handleUpdateLaundry = (itemId: string, updates: Partial<LaundryItem>) => {
    setLaundry(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

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
              <RoomBoard 
                rooms={rooms} 
                staff={staff}
                onAssignStaff={handleAssignStaff}
                onUpdateStatus={handleUpdateRoomStatus}
              />
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
