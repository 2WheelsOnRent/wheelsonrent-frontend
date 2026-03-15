export interface VehicleDto {
  id: number;
  name: string;
  make: string;
  model: string;
  districtId: number;
  hourlyRate: number;
  minBookingHours: number;
  isAvailable: boolean;
  lastServiceTime?: string;
  nextServiceTime?: string;
  insuranceExpiryDate?: string;
  insuranceDetails?: string;
  kmTravelled: number;
  gpsDeviceId?: string;
}

export interface VehicleSearchParams {
  districtId?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  size?: number;
}

export interface VehicleFilters {
  priceMin?: number;
  priceMax?: number;
  make?: string;
  sortBy?: 'recommended' | 'price-low' | 'price-high' | 'rating';
}

export interface VehicleDisplay extends VehicleDto {
  image: string; 
  districtName?: string;
}