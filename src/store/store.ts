import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from './slices/authSlice';

// All API slices
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
import { adminAuthApi } from './api/adminAuthApi';  

export const store = configureStore({
  reducer: {
    auth: authReducer,

    // RTK Query reducers
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
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,     
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
      adminAuthApi.middleware,      
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
