import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta.env.VITE_API_URL as string) || "https://apiwideservice.widetechbd.com/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("wide_auth_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Auth", "Users", "Services", "Category", "Subcategory", "Dashboard", "Notifications"],
  endpoints: () => ({}),
});
