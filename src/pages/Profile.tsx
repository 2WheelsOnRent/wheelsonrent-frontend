import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  User, 
  Calendar, 
  CreditCard, 
  Bell, 
  LogOut, 
  CheckCircle, 
  XCircle,
  Clock,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { vehicles } from '../Data/Vehicles';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

interface Booking {
  id: string;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  amount: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
  method: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'offer' | 'booking' | 'general';
  read: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-profile');
  const [isEditing, setIsEditing] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '9876543210',
    address: 'Udaipur, Rajasthan',
  });

  // Mock booking data
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK001',
      vehicleId: '1',
      pickupDate: '2025-11-05',
      returnDate: '2025-11-07',
      amount: 1000,
      status: 'active',
      paymentStatus: 'paid',
    },
    {
      id: 'BK002',
      vehicleId: '3',
      pickupDate: '2025-11-10',
      returnDate: '2025-11-12',
      amount: 2000,
      status: 'pending',
      paymentStatus: 'pending',
    },
    {
      id: 'BK003',
      vehicleId: '3',
      pickupDate: '2025-10-15',
      returnDate: '2025-10-18',
      amount: 3000,
      status: 'completed',
      paymentStatus: 'paid',
    },
    {
      id: 'BK004',
      vehicleId: '7',
      pickupDate: '2025-10-01',
      returnDate: '2025-10-02',
      amount: 600,
      status: 'cancelled',
      paymentStatus: 'refunded',
    },
  ]);

  const transactions: Transaction[] = [
    {
      id: 'TXN001',
      bookingId: 'BK001',
      amount: 1000,
      date: '2025-11-01',
      status: 'success',
      method: 'UPI',
    },
    {
      id: 'TXN002',
      bookingId: 'BK003',
      amount: 3000,
      date: '2025-10-14',
      status: 'success',
      method: 'Credit Card',
    },
    {
      id: 'TXN003',
      bookingId: 'BK004',
      amount: 600,
      date: '2025-10-01',
      status: 'failed',
      method: 'Debit Card',
    },
  ];

  const [notifications] = useState<Notification[]>([
    {
      id: 'NOT001',
      title: 'Booking Confirmed',
      message: 'Your booking BK001 has been confirmed for Nov 5, 2025',
      date: '2025-11-01',
      type: 'booking',
      read: false,
    },
    {
      id: 'NOT002',
      title: 'Special Offer!',
      message: 'Get 20% off on weekly rentals this month',
      date: '2025-10-28',
      type: 'offer',
      read: false,
    },
    {
      id: 'NOT003',
      title: 'Ride Completed',
      message: 'Thank you for choosing us! Your ride BK003 is completed',
      date: '2025-10-18',
      type: 'booking',
      read: true,
    },
  ]);

  const getVehicleById = (id: string) => vehicles.find((v) => v.id === id);

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as const, paymentStatus: 'refunded' as const } : b
    ));
    setBookingToCancel(null);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    
    // Dispatch custom event to notify Header component
    window.dispatchEvent(new Event('user-logout'));
    
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'isLoggedIn',
      newValue: null,
      oldValue: 'true',
    }));
    
    // Navigate to login page
    navigate('/login');
  };

  const renderBookingCard = (booking: Booking) => {
    const vehicle = getVehicleById(booking.vehicleId);
    if (!vehicle) return null;

    return (
      <div
        key={booking.id}
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex gap-4">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg text-black">{vehicle.name}</h3>
                <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xl text-blue-500">₹{booking.amount}</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : booking.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{booking.pickupDate}</span>
              </div>
              <span>to</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{booking.returnDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {booking.status === 'active' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Active Booking</span>
                  </>
                )}
                {booking.status === 'completed' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600">Completed</span>
                  </>
                )}
                {booking.status === 'cancelled' && (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Cancelled</span>
                  </>
                )}
                {booking.status === 'pending' && (
                  <>
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">Pending</span>
                  </>
                )}
              </div>

              {booking.status === 'active' && (
                <Button
                  onClick={() => setBookingToCancel(booking.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl text-black mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-8">
              <div className="bg-blue-500 text-white p-6 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-xl">{profile.name}</h2>
                <p className="text-blue-100 text-sm">{profile.phone}</p>
              </div>

              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('my-profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'my-profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  My Profile
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'bookings'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  Bookings
                </button>

                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'transactions'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  Transactions
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                <div className="border-t border-gray-200 my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            {/* My Profile Tab */}
            {activeTab === 'my-profile' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl text-black mb-6">Profile Information</h2>

                <div className="space-y-4 max-w-2xl">
                  <div>
                    <Label className="text-sm text-gray-600">Full Name</Label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Email</Label>
                    <Input
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Phone</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Address</Label>
                    <Input
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`${
                      isEditing
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-2xl text-black mb-4">Active Bookings</h2>
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === 'active').length > 0 ? (
                      bookings.filter(b => b.status === 'active').map(renderBookingCard)
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No active bookings</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-2xl text-black mb-4">Pending Bookings</h2>
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === 'pending').length > 0 ? (
                      bookings.filter(b => b.status === 'pending').map(renderBookingCard)
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No pending bookings</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-2xl text-black mb-4">Completed Bookings</h2>
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === 'completed').length > 0 ? (
                      bookings.filter(b => b.status === 'completed').map(renderBookingCard)
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No completed bookings</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-2xl text-black mb-4">Cancelled Bookings</h2>
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === 'cancelled').length > 0 ? (
                      bookings.filter(b => b.status === 'cancelled').map(renderBookingCard)
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No cancelled bookings</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl text-black mb-6">Transaction History</h2>
                <div className="space-y-4">
                  {transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            txn.status === 'success'
                              ? 'bg-green-100'
                              : txn.status === 'failed'
                              ? 'bg-red-100'
                              : 'bg-yellow-100'
                          }`}>
                            <CreditCard className={`w-6 h-6 ${
                              txn.status === 'success'
                                ? 'text-green-600'
                                : txn.status === 'failed'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-black">Booking {txn.bookingId}</p>
                            <p className="text-sm text-gray-600">{txn.method} • {txn.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl text-black">₹{txn.amount}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            txn.status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : txn.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl text-black mb-6">Notifications</h2>
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`border rounded-lg p-4 ${
                        notif.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'offer'
                            ? 'bg-green-100'
                            : notif.type === 'booking'
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                        }`}>
                          {notif.type === 'offer' ? (
                            <AlertCircle className="w-5 h-5 text-green-600" />
                          ) : notif.type === 'booking' ? (
                            <Calendar className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Bell className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-black">{notif.title}</h3>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                          <p className="text-xs text-gray-500">{notif.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Booking Dialog */}
      <AlertDialog open={!!bookingToCancel} onOpenChange={() => setBookingToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action may incur cancellation charges based on our cancellation policy. The cancellation fee will be deducted from your refund amount.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bookingToCancel && handleCancelBooking(bookingToCancel)}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}