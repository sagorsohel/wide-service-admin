import { baseApi } from "./baseApi";

export interface DashboardCounts {
  services: number;
  activeServices: number;
  inactiveServices: number;
  categories: number;
  subcategories: number;
  users: number;
  bookings: number;
  pendingBookings?: number;
  completedBookings?: number;
  images: number;
}

export interface ServicesByCategoryItem {
  categoryId: number;
  categoryName: string | null;
  serviceCount: number;
}

export interface SubcategoriesByCategoryItem {
  categoryId: number;
  subcategoryCount: number;
}

export interface UsersByRoleItem {
  role: string;
  userCount: number;
}

export interface RecentServiceItem {
  id: number;
  name: string;
  businessName: string;
  logo: string | null;
  categoryId: number;
  categoryName: string | null;
  subcategoryId: number | null;
  subcategoryName: string | null;
  phone: string;
  whatsapp: string | null;
  status: "active" | "inactive";
  createdAt: string;
}

export interface RecentCategoryItem {
  id: number;
  name: string;
  image: string | null;
  createdAt: string;
}

export interface RecentUserItem {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  createdAt: string;
}

export interface SystemInfo {
  database: string;
  dbStatus: string;
  serverTime: string;
  imageServer: string;
}

export interface DashboardStatsData {
  counts: DashboardCounts;
  servicesByCategory: ServicesByCategoryItem[];
  subcategoriesByCategory: SubcategoriesByCategoryItem[];
  usersByRole: UsersByRoleItem[];
  recentServices: RecentServiceItem[];
  recentCategories: RecentCategoryItem[];
  recentUsers: RecentUserItem[];
  systemInfo?: SystemInfo;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStatsData;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardResponse, void>({
      query: () => "/dashboard/stats",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
