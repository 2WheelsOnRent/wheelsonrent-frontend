import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VehicleCard from '../components/VehicleCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useSearchAvailableVehiclesQuery } from '../store/api/vehicleApi';
import BackgroundSlideshow from '../components/BackgroundSlideshow';
import { Calendar, AlertCircle, Filter, X } from 'lucide-react';
import { Button } from '../components/ui/button';

const VehicleListingPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Get search params from URL
  const startDate = searchParams.get('startDate') || '';
  const startTime = searchParams.get('startTime') || '';
  const endDate = searchParams.get('endDate') || '';
  const endTime = searchParams.get('endTime') || '';

  // Filter states
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFuel, setSelectedFuel] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 5000 });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch vehicles based on search params
  const { data: vehicles, isLoading, error } = useSearchAvailableVehiclesQuery({
    startDate,
    startTime,
    endDate,
    endTime,
  });

  // Apply client-side filters
  const filteredVehicles = vehicles?.filter(v => {
    if (selectedType && v.vehicleType !== selectedType) return false;
    if (selectedFuel && v.fuelType !== selectedFuel) return false;
    if (v.pricePerHour < priceRange.min || v.pricePerHour > priceRange.max) return false;
    return true;
  }) || [];

  const clearFilters = () => {
    setSelectedType('');
    setSelectedFuel('');
    setPriceRange({ min: 0, max: 10000 });
  };

  const hasActiveFilters = selectedType || selectedFuel || priceRange.min > 0 || priceRange.max < 10000;

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading available vehicles..." />;
  }

  if (error) {
    return <ErrorMessage fullScreen message="Failed to load vehicles" />;
  }

  return (
    <div className="min-h-screen bg-white relative">
      <BackgroundSlideshow />
      <div className="relative z-10">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Available Vehicles</h1>
              <p className="text-gray-600">
                Explore our complete fleet of two-wheelers
              </p>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Search criteria banner */}
          {(startDate || startTime || endDate || endTime) && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <Calendar className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-3">Your Search Criteria:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                    {startDate && startTime && (
                      <div>
                        <span className="font-medium">Pickup:</span> {startDate} at {startTime}
                      </div>
                    )}
                    {endDate && endTime && (
                      <div>
                        <span className="font-medium">Return:</span> {endDate} at {endTime}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    💡 These dates will be pre-filled when you click "Book Now"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Bike">Bike</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type
                  </label>
                  <select
                    value={selectedFuel}
                    onChange={(e) => setSelectedFuel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Fuel Types</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (per hour)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 5000 })}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicles Grid */}
          {filteredVehicles.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredVehicles.length}</span> available vehicle{filteredVehicles.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">
                No vehicles found
              </p>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria or filters
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};
export default VehicleListingPage;