import { useState } from 'react';
import { HousekeepingTask, HousekeepingStaff, TaskType, TaskPriority, TaskStatus } from '@/types/housekeeping';
import { Clock, User, Plus, AlertTriangle, CheckCircle, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TaskListProps {
  tasks: HousekeepingTask[];
  staff: HousekeepingStaff[];
  onAddTask: (task: Omit<HousekeepingTask, 'id' | 'createdAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<HousekeepingTask>) => void;
}

const taskTypeLabels: Record<TaskType, string> = {
  CHECKOUT_CLEAN: 'Checkout Clean',
  STAY_OVER: 'Stay Over',
  DEEP_CLEAN: 'Deep Clean',
  TURNDOWN: 'Turndown',
  INSPECTION: 'Inspection',
};

const priorityConfig: Record<TaskPriority, { color: string; label: string }> = {
  LOW: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
  HIGH: { color: 'bg-orange-100 text-orange-700', label: 'High' },
  URGENT: { color: 'bg-red-100 text-red-700', label: 'Urgent' },
};

const statusConfig: Record<TaskStatus, { color: string; icon: typeof Clock }> = {
  PENDING: { color: 'text-gray-500', icon: Pause },
  IN_PROGRESS: { color: 'text-blue-500', icon: Play },
  COMPLETED: { color: 'text-green-500', icon: CheckCircle },
  VERIFIED: { color: 'text-purple-500', icon: CheckCircle },
};

export function TaskList({ tasks, staff, onAddTask, onUpdateTask }: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newTask, setNewTask] = useState({
    roomNumber: '',
    roomId: '',
    taskType: 'CHECKOUT_CLEAN' as TaskType,
    priority: 'MEDIUM' as TaskPriority,
    assignedToId: '',
    notes: '',
    estimatedMinutes: 30,
  });

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const statusOrder = { PENDING: 0, IN_PROGRESS: 1, COMPLETED: 2, VERIFIED: 3 };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const handleAddTask = () => {
    const assignedStaff = staff.find(s => s.id === newTask.assignedToId);
    onAddTask({
      ...newTask,
      roomId: `r_${newTask.roomNumber}`,
      status: 'PENDING',
      assignedTo: assignedStaff?.name,
    });
    setNewTask({
      roomNumber: '',
      roomId: '',
      taskType: 'CHECKOUT_CLEAN',
      priority: 'MEDIUM',
      assignedToId: '',
      notes: '',
      estimatedMinutes: 30,
    });
    setIsDialogOpen(false);
  };

  const availableStaff = staff.filter(s => s.status !== 'OFF_DUTY');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-200 text-primary-900 hover:bg-primary-300">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Cleaning Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input
                    value={newTask.roomNumber}
                    onChange={(e) => setNewTask({ ...newTask, roomNumber: e.target.value })}
                    placeholder="101"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Est. Minutes</Label>
                  <Input
                    type="number"
                    value={newTask.estimatedMinutes}
                    onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select
                    value={newTask.taskType}
                    onValueChange={(v: TaskType) => setNewTask({ ...newTask, taskType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(taskTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v: TaskPriority) => setNewTask({ ...newTask, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={newTask.assignedToId}
                  onValueChange={(v) => setNewTask({ ...newTask, assignedToId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  placeholder="Special instructions..."
                />
              </div>
              <Button onClick={handleAddTask} className="w-full bg-primary-200 text-primary-900 hover:bg-primary-300">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {sortedTasks.map((task) => {
          const StatusIcon = statusConfig[task.status].icon;
          
          return (
            <div
              key={task.id}
              className="bg-card rounded-lg border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
            >
              <div className={`p-2 rounded-full ${priorityConfig[task.priority].color}`}>
                {task.priority === 'URGENT' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <StatusIcon className={`h-5 w-5 ${statusConfig[task.status].color}`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Room {task.roomNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${priorityConfig[task.priority].color}`}>
                    {priorityConfig[task.priority].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {taskTypeLabels[task.taskType]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {task.assignedTo && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.assignedTo}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimatedMinutes} min
                  </span>
                </div>
                {task.notes && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{task.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {task.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateTask(task.id, { status: 'IN_PROGRESS' })}
                  >
                    Start
                  </Button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateTask(task.id, { status: 'COMPLETED', completedAt: new Date().toISOString() })}
                  >
                    Complete
                  </Button>
                )}
                {task.status === 'COMPLETED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateTask(task.id, { status: 'VERIFIED' })}
                  >
                    Verify
                  </Button>
                )}
                {task.status === 'VERIFIED' && (
                  <span className="text-xs text-green-600 font-medium">✓ Verified</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sortedTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No tasks match your filters
        </div>
      )}
    </div>
  );
}
