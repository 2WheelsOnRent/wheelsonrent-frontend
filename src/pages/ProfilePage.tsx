import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, Calendar, Clock, MapPin,
  LogOut, Edit2, Save, X, Loader2, Bike,
  CheckCircle, XCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout, setCredentials } from '../store/slices/authSlice';
import { useGetBookingsByUserIdQuery } from '../store/api/bookingApi';
import { useUpdateUserMutation } from '../store/api/userApi';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BOOKING_STATUS_MAP: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  0: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  1: { label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  2: { label: 'Completed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  3: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="w-3.5 h-3.5" /> },
};

function StatusBadge({ status }: { status: number }) {
  const s = BOOKING_STATUS_MAP[status] ?? { label: 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.color}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string) {
  try {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeStr;
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useGetBookingsByUserIdQuery(user?.id ?? 0, { skip: !user?.id });

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (!user?.id) return;

    try {
      await updateUser({
        id: user.id,
        user: {
          id: user.id,
          userNumber: user.phone,
          name: editedName.trim(),
          email: user.email,
          districtId: user.districtId,
        },
      }).unwrap();

      dispatch(
        setCredentials({
          token: localStorage.getItem('authToken')!,
          user: { ...user, name: editedName.trim() },
        })
      );
      toast.success('Name updated successfully');
      setIsEditingName(false);
    } catch {
      toast.error('Failed to update name');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            {/* Avatar + Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name || 'User'}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 mt-1">
                  Active Member
                </span>
              </div>

              {/* Name field */}
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</span>
                    {!isEditingName && (
                      <button
                        onClick={() => { setIsEditingName(true); setEditedName(user.name || ''); }}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="flex-1 text-sm px-2 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={isUpdating}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{user.name || '—'}</p>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    <Phone className="inline w-3 h-3 mr-1" />Mobile
                  </span>
                  <p className="text-sm font-medium text-gray-900">+91 {user.phone}</p>
                </div>

                {user.email && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                      <Mail className="inline w-3 h-3 mr-1" />Email
                    </span>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Bookings</span>
                  <span className="font-bold text-gray-900">{bookings?.length ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Confirmed</span>
                  <span className="font-bold text-green-600">{bookings?.filter(b => b.status === 1).length ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Completed</span>
                  <span className="font-bold text-blue-600">{bookings?.filter(b => b.status === 2).length ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Booking History
                </h3>
                <button
                  onClick={refetchBookings}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                  title="Refresh bookings"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {isLoadingBookings && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <span className="ml-3 text-gray-500">Loading bookings...</span>
                </div>
              )}

              {isBookingsError && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                  <p className="text-gray-600 mb-4">Failed to load bookings</p>
                  <Button onClick={refetchBookings} variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                    <RefreshCw className="w-4 h-4 mr-2" />Try Again
                  </Button>
                </div>
              )}

              {!isLoadingBookings && !isBookingsError && (!bookings || bookings.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <Bike className="w-16 h-16 text-gray-300 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No bookings yet</h4>
                  <p className="text-sm text-gray-400 mb-6">Book your first ride and it will appear here.</p>
                  <Button
                    onClick={() => navigate('/vehicles')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Browse Vehicles
                  </Button>
                </div>
              )}

              {!isLoadingBookings && !isBookingsError && bookings && bookings.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        {/* Booking Icon + ID */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bike className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-semibold text-gray-400">
                                Booking #{booking.id}
                              </span>
                              <StatusBadge status={booking.status} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>
                                  {formatDate(booking.bookingStartDate?.toString())} →{' '}
                                  {formatDate(booking.bookingEndDate?.toString())}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>
                                  {formatTime(booking.startTime?.toString())} –{' '}
                                  {formatTime(booking.endTime?.toString())}
                                </span>
                              </div>
                              {booking.pickupLocationId && (
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                  <span>Pickup Location #{booking.pickupLocationId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Amount */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-gray-900">
                            ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
