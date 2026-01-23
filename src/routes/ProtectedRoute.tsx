import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin' | 'superadmin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // If not authenticated, redirect to auth page
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // If specific roles are required, check if user has permission
  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    // Redirect to appropriate dashboard based on user type
    if (user.userType === 'user') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};