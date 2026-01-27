import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MapWithLocations from '../components/MapWithLocations';
import PriceCalculator from '../components/PriceCalculator';
import { Button } from '../components/ui/button';
import { Calendar, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import BackgroundSlideshow from '../components/BackgroundSlideshow';
import { useGetVehicleByIdQuery } from '../store/api/vehicleApi';
import { useCreateBookingMutation } from '../store/api/bookingApi';
import { useAppSelector } from '../store/hooks';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { calculateTotalPrice, calculateDuration } from '../utils/vehicleUtils';

export default function BookNow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);

  // Get search params from URL (if any)
  const startDateParam = searchParams.get('startDate') || '';
  const startTimeParam = searchParams.get('startTime') || '';
  const endDateParam = searchParams.get('endDate') || '';
  const endTimeParam = searchParams.get('endTime') || '';

  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedDrop] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Booking dates state
  const [bookingDates, setBookingDates] = useState({
    startDate: startDateParam,
    startTime: startTimeParam,
    endDate: endDateParam,
    endTime: endTimeParam
  });

  // Fetch vehicle details
  const { data: vehicleData, isLoading: vehicleLoading, error: vehicleError } = useGetVehicleByIdQuery(
    parseInt(id || '0')
  );

  // Fetch locations for the vehicle's district
  // const { data: locationsData, isLoading: locationsLoading } = useGetActivePickupLocationsByDistrictQuery(
  //   vehicleData?.districtId || parseInt(districtId) || 1,
  //   { skip: !vehicleData && !districtId }
  // );

  // Create booking mutation
  const [createBooking, { isLoading: bookingLoading }] = useCreateBookingMutation();

  // Handle location selection from map
  const handleMapLocationSelect = (location: any) => {
    // Update the pickup dropdown to match the map selection
    setSelectedPickup(location.id.toString());
  };

  // Handle pickup dropdown change
  // const handlePickupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedPickup(e.target.value);
  // };

  // Calculate total hours
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

  // Calculate total price
  const calculateTotal = () => {
    if (!vehicleData || !bookingDates.startDate || !bookingDates.startTime || !bookingDates.endDate || !bookingDates.endTime) {
      return 0;
    }
    return calculateTotalPrice(
      vehicleData.pricePerHour,
      bookingDates.startDate,
      bookingDates.startTime,
      bookingDates.endDate,
      bookingDates.endTime
    );
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
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

    if (!selectedPickup) {
      setBookingError('Please select a pickup location');
      return;
    }

    if (!selectedDrop) {
      setBookingError('Please select a drop location');
      return;
    }

    try {
      const bookingRequest = {
        vehicleId: vehicleData.id,
        userId: user.id,
        pickupLocationId: parseInt(selectedPickup),
        dropLocationId: parseInt(selectedDrop),
        bookingStartDate: bookingDates.startDate,
        bookingEndDate: bookingDates.endDate,
        startTime: bookingDates.startTime,
        endTime: bookingDates.endTime,
        totalAmount: calculateTotal(),
      };

      await createBooking(bookingRequest).unwrap();
      
      // Success - redirect to dashboard
      alert('Booking created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Booking error:', error);
      setBookingError(error.data?.message || 'Failed to create booking. Please try again.');
    }
  };

  // Loading state
  if (vehicleLoading) {
    return <LoadingSpinner fullScreen message="Loading vehicle details..." />;
  }

  // Error state
  if (vehicleError || !vehicleData) {
    return (
      <ErrorMessage 
        fullScreen
        message="Failed to load vehicle details" 
        onRetry={() => navigate(-1)} 
      />
    );
  }

  const totalHours = calculateTotalHours();

  return (
    <div className="min-h-screen bg-white relative">
      <BackgroundSlideshow />
      <div className="relative z-10">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl text-black mb-8">Complete Your Booking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Map and Location */}
            <div className="lg:col-span-2 space-y-8">
              {/* Map and Pickup Locations */}
              <div>
                <h3 className="text-xl text-black mb-4">Select Pickup Location</h3>
                <MapWithLocations 
                  districtId={vehicleData.districtId}
                  onLocationSelect={handleMapLocationSelect}
                  selectedLocationId={selectedPickup ? parseInt(selectedPickup) : undefined}
                />

                {/* Location Dropdowns */}
                {/* {locationsLoading ? (
                  <div className="mt-4 text-sm text-gray-500">Loading locations...</div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        Pickup Location
                      </label>
                      <select
                        value={selectedPickup}
                        onChange={handlePickupChange}
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
                  </div>
                )} */}
              </div>

              {/* Vehicle Details Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex gap-4">
                  <img
                    src={vehicleData.primaryImageUrl || vehicleData.images?.[0]?.imageUrl || '/placeholder.jpg'}
                    alt={vehicleData.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{vehicleData.name}</h3>
                    <p className="text-gray-600 mb-3">{vehicleData.make} • {vehicleData.model}</p>
                    {/* <div className="flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Fuel className="w-4 h-4" />
                        {vehicleData.fuelType}
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="w-4 h-4" />
                        {vehicleData.kmTravelled.toLocaleString()} km
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Rental Period */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl text-black mb-4">Rental Period</h3>
                
                {/* Error Message */}
                {bookingError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{bookingError}</p>
                  </div>
                )}

                {/* Show message if dates are pre-filled */}
                {(startDateParam && startTimeParam && endDateParam && endTimeParam) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Booking dates and times have been pre-filled from your search. You can modify them if needed.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Pickup Date & Time
                    </label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={bookingDates.startDate}
                        onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <input
                        type="time"
                        value={bookingDates.startTime}
                        onChange={(e) => setBookingDates({ ...bookingDates, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Return Date & Time
                    </label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={bookingDates.endDate}
                        onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                        min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <input
                        type="time"
                        value={bookingDates.endTime}
                        onChange={(e) => setBookingDates({ ...bookingDates, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {totalHours > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Total Duration: <strong>{totalHours} hours</strong>
                      {vehicleData.minBookingHours && totalHours < vehicleData.minBookingHours && (
                        <span className="text-red-600 ml-2">
                          (Minimum {vehicleData.minBookingHours} hours required)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Important Information */}
              {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-black mb-3">Important Information</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Valid driving license and ID proof required at pickup</li>
                  <li>• Security deposit of ₹2000 will be collected (refundable)</li>
                  <li>• Vehicle will be provided with full fuel tank</li>
                  <li>• Helmets are charged separately</li>
                </ul>
              </div> */}
            </div>

            {/* Right Column - Price Calculator */}
            <div>
              <div className="sticky top-24">
                <PriceCalculator
                  basePrice={vehicleData.pricePerHour}
                  hours={totalHours}
                  vehicleName={vehicleData.name}
                  onProceedToPayment={handleBooking}
                  isLoading={bookingLoading}
                  isLoggedIn={!!user}
                  minBookingHours={vehicleData.minBookingHours}
                />

                {!user && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-gray-700 mb-3">
                      Please login to complete your booking
                    </p>
                    <Button
                      onClick={() => navigate('/login')}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Login to Continue
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}