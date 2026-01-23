export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5086/api',
  TIMEOUT: 30000,
  OTP_BYPASS: import.meta.env.VITE_OTP_BYPASS || '123456',
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/Auth/login',
  
  // Admins
  ADMINS: '/Admins',
  ADMIN_BY_ID: (id: number) => `/Admins/${id}`,
  
  // Users
  USERS: '/Users',
  USER_BY_ID: (id: number) => `/Users/${id}`,
  
  // Vehicles
  VEHICLES: '/Vehicles',
  VEHICLE_BY_ID: (id: number) => `/Vehicles/${id}`,
  AVAILABLE_VEHICLES: '/Vehicles/available',
  
  // Vehicle Images (NEW)
  VEHICLE_IMAGES: '/VehicleImages',
  VEHICLE_IMAGES_BY_VEHICLE: (vehicleId: number) => `/VehicleImages/vehicle/${vehicleId}`,
  
  // Bookings
  BOOKINGS: '/Bookings',
  BOOKING_BY_ID: (id: number) => `/Bookings/${id}`,
  BOOKINGS_BY_USER: (userId: number) => `/Bookings/user/${userId}`,
  
  // Locations
  LOCATIONS: '/Locations',
  LOCATIONS_BY_DISTRICT: (districtId: number) => `/Locations/district/${districtId}`,
  
  // Districts
  DISTRICTS: '/Districts',
  DISTRICT_BY_ID: (id: number) => `/Districts/${id}`,
  
  // States
  STATES: '/States',
  STATE_BY_ID: (id: number) => `/States/${id}`,
  
  // Payments
  PAYMENTS: '/Payments',
  PAYMENTS_BY_USER: (userId: number) => `/Payments/user/${userId}`,
  
  // Alerts
  ALERTS_BY_ADMIN: (adminId: number) => `/Alerts/admin/${adminId}`,
  MARK_ALERT_READ: (id: number) => `/Alerts/${id}/read`,
  
  // Website Reviews (NEW)
  WEBSITE_REVIEWS: '/WebsiteReviews',
  WEBSITE_REVIEWS_ACTIVE: '/WebsiteReviews/active',
  WEBSITE_REVIEW_BY_ID: (id: number) => `/WebsiteReviews/${id}`,
};

export default API_CONFIG;