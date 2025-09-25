import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios, { type AxiosError, type AxiosRequestHeaders } from "axios";

// Prefer local network base URL if available (fallback to previous hosted URL)
const BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_BASE ||
  "https://inda-core-backend-services.onrender.com"; // prior hosted: https://inda-core-backend-services.onrender.com

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

// ---- Additional Microlocation Endpoints ----

// Listings summary for a microlocation
type MicrolocationListingsSummary = {
  totalListings?: number;
  avgPriceNGN?: number;
  minPriceNGN?: number;
  maxPriceNGN?: number;
  [k: string]: unknown;
};
type MicrolocationListingsSummaryResponse = {
  status: string;
  data: MicrolocationListingsSummary;
};
export function useAdminMicrolocationListingsSummary(id?: string) {
  return useQuery({
    queryKey: ["admin", "microlocation", "listings-summary", id],
    queryFn: async () => {
      const { data } = await adminApi.get<MicrolocationListingsSummaryResponse>(
        `/microlocations/${id}/listings-summary`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

// Meta (distinct values for filters)
type MicrolocationMeta = {
  states?: string[];
  macroLocations?: string[];
  clusterTypes?: string[];
  tags?: string[];
  [k: string]: unknown;
};
type MicrolocationMetaResponse = { status: string; data: MicrolocationMeta };
export function useAdminMicrolocationMeta() {
  return useQuery({
    queryKey: ["admin", "microlocations", "meta"],
    queryFn: async () => {
      const { data } = await adminApi.get<MicrolocationMetaResponse>(
        "/microlocations-meta"
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

// Stats
type MicrolocationStats = {
  total?: number;
  withGeo?: number;
  withAnyMetric?: number;
  percentWithGeo?: number;
  percentWithAnyMetric?: number;
  [k: string]: unknown;
};
type MicrolocationStatsResponse = { status: string; data: MicrolocationStats };
export function useAdminMicrolocationStats() {
  return useQuery({
    queryKey: ["admin", "microlocations", "stats"],
    queryFn: async () => {
      const { data } = await adminApi.get<MicrolocationStatsResponse>(
        "/microlocations-stats"
      );
      return data.data;
    },
    refetchInterval: 60_000,
  });
}

// ---- Microlocation Mutations ----

// Helper to invalidate common microlocation queries
function invalidateMicrolocationQueries(
  qc: ReturnType<typeof useQueryClient>,
  id?: string
) {
  qc.invalidateQueries({ queryKey: ["admin", "microlocations"] });
  qc.invalidateQueries({ queryKey: ["admin", "microlocations", "stats"] });
  if (id) qc.invalidateQueries({ queryKey: ["admin", "microlocation", id] });
}

// Create
export function useCreateMicrolocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await adminApi.post("/microlocations", payload);
      return data?.data ?? data;
    },
    onSuccess: () => invalidateMicrolocationQueries(qc),
  });
}

// Update single
export function useUpdateMicrolocation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { data } = await adminApi.patch(`/microlocations/${id}`, patch);
      return data?.data ?? data;
    },
    onSuccess: () => invalidateMicrolocationQueries(qc, id),
  });
}

// Bulk update
export function useBulkUpdateMicrolocations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      ids: string[];
      set?: any;
      unset?: string[];
    }) => {
      const { data } = await adminApi.patch("/microlocations-bulk", payload);
      return data?.data ?? data;
    },
    onSuccess: () => invalidateMicrolocationQueries(qc),
  });
}

// Soft delete
export function useSoftDeleteMicrolocation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.delete(`/microlocations/${id}`);
      return data?.data ?? data;
    },
    onSuccess: () => invalidateMicrolocationQueries(qc, id),
  });
}

// Restore
export function useRestoreMicrolocation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post(`/microlocations/${id}/restore`, {});
      return data?.data ?? data;
    },
    onSuccess: () => invalidateMicrolocationQueries(qc, id),
  });
}

// Patch metrics-only fields
export function usePatchMicrolocationMetrics(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (metrics: Record<string, unknown>) => {
      const { data } = await adminApi.patch(
        `/microlocations/${id}/metrics`,
        metrics
      );
      return data?.data ?? data;
    },
    onSuccess: () => invalidateMicrolocationQueries(qc, id),
  });
}

// Update geo location
export function useUpdateMicrolocationGeo(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      const { data } = await adminApi.post(`/microlocations/${id}/geo`, {
        lat,
        lng,
      });
      return data?.data ?? data;
    },
    onSuccess: () => invalidateMicrolocationQueries(qc, id),
  });
}

// -----------------------------
// Data Pipeline (Raw / Clean / Compute)
// -----------------------------

