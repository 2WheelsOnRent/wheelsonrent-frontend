// Updated AdminDashboard.tsx
import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Bike, Calendar,  Bell, Settings, 
  LogOut, TrendingUp,  AlertCircle, Plus, Edit, Trash2, 
  Search, Filter, Eye, CheckCircle, XCircle, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'bookings' | 'users' | 'alerts'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [alertFilter, setAlertFilter] = useState('all');
  const [bookingSort, setBookingSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'id', direction: 'asc' });

  const navigate = useNavigate();

  // const admin = {
  //   name: 'Admin User',
  //   email: 'admin@2wheelsonrent.com',
  //   role: 'Admin',
  //   districtId: 1,
  //   districtName: 'Surat'
  // };

  const stats = {
    totalVehicles: 45,
    activeBookings: 12,
    totalUsers: 234,
    monthlyRevenue: 45600,
    availableVehicles: 33,
    pendingBookings: 5
  };

  const vehicles = [
    { id: 1, name: 'Honda Activa 6G', make: 'Honda', districtId: 1, hourlyRate: 50, isAvailable: true, kmTravelled: 5420, nextServiceTime: '2025-12-15' },
    { id: 2, name: 'Royal Enfield Classic 350', make: 'Royal Enfield', districtId: 1, hourlyRate: 120, isAvailable: true, kmTravelled: 8920, nextServiceTime: '2025-11-20' },
    { id: 3, name: 'TVS Jupiter', make: 'TVS', districtId: 1, hourlyRate: 45, isAvailable: false, kmTravelled: 3210, nextServiceTime: '2025-10-30' },
  ];

  const bookings = [
    { id: 1, vehicleName: 'Honda Activa 6G', userName: 'Rahul Sharma', userPhone: '9876543210', startDate: '2025-10-15', endDate: '2025-10-16', totalAmount: 400, status: 1 },
    { id: 2, vehicleName: 'Royal Enfield', userName: 'Priya Patel', userPhone: '9876543211', startDate: '2025-10-20', endDate: '2025-10-21', totalAmount: 1200, status: 0 },
    { id: 3, vehicleName: 'TVS Jupiter', userName: 'Amit Kumar', userPhone: '9876543212', startDate: '2025-10-18', endDate: '2025-10-19', totalAmount: 360, status: 1 },
  ];

  const users = [
    { id: 1, name: 'Rahul Sharma', phone: '+919876543210', districtName: 'Surat', totalBookings: 5, joinedDate: '2024-08-15' },
    { id: 2, name: 'Priya Patel', phone: '+919876543211', districtName: 'Surat', totalBookings: 3, joinedDate: '2024-09-10' },
    { id: 3, name: 'Amit Kumar', phone: '+919876543212', districtName: 'Ahmedabad', totalBookings: 7, joinedDate: '2024-07-20' },
  ];

  const alerts = [
    { id: 1, type: 'service', entityId: 3, message: 'TVS Jupiter service due on 2025-10-30', isRead: false, createdAt: '2025-10-05' },
    { id: 2, type: 'insurance', entityId: 1, message: 'Honda Activa insurance expires on 2025-11-15', isRead: false, createdAt: '2025-10-04' },
    { id: 3, type: 'booking', entityId: 2, message: 'New booking pending approval', isRead: true, createdAt: '2025-10-03' },
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredAlerts = alerts.filter(alert => 
    alertFilter === 'all' || alert.type === alertFilter
  );

  const handleSortBookings = (column: string) => {
    if (bookingSort.column === column) {
      setBookingSort({ column, direction: bookingSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setBookingSort({ column, direction: 'asc' });
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    const aVal = a[bookingSort.column as keyof typeof a];
    const bVal = b[bookingSort.column as keyof typeof b];
    if (aVal < bVal) return bookingSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return bookingSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleUserClick = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const handleAlertVehicleRedirect = (entityId: number) => {
    navigate(`/vehicles/${entityId}`);
  };

  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'Confirmed', color: 'bg-green-100 text-green-800' },
      2: { text: 'Completed', color: 'bg-blue-100 text-blue-800' },
      3: { text: 'Cancelled', color: 'bg-red-100 text-red-800' }
    };
    const { text, color } = statusMap[status as keyof typeof statusMap];
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
  };

  const handleLogout = () => {
    // Clear auth logic here
    navigate('/auth');
  };

  const SortIcon = ({ column }: { column: string }) => (
    <button onClick={() => handleSortBookings(column)} className="flex items-center ml-1">
      <ChevronDown className={`w-4 h-4 ${bookingSort.column === column ? 'text-blue-600' : 'text-gray-400'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            2WheelsOnRent
          </h2>
        </div>

        <nav className="px-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
              activeTab === 'overview' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
              activeTab === 'vehicles' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bike className="w-5 h-5 mr-3" />
            Vehicles
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
              activeTab === 'bookings' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
              activeTab === 'users' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition relative ${
              activeTab === 'alerts' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-5 h-5 mr-3" />
            Alerts
            {alerts.filter(a => !a.isRead).length > 0 && (
              <span className="absolute right-4 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {alerts.filter(a => !a.isRead).length}
              </span>
            )}
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Total Vehicles</p>
                  <Bike className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalVehicles}</p>
                <p className="text-sm text-green-600 mt-1">↑ {stats.availableVehicles} available</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Active Bookings</p>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeBookings}</p>
                <p className="text-sm text-yellow-600 mt-1">{stats.pendingBookings} pending</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-green-600 mt-1">↑ 12% this month</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Monthly Revenue</p>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">↑ 8.5% this month</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
                <div className="space-y-3">
                  {sortedBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.vehicleName}</p>
                        <p className="text-sm text-gray-600">{booking.userName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">₹{booking.totalAmount}</p>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Unread Alerts</h2>
                <div className="space-y-3">
                  {filteredAlerts.filter(a => !a.isRead).map((alert) => (
                    <div key={alert.id} className="flex items-start p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-600 mt-1">{alert.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Vehicle
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
            </div>

            {/* Vehicles Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vehicle</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Make</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rate/Hour</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Km Travelled</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Next Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{vehicle.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vehicle.make}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">₹{vehicle.hourlyRate}</td>
                      <td className="px-6 py-4">
                        {vehicle.isAvailable ? (
                          <span className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Available
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600 text-sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            Booked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vehicle.kmTravelled.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vehicle.nextServiceTime}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Booking Management</h1>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer flex items-center">
                      Booking ID <SortIcon column="id" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer flex items-center">
                      Vehicle <SortIcon column="vehicleName" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer flex items-center">
                      User <SortIcon column="userName" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer flex items-center">
                      Dates <SortIcon column="startDate" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer flex items-center">
                      Amount <SortIcon column="totalAmount" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">#{booking.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{booking.vehicleName}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{booking.userName}</p>
                        <p className="text-xs text-gray-600">{booking.userPhone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.startDate} to {booking.endDate}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{booking.totalAmount}</td>
                      <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {booking.status === 0 && (
                            <>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>

            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">District</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bookings</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">#{user.id}</td>
                      <td 
                        onClick={() => handleUserClick(user.id)}
                        className="px-6 py-4 text-sm text-gray-900 cursor-pointer hover:text-blue-600"
                      >
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.districtName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{user.totalBookings}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.joinedDate}</td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
              <select 
                value={alertFilter} 
                onChange={(e) => setAlertFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="service">Service</option>
                <option value="insurance">Insurance</option>
                <option value="booking">Booking</option>
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Message</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Entity ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          {alert.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{alert.message}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {alert.type !== 'booking' ? (
                          <button 
                            onClick={() => handleAlertVehicleRedirect(alert.entityId)}
                            className="text-blue-600 hover:underline"
                          >
                            {alert.entityId}
                          </button>
                        ) : (
                          alert.entityId
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alert.createdAt}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${alert.isRead ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>
                          {alert.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {!alert.isRead && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                            Mark as Read
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;