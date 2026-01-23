import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
const GOOGLE_MAPS_API_KEY = import.meta.env.REACT_APP_GOOGLE_MAPS_KEY;
interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

const locations: Location[] = [
  {
    id: '1',
    name: 'City Palace',
    address: 'Near City Palace, Lake Pichola, Udaipur',
    coordinates: { lat: 24.5761, lng: 73.6833 },
  },
  {
    id: '2',
    name: 'Fateh Sagar Lake',
    address: 'Fateh Sagar Road, Udaipur',
    coordinates: { lat: 24.5907, lng: 73.6789 },
  },
  {
    id: '3',
    name: 'Lake Pichola',
    address: 'Lake Pichola, Udaipur',
    coordinates: { lat: 24.5712, lng: 73.6795 },
  },
  {
    id: '4',
    name: 'Saheliyon Ki Bari',
    address: 'Panchwati, Udaipur',
    coordinates: { lat: 24.6039, lng: 73.6820 },
  },
  {
    id: '5',
    name: 'Jag Mandir',
    address: 'Jag Mandir Island Palace, Lake Pichola, Udaipur',
    coordinates: { lat: 24.5742, lng: 73.6817 },
  },
  {
    id: '6',
    name: 'Sukhadia Circle',
    address: 'Sukhadia Circle, Udaipur',
    coordinates: { lat: 24.6083, lng: 73.6825 },
  },
  {
    id: '7',
    name: 'Bapu Bazaar',
    address: 'Bapu Bazaar, Udaipur',
    coordinates: { lat: 24.5795, lng: 73.6866 },
  },
  {
    id: '8',
    name: 'Udaipur Railway Station',
    address: 'Udaipur City Railway Station',
    coordinates: { lat: 24.5806, lng: 73.6826 },
  },
  {
    id: '9',
    name: 'Pratap Nagar',
    address: 'Pratap Nagar, Udaipur',
    coordinates: { lat: 24.5556, lng: 73.7423 },
  },
  {
    id: '10',
    name: 'Doodh Talai',
    address: 'Doodh Talai Lake, Udaipur',
    coordinates: { lat: 24.5819, lng: 73.6769 },
  },
];

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 25.5, // Rajasthan center
  lng: 74.0,
};

export default function MapWithLocations({
  onLocationSelect,
}: {
  onLocationSelect: (location: Location) => void;
}) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Google Map */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={selectedLocation?.coordinates || defaultCenter}
            zoom={selectedLocation ? 14 : 6}
          >
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={location.coordinates}
                onClick={() => handleLocationClick(location)}
                icon={
                  selectedLocation?.id === location.id
                    ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Location List (UNCHANGED) */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-black">Pickup Locations</h3>
        </div>
        <div className="h-[350px] overflow-y-auto p-4">
          <div className="space-y-3">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationClick(location)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedLocation?.id === location.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin
                    className={`w-5 h-5 mt-1 ${
                      selectedLocation?.id === location.id
                        ? 'text-blue-500'
                        : 'text-gray-400'
                    }`}
                  />
                  <div>
                    <p className="text-black">{location.name}</p>
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
