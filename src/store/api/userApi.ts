import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UserDto } from '../../types/user.types';
import type { RootState } from '../store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api';

export const userApi = createApi({
  reducerPath: 'userApi',
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
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<UserDto[], { page?: number; size?: number }>({
      query: ({ page = 1, size = 10 }) => `/Users?page=${page}&size=${size}`,
      providesTags: ['User'],
    }),
    getUserById: builder.query<UserDto, number>({
      query: (id) => `/Users/${id}`,
      //providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<UserDto, Omit<UserDto, 'id'>>({
      query: (user) => ({
        url: '/Users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<void, { id: number; user: UserDto }>({
      query: ({ id, user }) => ({
        url: `/Users/${id}`,
        method: 'PUT',
        body: user,
      }),
      //invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} = userApi;