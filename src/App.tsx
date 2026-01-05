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
import HousekeepingPage from "@/pages/HousekeepingPage";
import InventoryPage from "@/pages/InventoryPage";
import MinimarketPage from "@/pages/MinimarketPage";
import FinancialsPage from "@/pages/FinancialsPage";
import CRMPage from "@/pages/CRMPage";
import CalendarPage from "@/pages/CalendarPage";
import ConciergePage from "@/pages/ConciergePage";
import GuestsPage from "@/pages/GuestsPage";
import SettingsPage from "@/pages/SettingsPage";
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
                <Route path="/housekeeping" element={<HousekeepingPage />} />
                <Route path="/restaurant" element={<RestaurantPage />} />
                <Route path="/minimarket" element={<MinimarketPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/financials" element={<FinancialsPage />} />
                <Route path="/crm" element={<CRMPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/concierge" element={<ConciergePage />} />
                <Route path="/guests" element={<GuestsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
