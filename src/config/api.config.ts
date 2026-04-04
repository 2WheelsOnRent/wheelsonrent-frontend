export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASEURL || 'https://app.scootyonrent.com/api',
  GOOGLE_MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `Auth/login`,
  SENDOTP: `Auth/send-otp`,
  VERIFYOTP: `Auth/verify-otp`,
  LOGOUT: `Auth/logout`,
  REFRESH: `Auth/refresh`,

  // Admin Management (under /admin/ prefix)
  ADMINS: '/admin/Admins',
  ADMIN_BY_ID: (id: number) => `/admin/Admins/${id}`,

  // User Management (admin only, under /admin/ prefix)
  USERS: '/admin/Users',
  USER_BY_ID: (id: number) => `/admin/Users/${id}`,

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

  // Alerts (admin only, under /admin/ prefix)
  ALERTS_BY_ADMIN: (adminId: number) => `/admin/Alerts/admin/${adminId}`,
  MARK_ALERT_READ: (id: number) => `/admin/Alerts/${id}/read`,

  // Offline Bookings
OFFLINE_BOOKINGS: 'OfflineBookings',

  // Pickup Locations (NEW)
  PICKUP_LOCATIONS: '/PickupLocations',
  PICKUP_LOCATIONS_BY_DISTRICT: (districtId: number) => `/PickupLocations/district/${districtId}`,
  PICKUP_LOCATIONS_ACTIVE_BY_DISTRICT: (districtId: number) => `/PickupLocations/district/${districtId}/active`,

  INITIATEPAYMENT: `Payments/initiate`,
  VERIFYPAYMENT: `Payments/verify`,
  // Website Reviews (NEW)
  WEBSITE_REVIEWS: '/WebsiteReviews',
  WEBSITE_REVIEWS_ACTIVE: '/WebsiteReviews/active',
  WEBSITE_REVIEW_BY_ID: (id: number) => `/WebsiteReviews/${id}`,

  // Promo Codes (NEW)
  PROMO_CODES: '/PromoCodes',
  PROMO_CODE_BY_ID: (id: number) => `/PromoCodes/${id}`,
  PROMO_CODES_ACTIVE: '/PromoCodes/active',
  PROMO_CODE_VALIDATE: '/PromoCodes/validate',

  // Admin Password Management (NEW)
  ADMIN_FORGOT_PASSWORD: 'Auth/admin/forgot-password',
  ADMIN_VERIFY_OTP: 'Auth/admin/verify-otp',
  ADMIN_RESET_PASSWORD: 'Auth/admin/reset-password',
  ADMIN_CHANGE_PASSWORD: 'Auth/admin/change-password',
};
export const EASEBUZZ_CONFIG = {
  MERCHANT_KEY: 'W0JXM1KFH7',
  MERCHANT_SALT: 'ZHVQXJKEI0',
  PAYMENT_URL: 'https://testpay.easebuzz.in/payment/initiateLink', // Test URL
  // PAYMENT_URL: 'https://pay.easebuzz.in/payment/initiateLink', // Production URL
};
export default API_CONFIG;