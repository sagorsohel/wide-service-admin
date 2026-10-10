import { baseApi } from "./baseApi";

export interface UploadResponse {
  success: boolean;
  message: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface UploadMultipleResponse {
  success: boolean;
  message: string;
  urls: string[];
  data: UploadResponse[];
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
    }),
    uploadMultipleImages: builder.mutation<UploadMultipleResponse, FormData>({
      query: (formData) => ({
        url: "/upload/multiple",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useUploadImageMutation, useUploadMultipleImagesMutation } = uploadApi;
