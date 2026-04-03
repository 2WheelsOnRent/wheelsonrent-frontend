import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../../config/api.config';
import type { RootState } from '../store';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      
      const token = (getState() as RootState).auth.token;
      
     
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      
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