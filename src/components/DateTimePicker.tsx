import { useState } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export default function DateTimePicker() {
  const navigate = useNavigate();
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('10:00');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSearch = () => {
    // Reset errors
    const newErrors: string[] = [];

    // Validate all fields
    if (!pickupDate) {
      newErrors.push('Please choose pickup date');
    }
    if (!pickupTime) {
      newErrors.push('Please choose pickup time');
    }
    if (!returnDate) {
      newErrors.push('Please choose return date');
    }
    if (!returnTime) {
      newErrors.push('Please choose return time');
    }

    // If there are errors, show them and don't navigate
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and navigate with date/time params
    setErrors([]);
    
    // Build URL with search params
    const params = new URLSearchParams({
      startDate: pickupDate,
      startTime: pickupTime,
      endDate: returnDate,
      endTime: returnTime
    });
    
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl text-black mb-6">Book Your Ride</h2>
      
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup */}
        <div>
          <label className="block text-gray-700 mb-2">Pickup Date & Time</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => {
                  setPickupDate(e.target.value);
                  // Clear error when user fills the field
                  if (errors.length > 0) {
                    setErrors(errors.filter(err => err !== 'Please choose pickup date'));
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                  errors.includes('Please choose pickup date') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => {
                  setPickupTime(e.target.value);
                  // Clear error when user fills the field
                  if (errors.length > 0) {
                    setErrors(errors.filter(err => err !== 'Please choose pickup time'));
                  }
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                  errors.includes('Please choose pickup time') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Return */}
        <div>
          <label className="block text-gray-700 mb-2">Return Date & Time</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => {
                  setReturnDate(e.target.value);
                  // Clear error when user fills the field
                  if (errors.length > 0) {
                    setErrors(errors.filter(err => err !== 'Please choose return date'));
                  }
                }}
                min={pickupDate || new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                  errors.includes('Please choose return date') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={returnTime}
                onChange={(e) => {
                  setReturnTime(e.target.value);
                  // Clear error when user fills the field
                  if (errors.length > 0) {
                    setErrors(errors.filter(err => err !== 'Please choose return time'));
                  }
                }}
                className={`w-full pl-10 pr-4 py-2 borderContinue2:24 PMrounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
errors.includes('Please choose return time') ? 'border-red-300 bg-red-50' : 'border-gray-300'
}`}
/>
</div>
</div>
</div>
</div>
  <Button
    onClick={handleSearch}
    className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-6"
  >
    Search Vehicles
  </Button>
</div>
);
}