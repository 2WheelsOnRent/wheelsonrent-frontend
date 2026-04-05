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
import ProfilePage from '../pages/admin/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import OfflineBookingPage from '../pages/admin/OfflineBookingPage';
export const adminRoutes: RouteObject[] = [
    // Auth pages (no layout - standalone)
    { path: '/', element: <AdminLogin /> },
    { path: '/login', element: <AdminLogin /> },
    { path: '/forgot-password', element: <AdminForgotPassword /> },

    // Change password (standalone - no sidebar, but protected)
    {
        path: '/change-password',
        element: (
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminChangePassword />
            </ProtectedRoute>
        ),
    },

    // Protected pages with AdminLayout (sidebar)
    {
        element: (
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { path: '/dashboard', element: <AdminDashboard /> },
            { path: '/vehicles', element: <VehiclesPage /> },
            { path: '/bookings', element: <BookingsPage /> },
            { path: '/users', element: <UsersPage /> },
            { path: '/profile', element: <ProfilePage /> },
            { path: '/offline-booking', element: <OfflineBookingPage /> },
            {
                path: '/superadmin',
                element: (
                    <ProtectedRoute allowedRoles={['superadmin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                ),
            },
        ],
    },

    // Catch-all 404
    { path: '*', element: <NotFoundPage /> },
];
