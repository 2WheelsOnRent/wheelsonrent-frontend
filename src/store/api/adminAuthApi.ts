import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../../../src/config/api.config';
import type { RootState } from '../store';

export interface AdminLoginRequest {
  type: 'admin' | 'superadmin';
  identifier: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  userType?: string;
  message?: string;
  userData?: {
    id: number;
    username: string;
    email: string;
    districtId: number;
    role: number;
    number: string;
  };
}

export const adminAuthApi = createApi({
  reducerPath: 'adminAuthApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    adminLogin: builder.mutation<AdminLoginResponse, AdminLoginRequest>({
      query: (credentials) => ({
        url: 'Auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useAdminLoginMutation } = adminAuthApi;
