import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PaymentDto } from '../../types/payment.types';
import type { RootState } from '../store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentDto[], { page?: number; size?: number }>({
      query: ({ page = 1, size = 10 }) => `/Payments?page=${page}&size=${size}`,
      providesTags: ['Payment'],
    }),
    getPaymentsByUserId: builder.query<PaymentDto[], number>({
      query: (userId) => `/Payments/user/${userId}`,
      providesTags: ['Payment'],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentsByUserIdQuery,
} = paymentApi;
