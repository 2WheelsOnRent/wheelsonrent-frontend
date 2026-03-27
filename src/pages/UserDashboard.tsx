// import React, { useState } from 'react';
// import { Calendar, MapPin, Clock, CreditCard, User, Bell, LogOut, FileText, ChevronRight, Star } from 'lucide-react';

// const UserDashboard: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'payments'>('bookings');

//   const user = {
//     id: 1,
//     name: 'Rahul Sharma',
//     phone: '9876543210',
//     email: 'rahul@example.com',
//     districtId: 1,
//     districtName: 'Surat',
//     joinedDate: '2024-08-15'
//   };

//   const bookings = [
//     {
//       id: 1,
//       vehicleName: 'Honda Activa 6G',
//       vehicleImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop',
//       startDate: '2025-10-15',
//       endDate: '2025-10-16',
//       startTime: '10:00',
//       endTime: '18:00',
//       pickupLocation: 'Athwa Gate',
//       dropLocation: 'Vesu',
//       totalAmount: 400,
//       status: 1, // 0=Pending, 1=Confirmed, 2=Completed, 3=Cancelled
//       paymentStatus: 'paid'
//     },
//     {
//       id: 2,
//       vehicleName: 'Royal Enfield Classic 350',
//       vehicleImage: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=200&h=150&fit=crop',
//       startDate: '2025-09-20',
//       endDate: '2025-09-21',
//       startTime: '09:00',
//       endTime: '19:00',
//       pickupLocation: 'Adajan',
//       dropLocation: 'Adajan',
//       totalAmount: 1200,
//       status: 2,
//       paymentStatus: 'paid'
//     }
//   ];

//   const payments = [
//     {
//       id: 1,
//       bookingId: 1,
//       amount: 400,
//       date: '2025-10-10',
//       method: 'Razorpay',
//       status: 'paid',
//       transactionId: 'pay_MnK4jFj2kH6Y7g'
//     },
//     {
//       id: 2,
//       bookingId: 2,
//       amount: 1200,
//       date: '2025-09-18',
//       method: 'Razorpay',
//       status: 'paid',
//       transactionId: 'pay_LmJ3kEi1jH5X6f'
//     }
//   ];

//   const getStatusBadge = (status: number) => {
//     const statusMap = {
//       0: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
//       1: { text: 'Confirmed', color: 'bg-green-100 text-green-800' },
//       2: { text: 'Completed', color: 'bg-blue-100 text-blue-800' },
//       3: { text: 'Cancelled', color: 'bg-red-100 text-red-800' }
//     };
//     const { text, color } = statusMap[status as keyof typeof statusMap];
//     return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//               scootyonrent
//             </a>
//             <div className="flex items-center space-x-4">
//               <button className="relative text-gray-600 hover:text-blue-600 transition">
//                 <Bell className="w-6 h-6" />
//                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
//                   2
//                 </span>
//               </button>
//               <a href="/" className="text-gray-600 hover:text-blue-600 transition">
//                 Browse Vehicles
//               </a>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Sidebar */}
//           <aside className="lg:col-span-1">
//             <div className="bg-white rounded-xl shadow-md overflow-hidden">
//               {/* User Info */}
//               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
//                   <User className="w-10 h-10 text-blue-600" />
//                 </div>
//                 <h2 className="text-xl font-bold text-center">{user.name}</h2>
//                 <p className="text-blue-100 text-center text-sm">{user.phone}</p>
//               </div>

//               {/* Navigation */}
//               <nav className="p-4 space-y-2">
//                 <button
//                   onClick={() => setActiveTab('bookings')}
//                   className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
//                     activeTab === 'bookings'
//                       ? 'bg-blue-50 text-blue-600 font-semibold'
//                       : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Calendar className="w-5 h-5 mr-3" />
//                   My Bookings
//                   <ChevronRight className="w-5 h-5 ml-auto" />
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('payments')}
//                   className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
//                     activeTab === 'payments'
//                       ? 'bg-blue-50 text-blue-600 font-semibold'
//                       : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <CreditCard className="w-5 h-5 mr-3" />
//                   Payments
//                   <ChevronRight className="w-5 h-5 ml-auto" />
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('profile')}
//                   className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
//                     activeTab === 'profile'
//                       ? 'bg-blue-50 text-blue-600 font-semibold'
//                       : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <User className="w-5 h-5 mr-3" />
//                   Profile
//                   <ChevronRight className="w-5 h-5 ml-auto" />
//                 </button>
//                 <button className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition">
//                   <LogOut className="w-5 h-5 mr-3" />
//                   Logout
//                 </button>
//               </nav>
//             </div>
//           </aside>

