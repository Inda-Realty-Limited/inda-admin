import {
  getQuestionnaireExportUrl,
  useAdminQuestionnaireStats,
  useAdminQuestionnaires,
} from "@/api";
import {
  Pagination,
  Table,
  TableBadge,
  TableButton,
  type TableColumn,
} from "@/components/ui";
import type {
  Questionnaire,
  QuestionnaireFilters,
  QuestionnaireListResponse,
  QuestionnaireStats,
} from "@/types/questionnaire";
import { formatPrice } from "@/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CiSearch } from "react-icons/ci";
import { FiDownload, FiFilter, FiRefreshCw } from "react-icons/fi";

const DEFAULT_FILTERS: QuestionnaireFilters = {
  page: 1,
  limit: 20,
  status: "",
  plan: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function QuestionnairesView() {
  const router = useRouter();
  const [filters, setFilters] = useState<QuestionnaireFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearch = useDeferredValue(searchInput);
  const queryFilters = useMemo(() => {
    const base: QuestionnaireFilters = {
      ...filters,
      search: debouncedSearch || undefined,
    };
    if (!base.status) delete base.status;
    if (!base.plan) delete base.plan;
    if (!base.startDate) delete base.startDate;
    if (!base.endDate) delete base.endDate;
    return base;
  }, [filters, debouncedSearch]);

  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useAdminQuestionnaireStats();

  const {
    data: listData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useAdminQuestionnaires(queryFilters);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  const questionnaires = (listData?.questionnaires ?? []) as Questionnaire[];
  const pagination = listData?.pagination as
    | QuestionnaireListResponse["pagination"]
    | undefined;

  const handleView = useCallback(
    (id?: string) => {
      if (!id) return;
      router.push(`/dashboard/questionnaires/${id}`);
    },
    [router]
  );

  const handleExport = useCallback(() => {
    const url = getQuestionnaireExportUrl({
      ...filters,
      search: debouncedSearch || undefined,
    });
    if (url) {
      window.open(url, "_blank", "noopener");
    }
  }, [filters, debouncedSearch]);

  const handleRefresh = useCallback(() => {
    refetch();
    refetchStats();
  }, [refetch, refetchStats]);

  const columns: TableColumn[] = useMemo(() => {
    const formatDateTime = (value: unknown) => formatDate(value, true);
    const formatDateOnly = (value: unknown) => formatDate(value, false);

    return [
      {
        key: "user",
        label: "User",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const user = row["userId"];
          if (user && typeof user === "object") {
            const first = (user as Record<string, unknown>)["firstName"];
            const last = (user as Record<string, unknown>)["lastName"];
            const email = (user as Record<string, unknown>)["email"];
            const displayName = [first, last]
              .filter((part) => typeof part === "string" && part.trim())
              .join(" ");
            return (
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-900">
                  {displayName || (typeof email === "string" ? email : "—")}
                </span>
                {typeof email === "string" && (
                  <span className="text-[11px] text-gray-500">{email}</span>
                )}
              </div>
            );
          }
          return "—";
        },
      },
      {
        key: "property",
        label: "Property",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const property = row["propertyBasics"];
          const listing = row["listingId"];
          const address =
            property && typeof property === "object"
              ? ((property as Record<string, unknown>)[
                  "propertyAddress"
                ] as string)
              : "";
          const location =
            listing && typeof listing === "object"
              ? ((listing as Record<string, unknown>)["location"] as string)
              : undefined;
          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-900">
                {address || "—"}
              </span>
              {location && (
                <span className="text-[11px] text-gray-500">{location}</span>
              )}
            </div>
          );
        },
      },
      {
        key: "plan",
        label: "Plan",
        render: (value: unknown) => {
          const plan = typeof value === "string" ? value : String(value || "");
          return (
            <TableBadge
              variant="default"
              className={
                plan === "deepDive"
                  ? "bg-cyan-100 text-cyan-800"
                  : plan === "deeperDive"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-700"
              }
            >
              {planLabel(plan)}
            </TableBadge>
          );
        },
      },
      {
        key: "status",
        label: "Status",
        render: (value: unknown) => {
          const status = typeof value === "string" ? value : "";
          const variant =
            status === "paid"
              ? "success"
              : status === "cancelled"
              ? "danger"
              : "warning";
          return (
            <TableBadge variant={variant} className="uppercase">
              {status || "—"}
            </TableBadge>
          );
        },
      },
      {
        key: "createdAt",
        label: "Submitted",
        render: (value: unknown) => (
          <span className="text-xs font-medium text-gray-700">
            {formatDateOnly(value)}
          </span>
        ),
      },
      {
        key: "paidAt",
        label: "Paid",
        render: (value: unknown) => (
          <span className="text-xs text-gray-700">
            {value ? formatDateTime(value) : "—"}
          </span>
        ),
      },
      {
        key: "lastPaymentReference",
        label: "Payment Ref",
        render: (value: unknown) => {
          const ref = typeof value === "string" ? value : "";
          if (!ref) return "—";
          const short =
            ref.length > 28 ? `${ref.slice(0, 12)}…${ref.slice(-6)}` : ref;
          return (
            <span className="text-[11px] font-mono" title={ref}>
              {short}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const id = typeof row["_id"] === "string" ? row["_id"] : undefined;
          return (
            <TableButton
              variant="secondary"
              size="sm"
              onClick={() => handleView(id)}
            >
              View
            </TableButton>
          );
        },
      },
    ];
  }, [handleView]);

  const totalItems = pagination?.total ?? questionnaires.length;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? filters.page ?? 1;
  const itemsPerPage = pagination?.limit ?? filters.limit ?? 20;
  const refreshing = isFetching && !isLoading;
  const statsRefreshing = statsFetching && !statsLoading;

  return (
    <div className="space-y-6">
      <Head>
        <title>Due Diligence Orders — Inda Admin</title>
      </Head>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Due Diligence Questionnaires
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Track Deep Dive and Deeper Dive questionnaire submissions, payments,
            and status updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiRefreshCw
              className={refreshing || statsRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4EA8A1] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4EA8A1]/90"
          >
            <FiDownload /> Export CSV
          </button>
        </div>
      </header>

      <StatsSection
        stats={stats}
        loading={statsLoading}
        refreshing={statsRefreshing}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center h-11 rounded-lg border border-gray-300 bg-white px-3 shadow-sm">
            <CiSearch size={18} className="mr-2 text-gray-400" />
            <input
              className="w-64 border-none bg-transparent text-sm focus:outline-none"
              placeholder="Search by user, address, reference, email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
                page: 1,
              }))
            }
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.plan || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, plan: e.target.value, page: 1 }))
            }
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:outline-none"
          >
            <option value="">All Plans</option>
            <option value="deepDive">Deep Dive</option>
            <option value="deeperDive">Deeper Dive</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showAdvanced
                ? "border-[#4EA8A1] bg-[#4EA8A1] text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FiFilter /> Advanced
          </button>

          {(filters.status ||
            filters.plan ||
            filters.startDate ||
            filters.endDate) && (
            <button
              type="button"
              onClick={() => {
                setFilters({ ...DEFAULT_FILTERS });
                setSearchInput("");
              }}
              className="text-xs font-semibold uppercase tracking-wide text-[#4EA8A1] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value,
                    page: 1,
                  }))
                }
                className="h-10 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              >
                <option value="createdAt">Submitted Date</option>
                <option value="paidAt">Paid Date</option>
                <option value="status">Status</option>
                <option value="plan">Plan</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: e.target
                      .value as QuestionnaireFilters["sortOrder"],
                    page: 1,
                  }))
                }
                className="h-10 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                    page: 1,
                  }))
                }
                className="h-10 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                    page: 1,
                  }))
                }
                className="h-10 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading questionnaires...
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load questionnaires. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <Table
          columns={columns}
          data={questionnaires as unknown as Record<string, unknown>[]}
          emptyMessage={
            debouncedSearch
              ? "No questionnaires match your search."
              : "No questionnaires found."
          }
        />
      )}

      {!isLoading && !isError && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          className="pb-6"
        />
      )}
    </div>
  );
}

