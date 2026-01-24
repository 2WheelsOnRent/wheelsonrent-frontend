import React, { useState } from 'react';
import { MapPin, Gauge, Clock, Shield, CheckCircle, Calendar, AlertCircle, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useGetVehicleByIdQuery } from '../store/api/vehicleApi';
import { useGetLocationsByDistrictIdQuery } from '../store/api/locationApi';
import { useCreateBookingMutation } from '../store/api/bookingApi';
import { useAppSelector } from '../store/hooks';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { enhanceVehicleData, calculateTotalPrice, calculateDuration } from '../utils/vehicleUtils';
import { toast } from 'sonner';

const VehicleDetailsPage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedDrop, setSelectedDrop] = useState('');
  const [bookingError, setBookingError] = useState('');

  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Get search params from URL
  const districtId = searchParams.get('districtId') || '';
  const startDate = searchParams.get('startDate') || '';
  const startTime = searchParams.get('startTime') || '';
  const endDate = searchParams.get('endDate') || '';
  const endTime = searchParams.get('endTime') || '';

  const [bookingDates, setBookingDates] = useState({
    startDate,
    startTime,
    endDate,
    endTime
  });

  // Fetch vehicle details
  const { data: vehicleData, isLoading: vehicleLoading, error: vehicleError } = useGetVehicleByIdQuery(
    parseInt(id || '0')
  );

  // Fetch locations for the vehicle's district
  const { data: locationsData, isLoading: locationsLoading } = useGetLocationsByDistrictIdQuery(
    vehicleData?.districtId || parseInt(districtId) || 1,
    { skip: !vehicleData && !districtId }
  );

  // Create booking mutation
  const [createBooking, { isLoading: bookingLoading }] = useCreateBookingMutation();

  // Mock images array (in real app, fetch from VehicleImages table)
  const vehicleImages = vehicleData ? [
    enhanceVehicleData(vehicleData).image,
    enhanceVehicleData(vehicleData).image
  ] : [];

  const enhancedVehicle = vehicleData ? enhanceVehicleData(vehicleData) : null;

  const calculateTotal = () => {
    if (!enhancedVehicle || !bookingDates.startDate || !bookingDates.startTime || !bookingDates.endDate || !bookingDates.endTime) {
      return 0;
    }
    return calculateTotalPrice(
      enhancedVehicle.hourlyRate,
      bookingDates.startDate,
      bookingDates.startTime,
      bookingDates.endDate,
      bookingDates.endTime
    );
  };

  const calculateTotalHours = () => {
    if (!bookingDates.startDate || !bookingDates.startTime || !bookingDates.endDate || !bookingDates.endTime) {
      return 0;
    }
    return calculateDuration(
      bookingDates.startDate,
      bookingDates.startTime,
      bookingDates.endDate,
      bookingDates.endTime
    );
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!vehicleData) return;

    setBookingError('');

    // Validation
    if (!bookingDates.startDate || !bookingDates.startTime || !bookingDates.endDate || !bookingDates.endTime) {
      setBookingError('Please fill all date and time fields');
      return;
    }

    const duration = calculateTotalHours();
    if (duration < vehicleData.minBookingHours) {
      setBookingError(`Minimum booking duration is ${vehicleData.minBookingHours} hours`);
      return;
    }

    try {
      const bookingRequest = {
        vehicleId: vehicleData.id,
        userId: user.id,
        pickupLocationId: selectedPickup ? parseInt(selectedPickup) : undefined,
        dropLocationId: selectedDrop ? parseInt(selectedDrop) : undefined,
        bookingStartDate: bookingDates.startDate,
        bookingEndDate: bookingDates.endDate,
        startTime: bookingDates.startTime,
        endTime: bookingDates.endTime,
        totalAmount: calculateTotal(),
      };

      await createBooking(bookingRequest).unwrap();
      
      // Success - redirect to dashboard
      toast.success('Booking created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Booking error:', error);
      setBookingError(error.data?.message || 'Failed to create booking. Please try again.');
    }
  };

  if (vehicleLoading) {
    return <LoadingSpinner fullScreen message="Loading vehicle details..." />;
  }

  if (vehicleError || !enhancedVehicle) {
    return (
      <ErrorMessage 
        fullScreen
        message="Failed to load vehicle details" 
        onRetry={() => navigate(-1)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-blue-600 mr-4 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              2WheelsOnRent
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative h-96">
                <img
                  src={vehicleImages[currentImageIndex]}
                  alt={enhancedVehicle.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {vehicleImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition ${
                        currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{enhancedVehicle.name}</h1>
                  <p className="text-lg text-gray-600">{enhancedVehicle.make} • {enhancedVehicle.model}</p>
                </div>
                
              </div>

              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                <span>Available in District {enhancedVehicle.districtId}</span>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Gauge className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Km Travelled</p>
                  <p className="font-semibold text-gray-900">{enhancedVehicle.kmTravelled.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Min Booking</p>
                  <p className="font-semibold text-gray-900">{enhancedVehicle.minBookingHours} hours</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Insurance</p>
                  <p className="font-semibold text-gray-900">Valid</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-gray-600">Condition</p>
                  <p className="font-semibold text-gray-900">Excellent</p>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Features & Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Comprehensive Insurance</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Well Maintained</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Helmet Included</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-700">24/7 Support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Fuel Efficient</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-700">GPS Tracking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {[
                  { name: 'Rahul Shah', rating: 5, comment: 'Excellent bike! Very smooth ride and well maintained.', date: '2 days ago' },
                  { name: 'Priya Patel', rating: 5, comment: 'Great service. The booking process was super easy.', date: '1 week ago' },
                  { name: 'Amit Kumar', rating: 4, comment: 'Good bike for the price. Minor scratches but runs perfectly.', date: '2 weeks ago' }
                ].map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="font-semibold text-blue-600">{review.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.name}</p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-blue-600">₹{enhancedVehicle.hourlyRate}</span>
                  <span className="text-gray-600 ml-2">/hour</span>
                </div>
                <p className="text-sm text-gray-500">Minimum {enhancedVehicle.minBookingHours} hours booking required</p>
              </div>

              {/* Error Message */}
              {bookingError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{bookingError}</p>
                </div>
              )}

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Start Date & Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={bookingDates.startDate}
                      onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="time"
                      value={bookingDates.startTime}
                      onChange={(e) => setBookingDates({ ...bookingDates, startTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    End Date & Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={bookingDates.endDate}
                      onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                      min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="time"
                      value={bookingDates.endTime}
                      onChange={(e) => setBookingDates({ ...bookingDates, endTime: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {locationsLoading ? (
                  <div className="text-sm text-gray-500">Loading locations...</div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        Pickup Location
                      </label>
                      <select
                        value={selectedPickup}
                        onChange={(e) => setSelectedPickup(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select pickup location</option>
                        {locationsData?.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        Drop Location
                      </label>
                      <select
                        value={selectedDrop}
                        onChange={(e) => setSelectedDrop(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select drop location</option>
                        {locationsData?.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">{calculateTotalHours()} hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate per hour</span>
                    <span className="font-medium text-gray-900">₹{enhancedVehicle.hourlyRate}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="font-bold text-xl text-blue-600">₹{calculateTotal()}</span>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Payment will be processed securely through Razorpay after booking confirmation.
                  </p>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {bookingLoading ? 'Creating Booking...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;