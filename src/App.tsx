import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Hospitals from './pages/Hospitals';
import DonorHome from './pages/DonorHome';
import Matches from './pages/Matches';
import Referrals from './pages/Referrals';
import ViewMatch from './pages/admin/ViewMatch';

// New Role-Specific Pages
import CompleteDonorProfile from './pages/donor/CompleteDonorProfile';
import CompleteRecipientProfile from './pages/recipient/CompleteRecipientProfile';
import RecipientHome from './pages/recipient/RecipientHome';
import HospitalHome from './pages/hospital/HospitalHome';
import AdminHome from './pages/admin/AdminHome';
import HospitalSchedule from './pages/hospital/HospitalSchedule';

// ProfileCheck routes users to complete their profile if needed
const ProfileCheck = ({ children }: { children: React.ReactNode }) => {
  const { user, hasCompletedProfile } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (!hasCompletedProfile) {
    switch (user.role) {
      case 'donor':
        return <Navigate to="/donor/complete-profile" replace />;
      case 'recipient':
        return <Navigate to="/recipient/complete-profile" replace />;
      default:
        break;
    }
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/hospitals" element={<Hospitals />} />
          
          {/* Update the hospital schedule route */}
          <Route 
            path="/hospital/:hospitalId/schedule" 
            element={
              <ProtectedRoute roles={['donor']}>
                <HospitalSchedule />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Donor Routes */}
          <Route 
            path="/donor" 
            element={
              <ProtectedRoute roles={['donor']}>
                <ProfileCheck>
                  <DonorHome />
                </ProfileCheck>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/complete-profile" 
            element={
              <ProtectedRoute roles={['donor']}>
                <CompleteDonorProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Recipient Routes */}
          <Route 
            path="/recipient" 
            element={
              <ProtectedRoute roles={['recipient']}>
                <ProfileCheck>
                  <RecipientHome />
                </ProfileCheck>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipient/complete-profile" 
            element={
              <ProtectedRoute roles={['recipient']}>
                <CompleteRecipientProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Hospital Routes */}
          <Route 
            path="/hospital" 
            element={
              <ProtectedRoute roles={['hospital']}>
                <HospitalHome />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminHome />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin-only match management routes */}
          <Route 
            path="/matches" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Matches />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/matches/:matchId" 
            element={
              <ProtectedRoute roles={['admin']}>
                <ViewMatch />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared Routes */}
          <Route 
            path="/referrals" 
            element={
              <ProtectedRoute roles={['donor', 'recipient', 'admin']}>
                <Referrals />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
