import type {
  QuestionnaireDetailResponse,
  QuestionnaireFilters,
  QuestionnaireListResponse,
  QuestionnaireStats,
  QuestionnaireStatus,
  QuestionnaireUserSubmissions,
} from "@/types/questionnaire";
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
  const { data } = await adminApi.post<LoginResponse>("/login", {
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
  const { data } = await adminApi.post("/register", body);
  return data;
}

export async function adminVerifyOtp(email: string, code: string) {
  const { data } = await adminApi.post("/verify-otp", { email, code });
  return data;
}

export async function adminRequestPasswordReset(email: string) {
  const { data } = await adminApi.post("/request-password-reset", {
    email,
  });
  return data;
}

export async function adminResetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  const { data } = await adminApi.post("/reset-password", {
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

// Payment Reconciliation
export type ReconciliationResult = {
  reference: string;
  userId?: string;
  listingId?: string;
  plan?: string;
  amountNGN?: number;
  beforeStatus: string;
  afterStatus: string;
  verificationStatus: string;
  paidAt?: string;
  emailSent?: boolean;
  action: string;
  error?: string;
};

export type ReconciliationResponse = {
  date: {
    input: string;
    start: string;
    end: string;
  };
  dryRun: boolean;
  totals: {
    examined: number;
    markedSuccess: number;
    updatedOther: number;
    unchanged: number;
    emailSent: number;
    errors: number;
  };
  results: ReconciliationResult[];
};

export type ReconcilePayload = {
  date: string;
  statuses?: string[];
  plan?: string;
  userId?: string;
  dryRun?: boolean;
};

type ReconcileApiResponse = { status: string; data: ReconciliationResponse };

export function useReconcilePayments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ReconcilePayload) => {
      const { data } = await adminApi.post<ReconcileApiResponse>(
        "/payments/reconcile",
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      // Invalidate payments list after reconciliation
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
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

// ---- Questionnaires ----
type QuestionnaireStatsApiResponse = {
  status: string | number;
  data: QuestionnaireStats;
};
export function useAdminQuestionnaireStats() {
  return useQuery({
    queryKey: ["admin", "questionnaires", "stats"],
    queryFn: async () => {
      const { data } = await adminApi.get<QuestionnaireStatsApiResponse>(
        "/questionnaires/stats"
      );
      return data.data;
    },
    staleTime: 60_000,
  });
}

type QuestionnaireListApiResponse = {
  status: string | number;
  data: QuestionnaireListResponse;
};
export function useAdminQuestionnaires(filters: QuestionnaireFilters) {
  return useQuery({
    queryKey: ["admin", "questionnaires", filters],
    queryFn: async () => {
      const { data } = await adminApi.get<QuestionnaireListApiResponse>(
        "/questionnaires",
        {
          params: filters,
        }
      );
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

type QuestionnaireDetailApiResponse = {
  status: string | number;
  data: QuestionnaireDetailResponse;
};
export function useAdminQuestionnaire(id?: string) {
  return useQuery({
    queryKey: ["admin", "questionnaire", id],
    queryFn: async () => {
      const { data } = await adminApi.get<QuestionnaireDetailApiResponse>(
        `/questionnaires/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

type QuestionnaireUserApiResponse = {
  status: string | number;
  data: QuestionnaireUserSubmissions;
};
export function useAdminQuestionnairesByUser(userId?: string) {
  return useQuery({
    queryKey: ["admin", "questionnaires", "user", userId],
    queryFn: async () => {
      const { data } = await adminApi.get<QuestionnaireUserApiResponse>(
        `/questionnaires/user/${userId}`
      );
      return data.data;
    },
    enabled: !!userId,
  });
}

export function getQuestionnaireExportUrl(filters: QuestionnaireFilters = {}) {
  const base = adminApi.defaults.baseURL ?? `${BASE_URL}/admin`;
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
  });

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) params.append("token", token);
  }

  const query = params.toString();
  return query
    ? `${base}/questionnaires/export?${query}`
    : `${base}/questionnaires/export`;
}

type QuestionnaireMutationResponse = {
  status: string | number;
  data: QuestionnaireDetailResponse;
};

type UpdateQuestionnaireStatusVariables = {
  id: string;
  status: QuestionnaireStatus;
  notes?: string;
  userId?: string;
};
export function useUpdateQuestionnaireStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateQuestionnaireStatusVariables) => {
      const { data } = await adminApi.patch<QuestionnaireMutationResponse>(
        `/questionnaires/${id}/status`,
        body
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "questionnaires"] });
      qc.invalidateQueries({ queryKey: ["admin", "questionnaires", "stats"] });
      qc.invalidateQueries({
        queryKey: ["admin", "questionnaire", variables.id],
      });
      if (variables.userId) {
        qc.invalidateQueries({
          queryKey: ["admin", "questionnaires", "user", variables.userId],
        });
      }
    },
  });
}

type UpdateQuestionnaireVariables = {
  id: string;
  payload: Record<string, unknown>;
  userId?: string;
};
export function useUpdateQuestionnaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: UpdateQuestionnaireVariables) => {
      const { data } = await adminApi.patch<QuestionnaireMutationResponse>(
        `/questionnaires/${id}`,
        payload
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "questionnaires"] });
      qc.invalidateQueries({ queryKey: ["admin", "questionnaires", "stats"] });
      qc.invalidateQueries({
        queryKey: ["admin", "questionnaire", variables.id],
      });
      if (variables.userId) {
        qc.invalidateQueries({
          queryKey: ["admin", "questionnaires", "user", variables.userId],
        });
      }
    },
  });
}

type CancelQuestionnaireVariables = {
  id: string;
  reason?: string;
  userId?: string;
};
export function useCancelQuestionnaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: CancelQuestionnaireVariables) => {
      const config = reason ? { data: { reason } } : undefined;
      const { data } = await adminApi.delete<QuestionnaireMutationResponse>(
        `/questionnaires/${id}`,
        config
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "questionnaires"] });
      qc.invalidateQueries({ queryKey: ["admin", "questionnaires", "stats"] });
      qc.invalidateQueries({
        queryKey: ["admin", "questionnaire", variables.id],
      });
      if (variables.userId) {
        qc.invalidateQueries({
          queryKey: ["admin", "questionnaires", "user", variables.userId],
        });
      }
    },
  });
}

// Lookup listing by URL
export function useAdminListingByUrl(url?: string) {
  return useQuery({
    queryKey: ["admin", "listings", "by-url", url],
    queryFn: async () => {
      const { data } = await adminApi.get<{
        status?: string;
        data?: Record<string, unknown> | null;
      }>("/listings/by-url", { params: { url } });
      return (data?.data ?? null) as Record<string, unknown> | null;
    },
    enabled: !!url,
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
      try {
        const { data } = await adminApi.get<MicrolocationsResponse>(
          "/microlocations",
          { params: filters }
        );
        return data.data;
      } catch (err) {
        const e = err as AxiosError;
        if (e.response?.status === 404) {
          const limitVal = filters.limit ?? 20;
          return {
            items: [],
            total: 0,
            page: filters.page ?? 1,
            limit: limitVal,
            pageSize: limitVal,
            pages: 1,
          } as PageList<AnyMicrolocation>;
        }
        throw err;
      }
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
      try {
        const { data } = await adminApi.get<MicrolocationMetaResponse>(
          "/microlocations-meta"
        );
        return data.data;
      } catch (err) {
        const e = err as AxiosError;
        if (e.response?.status === 404) {
          return { states: [], macroLocations: [], clusterTypes: [], tags: [] };
        }
        throw err;
      }
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
      try {
        const { data } = await adminApi.get<MicrolocationStatsResponse>(
          "/microlocations-stats"
        );
        return data.data;
      } catch (err) {
        const e = err as AxiosError;
        if (e.response?.status === 404) {
          return { total: 0 } as MicrolocationStats;
        }
        throw err;
      }
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
      set?: Record<string, unknown>;
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

// Manual clean selected listings
export function useCleanListingsManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await adminApi.post("/clean/listings", body);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cleaned-listings"] });
      qc.invalidateQueries({ queryKey: ["admin", "listings"] });
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
      const { data } = await adminApi.get<
        | ComputedListingsResponse
        | {
            status?: string;
            data?: unknown;
            pagination?: {
              page?: number;
              limit?: number;
              total?: number;
              pages?: number;
            };
            items?: unknown[]; // alternate root shape
          }
      >("/computed-listings", {
        params: filters,
      });
      const raw = data as any; // internal flexible parsing

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

// -----------------------------
// Runtime Config (Admin)
// -----------------------------

export type RuntimeConfig = Record<string, unknown>;
type RuntimeConfigResponse = { status: string; data: RuntimeConfig };

export function useAdminRuntimeConfig() {
  return useQuery({
    queryKey: ["admin", "runtime-config"],
    queryFn: async () => {
      const { data } = await adminApi.get<RuntimeConfigResponse>(
        "/runtime-config"
      );
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function usePatchRuntimeConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { data } = await adminApi.patch("/runtime-config", patch);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "runtime-config"] });
    },
  });
}

// -----------------------------
// Microlocation Datasets (FMV / Appreciation / Yields)
// -----------------------------

export type MicrolocationDatasetType = "fmv" | "appreciation" | "yields";
export type MicrolocationDatasetItem = Record<string, unknown>;

type MicrolocationDatasetListResponse = {
  status: string;
  data:
    | PageList<MicrolocationDatasetItem>
    | {
        items: MicrolocationDatasetItem[];
        total?: number;
        page?: number;
        limit?: number;
      };
};

export function useMicrolocationDataset(
  dataset: MicrolocationDatasetType,
  params: {
    page?: number;
    limit?: number;
    q?: string;
    state?: string;
    microlocation?: string;
    sort?: string;
  }
) {
  return useQuery({
    queryKey: ["admin", "microlocations-dataset", dataset, params],
    queryFn: async () => {
      try {
        const basePath =
          dataset === "fmv"
            ? "/microlocation-fmv"
            : dataset === "appreciation"
            ? "/microlocation-appreciation"
            : "/microlocation-yields";
        const { data } = await adminApi.get<MicrolocationDatasetListResponse>(
          basePath,
          { params }
        );
        const raw: any = data?.data;
        if (raw?.items && Array.isArray(raw.items)) {
          const limitVal = (raw.limit ??
            params.limit ??
            raw.items.length) as number;
          const totalVal = (raw.total ?? raw.items.length) as number;
          return {
            items: raw.items,
            total: totalVal,
            page: (raw.page ?? params.page ?? 1) as number,
            limit: limitVal,
            pageSize: limitVal,
            pages: Math.max(1, Math.ceil(totalVal / (limitVal || 1))),
          } as PageList<MicrolocationDatasetItem>;
        }
        return raw as PageList<MicrolocationDatasetItem>;
      } catch (err) {
        const e = err as AxiosError;
        if (e.response?.status === 404) {
          const limitVal = params.limit ?? 20;
          return {
            items: [],
            total: 0,
            page: params.page ?? 1,
            limit: limitVal,
            pageSize: limitVal,
            pages: 1,
          } as PageList<MicrolocationDatasetItem>;
        }
        throw err;
      }
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateMicrolocationDatasetItem(
  dataset: MicrolocationDatasetType
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const basePath =
        dataset === "fmv"
          ? "/microlocation-fmv"
          : dataset === "appreciation"
          ? "/microlocation-appreciation"
          : "/microlocation-yields";
      const { data } = await adminApi.post(basePath, body);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin", "microlocations-dataset", dataset],
      });
    },
  });
}

export function usePatchMicrolocationDatasetItem(
  dataset: MicrolocationDatasetType,
  id: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const basePath =
        dataset === "fmv"
          ? "/microlocation-fmv"
          : dataset === "appreciation"
          ? "/microlocation-appreciation"
          : "/microlocation-yields";
      const { data } = await adminApi.patch(`${basePath}/${id}`, patch);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin", "microlocations-dataset", dataset],
      });
    },
  });
}

export function useDeleteMicrolocationDatasetItem(
  dataset: MicrolocationDatasetType,
  id: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const basePath =
        dataset === "fmv"
          ? "/microlocation-fmv"
          : dataset === "appreciation"
          ? "/microlocation-appreciation"
          : "/microlocation-yields";
      const { data } = await adminApi.delete(`${basePath}/${id}`);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["admin", "microlocations-dataset", dataset],
      });
    },
  });
}

// -----------------------------
// Computed Listings: extras
// -----------------------------

// Get a computed listing by URL (exact)
export function useAdminComputedByUrl(url?: string) {
  return useQuery({
    queryKey: ["admin", "computed-listings", "by-url", url],
    queryFn: async () => {
      const { data } = await adminApi.get<{
        status?: string;
        data?: Record<string, unknown> | null;
      }>("/computed-listings/by-url", { params: { url } });
      return (data?.data ?? null) as Record<string, unknown> | null;
    },
    enabled: !!url,
  });
}

// Patch override fields on a computed listing
export function usePatchComputedListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { data } = await adminApi.patch(`/computed-listings/${id}`, patch);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "computed-listings"] });
    },
  });
}

// Delete AI report attached to a computed listing
export function useDeleteComputedAiReport(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.delete(
        `/computed-listings/${id}/ai-report`
      );
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "computed-listings"] });
    },
  });
}
