import { baseApi } from "./baseApi";

export interface Subcategory {
  id: number;
  categoryId: number;
  categoryName?: string | null;
  name: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubcategoriesResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data: Subcategory[];
}

export interface GetSubcategoriesParams {
  categoryId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SingleSubcategoryResponse {
  success: boolean;
  message?: string;
  data: Subcategory;
}

export interface CreateSubcategoryRequest {
  categoryId: number;
  name: string;
  image?: string;
}

export interface UpdateSubcategoryRequest {
  id: number;
  categoryId: number;
  name: string;
  image?: string;
}

export const subcategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubcategories: builder.query<SubcategoriesResponse, GetSubcategoriesParams | void>({
      query: (params) => {
        if (!params) return { url: "/subcategories" };
        const queryParams: Record<string, any> = {};
        if (params.categoryId) queryParams.categoryId = params.categoryId;
        if (params.search) queryParams.search = params.search;
        if (params.page !== undefined) queryParams.page = params.page;
        if (params.limit !== undefined) queryParams.limit = params.limit;
        return {
          url: "/subcategories",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: ["Subcategory"],
    }),
    createSubcategory: builder.mutation<SingleSubcategoryResponse, CreateSubcategoryRequest>({
      query: (body) => ({
        url: "/subcategories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subcategory"],
    }),
    updateSubcategory: builder.mutation<SingleSubcategoryResponse, UpdateSubcategoryRequest>({
      query: ({ id, ...body }) => ({
        url: `/subcategories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subcategory"],
    }),
    deleteSubcategory: builder.mutation<{ success: boolean; message: string; data: { id: number } }, number>({
      query: (id) => ({
        url: `/subcategories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subcategory"],
    }),
  }),
});

export const {
  useGetSubcategoriesQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = subcategoryApi;
