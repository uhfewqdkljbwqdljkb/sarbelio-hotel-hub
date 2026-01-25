import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingPage from "@/pages/BookingPage";
import AuthPage from "@/pages/AuthPage";
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
import SalesManagement from "@/pages/SalesManagement";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Booking Page */}
            <Route path="/" element={<BookingPage />} />
            
            {/* Auth Page */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Admin Routes - Protected & Wrapped in Layout */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/rooms" element={
                      <ProtectedRoute allowedRoles={['admin', 'reception']}>
                        <RoomsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/reservations" element={
                      <ProtectedRoute allowedRoles={['admin', 'reception']}>
                        <ReservationsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/housekeeping" element={
                      <ProtectedRoute allowedRoles={['admin', 'housekeeping']}>
                        <HousekeepingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/restaurant" element={
                      <ProtectedRoute allowedRoles={['admin', 'fnb']}>
                        <RestaurantPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/minimarket" element={
                      <ProtectedRoute allowedRoles={['admin', 'fnb']}>
                        <MinimarketPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/inventory" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <InventoryPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/financials" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <FinancialsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/calendar" element={
                      <ProtectedRoute allowedRoles={['admin', 'reception']}>
                        <CalendarPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/concierge" element={
                      <ProtectedRoute allowedRoles={['admin', 'reception']}>
                        <ConciergePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/guests" element={
                      <ProtectedRoute allowedRoles={['admin', 'reception']}>
                        <GuestsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <SettingsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/sales" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <SalesManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
