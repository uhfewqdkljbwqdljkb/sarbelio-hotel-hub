export type CampaignType = 'EMAIL' | 'SMS' | 'PROMO' | 'SOCIAL';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';

export interface MarketingCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetAudience: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  reach?: number;
  conversions?: number;
  description: string;
}

export interface GuestReview {
  id: string;
  guestName: string;
  guestEmail: string;
  rating: number;
  title: string;
  content: string;
  source: string;
  createdAt: string;
  response?: string;
  respondedAt?: string;
  status: 'PENDING' | 'RESPONDED' | 'FLAGGED';
}

export interface GuestInteraction {
  id: string;
  guestId: string;
  guestName: string;
  type: 'CALL' | 'EMAIL' | 'CHAT' | 'IN_PERSON' | 'FEEDBACK';
  subject: string;
  notes: string;
  createdAt: string;
  createdBy: string;
  followUpDate?: string;
}

export interface LoyaltyStats {
  tier: string;
  count: number;
  totalSpent: number;
  avgSpent: number;
}
