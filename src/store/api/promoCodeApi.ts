import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import APICONFIG from '../../config/api.config';

export interface PromoCodeDto {
  id: number;
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  maxUses?: number;
  usedCount: number;
  isFirstRideOnly: boolean;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidatePromoCodeDto {
  code: string;
  userId: number;
  orderAmount: number;
}

export interface PromoValidationResultDto {
  isValid: boolean;
  message?: string;
  discountAmount: number;
  finalAmount: number;
  promoCodeId?: number;
}

export const promoCodeApi = createApi({
  reducerPath: 'promoCodeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: APICONFIG.BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['PromoCode'],
  endpoints: (builder) => ({
    getPromoCodes: builder.query<PromoCodeDto[], { page?: number; size?: number }>({
      query: ({ page = 1, size = 50 } = {}) =>
        `PromoCodes?page=${page}&size=${size}`,
      providesTags: ['PromoCode'],
    }),
    getPromoCodeById: builder.query<PromoCodeDto, number>({
      query: (id) => `PromoCodes/${id}`,
      providesTags: ['PromoCode'],
    }),
    createPromoCode: builder.mutation<PromoCodeDto, Partial<PromoCodeDto>>({
      query: (body) => ({ url: 'PromoCodes', method: 'POST', body }),
      invalidatesTags: ['PromoCode'],
    }),
    updatePromoCode: builder.mutation<void, { id: number; body: Partial<PromoCodeDto> }>({
      query: ({ id, body }) => ({ url: `PromoCodes/${id}`, method: 'PUT', body }),
      invalidatesTags: ['PromoCode'],
    }),
    deletePromoCode: builder.mutation<void, number>({
      query: (id) => ({ url: `PromoCodes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['PromoCode'],
    }),
    validatePromoCode: builder.mutation<PromoValidationResultDto, ValidatePromoCodeDto>({
      query: (body) => ({ url: 'PromoCodes/validate', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetPromoCodesQuery,
  useGetPromoCodeByIdQuery,
  useCreatePromoCodeMutation,
  useUpdatePromoCodeMutation,
  useDeletePromoCodeMutation,
  useValidatePromoCodeMutation,
} = promoCodeApi;