
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
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
          
          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor" 
            element={
              <ProtectedRoute roles={['donor', 'admin']}>
                <DonorHome />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/matches" 
            element={
              <ProtectedRoute roles={['donor', 'admin']}>
                <Matches />
              </ProtectedRoute>
            } 
          />
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
