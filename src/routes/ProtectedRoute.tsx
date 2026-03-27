import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("user" | "admin" | "superadmin")[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    const loginPath = location.pathname.startsWith("/admin") ? "/admin-login" : "/auth";
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.userType as any)) {
    // Admin/SuperAdmin trying to access user routes → send to admin panel
    if (user.userType === "admin" || user.userType === "superadmin") {
      return <Navigate to="/admin" replace />;
    }
    // User trying to access admin routes → send to admin login
    if (user.userType === "user") {
      return <Navigate to="/admin-login" replace />;
    }
  }

  return <>{children}</>;
};
