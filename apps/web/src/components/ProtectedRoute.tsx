import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && !localStorage.getItem('accessToken')) {
    // Redirect to home landing page
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