//           {/* Main Content */}
//           <main className="lg:col-span-3">
//             {/* Bookings Tab */}
//             {activeTab === 'bookings' && (
//               <div>
//                 <div className="flex items-center justify-between mb-6">
//                   <h2 className="text-3xl font-bold text-gray-900">My Bookings</h2>
//                   <a href="/vehicles" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
//                     Book New Vehicle
//                   </a>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
//                         <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
//                       </div>
//                       <Calendar className="w-12 h-12 text-blue-600" />
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-gray-600 text-sm mb-1">Active Bookings</p>
//                         <p className="text-3xl font-bold text-gray-900">
//                           {bookings.filter(b => b.status === 1).length}
//                         </p>
//                       </div>
//                       <Clock className="w-12 h-12 text-green-600" />
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-xl shadow-md p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-gray-600 text-sm mb-1">Total Spent</p>
//                         <p className="text-3xl font-bold text-gray-900">
//                           ₹{bookings.reduce((sum, b) => sum + b.totalAmount, 0)}
//                         </p>
//                       </div>
//                       <CreditCard className="w-12 h-12 text-purple-600" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Bookings List */}
//                 <div className="space-y-4">
//                   {bookings.map((booking) => (
//                     <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
//                       <div className="flex flex-col md:flex-row">
//                         <img
//                           src={booking.vehicleImage}
//                           alt={booking.vehicleName}
//                           className="w-full md:w-48 h-48 object-cover"
//                         />
//                         <div className="flex-1 p-6">
//                           <div className="flex items-start justify-between mb-4">
//                             <div>
//                               <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.vehicleName}</h3>
//                               <p className="text-sm text-gray-600">Booking ID: #{booking.id}</p>
//                             </div>
//                             {getStatusBadge(booking.status)}
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                             <div className="flex items-center text-gray-600">
//                               <Calendar className="w-5 h-5 mr-2 text-blue-600" />
//                               <div>
//                                 <p className="text-xs text-gray-500">Date</p>
//                                 <p className="font-medium">{booking.startDate} to {booking.endDate}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center text-gray-600">
//                               <Clock className="w-5 h-5 mr-2 text-blue-600" />
//                               <div>
//                                 <p className="text-xs text-gray-500">Time</p>
//                                 <p className="font-medium">{booking.startTime} - {booking.endTime}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center text-gray-600">
//                               <MapPin className="w-5 h-5 mr-2 text-blue-600" />
//                               <div>
//                                 <p className="text-xs text-gray-500">Pickup</p>
//                                 <p className="font-medium">{booking.pickupLocation}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center text-gray-600">
//                               <MapPin className="w-5 h-5 mr-2 text-blue-600" />
//                               <div>
//                                 <p className="text-xs text-gray-500">Drop</p>
//                                 <p className="font-medium">{booking.dropLocation}</p>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//                             <div>
//                               <span className="text-2xl font-bold text-blue-600">₹{booking.totalAmount}</span>
//                               <span className="text-sm text-gray-600 ml-2">({booking.paymentStatus})</span>
//                             </div>
//                             <div className="flex space-x-2">
//                               <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
//                                 View Details
//                               </button>
//                               {booking.status === 2 && (
//                                 <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center">
//                                   <Star className="w-4 h-4 mr-1" />
//                                   Rate
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Payments Tab */}
//             {activeTab === 'payments' && (
//               <div>
//                 <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment History</h2>

//                 <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Transaction ID</th>
//                           <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Booking ID</th>
//                           <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
//                           <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
//                           <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
//                           <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
//                           <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {payments.map((payment) => (
//                           <tr key={payment.id} className="hover:bg-gray-50 transition">
//                             <td className="px-6 py-4 text-sm text-gray-900 font-mono">{payment.transactionId}</td>
//                             <td className="px-6 py-4 text-sm text-gray-900">#{payment.bookingId}</td>
//                             <td className="px-6 py-4 text-sm text-gray-600">{payment.date}</td>
//                             <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
//                             <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{payment.amount}</td>
//                             <td className="px-6 py-4">
//                               <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
//                                 {payment.status}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4">
//                               <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
//                                 <FileText className="w-4 h-4 mr-1" />
//                                 Invoice
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Profile Tab */}
//             {activeTab === 'profile' && (
//               <div>
//                 <h2 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h2>

//                 <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//                   <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//                       <input
//                         type="text"
//                         defaultValue={user.name}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
//                       <input
//                         type="tel"
//                         defaultValue={user.phone}
//                         disabled
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//                       <input
//                         type="email"
//                         defaultValue={user.email}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
//                       <select
//                         defaultValue={user.districtId}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                       >
//                         <option value="1">Surat</option>
//                         <option value="2">Ahmedabad</option>
//                         <option value="3">Vadodara</option>
//                         <option value="4">Rajkot</option>
//                       </select>
//                     </div>
//                     <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
//                       Update Profile
//                     </button>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-md p-6">
//                   <h3 className="text-xl font-bold text-gray-900 mb-6">Account Details</h3>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between py-2 border-b border-gray-200">
//                       <span className="text-gray-600">Member Since</span>
//                       <span className="font-medium text-gray-900">{user.joinedDate}</span>
//                     </div>
//                     <div className="flex justify-between py-2 border-b border-gray-200">
//                       <span className="text-gray-600">Total Bookings</span>
//                       <span className="font-medium text-gray-900">{bookings.length}</span>
//                     </div>
//                     <div className="flex justify-between py-2">
//                       <span className="text-gray-600">Account Status</span>
//                       <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
//                         Active
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;