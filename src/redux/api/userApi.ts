import { baseApi } from "./baseApi";

export interface UserItem {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: "superadmin" | "creator" | "admin" | "staff" | "customer";
  avatar?: string | null;
  servicesViewed?: number;
  detailsViewed?: number;
  callsClicked?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserStats {
  totalUsers: number;
  customerCount: number;
  creatorCount: number;
  adminCount: number;
}

export interface UsersResponse {
  success: boolean;
  data: UserItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: UserStats;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: "superadmin" | "creator" | "admin" | "staff" | "customer";
}

export interface UpdateUserRoleRequest {
  id: number;
  role: "superadmin" | "creator" | "admin" | "staff" | "customer";
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, GetUsersParams | void>({
      query: (params) => ({
        url: "/users",
        params: params || undefined,
      }),
      providesTags: ["Users"],
    }),
    createUser: builder.mutation<{ success: boolean; message: string; data: UserItem }, CreateUserRequest>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUserRole: builder.mutation<{ success: boolean; message: string; data: { id: number; role: string } }, UpdateUserRoleRequest>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = userApi;