function StatsSection({
  stats,
  loading,
  refreshing,
}: {
  stats: QuestionnaireStats | undefined;
  loading: boolean;
  refreshing: boolean;
}) {
  const total = stats?.total ?? 0;
  const submitted = stats?.byStatus?.submitted ?? 0;
  const paid = stats?.byStatus?.paid ?? 0;
  const cancelled = stats?.byStatus?.cancelled ?? 0;
  const revenueTotal = stats?.revenue?.total ?? 0;
  const revenueDeepDive = stats?.revenue?.byPlan?.deepDive ?? 0;
  const revenueDeeperDive = stats?.revenue?.byPlan?.deeperDive ?? 0;
  const recent = stats?.recentSubmissions ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Submissions"
        value={total.toLocaleString()}
        subtitle={`Recent (7d): ${recent.toLocaleString()}`}
        loading={loading}
        refreshing={refreshing}
      />
      <StatCard
        title="Pending Review"
        value={submitted.toLocaleString()}
        subtitle={`Cancelled: ${cancelled.toLocaleString()}`}
        loading={loading}
        refreshing={refreshing}
        accent="bg-amber-100 text-amber-700"
      />
      <StatCard
        title="Paid"
        value={paid.toLocaleString()}
        subtitle={`Revenue: ${formatPrice(revenueTotal)}`}
        loading={loading}
        refreshing={refreshing}
        accent="bg-emerald-100 text-emerald-700"
      />
      <StatCard
        title="Plan Breakdown"
        value={`${formatPrice(revenueDeepDive)} / ${formatPrice(
          revenueDeeperDive
        )}`}
        subtitle="Deep Dive / Deeper Dive revenue"
        loading={loading}
        refreshing={refreshing}
        accent="bg-sky-100 text-sky-700"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  loading,
  refreshing,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  loading: boolean;
  refreshing: boolean;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {refreshing && (
        <div className="absolute inset-0 bg-white/70" aria-hidden />
      )}
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>
      {loading ? (
        <div className="mt-4 h-6 w-24 rounded-lg bg-gray-200 animate-pulse" />
      ) : (
        <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      )}
      {subtitle && (
        <p
          className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
            accent ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function planLabel(plan: string) {
  if (plan === "deepDive") return "Deep Dive";
  if (plan === "deeperDive") return "Deeper Dive";
  if (!plan) return "—";
  return plan;
}

function formatDate(value: unknown, withTime: boolean) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      : {}),
  });
}
