import { type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import AdminLayout from '../components/AdminLayout';

// Admin pages
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminForgotPassword from '../pages/AdminForgotPassword';
import AdminChangePassword from '../pages/AdminChangePassword';
import VehiclesPage from '../pages/admin/VehiclesPage';
import BookingsPage from '../pages/admin/BookingsPage';
import UsersPage from '../pages/admin/UsersPage';
import NotFoundPage from '../pages/NotFoundPage';
import OfflineBookingPage from '../pages/admin/OfflineBookingPage';
import SuperAdminPage from '../pages/admin/SuperAdminPage'; // ← ADD THIS
import PromoCodesPage from '../pages/admin/PromoCodesPage';

export const adminRoutes: RouteObject[] = [
  // Auth pages — no layout
  { path: '', element: <AdminLogin /> },
  { path: 'login', element: <AdminLogin /> },
  { path: 'forgot-password', element: <AdminForgotPassword /> },
  {
    path: 'change-password',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminChangePassword />
      </ProtectedRoute>
    ),
  },

  // Protected pages with AdminLayout sidebar
  {
    element: (
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'vehicles', element: <VehiclesPage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'offline-booking', element: <OfflineBookingPage /> },
      { path: 'promo-codes', element: <PromoCodesPage /> },
      {
        path: 'superadmin',
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminPage />  {/* ← WAS AdminDashboard, NOW SuperAdminPage */}
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Catch-all
  { path: '*', element: <NotFoundPage /> },
];