import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './api/authApi';
import { vehicleApi } from './api/vehicleApi';
import { bookingApi } from './api/bookingApi';
import { userApi } from './api/userApi';
import { districtApi } from './api/districtApi';
import { locationApi } from './api/locationApi';
import { paymentApi } from './api/paymentApi';
import { vehicleImageApi } from './api/vehicleImageApi'; // NEW
import { websiteReviewApi } from './api/websiteReviewApi'; // NEW
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    // Add RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [districtApi.reducerPath]: districtApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [vehicleImageApi.reducerPath]: vehicleImageApi.reducer, // NEW
    [websiteReviewApi.reducerPath]: websiteReviewApi.reducer, // NEW
    // Add regular reducers
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['authApi/executeMutation/fulfilled'],
      },
    }).concat(
      authApi.middleware,
      vehicleApi.middleware,
      bookingApi.middleware,
      userApi.middleware,
      districtApi.middleware,
      locationApi.middleware,
      paymentApi.middleware,
      vehicleImageApi.middleware, // NEW
      websiteReviewApi.middleware // NEW
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;