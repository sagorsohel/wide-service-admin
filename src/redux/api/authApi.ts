import { baseApi } from "./baseApi";
import type { User } from "../slices/authSlice";

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    role: "superadmin" | "creator" | "admin" | "staff" | "customer";
    token: string;
  };
}

export interface RegisterCreatorRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface RegisterCreatorResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    role: "creator";
    token: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    registerCreator: builder.mutation<RegisterCreatorResponse, RegisterCreatorRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: { ...userData, role: "creator" },
      }),
      invalidatesTags: ["Auth"],
    }),
    getMe: builder.query<ProfileResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useRegisterCreatorMutation, useGetMeQuery } = authApi;
