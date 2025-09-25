import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// User Pages
import Index from "./pages/Index";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/user/Profile";
import Network from "./pages/user/Network";
import TeamReport from "./pages/user/TeamReport";
import IncomeReport from "./pages/user/IncomeReport";
import EWallet from "./pages/wallets/EWallet";
import RegistrationWallet from "./pages/wallets/RegistrationWallet";
import IncentiveWallet from "./pages/wallets/IncentiveWallet";
import PayoutManagement from "./pages/user/PayoutManagement";
import Notifications from "./pages/user/Notifications";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/network" element={
              <ProtectedRoute>
                <AppLayout><Network /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/team-report" element={
              <ProtectedRoute>
                <AppLayout><TeamReport /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/income-report" element={
              <ProtectedRoute>
                <AppLayout><IncomeReport /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/e-wallet" element={
              <ProtectedRoute>
                <AppLayout><EWallet /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/registration-wallet" element={
              <ProtectedRoute>
                <AppLayout><RegistrationWallet /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/incentive-wallet" element={
              <ProtectedRoute>
                <AppLayout><IncentiveWallet /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/payout-management" element={
              <ProtectedRoute>
                <AppLayout><PayoutManagement /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <AppLayout><Notifications /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
