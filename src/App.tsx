
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import About from "@/pages/About";
import Hospitals from "@/pages/Hospitals";
import Profile from "@/pages/Profile";
import Matches from "@/pages/Matches";
import Referrals from "@/pages/Referrals";
import DonorHome from "@/pages/DonorHome";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/hospitals" element={<Hospitals />} />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/donor" element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <DonorHome />
              </ProtectedRoute>
            } />
            
            <Route path="/matches" element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <Matches />
              </ProtectedRoute>
            } />
            
            <Route path="/referrals" element={
              <ProtectedRoute allowedRoles={['donor', 'recipient', 'hospital', 'admin']}>
                <Referrals />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
