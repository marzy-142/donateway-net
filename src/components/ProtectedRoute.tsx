
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles = [] 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloodlink-red border-t-transparent"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no roles are specified, allow access to any authenticated user
  if (roles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has the required role
  if (user && roles.includes(user.role)) {
    return <>{children}</>;
  }

  // Redirect based on user's role if they don't have access
  if (user) {
    switch (user.role) {
      case 'donor':
        return <Navigate to="/donor" replace />;
      case 'recipient':
        return <Navigate to="/recipient" replace />;
      case 'hospital':
        return <Navigate to="/hospital" replace />;
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Fallback to home page
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
