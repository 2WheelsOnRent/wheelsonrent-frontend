import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Gauge, Package } from 'lucide-react';
import { Button } from './ui/button';
import type { Vehicle } from '../Data/Vehicles';

interface VehicleCardProps {
  vehicle: Vehicle;
  availableCount?: number;
}

export default function VehicleCard({ vehicle, availableCount = 5 }: VehicleCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative h-[500px]">
      <div
        className={`absolute w-full h-full transition-all duration-500 transform-gpu ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-1">
              <span className="text-sm">{availableCount} available</span>
            </div>
            
          </div>

          {/* Package Toggle Button */}
          <div className="px-4 pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                
                setIsFlipped(!isFlipped);
              }}
              className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span className="text-sm">View Packages</span>
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-lg text-black mb-1">{vehicle.name}</h3>
            <p className="text-gray-600 mb-3">{vehicle.company}</p>

            <div className="flex items-center gap-4 mb-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Fuel className="w-4 h-4" />
                <span className="text-sm">{vehicle.fuelType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                <span className="text-sm">{vehicle.kmLimit} km/day</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl text-blue-500">₹{vehicle.pricePerHour}</p>
                <p className="text-sm text-gray-500">per hour</p>
              </div>
              
            </div>

            <Button
              onClick={() => navigate(`/book/${vehicle.id}`)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Book Now
            </Button>
          </div>
        </div>

        {/* Back of card - Package Grid Layout */}
        <div
          className="absolute w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Back Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="text-gray-600 hover:text-gray-800 text-lg mb-6 text-left font-medium"
            >
              ← Back
            </button>

            {/* Package Grid - 2x2 */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Daily Package - Available (Green) */}
              <div className="bg-gradient-to-br from-lime-400 to-lime-500 rounded-lg p-6 flex flex-col justify-center items-center text-white shadow-md">
                <h3 className="text-2xl font-bold mb-2">Daily</h3>
                <p className="text-3xl font-bold mb-1">₹ {vehicle.packages.oneDay}</p>
                <p className="text-sm opacity-90">Per Day</p>
                <p className="text-xs mt-2 opacity-80">({vehicle.kmLimit} km included)</p>
              </div>

              {/* 7 Days Package - Not Available */}
              <div className="bg-gray-100 rounded-lg p-6 flex flex-col justify-center items-center border border-gray-200">
                <h3 className="text-xl font-semibold mb-2 text-lime-400">7 Days</h3>
                <p className="text-lg text-gray-400 font-medium">Not Available</p>
              </div>

              {/* 15 Days Package - Not Available */}
              <div className="bg-gray-100 rounded-lg p-6 flex flex-col justify-center items-center border border-gray-200">
                <h3 className="text-xl font-semibold mb-2 text-lime-400">15 Days</h3>
                <p className="text-lg text-gray-400 font-medium">Not Available</p>
              </div>

              {/* Monthly Package - Not Available */}
              <div className="bg-gray-100 rounded-lg p-6 flex flex-col justify-center items-center border border-gray-200">
                <h3 className="text-xl font-semibold mb-2 text-lime-400">Monthly</h3>
                <p className="text-lg text-gray-400 font-medium">Not Available</p>
              </div>
            </div>

            {/* Book Now Button */}
            <div className="mt-6">
              <Button
                onClick={() => navigate(`/book/${vehicle.id}`)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}