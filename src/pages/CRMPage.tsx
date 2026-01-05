import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MARKETING_CAMPAIGNS, GUEST_REVIEWS, GUEST_INTERACTIONS, LOYALTY_STATS } from '@/data/crmMock';
import { Megaphone, Star, MessageSquare, Users, Mail, Phone, User, Calendar, Send } from 'lucide-react';

const campaignStatusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
};

const reviewStatusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  RESPONDED: 'bg-green-100 text-green-700',
  FLAGGED: 'bg-red-100 text-red-700',
};

export default function CRMPage() {
  const [campaigns] = useState(MARKETING_CAMPAIGNS);
  const [reviews, setReviews] = useState(GUEST_REVIEWS);
  const [interactions] = useState(GUEST_INTERACTIONS);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const pendingReviews = reviews.filter(r => r.status === 'PENDING').length;

  const handleReply = (reviewId: string) => {
    if (!replyText[reviewId]) return;
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, response: replyText[reviewId], respondedAt: new Date().toISOString(), status: 'RESPONDED' as const } : r));
    setReplyText(prev => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><Megaphone className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active Campaigns</p>
              <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'ACTIVE').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100"><Star className="h-5 w-5 text-yellow-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
              <p className="text-2xl font-bold">{avgRating}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><MessageSquare className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
              <p className="text-2xl font-bold">{pendingReviews}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><Users className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Loyalty</p>
              <p className="text-2xl font-bold">{LOYALTY_STATS.reduce((s, l) => s + l.count, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Tiers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {LOYALTY_STATS.map(stat => (
          <div key={stat.tier} className="bg-card rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{stat.tier}</span>
              <Badge variant="outline">{stat.count} guests</Badge>
            </div>
            <p className="text-2xl font-bold">€{stat.totalSpent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Avg: €{stat.avgSpent}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-xl border">
        <Tabs defaultValue="campaigns">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-14">
              <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary-100"><Megaphone className="h-4 w-4 mr-2" />Campaigns</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-primary-100"><Star className="h-4 w-4 mr-2" />Reviews</TabsTrigger>
              <TabsTrigger value="interactions" className="data-[state=active]:bg-primary-100"><MessageSquare className="h-4 w-4 mr-2" />Interactions</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="campaigns" className="mt-0">
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaignStatusColors[campaign.status]}`}>{campaign.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                      <span><Badge variant="outline">{campaign.type}</Badge></span>
                      <span>Target: {campaign.targetAudience}</span>
                      <span>{campaign.startDate} - {campaign.endDate || 'Ongoing'}</span>
                      {campaign.reach && <span>Reach: {campaign.reach.toLocaleString()}</span>}
                      {campaign.conversions && <span className="text-green-600">Conversions: {campaign.conversions}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{review.guestName}</h3>
                        <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}</div>
                        <Badge variant="outline">{review.source}</Badge>
                      </div>
                      <p className="font-medium mt-1">{review.title}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${reviewStatusColors[review.status]}`}>{review.status}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{review.content}</p>
                  {review.response && (
                    <div className="mt-3 pl-4 border-l-2 border-primary-200">
                      <p className="text-sm font-medium">Our Response:</p>
                      <p className="text-sm text-muted-foreground">{review.response}</p>
                    </div>
                  )}
                  {review.status === 'PENDING' && (
                    <div className="mt-3 flex gap-2">
                      <Textarea placeholder="Write a response..." value={replyText[review.id] || ''} onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))} className="flex-1" rows={2} />
                      <Button onClick={() => handleReply(review.id)} className="bg-primary-200 text-primary-900 hover:bg-primary-300"><Send className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="interactions" className="mt-0">
              <div className="space-y-3">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="flex items-start gap-4 border rounded-lg p-4">
                    <div className={`p-2 rounded-lg ${interaction.type === 'CALL' ? 'bg-blue-100' : interaction.type === 'EMAIL' ? 'bg-green-100' : 'bg-purple-100'}`}>
                      {interaction.type === 'CALL' ? <Phone className="h-4 w-4 text-blue-600" /> : interaction.type === 'EMAIL' ? <Mail className="h-4 w-4 text-green-600" /> : <User className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{interaction.guestName}</span>
                        <Badge variant="outline">{interaction.type}</Badge>
                      </div>
                      <p className="font-medium text-sm">{interaction.subject}</p>
                      <p className="text-sm text-muted-foreground">{interaction.notes}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(interaction.createdAt).toLocaleDateString()}</span>
                        <span>By: {interaction.createdBy}</span>
                        {interaction.followUpDate && <span className="text-orange-600">Follow-up: {interaction.followUpDate}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
