import { baseApi } from "./baseApi";

export interface Category {
  id: number;
  name: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data: Category[];
}

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SingleCategoryResponse {
  success: boolean;
  message?: string;
  data: Category;
}

export interface CreateCategoryRequest {
  name: string;
  image?: string;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
  image?: string;
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoriesResponse, GetCategoriesParams | void>({
      query: (params) => {
        if (!params) return "/categories";
        const queryParams: Record<string, any> = {};
        if (params.page !== undefined) queryParams.page = params.page;
        if (params.limit !== undefined) queryParams.limit = params.limit;
        if (params.search) queryParams.search = params.search;
        return {
          url: "/categories",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation<SingleCategoryResponse, CreateCategoryRequest>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<SingleCategoryResponse, UpdateCategoryRequest>({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<{ success: boolean; message: string; data: { id: number } }, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
