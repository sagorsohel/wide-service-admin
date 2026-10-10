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
  data: Subcategory[];
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
    getSubcategories: builder.query<SubcategoriesResponse, { categoryId?: number } | void>({
      query: (params) => ({
        url: "/subcategories",
        params: params && params.categoryId ? { categoryId: params.categoryId } : undefined,
      }),
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
