import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from './slices/authSlice';
import adminAuthReducer from './slices/adminAuthSlice';

import { vehicleApi } from './api/vehicleApi';
import { vehicleImageApi } from './api/vehicleImageApi';
import { userApi } from './api/userApi';
import { bookingApi } from './api/bookingApi';
import { districtApi } from './api/districtApi';
import { locationApi } from './api/locationApi';
import { pickupLocationApi } from './api/pickupLocationApi';
import { paymentApi } from './api/paymentApi';
import { authApi } from './api/authApi';
import { websiteReviewApi } from './api/websiteReviewApi';
import { adminApi } from './api/adminApi';        // ← replaces adminAuthApi
import { promoCodeApi } from './api/promoCodeApi'; // ← NEW

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAuth: adminAuthReducer, // ← NEW

    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [vehicleImageApi.reducerPath]: vehicleImageApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [districtApi.reducerPath]: districtApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    [pickupLocationApi.reducerPath]: pickupLocationApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [websiteReviewApi.reducerPath]: websiteReviewApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,       // reducerPath = 'adminAuthApi' (unchanged)
    [promoCodeApi.reducerPath]: promoCodeApi.reducer, // reducerPath = 'promoCodeApi'
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      vehicleApi.middleware,
      vehicleImageApi.middleware,
      userApi.middleware,
      bookingApi.middleware,
      districtApi.middleware,
      locationApi.middleware,
      pickupLocationApi.middleware,
      paymentApi.middleware,
      authApi.middleware,
      websiteReviewApi.middleware,
      adminApi.middleware,
      promoCodeApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;