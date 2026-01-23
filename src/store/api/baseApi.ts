import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../../config/api.config';
import type { RootState } from '../store';

/**
 * Base API configuration for all endpoints
 * Includes automatic token injection and error handling
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux store
      const token = (getState() as RootState).auth.token;
      
      // Add authorization header if token exists
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Set content type
      headers.set('Content-Type', 'application/json');
      
      return headers;
    },
  }),
  tagTypes: [
    'Vehicle',
    'Booking',
    'User',
    'Admin',
    'District',
    'State',
    'Location',
    'Payment',
    'Alert',
  ],
  endpoints: () => ({}),
});

export default baseApi;