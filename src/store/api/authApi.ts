import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.config';
import type { RootState } from '../store';

export interface LoginRequest {
  type: 'user' | 'admin' | 'superadmin';
  identifier: string;
  password?: string;
  otpCode?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  userType?: string;
  message?: string;
  userData?: {
    id: number;
    username?: string;
    email?: string;
    userNumber?: string;
    districtId?: number;
    role?: number;
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
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
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;