// ---- Raw Listings ----
export type RawListingsFilters = {
  q?: string;
  source?: string;
  processed?: "true" | "false";
  page?: number;
  limit?: number;
  sort?: string; // e.g. -scrapedAt,listingUrl
  includePayload?: "true" | "false";
};
type AnyRawListing = Record<string, unknown>;
type RawListingsResponse = {
  status: string;
  data: PageList<AnyRawListing>;
};
export function useAdminRawListings(filters: RawListingsFilters) {
  return useQuery({
    queryKey: ["admin", "raw-listings", filters],
    queryFn: async () => {
      const { data } = await adminApi.get<RawListingsResponse>(
        "/raw-listings",
        { params: filters }
      );
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

// Process raw listings
type ProcessRawBody = {
  source?: string;
  limit?: number;
  since?: string;
  onlyUnprocessed?: boolean;
  headers?: Record<string, string>;
  cookie?: string;
  userAgent?: string;
};
export function useProcessRawListings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ProcessRawBody) => {
      const { data } = await adminApi.post("/raw-listings/process", body);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "raw-listings"] });
      qc.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
  });
}

// Scrape NPC (list pages only)
export function useScrapeNpc() {
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await adminApi.post("/scrape/npc", body);
      return data?.data ?? data;
    },
  });
}

// Scrape NPC Batch (list + detail)
export function useScrapeNpcBatch() {
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await adminApi.post("/scrape/npc/batch", body);
      return data?.data ?? data;
    },
  });
}

// Scrape Premium Lagos preset
export function useScrapePremiumLagos() {
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await adminApi.post("/scrape/premium-lagos", body);
      return data?.data ?? data;
    },
  });
}

// ---- Cleaned Listings ----
export type CleanedListingsFilters = {
  q?: string;
  microlocation?: string;
  state?: string;
  page?: number;
  limit?: number;
  sort?: string;
};
type CleanedListing = Record<string, unknown>;
type CleanedListingsResponse = {
  status: string;
  data: PageList<CleanedListing>;
};
export function useAdminCleanedListings(filters: CleanedListingsFilters) {
  return useQuery({
    queryKey: ["admin", "cleaned-listings", filters],
    queryFn: async () => {
      const { data } = await adminApi.get<CleanedListingsResponse>(
        "/cleaned-listings",
        { params: filters }
      );
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

// Clean pending listings mutation
export function useCleanPendingListings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { batchSize?: number }) => {
      const { data } = await adminApi.post("/clean/pending", body);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "listings"] });
      qc.invalidateQueries({ queryKey: ["admin", "cleaned-listings"] });
    },
  });
}

// ---- Computed Listings ----
export type ComputedListingsFilters = {
  q?: string;
  url?: string;
  minScore?: number;
  state?: string;
  lga?: string;
  page?: number;
  limit?: number;
  sort?: string; // default -computedAt
};
type ComputedListing = Record<string, unknown>;
type ComputedListingsResponse = {
  status: string;
  data: PageList<ComputedListing>;
};
export function useAdminComputedListings(filters: ComputedListingsFilters) {
  return useQuery({
    queryKey: ["admin", "computed-listings", filters],
    queryFn: async () => {
      const { data } = await adminApi.get<any>("/computed-listings", {
        params: filters,
      });

      const raw: any = data;

      // Shape 1: { status, data: { items, total, page, limit, pages } }
      if (raw?.data?.items && Array.isArray(raw.data.items)) {
        return raw.data;
      }

      // Shape 2: { status, data: [..], pagination: {...} }
      if (Array.isArray(raw?.data) && raw?.pagination) {
        const p = raw.pagination;
        const limitVal = p.limit ?? filters.limit ?? raw.data.length;
        const totalVal = p.total ?? raw.data.length;
        return {
          items: raw.data,
          total: totalVal,
          page: p.page ?? filters.page ?? 1,
          limit: limitVal,
          pageSize: limitVal,
          pages: p.pages ?? Math.max(1, Math.ceil(totalVal / (limitVal || 1))),
        } as PageList<ComputedListing>;
      }

      // Shape 3: { status, data: [..] }
      if (Array.isArray(raw?.data)) {
        const len = raw.data.length;
        const limitVal = filters.limit ?? len;
        return {
          items: raw.data,
          total: len,
          page: filters.page ?? 1,
          limit: limitVal,
          pageSize: limitVal,
          pages: 1,
        } as PageList<ComputedListing>;
      }

      // Shape 4: Page list directly at root
      if (raw?.items && Array.isArray(raw.items)) {
        return raw as PageList<ComputedListing>;
      }

      const limitVal = filters.limit ?? 20;
      return {
        items: [],
        total: 0,
        page: filters.page ?? 1,
        limit: limitVal,
        pageSize: limitVal,
        pages: 1,
      } as PageList<ComputedListing>;
    },
    placeholderData: keepPreviousData,
  });
}

// Compute single listing (proxy)
export function useComputeListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      query?: Record<string, unknown>;
      body?: any;
    }) => {
      const { query, body } = params || {};
      const { data } = await adminApi.post("/compute/listing", body || {}, {
        params: query,
      });
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "computed-listings"] });
      qc.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
  });
}

// Batch compute listings
export function useBatchComputeListings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (query: Record<string, unknown>) => {
      const { data } = await adminApi.post(
        "/compute/listings-batch",
        {},
        { params: query }
      );
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "computed-listings"] });
      qc.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
  });
}
