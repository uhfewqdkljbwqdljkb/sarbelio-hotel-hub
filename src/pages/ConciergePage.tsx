import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SERVICE_REQUESTS, CONCIERGE_SERVICES } from '@/data/conciergeMock';
import { ServiceRequest } from '@/types/concierge';
import { UserCheck, ClipboardList, Car, Sparkles, Utensils, Map, Wrench, Clock, DollarSign } from 'lucide-react';

const categoryIcons = {
  TRANSPORT: Car,
  SPA: Sparkles,
  TOUR: Map,
  RESTAURANT: Utensils,
  HOUSEKEEPING: ClipboardList,
  MAINTENANCE: Wrench,
  OTHER: UserCheck,
};

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

const priorityColors = {
  LOW: 'border-l-gray-300',
  NORMAL: 'border-l-blue-400',
  HIGH: 'border-l-orange-500',
  URGENT: 'border-l-red-500',
};

export default function ConciergePage() {
  const [requests, setRequests] = useState<ServiceRequest[]>(SERVICE_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
  const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS').length;
  const todayRevenue = requests.filter(r => r.status === 'COMPLETED' && r.cost).reduce((sum, r) => sum + (r.cost || 0), 0);

  const filteredRequests = requests.filter(r => statusFilter === 'all' || r.status === statusFilter);

  const handleStatusChange = (requestId: string, newStatus: ServiceRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus, ...(newStatus === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}) } : r));
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100"><Clock className="h-5 w-5 text-yellow-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><UserCheck className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{inProgressRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><ClipboardList className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold">{requests.filter(r => r.status === 'COMPLETED').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><DollarSign className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
              <p className="text-2xl font-bold">€{todayRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-xl border">
        <Tabs defaultValue="requests">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-14">
              <TabsTrigger value="requests" className="data-[state=active]:bg-primary-100"><ClipboardList className="h-4 w-4 mr-2" />Service Requests</TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-primary-100"><UserCheck className="h-4 w-4 mr-2" />Available Services</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="requests" className="mt-0 space-y-4">
              <div className="flex justify-between items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredRequests.map((request) => {
                  const Icon = categoryIcons[request.category];
                  return (
                    <div key={request.id} className={`border rounded-lg p-4 border-l-4 ${priorityColors[request.priority]} hover:shadow-sm transition-shadow`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted"><Icon className="h-5 w-5" /></div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{request.title}</span>
                              <Badge variant="outline">{request.category}</Badge>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>{request.status.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Guest: {request.guestName}</span>
                              <span>Room: {request.roomNumber}</span>
                              {request.scheduledFor && <span>Scheduled: {new Date(request.scheduledFor).toLocaleString()}</span>}
                              {request.cost && <span className="text-green-600 font-medium">€{request.cost}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {request.status === 'PENDING' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(request.id, 'CONFIRMED')}>Confirm</Button>
                          )}
                          {request.status === 'CONFIRMED' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(request.id, 'IN_PROGRESS')}>Start</Button>
                          )}
                          {request.status === 'IN_PROGRESS' && (
                            <Button size="sm" className="bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleStatusChange(request.id, 'COMPLETED')}>Complete</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="services" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CONCIERGE_SERVICES.map((service) => {
                  const Icon = categoryIcons[service.category];
                  return (
                    <div key={service.id} className={`border rounded-lg p-4 ${!service.isAvailable && 'opacity-50'}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary-100"><Icon className="h-5 w-5 text-primary-700" /></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{service.name}</span>
                            {!service.isAvailable && <Badge variant="secondary">Unavailable</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-medium text-green-600">€{service.price}</span>
                            {service.duration && <span className="text-muted-foreground">{service.duration} min</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
