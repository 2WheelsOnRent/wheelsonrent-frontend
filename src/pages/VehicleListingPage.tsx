import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VehicleFilters, { type FilterState } from '../components/VehicleFilters';
import VehicleCard from '../components/VehicleCard';
import { vehicles } from '../Data/Vehicles';
import BackgroundSlideshow from '../components/BackgroundSlideshow';

export default function Vehicles() {
  const [filters, setFilters] = useState<FilterState>({
    vehicleTypes: [],
    fuelTypes: [],
    companies: [],
    priceRange: [0, 1500],
    minRating: 0,
  });

  const filteredVehicles = vehicles.filter((vehicle) => {
    // Vehicle type filter
    if (
      filters.vehicleTypes.length > 0 &&
      !filters.vehicleTypes.includes(vehicle.type)
    ) {
      return false;
    }

    // Fuel type filter
    if (
      filters.fuelTypes.length > 0 &&
      !filters.fuelTypes.includes(vehicle.fuelType)
    ) {
      return false;
    }

    // Company filter
    if (
      filters.companies.length > 0 &&
      !filters.companies.includes(vehicle.company)
    ) {
      return false;
    }

    // Price range filter
    if (
      vehicle.pricePerDay < filters.priceRange[0] ||
      vehicle.pricePerDay > filters.priceRange[1]
    ) {
      return false;
    }

    // Rating filter
    if (vehicle.rating < filters.minRating) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-white relative">
      <BackgroundSlideshow />
      <div className="relative z-10">
        <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl text-black mb-8">Available Vehicles</h1>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <VehicleFilters onFilterChange={setFilters} />
          </aside>

          {/* Vehicles Grid */}
          <div className="flex-1">
            {filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600">
                  No vehicles found matching your criteria.
                </p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters to see more options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

        <Footer />
      </div>
    </div>
  );
}
