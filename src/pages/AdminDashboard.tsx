import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Bike, Calendar, LogOut, TrendingUp,
  CheckCircle, XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { LoadingSpinner } from '../components/LoadingSpinner';

// RTK Query hooks (overview only)
import { useGetVehiclesQuery } from '../store/api/vehicleApi';
import { useGetUsersQuery } from '../store/api/userApi';
import { useGetBookingsQuery } from '../store/api/bookingApi';

// ── Reusable tab components ────────────────────────────────────────────────
import VehiclesTab from './..//components/admin/VehiclesTab';
import BookingsTab from './..//components/admin/BookingsTab';
import UsersTab from './..//components/admin/UsersTab';

type ActiveTab = 'overview' | 'vehicles' | 'bookings' | 'users';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const adminUser = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // ── Overview data ──────────────────────────────────────────────────────
  const { data: vehicles = [], isLoading: vehiclesLoading } = useGetVehiclesQuery(undefined);
  const { data: users = [] } = useGetUsersQuery({ page: 1, size: 100 });
  const { data: bookings = [], isLoading: bookingsLoading } = useGetBookingsQuery({ page: 1, size: 100 });

  // ── Derived Stats ──────────────────────────────────────────────────────
  const stats = {
    totalVehicles:     vehicles.length,
    availableVehicles: vehicles.filter((v) => v.isAvailable).length,
    totalUsers:        users.length,
    activeBookings:    bookings.filter((b) => b.status === 1).length,
    pendingBookings:   bookings.filter((b) => b.status === 0).length,
    monthlyRevenue:    bookings
      .filter((b) => b.status === 1 || b.status === 2)
      .reduce((sum, b) => sum + Number(b.totalAmount), 0),
  };

  const getStatusBadge = (status: number) => {
    const map: Record<number, { text: string; color: string }> = {
      0: { text: 'Pending',   color: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'Confirmed', color: 'bg-green-100 text-green-800' },
      2: { text: 'Completed', color: 'bg-primary-100 text-blue-800' },
      3: { text: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };
    const { text, color } = map[status] ?? { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.dispatchEvent(new Event('user-logout'));
    navigate('/admin-login', { replace: true });
  };

  // ── JSX ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white shadow-lg fixed h-full z-20">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            scootyonrent
          </h2>
          <p className="text-xs text-gray-500">Admin Panel</p>
          {adminUser && (
            <div className="mt-3 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">{adminUser.name}</p>
              <p className="text-xs text-primary-600 capitalize">{adminUser.userType}</p>
            </div>
          )}
        </div>

        <nav className="px-4 space-y-2">
          {([
            { id: 'overview',  icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'vehicles',  icon: Bike,            label: 'Vehicles'  },
            { id: 'bookings',  icon: Calendar,        label: 'Bookings'  },
            { id: 'users',     icon: Users,           label: 'Users'     },
          ] as { id: ActiveTab; icon: any; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
                activeTab === id ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />{label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5 mr-3" />Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ml-64 flex-1 p-8">

        {/* ════ OVERVIEW TAB ════ */}
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Vehicles',     value: stats.totalVehicles,   sub: `${stats.availableVehicles} available`, icon: Bike,       color: 'text-primary-600'   },
                { label: 'Active Bookings',     value: stats.activeBookings,  sub: `${stats.pendingBookings} pending`,    icon: Calendar,   color: 'text-green-600'  },
                { label: 'Total Users',         value: stats.totalUsers,      sub: 'registered',                          icon: Users,      color: 'text-purple-600' },
                { label: 'Revenue (Confirmed)', value: `₹${stats.monthlyRevenue.toLocaleString()}`, sub: 'total',         icon: TrendingUp, color: 'text-orange-600' },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600 text-sm">{label}</p>
                    <Icon className={`w-8 h-8 ${color}`} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-green-600 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
                {bookingsLoading ? <LoadingSpinner /> : (
                  <div className="space-y-3">
                    {[...bookings]
                      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
                      .slice(0, 5)
                      .map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Booking #{booking.id}</p>
                            <p className="text-sm text-gray-600">User #{booking.userId}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary-600">₹{booking.totalAmount}</p>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))}
                    {bookings.length === 0 && <p className="text-gray-500 text-sm">No bookings yet</p>}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Fleet Overview</h2>
                {vehiclesLoading ? <LoadingSpinner /> : (
                  <div className="space-y-3">
                    {vehicles.slice(0, 5).map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{v.name}</p>
                          <p className="text-sm text-gray-600">{v.make} · {v.vehicleType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary-600">₹{v.pricePerHour}/hr</span>
                          {v.isAvailable
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                    ))}
                    {vehicles.length === 0 && <p className="text-gray-500 text-sm">No vehicles added yet</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════ VEHICLES TAB ════ */}
        {activeTab === 'vehicles' && <VehiclesTab />}

        {/* ════ BOOKINGS TAB ════ */}
        {activeTab === 'bookings' && <BookingsTab />}

        {/* ════ USERS TAB ════ */}
        {activeTab === 'users' && <UsersTab />}

      </main>
    </div>
  );
};

export default AdminDashboard;