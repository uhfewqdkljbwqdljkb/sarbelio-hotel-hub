import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import RoomsPage from "@/pages/RoomsPage";
import ReservationsPage from "@/pages/ReservationsPage";
import RestaurantPage from "@/pages/RestaurantPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Admin Routes - Wrapped in Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/reservations" element={<ReservationsPage />} />
                <Route path="/housekeeping" element={<PlaceholderPage title="Housekeeping" />} />
                <Route path="/restaurant" element={<RestaurantPage />} />
                <Route path="/inventory" element={<PlaceholderPage title="Inventory" />} />
                <Route path="/financials" element={<PlaceholderPage title="Financials" />} />
                <Route path="/crm" element={<PlaceholderPage title="CRM & Marketing" />} />
                <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
                <Route path="/concierge" element={<PlaceholderPage title="Concierge" />} />
                <Route path="/guests" element={<PlaceholderPage title="Guests" />} />
                <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Placeholder component for modules not yet implemented
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="p-4 bg-primary-100 rounded-full mb-4">
      <svg className="w-12 h-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground max-w-md">
      This module is coming soon. Stay tuned for updates!
    </p>
  </div>
);

export default App;
