import { baseApi } from "./baseApi";

export interface AppRelease {
  id: number;
  platform: "android" | "ios";
  version: string;
  buildNumber: string;
  downloadUrl: string;
  fileSize?: string;
  fileType: string;
  releaseNotes?: string;
  minOsVersion: string;
  isActive: number;
  downloadsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveReleaseDto {
  id?: number;
  platform: "android" | "ios";
  version: string;
  buildNumber?: string;
  downloadUrl: string;
  fileSize?: string;
  fileType?: string;
  releaseNotes?: string;
  minOsVersion?: string;
  isActive?: number;
}

export interface UploadAppResponse {
  success: boolean;
  message: string;
  downloadUrl: string;
  filename: string;
  originalName: string;
  fileSize: string;
  fileType: string;
  sizeBytes: number;
}

export const appReleaseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllReleases: builder.query<{ success: boolean; data: AppRelease[] }, void>({
      query: () => "/app-releases",
      providesTags: ["AppReleases"],
    }),
    saveRelease: builder.mutation<{ success: boolean; message: string; id?: number }, SaveReleaseDto>({
      query: (body) => ({
        url: "/app-releases",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AppReleases"],
    }),
    deleteRelease: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/app-releases/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AppReleases"],
    }),
    uploadAppBinary: builder.mutation<UploadAppResponse, FormData>({
      query: (formData) => ({
        url: "/app-releases/upload",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetAllReleasesQuery,
  useSaveReleaseMutation,
  useDeleteReleaseMutation,
  useUploadAppBinaryMutation,
} = appReleaseApi;
