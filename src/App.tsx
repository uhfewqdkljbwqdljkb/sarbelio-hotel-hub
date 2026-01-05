import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PublicHomePage from "@/pages/PublicHomePage";
import Dashboard from "@/pages/Dashboard";
import RoomsPage from "@/pages/RoomsPage";
import ReservationsPage from "@/pages/ReservationsPage";
import RestaurantPage from "@/pages/RestaurantPage";
import HousekeepingPage from "@/pages/HousekeepingPage";
import InventoryPage from "@/pages/InventoryPage";
import MinimarketPage from "@/pages/MinimarketPage";
import FinancialsPage from "@/pages/FinancialsPage";
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
          {/* Public Website - Main Landing Page */}
          <Route path="/" element={<PublicHomePage />} />
          
          {/* Admin/Staff Backend Routes - Wrapped in Layout */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/rooms" element={<Layout><RoomsPage /></Layout>} />
          <Route path="/reservations" element={<Layout><ReservationsPage /></Layout>} />
          <Route path="/housekeeping" element={<Layout><HousekeepingPage /></Layout>} />
          <Route path="/restaurant" element={<Layout><RestaurantPage /></Layout>} />
          <Route path="/minimarket" element={<Layout><MinimarketPage /></Layout>} />
          <Route path="/inventory" element={<Layout><InventoryPage /></Layout>} />
          <Route path="/financials" element={<Layout><FinancialsPage /></Layout>} />
          <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
          <Route path="/concierge" element={<Layout><ConciergePage /></Layout>} />
          <Route path="/guests" element={<Layout><GuestsPage /></Layout>} />
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
