import React from 'react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ChevronDown, Star } from 'lucide-react';
import { 
  REVIEW_DATA, 
  REVIEWS, 
  RATINGS_BREAKDOWN, 
  COUNTRY_STATS 
} from '@/data/mockData';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Row Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Review Statistics Chart */}
        <DashboardCard 
          className="lg:col-span-2" 
          title="Review Statistics" 
          action={
            <button className="flex items-center text-xs font-medium bg-primary-100 text-primary-800 px-3 py-1 rounded-full hover:bg-primary-200 transition-colors">
              Last 7 Days <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVIEW_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--secondary))' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'hsl(var(--card))'
                  }}
                />
                <Bar dataKey="positive" fill="hsl(var(--lime-200))" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="negative" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-primary-200 mr-2"></span>
              <span className="text-sm text-muted-foreground">Positive</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-secondary mr-2"></span>
              <span className="text-sm text-muted-foreground">Negative</span>
            </div>
          </div>
        </DashboardCard>

        {/* Overall Rating */}
        <DashboardCard 
          title="Overall Rating" 
          action={
            <button className="flex items-center text-xs font-medium bg-secondary text-muted-foreground px-3 py-1 rounded-full hover:bg-secondary/80 transition-colors">
              This Week <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          }
        >
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              {/* SVG Circle for Rating */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" stroke="hsl(var(--secondary))" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="hsl(var(--lime-300))" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="351" 
                  strokeDashoffset="35" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">4.6</span>
                <span className="text-xs text-muted-foreground">/ 5</span>
              </div>
            </div>
            <div className="bg-primary-200 text-primary-900 px-4 py-1.5 rounded-full text-sm font-semibold">
              Impressive
            </div>
            <p className="text-xs text-muted-foreground mt-2">from 2546 reviews</p>
          </div>
          
          <div className="space-y-3">
            {RATINGS_BREAKDOWN.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <div className="flex items-center">
                  <div className="w-24 h-1.5 bg-secondary rounded-full mr-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        index % 2 === 0 ? 'bg-primary-500' : 'bg-primary-400'
                      }`}
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-foreground">{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <DashboardCard className="lg:col-span-2" title="Reviews by Country">
          <div className="h-64 bg-primary-50 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              {/* Abstract World Map Dots */}
              <svg className="w-full h-full text-primary-300" fill="currentColor" viewBox="0 0 100 50">
                <circle cx="20" cy="20" r="1" /> <circle cx="22" cy="18" r="1.5" />
                <circle cx="25" cy="22" r="1" /> <circle cx="50" cy="15" r="2" />
                <circle cx="55" cy="18" r="1" /> <circle cx="80" cy="20" r="1.5" />
                <circle cx="85" cy="25" r="1" /> <circle cx="82" cy="15" r="1" />
                <circle cx="30" cy="35" r="1.5" /> <circle cx="35" cy="38" r="1" />
                <circle cx="45" cy="30" r="1.2" /> <circle cx="60" cy="35" r="1" />
                <circle cx="70" cy="28" r="1.5" /> <circle cx="15" cy="30" r="1" />
              </svg>
            </div>
            <div className="text-center z-10">
              <p className="text-primary-800 font-medium">Global Guest Distribution</p>
              <p className="text-xs text-primary-600">Interactive map coming soon</p>
            </div>
          </div>
        </DashboardCard>

        {/* Customer Stats */}
        <DashboardCard>
          <div className="mb-6">
            <span className="text-sm text-muted-foreground block mb-1">Total Customers</span>
            <span className="text-3xl font-bold text-foreground">17,850</span>
          </div>
          
          <div className="space-y-4">
            {COUNTRY_STATS.map((c, index) => (
              <div key={c.country} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-sm mr-3 ${
                    index < 2 ? 'bg-primary-300' : 
                    index < 3 ? 'bg-primary-200' : 'bg-secondary'
                  }`}></span>
                  <span className="text-sm text-muted-foreground">{c.country}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{c.pct}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Customer Reviews List */}
      <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">Customer Reviews</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REVIEWS.map(review => (
          <DashboardCard key={review.id} className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <img 
                  src={review.avatar} 
                  alt={review.author} 
                  className="w-10 h-10 rounded-full mr-3 object-cover" 
                />
                <div>
                  <h4 className="text-sm font-bold text-foreground">{review.author}</h4>
                  <div className="flex items-center mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${
                          i < review.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-muted-foreground/30'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
              "{review.text}"
            </p>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
