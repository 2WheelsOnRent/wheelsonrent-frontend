// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin' | 'superadmin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Not logged in → send to appropriate login page
  if (!isAuthenticated || !user) {
    const loginPath = location.pathname.startsWith('/admin') ? '/admin-login' : '/auth';
    return <Navigate to={loginPath} replace />;
  }

  // Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    // ✅ FIX: Redirect to the CORRECT dashboard — NOT back to the same page
    if (user.userType === 'user') {
      return <Navigate to="/dashboard" replace />;
    }
    // admin/superadmin trying to access a user-only route
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
