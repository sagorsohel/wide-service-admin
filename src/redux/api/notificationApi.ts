import { baseApi } from "./baseApi";

export interface PushNotificationItem {
  id: number;
  title: string;
  body: string;
  imageUrl?: string | null;
  scheduledAt?: string | null;
  status: "pending" | "sent" | "failed" | "cancelled";
  target: "all" | "users_only" | "guests_only";
  successCount?: number;
  failureCount?: number;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsListResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: PushNotificationItem[];
}

export interface NotificationStatsResponse {
  success: boolean;
  data: {
    totalDevices: number;
    totalSent: number;
    totalPending: number;
  };
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  target: "all" | "users_only" | "guests_only";
  scheduledAt?: string | null;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsListResponse,
      { page?: number; limit?: number; status?: string; search?: string } | void
    >({
      query: (params) => ({
        url: "/notifications",
        params: params || {},
      }),
      providesTags: ["Notifications"],
    }),

    getNotificationStats: builder.query<NotificationStatsResponse, void>({
      query: () => "/notifications/stats",
      providesTags: ["Notifications"],
    }),

    sendNotification: builder.mutation<
      { success: boolean; message: string; data: any },
      SendNotificationPayload
    >({
      query: (body) => ({
        url: "/notifications/send",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    cancelNotification: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/notifications/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    deleteNotification: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationStatsQuery,
  useSendNotificationMutation,
  useCancelNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApi;
