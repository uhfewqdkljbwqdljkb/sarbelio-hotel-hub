import { ServiceRequest, ConciergeService } from '@/types/concierge';

export const SERVICE_REQUESTS: ServiceRequest[] = [
  { id: 'sr1', guestName: 'Alice Johnson', roomNumber: '401', category: 'TRANSPORT', title: 'Airport Transfer', description: 'Need pickup from airport tomorrow at 2 PM', status: 'CONFIRMED', priority: 'HIGH', requestedAt: '2024-01-15T08:00:00Z', scheduledFor: '2024-01-16T14:00:00Z', assignedTo: 'Carlos Driver', cost: 75.00 },
  { id: 'sr2', guestName: 'Bob Smith', roomNumber: '205', category: 'SPA', title: 'Couples Massage', description: 'Booking for 2 people, 90-minute deep tissue', status: 'PENDING', priority: 'NORMAL', requestedAt: '2024-01-15T09:30:00Z', scheduledFor: '2024-01-15T16:00:00Z', cost: 280.00 },
  { id: 'sr3', guestName: 'Carol Davis', roomNumber: '302', category: 'RESTAURANT', title: 'Dinner Reservation', description: 'Table for 4 at the rooftop restaurant, 7 PM', status: 'CONFIRMED', priority: 'NORMAL', requestedAt: '2024-01-15T10:00:00Z', scheduledFor: '2024-01-15T19:00:00Z' },
  { id: 'sr4', guestName: 'David Lee', roomNumber: '108', category: 'TOUR', title: 'City Tour', description: 'Full day city tour with guide, English speaking', status: 'IN_PROGRESS', priority: 'NORMAL', requestedAt: '2024-01-14T15:00:00Z', scheduledFor: '2024-01-15T09:00:00Z', assignedTo: 'Tour Guide Maria', cost: 150.00 },
  { id: 'sr5', guestName: 'Eva Martinez', roomNumber: '501', category: 'HOUSEKEEPING', title: 'Extra Pillows', description: 'Request 2 additional pillows', status: 'COMPLETED', priority: 'LOW', requestedAt: '2024-01-15T07:00:00Z', completedAt: '2024-01-15T07:30:00Z', assignedTo: 'Housekeeping Team' },
  { id: 'sr6', guestName: 'Frank Wilson', roomNumber: '203', category: 'MAINTENANCE', title: 'AC Not Cooling', description: 'Air conditioning not working properly', status: 'IN_PROGRESS', priority: 'URGENT', requestedAt: '2024-01-15T11:00:00Z', assignedTo: 'Maintenance - John' },
  { id: 'sr7', guestName: 'Grace Kim', roomNumber: '405', category: 'OTHER', title: 'Birthday Cake', description: 'Surprise birthday cake for spouse, chocolate preferred', status: 'PENDING', priority: 'HIGH', requestedAt: '2024-01-15T12:00:00Z', scheduledFor: '2024-01-16T20:00:00Z', cost: 85.00 },
];

export const CONCIERGE_SERVICES: ConciergeService[] = [
  { id: 'cs1', name: 'Airport Transfer', category: 'TRANSPORT', description: 'Private car service to/from airport', price: 75.00, duration: 60, isAvailable: true },
  { id: 'cs2', name: 'City Tour', category: 'TOUR', description: 'Full day guided tour of city highlights', price: 150.00, duration: 480, isAvailable: true },
  { id: 'cs3', name: 'Swedish Massage', category: 'SPA', description: 'Relaxing full body massage', price: 120.00, duration: 60, isAvailable: true },
  { id: 'cs4', name: 'Couples Massage', category: 'SPA', description: 'Side-by-side massage experience', price: 280.00, duration: 90, isAvailable: true },
  { id: 'cs5', name: 'Restaurant Reservation', category: 'RESTAURANT', description: 'Table booking at hotel restaurants', price: 0, isAvailable: true },
  { id: 'cs6', name: 'Wine Tasting Tour', category: 'TOUR', description: 'Half-day vineyard visit with tastings', price: 200.00, duration: 300, isAvailable: true },
  { id: 'cs7', name: 'Private Chef Dinner', category: 'RESTAURANT', description: 'In-room gourmet dining experience', price: 350.00, duration: 120, isAvailable: true },
  { id: 'cs8', name: 'Helicopter Tour', category: 'TOUR', description: 'Scenic aerial tour of the region', price: 450.00, duration: 45, isAvailable: false },
];
