import { useState } from 'react';
import { RoomCleaningStatus, HousekeepingStaff } from '@/types/housekeeping';
import { BedDouble, User, Clock, AlertTriangle, CheckCircle, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RoomBoardProps {
  rooms: RoomCleaningStatus[];
  staff: HousekeepingStaff[];
  onAssignStaff: (roomId: string, staffId: string) => void;
  onUpdateStatus: (roomId: string, status: RoomCleaningStatus['cleaningStatus']) => void;
}

const cleaningStatusConfig = {
  CLEAN: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Clean' },
  DIRTY: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: 'Dirty' },
  IN_PROGRESS: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, label: 'In Progress' },
  INSPECTED: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Sparkles, label: 'Inspected' },
};

const priorityConfig = {
  LOW: 'border-l-gray-300',
  MEDIUM: 'border-l-yellow-400',
  HIGH: 'border-l-orange-500',
  URGENT: 'border-l-red-500',
};

export function RoomBoard({ rooms, staff, onAssignStaff, onUpdateStatus }: RoomBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const floors = [...new Set(rooms.map(r => r.floor))].sort();
  
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.includes(searchTerm);
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter;
    const matchesStatus = statusFilter === 'all' || room.cleaningStatus === statusFilter;
    return matchesSearch && matchesFloor && matchesStatus;
  });

  const availableStaff = staff.filter(s => s.status === 'AVAILABLE' || s.status === 'BUSY');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={floorFilter} onValueChange={setFloorFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {floors.map(floor => (
              <SelectItem key={floor} value={floor.toString()}>Floor {floor}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DIRTY">Dirty</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="CLEAN">Clean</SelectItem>
            <SelectItem value="INSPECTED">Inspected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredRooms.map((room) => {
          const statusConf = cleaningStatusConfig[room.cleaningStatus];
          const StatusIcon = statusConf.icon;
          
          return (
            <div
              key={room.roomId}
              className={`bg-card rounded-lg border shadow-sm overflow-hidden border-l-4 ${priorityConfig[room.priority]}`}
            >
              <div className={`px-3 py-2 ${statusConf.color} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4" />
                  <span className="font-semibold">{room.roomNumber}</span>
                </div>
                <StatusIcon className="h-4 w-4" />
              </div>
              
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Floor {room.floor}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    room.roomStatus === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' :
                    room.roomStatus === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' :
                    room.roomStatus === 'OUT_OF_ORDER' ? 'bg-gray-100 text-gray-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {room.roomStatus.replace('_', ' ')}
                  </span>
                </div>

                {room.assignedTo && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">{room.assignedTo}</span>
                  </div>
                )}

                {room.cleaningStatus === 'DIRTY' && (
                  <Select onValueChange={(staffId) => onAssignStaff(room.roomId, staffId)}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Assign..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStaff.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.currentTasks} tasks)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {room.cleaningStatus === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => onUpdateStatus(room.roomId, 'CLEAN')}
                  >
                    Mark Clean
                  </Button>
                )}

                {room.cleaningStatus === 'CLEAN' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => onUpdateStatus(room.roomId, 'INSPECTED')}
                  >
                    Inspect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No rooms match your filters
        </div>
      )}
    </div>
  );
}
