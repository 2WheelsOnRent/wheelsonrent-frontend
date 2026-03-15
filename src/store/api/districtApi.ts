import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.config';
import type { RootState } from '../store';

export interface DistrictDto {
  id: number;
  name: string;
  stateId: number;
  isActive: boolean;
}

export interface StateDto {
  id: number;
  name: string;
  isActive: boolean;
}

export const districtApi = createApi({
  reducerPath: 'districtApi',
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
  tagTypes: ['District', 'State'],
  endpoints: (builder) => ({
    getDistricts: builder.query<DistrictDto[], { page?: number; size?: number }>({
      query: ({ page = 1, size = 100 }) => `${API_ENDPOINTS.DISTRICTS}?page=${page}&size=${size}`,
      providesTags: ['District'],
    }),
    getDistrictById: builder.query<DistrictDto, number>({
      query: (id) => API_ENDPOINTS.DISTRICT_BY_ID(id),
      
    }),
    getStates: builder.query<StateDto[], { page?: number; size?: number }>({
      query: ({ page = 1, size = 100 }) => `${API_ENDPOINTS.STATES}?page=${page}&size=${size}`,
      providesTags: ['State'],
    }),
  }),
});

export const {
  useGetDistrictsQuery,
  useGetDistrictByIdQuery,
  useGetStatesQuery,
} = districtApi;