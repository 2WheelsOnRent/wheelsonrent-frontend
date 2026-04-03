import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../../config/api.config';
import type { RootState } from '../store';

export interface PromoCodeDto {
  id: number;
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt?: string;
}

export interface ValidatePromoCodeRequest {
  code: string;
  orderAmount: number;
  userId: number;
}

export interface ValidatePromoCodeResponse {
  success: boolean;
  message: string;
  discountAmount?: number;
  promoCode?: PromoCodeDto;
}

export const promoCodeApi = createApi({
  reducerPath: 'promoCodeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['PromoCode'],
  endpoints: (builder) => ({
    getPromoCodes: builder.query<PromoCodeDto[], { page?: number; size?: number }>({
      query: ({ page = 1, size = 100 } = {}) => `/PromoCodes?page=${page}&size=${size}`,
      providesTags: ['PromoCode'],
    }),
    getPromoCodeById: builder.query<PromoCodeDto, number>({
      query: (id) => `/PromoCodes/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'PromoCode', id }],
    }),
    getActivePromoCodes: builder.query<PromoCodeDto[], void>({
      query: () => '/PromoCodes/active',
      providesTags: ['PromoCode'],
    }),
    validatePromoCode: builder.mutation<ValidatePromoCodeResponse, ValidatePromoCodeRequest>({
      query: (data) => ({
        url: '/PromoCodes/validate',
        method: 'POST',
        body: data,
      }),
    }),
    createPromoCode: builder.mutation<PromoCodeDto, Omit<PromoCodeDto, 'id' | 'usedCount' | 'createdAt'>>({
      query: (promo) => ({
        url: '/PromoCodes',
        method: 'POST',
        body: promo,
      }),
      invalidatesTags: ['PromoCode'],
    }),
    updatePromoCode: builder.mutation<void, { id: number; promo: PromoCodeDto }>({
      query: ({ id, promo }) => ({
        url: `/PromoCodes/${id}`,
        method: 'PUT',
        body: promo,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'PromoCode', id }, 'PromoCode'],
    }),
    deletePromoCode: builder.mutation<void, number>({
      query: (id) => ({
        url: `/PromoCodes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PromoCode'],
    }),
  }),
});

export const {
  useGetPromoCodesQuery,
  useGetPromoCodeByIdQuery,
  useGetActivePromoCodesQuery,
  useValidatePromoCodeMutation,
  useCreatePromoCodeMutation,
  useUpdatePromoCodeMutation,
  useDeletePromoCodeMutation,
} = promoCodeApi;