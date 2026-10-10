import { baseApi } from "./baseApi";

export interface Service {
  id: number;
  name: string;
  businessName: string;
  logo?: string | null;
  address: string;
  phone: string;
  whatsapp?: string | null;
  images: string[];
  categoryId: number;
  categoryName?: string | null;
  subcategoryId?: number | null;
  subcategoryName?: string | null;
  description?: string | null;
  status: "active" | "inactive";
  userId?: number | null;
  creatorName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicesResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data: Service[];
}

export interface SingleServiceResponse {
  success: boolean;
  message?: string;
  data: Service;
}

export interface GetServicesParams {
  categoryId?: number;
  subcategoryId?: number;
  status?: "active" | "inactive";
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateServiceRequest {
  name: string;
  businessName: string;
  logo?: string | null;
  address: string;
  phone: string;
  whatsapp?: string | null;
  images?: string[];
  categoryId: number;
  subcategoryId?: number | null;
  description?: string | null;
  status?: "active" | "inactive";
}

export interface UpdateServiceRequest {
  id: number;
  name?: string;
  businessName?: string;
  logo?: string | null;
  address?: string;
  phone?: string;
  whatsapp?: string | null;
  images?: string[];
  categoryId?: number;
  subcategoryId?: number | null;
  description?: string | null;
  status?: "active" | "inactive";
}

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<ServicesResponse, GetServicesParams | void>({
      query: (params) => {
        if (!params) return { url: "/services" };
        const queryParams: Record<string, any> = {};
        if (params.categoryId) queryParams.categoryId = params.categoryId;
        if (params.subcategoryId) queryParams.subcategoryId = params.subcategoryId;
        if (params.status) queryParams.status = params.status;
        if (params.search) queryParams.search = params.search;
        if (params.page !== undefined) queryParams.page = params.page;
        if (params.limit !== undefined) queryParams.limit = params.limit;
        return {
          url: "/services",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: ["Services"],
    }),
    getServiceById: builder.query<SingleServiceResponse, number>({
      query: (id) => ({
        url: `/services/${id}`,
      }),
      providesTags: ["Services"],
    }),
    createService: builder.mutation<SingleServiceResponse, CreateServiceRequest>({
      query: (body) => ({
        url: "/services",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Services", "Dashboard"],
    }),
    updateService: builder.mutation<SingleServiceResponse, UpdateServiceRequest>({
      query: ({ id, ...body }) => ({
        url: `/services/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Services", "Dashboard"],
    }),
    deleteService: builder.mutation<{ success: boolean; message: string; data: { id: number } }, number>({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Services", "Dashboard"],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;
