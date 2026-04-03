import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import UserLayout from '../components/UserLayout'; // adjust path if needed

// User pages
import HomePage from '../pages/HomePage';
import AuthPage from '../pages/AuthPage';
import Login from '../pages/Login';
import Contact from '../pages/Contact';
import VehicleListingPage from '../pages/VehicleListingPage';
import TermsAndConditions from '../pages/TermsAndConditions';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import BookNow from '../pages/BookNow';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentFailurePage from '../pages/PaymentFailurePage';
import Profile from '../pages/ProfilePage';

// Admin pages
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminForgotPassword from '../pages/AdminForgotPassword';       // NEW
import AdminChangePassword from '../pages/AdminChangePassword';       // NEW
// import SuperAdminDashboard from '../pages/SuperAdminDashboard';   // create when ready

const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/auth', element: <AuthPage /> },
      { path: '/login', element: <Login /> },
      { path: '/contact', element: <Contact /> },
      { path: '/vehicles', element: <VehicleListingPage /> },
      { path: '/terms', element: <TermsAndConditions /> },
      { path: '/privacy-policy', element: <PrivacyPolicy /> },
      {
        path: '/book/:id',
        element: (
          <ProtectedRoute allowedRoles={['user']}>
            <BookNow />
          </ProtectedRoute>
        ),
      },
      { path: '/booking-success', element: <PaymentSuccessPage /> },
      { path: '/payment-failure', element: <PaymentFailurePage /> },
      {
        path: '/profile',
        element: (
          <ProtectedRoute allowedRoles={['user']}>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ── Admin Auth (public) ──────────────────────────────────────────────────
  { path: '/admin-login', element: <AdminLogin /> },
  { path: '/admin-forgot-password', element: <AdminForgotPassword /> },   // NEW

  // ── Admin Change Password (auth required, no password-change guard) ──────
  {
    path: '/admin-change-password',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminChangePassword />
      </ProtectedRoute>
    ),
  },

  // ── Admin Dashboard ──────────────────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  // ── SuperAdmin Dashboard (NEW route) ─────────────────────────────────────
  {
    path: '/superadmin-dashboard',
    element: (
      <ProtectedRoute allowedRoles={['superadmin']}>
        {/* Replace with <SuperAdminDashboard /> when built */}
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
]);

export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};