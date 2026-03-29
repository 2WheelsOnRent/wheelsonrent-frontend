import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../../config/api.config';
import type { RootState } from '../store';

// ── Auth DTOs ──────────────────────────────────────────────────────────────

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

export interface AdminForgotPasswordRequest {
  email: string;
}

export interface AdminForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface AdminVerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AdminVerifyOtpResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface AdminResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface AdminResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface AdminChangePasswordRequest {
  adminId: number;
  currentPassword: string;
  newPassword: string;
}

export interface AdminChangePasswordResponse {
  success: boolean;
  message: string;
}

// ── Admin CRUD DTOs ────────────────────────────────────────────────────────

export interface AdminDto {
  id: number;
  username: string;
  email: string;
  districtId: number;
  role: number;           // 1 = Admin, 2 = SuperAdmin
  number: string;
  isActive: boolean;
  hasChangedPassword: boolean;
}

// ── API ────────────────────────────────────────────────────────────────────

export const adminApi = createApi({
  reducerPath: 'adminAuthApi', // keep same reducerPath so store key doesn't change
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Admin'],
  endpoints: (builder) => ({
    // ── Login ──────────────────────────────────────────────────────────
    adminLogin: builder.mutation<AdminLoginResponse, AdminLoginRequest>({
      query: (credentials) => ({
        url: 'Auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // ── Forgot Password (Step 1 — send OTP to email) ───────────────────
    adminForgotPassword: builder.mutation<AdminForgotPasswordResponse, AdminForgotPasswordRequest>({
      query: (data) => ({
        url: '/admins/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // ── Verify OTP (Step 2 — verify code, get reset token) ────────────
    adminVerifyOtp: builder.mutation<AdminVerifyOtpResponse, AdminVerifyOtpRequest>({
      query: (data) => ({
        url: '/admins/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // ── Reset Password (Step 3 — set new password) ────────────────────
    adminResetPassword: builder.mutation<AdminResetPasswordResponse, AdminResetPasswordRequest>({
      query: (data) => ({
        url: '/admins/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // ── Change Password (forced first-login change) ───────────────────
    adminChangePassword: builder.mutation({
      query: (data) => ({
        url: `/admins/${data.adminId}/change-password`,
        method: 'POST',
        body: {
          newPassword: data.newPassword,
          confirmPassword: data.newPassword
        }
      }),
    }),

    // ── Admin CRUD (SuperAdmin only) ───────────────────────────────────
    getAdmins: builder.query<AdminDto[], { page?: number; size?: number }>({
      query: ({ page = 1, size = 100 } = {}) => `/Admins?page=${page}&size=${size}`,
      providesTags: ['Admin'],
    }),
    getAdminById: builder.query<AdminDto, number>({
      query: (id) => `/Admins/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Admin', id }],
    }),
    createAdmin: builder.mutation<AdminDto, Omit<AdminDto, 'id'>>({
      query: (admin) => ({
        url: '/Admins',
        method: 'POST',
        body: admin,
      }),
      invalidatesTags: ['Admin'],
    }),
    updateAdmin: builder.mutation<void, { id: number; admin: AdminDto }>({
      query: ({ id, admin }) => ({
        url: `/Admins/${id}`,
        method: 'PUT',
        body: admin,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Admin', id }, 'Admin'],
    }),
    deleteAdmin: builder.mutation<void, number>({
      query: (id) => ({
        url: `/Admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminForgotPasswordMutation,
  useAdminVerifyOtpMutation,
  useAdminResetPasswordMutation,
  useAdminChangePasswordMutation,
  useGetAdminsQuery,
  useGetAdminByIdQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} = adminApi;

// Backward-compat alias so existing imports of adminAuthApi still work
export const adminAuthApi = adminApi;