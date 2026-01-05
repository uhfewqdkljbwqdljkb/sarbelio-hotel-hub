import { MarketingCampaign, GuestReview, GuestInteraction, LoyaltyStats } from '@/types/crm';

export const MARKETING_CAMPAIGNS: MarketingCampaign[] = [
  { id: 'mc1', name: 'Winter Escape Package', type: 'EMAIL', status: 'ACTIVE', targetAudience: 'Past Guests', startDate: '2024-01-01', endDate: '2024-02-28', budget: 5000, spent: 2100, reach: 15000, conversions: 245, description: '20% off winter stays with spa package' },
  { id: 'mc2', name: 'Valentine\'s Special', type: 'PROMO', status: 'SCHEDULED', targetAudience: 'Couples', startDate: '2024-02-01', endDate: '2024-02-14', budget: 3000, description: 'Romantic dinner and suite upgrade promotion' },
  { id: 'mc3', name: 'Business Traveler Rewards', type: 'EMAIL', status: 'COMPLETED', targetAudience: 'Corporate Clients', startDate: '2023-11-01', endDate: '2023-12-31', budget: 4000, spent: 3800, reach: 8500, conversions: 156, description: 'Double points for business bookings' },
  { id: 'mc4', name: 'Instagram Giveaway', type: 'SOCIAL', status: 'ACTIVE', targetAudience: 'Social Followers', startDate: '2024-01-10', endDate: '2024-01-31', budget: 1500, spent: 800, reach: 45000, conversions: 89, description: 'Win a free weekend stay' },
  { id: 'mc5', name: 'Flash Sale Alert', type: 'SMS', status: 'DRAFT', targetAudience: 'Newsletter Subscribers', startDate: '2024-01-20', budget: 800, description: '48-hour flash sale notification' },
];

export const GUEST_REVIEWS: GuestReview[] = [
  { id: 'gr1', guestName: 'Sarah Mitchell', guestEmail: 'sarah.m@email.com', rating: 5, title: 'Exceptional Stay!', content: 'The staff went above and beyond. The room was immaculate and the breakfast was delicious. Will definitely return!', source: 'Google', createdAt: '2024-01-14', status: 'RESPONDED', response: 'Thank you so much, Sarah! We\'re thrilled you enjoyed your stay!', respondedAt: '2024-01-15' },
  { id: 'gr2', guestName: 'Michael Chen', guestEmail: 'mchen@email.com', rating: 4, title: 'Great location, minor issues', content: 'Perfect location and friendly staff. The AC in our room was a bit noisy but overall a good experience.', source: 'TripAdvisor', createdAt: '2024-01-13', status: 'PENDING' },
  { id: 'gr3', guestName: 'Emma Wilson', guestEmail: 'emma.w@email.com', rating: 5, title: 'Perfect for our anniversary', content: 'Booked the suite for our anniversary and it was magical. The champagne and flowers were a lovely touch.', source: 'Booking.com', createdAt: '2024-01-12', status: 'RESPONDED', response: 'Happy Anniversary, Emma! Thank you for celebrating with us!', respondedAt: '2024-01-12' },
  { id: 'gr4', guestName: 'James Brown', guestEmail: 'jbrown@email.com', rating: 2, title: 'Disappointed with service', content: 'Room service took over an hour. Front desk was unhelpful with our requests. Expected better for the price.', source: 'Expedia', createdAt: '2024-01-11', status: 'FLAGGED' },
  { id: 'gr5', guestName: 'Lisa Anderson', guestEmail: 'lisa.a@email.com', rating: 5, title: 'Best hotel in the city!', content: 'This is my third stay and it never disappoints. The restaurant is top-notch and the spa is heavenly.', source: 'Direct', createdAt: '2024-01-10', status: 'PENDING' },
];

export const GUEST_INTERACTIONS: GuestInteraction[] = [
  { id: 'gi1', guestId: 'g1', guestName: 'Sarah Mitchell', type: 'CALL', subject: 'Booking Modification', notes: 'Requested to extend stay by 2 nights. Approved and confirmed.', createdAt: '2024-01-14T10:30:00Z', createdBy: 'Maria Santos' },
  { id: 'gi2', guestId: 'g2', guestName: 'Michael Chen', type: 'EMAIL', subject: 'Special Dietary Requirements', notes: 'Guest is vegan. Updated restaurant and room service notes.', createdAt: '2024-01-13T14:15:00Z', createdBy: 'John Smith' },
  { id: 'gi3', guestId: 'g3', guestName: 'Emma Wilson', type: 'IN_PERSON', subject: 'Anniversary Arrangements', notes: 'Coordinated champagne delivery and room decoration for anniversary.', createdAt: '2024-01-12T09:00:00Z', createdBy: 'Anna Garcia' },
  { id: 'gi4', guestId: 'g4', guestName: 'James Brown', type: 'FEEDBACK', subject: 'Complaint Resolution', notes: 'Apologized for service delays. Offered complimentary dinner as gesture.', createdAt: '2024-01-11T16:45:00Z', createdBy: 'David Lee', followUpDate: '2024-01-18' },
  { id: 'gi5', guestId: 'g5', guestName: 'Lisa Anderson', type: 'CHAT', subject: 'Loyalty Points Inquiry', notes: 'Explained platinum benefits and upcoming promotions.', createdAt: '2024-01-10T11:20:00Z', createdBy: 'Maria Santos' },
];

export const LOYALTY_STATS: LoyaltyStats[] = [
  { tier: 'Platinum', count: 45, totalSpent: 125000, avgSpent: 2778 },
  { tier: 'Gold', count: 156, totalSpent: 285000, avgSpent: 1827 },
  { tier: 'Silver', count: 423, totalSpent: 412000, avgSpent: 974 },
  { tier: 'Standard', count: 1250, totalSpent: 520000, avgSpent: 416 },
];
