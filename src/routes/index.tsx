import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AuthPage from '../pages/AuthPage';
import VehicleListingPage from '../pages/VehicleListingPage';
//import VehicleDetailsPage from '../pages/VehicleDetailsPage';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import BookNow from '../pages/BookNow';
import Contact from '../pages/Contact';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/vehicles',
    element: <VehicleListingPage />,
  },
  {
    path: '/book/:id',
    element: <BookNow />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600">Page not found</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Go back home
          </a>
        </div>
      </div>
    ),
  },
]);

export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};