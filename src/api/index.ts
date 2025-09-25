import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios, { type AxiosError, type AxiosRequestHeaders } from "axios";

// Prefer local network base URL if available (fallback to previous hosted URL)
const BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_BASE || "http://192.168.0.102:9009"; // prior hosted: https://inda-core-backend-services.onrender.com

export const adminApi = axios.create({
  baseURL: BASE_URL + "/admin",
});

// Attach token from localStorage on every request (keeps in sync with AuthGuard's key)
adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      // Ensure we mutate a headers object compatible with axios types
      config.headers = (config.headers || {}) as AxiosRequestHeaders;
      (config.headers as unknown as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${token}`;
    }
  }
  return config;
});

// Global 401/403 handler: clear token and redirect to sign-in
adminApi.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error?.response?.status;
    if (typeof window !== "undefined" && (status === 401 || status === 403)) {
      try {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_profile");
      } catch {}
      window.location.href = "/adminSignIn";
    }
    return Promise.reject(error);
  }
);

// Types for Overview endpoint
export type OverviewData = {
  properties: { total: number; addedThisWeek?: number };
  developers: { total: number };
  agents: { total: number };
  claimedProfiles: { total: number };
  pendingRequests: { total: number };
  users: { total: number; addedThisWeek?: number };
  newSalesRequests: { total: number };
  weeklyActivity?: {
    labels: string[];
    listings?: number[];
    users?: number[];
    payments?: number[];
    total?: number[];
  };
  categoryBreakdown?: Array<{ key: string; count: number; percent: number }>;
  recentActivity?: Array<{
    type: string;
    category?: "Listings" | "Users" | "Sales" | "Profiles" | string;
    title: string;
    actor: string | null;
    createdAt: string;
    meta?: Record<string, unknown>;
  }>;
};

type OverviewResponse = { status: string; data: OverviewData };

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const { data } = await adminApi.get<OverviewResponse>("/overview");
      return data.data;
    },
    staleTime: 60_000,
  });
}

// ---- Auth ----
type AdminProfile = {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
};
type LoginResponse = {
  status: string | number;
  token: string;
  admin: AdminProfile;
};
export async function adminLogin(email: string, password: string) {
  const { data } = await adminApi.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

// Additional auth endpoints per new API surface
export async function adminRegister(body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isSuperAdmin?: boolean;
}) {
  const { data } = await adminApi.post("/auth/register", body);
  return data;
}

export async function adminVerifyOtp(email: string, code: string) {
  const { data } = await adminApi.post("/auth/verify-otp", { email, code });
  return data;
}

export async function adminRequestPasswordReset(email: string) {
  const { data } = await adminApi.post("/auth/request-password-reset", {
    email,
  });
  return data;
}

export async function adminResetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  const { data } = await adminApi.post("/auth/reset-password", {
    email,
    code,
    newPassword,
  });
  return data;
}

// ---- Listings ----
export type ListingFilters = {
  q?: string;
  state?: string;
  lga?: string;
  propertyType?: string;
  status?: "active" | "sold";
  page?: number;
  limit?: number;
  sort?: string;
};

type PageList<T> = {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
};
type AnyListing = Record<string, unknown>;
type ListingsResponse = { status: string; data: PageList<AnyListing> };

export function useAdminListings(filters: ListingFilters) {
  return useQuery({
    queryKey: ["admin", "listings", filters],
    queryFn: async () => {
      const { data } = await adminApi.get<ListingsResponse>("/listings", {
        params: filters,
      });
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

// Single listing detail
type ListingDetailResponse = { status: string; data: AnyListing };
export function useAdminListing(id?: string) {
  return useQuery({
    queryKey: ["admin", "listing", id],
    queryFn: async () => {
      const { data } = await adminApi.get<ListingDetailResponse>(
        `/listings/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

// ---- Users ----
type AnyUser = Record<string, unknown>;
type UsersResponse = { status: string; data: PageList<AnyUser> };
export function useAdminUsers(params: Record<string, unknown>) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await adminApi.get<UsersResponse>("/users", {
        params,
      });
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

// Single user detail
type UserDetailResponse = { status: string; data: AnyUser };
export function useAdminUser(id?: string) {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: async () => {
      const { data } = await adminApi.get<UserDetailResponse>(`/users/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ---- Payments ----
type AnyPayment = Record<string, unknown>;
type PaymentsResponse = { status: string; data: PageList<AnyPayment> };
export function useAdminPayments(params: Record<string, unknown>) {
  return useQuery({
    queryKey: ["admin", "payments", params],
    queryFn: async () => {
      const { data } = await adminApi.get<PaymentsResponse>("/payments", {
        params,
      });
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

// Single payment
type PaymentDetailResponse = { status: string; data: AnyPayment };
export function useAdminPayment(id?: string) {
  return useQuery({
    queryKey: ["admin", "payment", id],
    queryFn: async () => {
      const { data } = await adminApi.get<PaymentDetailResponse>(
        `/payments/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

// ---- Orders ----
type OrdersResponse = {
  status: string;
  data: { page: number; pageSize: number; items: Record<string, unknown>[] };
};
export function useAdminOrders(page = 1, limit = 50) {
  return useQuery({
    queryKey: ["admin", "orders", { page, limit }],
    queryFn: async () => {
      const { data } = await adminApi.get<OrdersResponse>("/orders", {
        params: { page, limit },
      });
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

// Order group detail
type OrderGroupResponse = { status: string; data: Record<string, unknown> };
export function useAdminOrderGroup(groupId?: string) {
  return useQuery({
    queryKey: ["admin", "orders", groupId],
    queryFn: async () => {
      const { data } = await adminApi.get<OrderGroupResponse>(
        `/orders/${groupId}`
      );
      return data.data;
    },
    enabled: !!groupId,
  });
}

// ---- Microlocations ----
export type MicrolocationFilters = {
  q?: string;
  state?: string;
  macroLocation?: string;
  clusterType?: string;
  tag?: string; // microlocationTag
  page?: number;
  limit?: number;
  sort?: string;
};

type AnyMicrolocation = Record<string, unknown>;
type MicrolocationsResponse = {
  status: string;
  data: PageList<AnyMicrolocation>;
};
export function useAdminMicrolocations(filters: MicrolocationFilters) {
  return useQuery({
    queryKey: ["admin", "microlocations", filters],
    queryFn: async () => {
      const { data } = await adminApi.get<MicrolocationsResponse>(
        "/microlocations",
        { params: filters }
      );
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

type MicrolocationDetailResponse = { status: string; data: AnyMicrolocation };
export function useAdminMicrolocation(id?: string) {
  return useQuery({
    queryKey: ["admin", "microlocation", id],
    queryFn: async () => {
      const { data } = await adminApi.get<MicrolocationDetailResponse>(
        `/microlocations/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}
