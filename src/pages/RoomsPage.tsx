import React, { useState } from 'react';
import { useRooms, useUpdateRoom } from '@/hooks/useRooms';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import AddRoomDialog from '@/components/rooms/AddRoomDialog';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Users, 
  Maximize, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Wifi,
  Loader2,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { RoomStatus, CleaningStatus, Room } from '@/types';

const RoomsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const { data: rooms = [], isLoading, error } = useRooms();
  const updateRoom = useUpdateRoom();
  const queryClient = useQueryClient();
  
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          room.roomNumber.includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'OCCUPIED': return 'bg-red-100 text-red-800 border-red-200';
      case 'RESERVED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OUT_OF_ORDER': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCleaningIcon = (status: CleaningStatus) => {
    switch (status) {
      case 'CLEAN': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'DIRTY': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'INSPECTED': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted successfully');
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const handleToggleStatus = async (room: Room) => {
    const newStatus = room.status === 'AVAILABLE' ? 'OUT_OF_ORDER' : 'AVAILABLE';
    try {
      await updateRoom.mutateAsync({ id: room.id, status: newStatus });
      toast.success(`Room marked as ${newStatus.replace(/_/g, ' ').toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update room status');
    }
  };

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
        Error loading rooms: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Room Inventory</h2>
          <p className="text-muted-foreground">Manage unique rooms, pricing, and availability.</p>
        </div>
        <button 
          onClick={() => setAddDialogOpen(true)}
          className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 shadow-lg flex items-center transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Room
        </button>
      </div>

      <AddRoomDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {/* Filters Toolbar */}
      <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Search by Room Number or Name..." 
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_ORDER'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                filterStatus === status 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No rooms found</p>
          <p className="text-sm">Add your first room to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div 
              key={room.id} 
              className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col animate-fade-in"
            >
              {/* Image Area */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={room.imageUrl} 
                  alt={room.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold text-foreground shadow-sm">
                  Room {room.roomNumber}
                </div>
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 bg-foreground/20 backdrop-blur-md rounded-full hover:bg-card text-background hover:text-foreground transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleToggleStatus(room)}>
                        {room.status === 'AVAILABLE' ? (
                          <>
                            <ToggleLeft className="w-4 h-4 mr-2" />
                            Mark Unavailable
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-4 h-4 mr-2" />
                            Mark Available
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Room
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                  <h3 className="text-white font-bold text-lg leading-tight">{room.name}</h3>
                  <p className="text-white/80 text-xs mt-1 line-clamp-1">{room.description}</p>
                </div>
              </div>

              {/* Details Body */}
              <div className="p-5 flex-1 flex flex-col">
                {/* Status & Cleaning */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(room.status)}`}>
                    {room.status.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getCleaningIcon(room.cleaningStatus)}
                    <span className="ml-1.5">{room.cleaningStatus.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* Room Features */}
                <div className="grid grid-cols-3 gap-3 py-4 border-y border-border text-center">
                  <div className="flex flex-col items-center">
                    <Users className="w-4 h-4 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Sleeps {room.capacity}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Maximize className="w-4 h-4 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">{room.size} sqft</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Wifi className="w-4 h-4 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Free WiFi</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
                  {room.amenities.slice(0, 4).map((amenity) => (
                    <span 
                      key={amenity} 
                      className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-md"
                    >
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 4 && (
                    <span className="px-2 py-0.5 text-primary-600 text-xs font-medium">
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                  <div>
                    <span className="text-2xl font-bold text-foreground">${room.price}</span>
                    <span className="text-sm text-muted-foreground"> / night</span>
                  </div>
                  <button className="px-4 py-2 bg-primary-200 text-primary-900 rounded-lg text-sm font-medium hover:bg-primary-300 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
