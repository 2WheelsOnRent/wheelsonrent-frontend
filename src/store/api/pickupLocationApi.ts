import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../../config/api.config';
import type { RootState } from '../store';

export interface PickupLocationDto {
  id: number;
  name: string;
  districtId: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  displayOrder: number;
}

export const pickupLocationApi = createApi({
  reducerPath: 'pickupLocationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['PickupLocation'],
  endpoints: (builder) => ({
    getPickupLocations: builder.query<PickupLocationDto[], { page?: number; size?: number }>({
      query: ({ page = 1, size = 100 }) => `/PickupLocations?page=${page}&size=${size}`,
      providesTags: ['PickupLocation'],
    }),
    getPickupLocationById: builder.query<PickupLocationDto, number>({
      query: (id) => `/PickupLocations/${id}`,
      providesTags: (result, error, id) => [{ type: 'PickupLocation', id }],
    }),
    getPickupLocationsByDistrict: builder.query<PickupLocationDto[], number>({
      query: (districtId) => `/PickupLocations/district/${districtId}`,
      providesTags: ['PickupLocation'],
    }),
    getActivePickupLocationsByDistrict: builder.query<PickupLocationDto[], number>({
      query: (districtId) => `/PickupLocations/district/${districtId}/active`,
      providesTags: ['PickupLocation'],
    }),
    createPickupLocation: builder.mutation<PickupLocationDto, Omit<PickupLocationDto, 'id'>>({
      query: (location) => ({
        url: '/PickupLocations',
        method: 'POST',
        body: location,
      }),
      invalidatesTags: ['PickupLocation'],
    }),
    updatePickupLocation: builder.mutation<void, { id: number; location: PickupLocationDto }>({
      query: ({ id, location }) => ({
        url: `/PickupLocations/${id}`,
        method: 'PUT',
        body: location,
      }),
      invalidatesTags: ['PickupLocation'],
    }),
    deletePickupLocation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/PickupLocations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PickupLocation'],
    }),
  }),
});

export const {
  useGetPickupLocationsQuery,
  useGetPickupLocationByIdQuery,
  useGetPickupLocationsByDistrictQuery,
  useGetActivePickupLocationsByDistrictQuery,
  useCreatePickupLocationMutation,
  useUpdatePickupLocationMutation,
  useDeletePickupLocationMutation,
} = pickupLocationApi;