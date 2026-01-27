import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import type { VehicleWithImagesDto } from '../store/api/vehicleApi';

interface VehicleCardProps {
  vehicle: VehicleWithImagesDto;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleBookNow = () => {
    // Get datetime params from URL if they exist
    const startDate = searchParams.get('startDate');
    const startTime = searchParams.get('startTime');
    const endDate = searchParams.get('endDate');
    const endTime = searchParams.get('endTime');

    // Fix: Handle districtId being undefined or string
    const districtIdValue = vehicle.districtId ?? 1; // Default to 1 if missing
    
    // Build URL with all params
    const params = new URLSearchParams({
      districtId: districtIdValue.toString(),
      ...(startDate && { startDate }),
      ...(startTime && { startTime }),
      ...(endDate && { endDate }),
      ...(endTime && { endTime }),
    });

    navigate(`/book/${vehicle.id}?${params.toString()}`);
  };

  // Fix: Get image URL from the API response structure you showed
  // Your API returns: image: "https://imgd.aeplcdn.com/..."
  const imageUrl = (vehicle as any).image || 
                   vehicle.primaryImageUrl || 
                   vehicle.images?.[0]?.imageUrl || 
                   'https://via.placeholder.com/400x300?text=No+Image';

  // Fix: Check availability
  const isAvailable = vehicle.isAvailable !== false;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      {/* Vehicle Image */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={imageUrl}
          alt={vehicle.name}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Prevent infinite loop
            if (!target.src.includes('placeholder')) {
              target.src = 'https://via.placeholder.com/400x300?text=Vehicle+Image';
            }
          }}
        />
        
        {/* Unavailable Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Not Available
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {/* {vehicle.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )} */}
      </div>

      {/* Vehicle Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{vehicle.name}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {vehicle.make} {vehicle.model}
        </p>

        {/* Vehicle Specs */}
        {/* <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            <span>{vehicle.kmTravelled?.toLocaleString() || '0'} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="w-4 h-4" />
            <span>{vehicle.fuelType || 'Petrol'}</span>
          </div>
        </div> */}

        {/* Pricing */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              ₹{vehicle.pricePerHour || 0}
            </span>
            <span className="text-sm text-gray-600">/hour</span>
          </div>
          {/* <div className="text-xs text-gray-500 text-right">
            <div>₹{vehicle.pricePerDay || 0}/day</div>
            <div>Min {vehicle.minBookingHours || 4}h</div>
          </div> */}
        </div>

        {/* Book Now Button */}
        <Button
          onClick={handleBookNow}
          disabled={!isAvailable}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isAvailable ? 'Book Now' : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
}
