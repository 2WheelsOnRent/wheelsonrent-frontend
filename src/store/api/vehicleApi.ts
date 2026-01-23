import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.config';
import type { RootState } from '../store';

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

export const vehicleApi = createApi({
  reducerPath: 'vehicleApi',
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
  tagTypes: ['Vehicle'],
  endpoints: (builder) => ({
    getVehicles: builder.query<VehicleDto[], { page?: number; size?: number }>({
      query: ({ page = 1, size = 10 }) => `${API_ENDPOINTS.VEHICLES}?page=${page}&size=${size}`,
      providesTags: ['Vehicle'],
    }),
    getVehicleById: builder.query<VehicleDto, number>({
      query: (id) => API_ENDPOINTS.VEHICLE_BY_ID(id)
      //providesTags: (result, error, id) => [{ type: 'Vehicle', id }],
    }),
    getAvailableVehicles: builder.query<
      VehicleDto[],
      { districtId: number; start: string; end: string }
    >({
      query: ({ districtId, start, end }) =>
        `${API_ENDPOINTS.AVAILABLE_VEHICLES}?districtId=${districtId}&start=${start}&end=${end}`,
      providesTags: ['Vehicle'],
    }),
    createVehicle: builder.mutation<VehicleDto, Omit<VehicleDto, 'id'>>({
      query: (vehicle) => ({
        url: API_ENDPOINTS.VEHICLES,
        method: 'POST',
        body: vehicle,
      }),
      invalidatesTags: ['Vehicle'],
    }),
    updateVehicle: builder.mutation<void, { id: number; vehicle: VehicleDto }>({
      query: ({ id, vehicle }) => ({
        url: API_ENDPOINTS.VEHICLE_BY_ID(id),
        method: 'PUT',
        body: vehicle,
      }),
      //invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }, 'Vehicle'],
    }),
    deleteVehicle: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.VEHICLE_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useGetVehicleByIdQuery,
  useGetAvailableVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehicleApi;