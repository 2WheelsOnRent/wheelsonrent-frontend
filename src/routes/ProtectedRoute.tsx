import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin' | 'superadmin')[];
  requirePasswordChanged?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { hasChangedPassword } = useAppSelector((state) => state.adminAuth);
  const location = useLocation();

  // Not authenticated → redirect to appropriate login
  if (!isAuthenticated || !user) {
    const loginPath = location.pathname.startsWith('/admin') ? '/admin-login' : '/auth';
    return <Navigate to={loginPath} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.userType as any)) {
    if (user.userType === 'admin' || user.userType === 'superadmin') {
      return <Navigate to="/admin" replace />;
    }
    if (user.userType === 'user') {
      return <Navigate to="/admin-login" replace />;
    }
  }

  // Admin/SuperAdmin first-login password change guard
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isChangePasswordPage = location.pathname === '/admin-change-password';
  const isAdminUser = user.userType === 'admin' || user.userType === 'superadmin';

  if (
    isAdminUser &&
    isAdminRoute &&
    !isChangePasswordPage &&
    !hasChangedPassword
  ) {
    return <Navigate to="/admin-change-password" replace />;
  }

  return <>{children}</>;
};