import type { VehicleDto, VehicleDisplay } from '../types/vehicle.types';

// Vehicle image mapping based on make/model
const VEHICLE_IMAGES: Record<string, string> = {
  'honda-activa': 'https://imgd.aeplcdn.com/664x374/n/cw/ec/1/versions/--connected-obd-2b1737697110094.jpg?q=80',
  'royal-enfield': 'https://acko-cms.ackoassets.com/3_Royal_Enfield_Classic_350_Update_ce5a5abc5b.jpg',
  'tvs-jupiter': 'https://cdn.bikedekho.com/processedimages/tvs/jupiter/source/jupiter68c8080e2422c.jpg?imwidth=412&impolicy=resize',
  'suzuki-access': 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=800&h=600&fit=crop',
  'yamaha-fz': 'https://images.timesdrive.in/photo/msid-151054468,thumbsize-566229/151054468.jpg',
  'honda-shine': 'https://cdn.bikedekho.com/processedimages/honda/shine-bs6/source/shine-bs6649193c31e3e6.jpg',
  'default': 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/201293/hunter-350-2025-right-side-view-5.jpeg?isig=0',
};

/**
 * Get vehicle image URL based on make and model
 */
export const getVehicleImage = (make: string, model: string): string => {
  const key = `${make.toLowerCase().replace(/\s+/g, '-')}-${model.toLowerCase().replace(/\s+/g, '-')}`;
  return VEHICLE_IMAGES[key] || VEHICLE_IMAGES['default'];
};


/**
 * Convert VehicleDto to VehicleDisplay with additional fields
 */
export const enhanceVehicleData = (vehicle: VehicleDto, districtName?: string): VehicleDisplay => {
  return {
    ...vehicle,
    image: getVehicleImage(vehicle.make, vehicle.model),
    districtName,
  };
};

/**
 * Calculate total price for booking
 */
export const calculateTotalPrice = (
  hourlyRate: number,
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): number => {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  return hourlyRate * Math.max(hours, 1);
};

/**
 * Calculate duration in hours
 */
export const calculateDuration = (
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): number => {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
};

/**
 * Filter vehicles by price range
 */
export const filterByPrice = (
  vehicles: VehicleDisplay[],
  minPrice?: number,
  maxPrice?: number
): VehicleDisplay[] => {
  return vehicles.filter(v => {
    if (minPrice && v.hourlyRate < minPrice) return false;
    if (maxPrice && v.hourlyRate > maxPrice) return false;
    return true;
  });
};

/**
 * Filter vehicles by make
 */
export const filterByMake = (
  vehicles: VehicleDisplay[],
  make?: string
): VehicleDisplay[] => {
  if (!make) return vehicles;
  return vehicles.filter(v => v.make.toLowerCase() === make.toLowerCase());
};

/**
 * Sort vehicles
 */
export const sortVehicles = (
  vehicles: VehicleDisplay[],
  sortBy: 'recommended' | 'price-low' | 'price-high' | 'rating'
): VehicleDisplay[] => {
  const sorted = [...vehicles];
  
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.hourlyRate - b.hourlyRate);
    case 'price-high':
      return sorted.sort((a, b) => b.hourlyRate - a.hourlyRate);
    default:
      return sorted.sort();
  }
};