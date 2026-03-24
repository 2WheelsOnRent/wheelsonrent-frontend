import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AuthPage from '../pages/AuthPage';
import VehicleListingPage from '../pages/VehicleListingPage';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AdminLogin from '../pages/AdminLogin';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/Login';
import Profile from '../pages/ProfilePage';
import BookNow from '../pages/BookNow';
import Contact from '../pages/Contact';
import TermsAndConditions from '../pages/TermsAndConditions';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentFailurePage from '../pages/PaymentFailurePage';
import UserLayout from '../components/UserLayout';
import React from 'react';

const router = createBrowserRouter([

  {
    element: <UserLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/auth', element: <AuthPage /> },
      { path: '/contact', element: <Contact /> },
      { path: '/login', element: <Login /> },
      { path: '/vehicles', element: <VehicleListingPage /> },
      { path: '/terms', element: <TermsAndConditions /> },
      { path: '/privacy-policy', element: <PrivacyPolicy /> },
      { path: '/book/:id', element: <BookNow /> },
      { path: '/booking-success', element: <PaymentSuccessPage /> },
      { path: '/payment-failure', element: <PaymentFailurePage /> },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },

  { path: '/admin-login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

]);

export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};
