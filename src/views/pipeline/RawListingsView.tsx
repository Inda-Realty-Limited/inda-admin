import {
  useAdminRawListings,
  useProcessRawListings,
  useQueueRecentScrape,
  useScrapeJobs,
  type RawListingsFilters,
} from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import Head from "next/head";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";

export default function RawListingsView() {
  const [filters, setFilters] = useState<RawListingsFilters>({
    page: 1,
    limit: 20,
    sort: "-scrapedAt",
    includePayload: "false",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandId, setExpandId] = useState<string | null>(null);
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [showJobsModal, setShowJobsModal] = useState(false);

  function update<K extends keyof RawListingsFilters>(
    key: K,
    val: RawListingsFilters[K]
  ) {
    setFilters((f) => ({
      ...f,
      [key]: val,
      page: key === "page" ? (val as number) : 1,
    }));
  }

  const { data, isLoading, isError, refetch } = useAdminRawListings(filters);
  const processMutation = useProcessRawListings();

  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 20;
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const columns: TableColumn[] = [
    {
      key: "#",
      label: "#",
      align: "center",
      render: (_v, _row, index) => {
        const rowNumber = (currentPage - 1) * itemsPerPage + (index || 0) + 1;
        return (
          <span className="text-xs font-medium text-gray-600">{rowNumber}</span>
        );
      },
    },
    {
      key: "source",
      label: "Source",
      render: (v) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {typeof v === "string" ? v : "—"}
        </span>
      ),
    },
    {
      key: "listingUrl",
      label: "Listing URL",
      render: (v) =>
        typeof v === "string" ? (
          <a
            href={v}
            target="_blank"
            rel="noreferrer"
            className="text-[#4EA8A1] hover:underline truncate max-w-[300px] inline-block align-top text-sm"
            title={v}
          >
            {v.split("/").pop()?.replace(/-/g, " ").substring(0, 50) || v}
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "jobType",
      label: "Job Type",
      align: "center",
      render: (v) =>
        v ? (
          <span className="px-2 py-1 rounded text-xs font-mono bg-purple-50 text-purple-700">
            {String(v)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "scrapeSessionId",
      label: "Session ID",
      align: "center",
      render: (v, _row) => {
        const sessionId = String(v || "");
        const shortId = sessionId ? sessionId.substring(0, 8) : "—";
        return v ? (
          <button
            onClick={() => {
              navigator.clipboard.writeText(sessionId);
              alert("Session ID copied!");
            }}
            className="px-2 py-1 rounded text-xs font-mono bg-gray-100 hover:bg-gray-200 transition-colors"
            title={`Click to copy: ${sessionId}`}
          >
            {shortId}...
          </button>
        ) : (
          "—"
        );
      },
    },
    {
      key: "scrapedAt",
      label: "Scraped At",
      align: "center",
      render: (v) => (
        <span className="text-xs text-gray-600">{formatDate(v)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_v, row) => {
        const id = typeof row._id === "string" ? row._id : undefined;
        return (
          <div className="flex justify-center">
            <TableButton
              size="sm"
              variant="secondary"
              onClick={() => setExpandId(expandId === id ? null : id || null)}
            >
              Details
            </TableButton>
          </div>
        );
      },
    },
  ];

  function formatDate(v: unknown) {
    if (!v) return "—";
    const d = new Date(v as any);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  }

  function exportCsv() {
    const items = data?.items || [];
    if (!items.length) return;
    const cols = Array.from(new Set(items.flatMap((it) => Object.keys(it))));
    const rows = [
      cols.join(","),
      ...items.map((it) =>
        cols.map((c) => JSON.stringify((it as any)[c] ?? "")).join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raw_listings_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Head>
        <title>Raw Listings — Inda Admin</title>
      </Head>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Raw Listings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Scraped inventory prior to cleaning & compute
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={exportCsv}
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
          >
            Export
          </button>
          <button
            onClick={() => refetch()}
            className="px-3 py-2 bg-[#4EA8A1] text-white rounded-md text-sm"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowJobsModal(true)}
            className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
          >
            View Jobs
          </button>
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="px-3 py-2 border border-[#4EA8A1] text-[#4EA8A1] rounded-md text-sm hover:bg-[#4EA8A1] hover:text-white"
          >
            Advanced
          </button>
        </div>
      </div>

      <div className="border border-[#4EA8A1] text-[#4EA8A1] flex items-center h-11 rounded-lg px-3">
        <CiSearch size={18} className="mr-2" />
        <input
          className="w-full border-none focus:outline-none placeholder:text-[#4EA8A1] bg-transparent"
          placeholder="Search URL"
          value={filters.q || ""}
          onChange={(e) => update("q", e.target.value)}
        />
        {filters.q && (
          <button
            onClick={() => update("q", "")}
            className="text-xs px-2 py-1 hover:bg-[#4EA8A1]/10 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid md:grid-cols-6 gap-4 bg-white p-4 border rounded-lg">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Source</label>
            <input
              value={filters.source || ""}
              onChange={(e) => update("source", e.target.value)}
              className="h-9 border rounded px-2 text-sm"
              placeholder="NPC"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Scrape Session ID
            </label>
            <input
              value={filters.scrapeSessionId || ""}
              onChange={(e) => update("scrapeSessionId", e.target.value)}
              className="h-9 border rounded px-2 text-sm"
              placeholder="Job ID"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Job Type
            </label>
            <input
              value={filters.jobType || ""}
              onChange={(e) => update("jobType", e.target.value)}
              className="h-9 border rounded px-2 text-sm"
              placeholder="npc-recent-30-days"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Processed
            </label>
            <select
              value={filters.processed || ""}
              onChange={(e) => update("processed", e.target.value as any)}
              className="h-9 border rounded px-2 text-sm"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Limit</label>
            <input
              type="number"
              value={filters.limit || 20}
              onChange={(e) => update("limit", Number(e.target.value))}
              className="h-9 border rounded px-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Sort</label>
            <select
              value={filters.sort || "-scrapedAt"}
              onChange={(e) => update("sort", e.target.value)}
              className="h-9 border rounded px-2 text-sm"
            >
              <option value="-scrapedAt">Newest</option>
              <option value="scrapedAt">Oldest</option>
              <option value="listingUrl">URL A-Z</option>
              <option value="-listingUrl">URL Z-A</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Payload</label>
            <select
              value={filters.includePayload || "false"}
              onChange={(e) => update("includePayload", e.target.value as any)}
              className="h-9 border rounded px-2 text-sm"
            >
              <option value="false">Omit</option>
              <option value="true">Include</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <button
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 20,
                  sort: "-scrapedAt",
                  includePayload: "false",
                  q: "",
                  source: "",
                  scrapeSessionId: "",
                  jobType: "",
                  processed: undefined,
                })
              }
              className="h-9 border border-red-300 text-red-600 rounded text-xs hover:bg-red-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <PipelineActions
        process={() => processMutation.mutate({})}
        processing={processMutation.status === "pending"}
        openScrapeModal={() => setShowScrapeModal(true)}
      />

      {isLoading && (
        <div className="p-8 text-center text-gray-500 border rounded bg-white">
          Loading raw listings...
        </div>
      )}
      {isError && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded">
          Failed to load raw listings.
        </div>
      )}

      {!isLoading && !isError && (
        <Table
          columns={columns}
          data={data?.items || []}
          emptyMessage="No raw listings found."
        />
      )}

      {!isLoading && !isError && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => update("page", p)}
          className="mt-6"
        />
      )}

      {expandId && (
        <RawExpandModal
          id={expandId}
          onClose={() => setExpandId(null)}
          items={data?.items || []}
        />
      )}

      {showScrapeModal && (
        <ScrapeModal
          onClose={() => setShowScrapeModal(false)}
          onSuccess={() => {
            setShowScrapeModal(false);
            setShowJobsModal(true);
          }}
        />
      )}

      {showJobsModal && (
        <JobsModal
          onClose={() => setShowJobsModal(false)}
          onSelectJob={(jobId) => {
            update("scrapeSessionId", jobId);
            setShowJobsModal(false);
          }}
        />
      )}
    </div>
  );
}

function RawExpandModal({
  id,
  onClose,
  items,
}: {
  id: string;
  onClose: () => void;
  items: Record<string, unknown>[];
}) {
  const item = items.find((i) => (i as any)._id === id);
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="w-full max-w-xl h-full bg-white shadow-xl border-l p-4 overflow-y-auto text-sm space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Raw Listing Detail</h2>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        {!item && <div className="text-gray-500">Not found.</div>}
        {item && (
          <>
            <KeyValue label="URL" value={item.listingUrl as any} mono copy />
            <KeyValue label="Source" value={item.source as any} />
            <KeyValue label="Job Type" value={item.jobType as any} />
            <KeyValue
              label="Scrape Session ID"
              value={item.scrapeSessionId as any}
              mono
              copy
            />
            <KeyValue
              label="Scraped At"
              value={formatAnyDate(item.scrapedAt)}
            />
            <KeyValue
              label="Created At"
              value={formatAnyDate(item.createdAt)}
            />
            <KeyValue
              label="Updated At"
              value={formatAnyDate(item.updatedAt)}
            />
            <KeyValue
              label="Processed At"
              value={formatAnyDate(item.processedAt)}
            />
            {item.payload && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  Payload
                </h3>
                <pre className="text-[11px] bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-72">
                  {JSON.stringify(item.payload, null, 2)}
                </pre>
              </div>
            )}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Raw JSON
              </h3>
              <pre className="text-[11px] bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-72">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function KeyValue({
  label,
  value,
  mono,
  copy,
}: {
  label: string;
  value: unknown;
  mono?: boolean;
  copy?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className={
            mono ? "font-mono text-xs break-all" : "text-sm break-words"
          }
        >
          {value == null ? "—" : String(value)}
        </span>
        {copy && typeof value === "string" && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
            }}
            className="text-[10px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            Copy
          </button>
        )}
      </div>
    </div>
  );
}

function formatAnyDate(v: any) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

// Pipeline actions component (scrape / process)
function PipelineActions(props: {
  process: () => void;
  processing: boolean;
  openScrapeModal: () => void;
}) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={props.process}
          disabled={props.processing}
          className="px-4 py-2 bg-[#4EA8A1] text-white rounded-md text-sm disabled:opacity-50 hover:bg-[#3F8C86] transition-colors"
        >
          {props.processing ? "Processing…" : "Process Raw → Listings"}
        </button>
        <button
          onClick={props.openScrapeModal}
          className="px-4 py-2 bg-[#4EA8A1] hover:bg-[#3F8C86] text-white rounded-md text-sm transition-colors flex items-center gap-2"
        >
          <FiRefreshCw size={16} />
          Scrape Recent Listings
        </button>
        <span className="text-xs text-gray-500 ml-2">
          Fire-and-forget scraping with job tracking
        </span>
      </div>
    </div>
  );
}

// Scrape modal for queueing new scrape jobs
function ScrapeModal(props: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    limit: 5,
    maxPages: 3,
    url: "",
    headers: "",
    cookie: "",
    userAgent: "",
  });
  const queueMutation = useQueueRecentScrape();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        limit: form.limit || undefined,
        maxPages: form.maxPages || undefined,
      };
      if (form.url) payload.url = form.url;
      if (form.cookie) payload.cookie = form.cookie;
      if (form.userAgent) payload.userAgent = form.userAgent;
      if (form.headers) {
        try {
          payload.headers = JSON.parse(form.headers);
        } catch {
          alert("Invalid JSON in headers field");
          return;
        }
      }

      await queueMutation.mutateAsync(payload);
      props.onSuccess();
    } catch (err: any) {
      alert(err?.message || "Failed to queue scrape job");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={props.onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Queue Recent Listings Scrape</h2>
          <button
            onClick={props.onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <strong>Fire-and-forget:</strong> This scrape runs in the
            background. You&apos;ll receive a job ID and can track progress in
            the Jobs view.
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Limit (optional)
              </label>
              <input
                type="number"
                min="1"
                value={form.limit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, limit: Number(e.target.value) }))
                }
                className="h-10 border rounded px-3 text-sm"
                placeholder="e.g., 5"
              />
              <span className="text-xs text-gray-500">
                Number of listings to fetch. Leave empty for unlimited.
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Max Pages (optional)
              </label>
              <input
                type="number"
                min="1"
                value={form.maxPages}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxPages: Number(e.target.value) }))
                }
                className="h-10 border rounded px-3 text-sm"
                placeholder="e.g., 3"
              />
              <span className="text-xs text-gray-500">
                Cap page traversal. Leave empty for unlimited.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Custom URL (optional)
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="h-10 border rounded px-3 text-sm"
              placeholder="https://..."
            />
            <span className="text-xs text-gray-500">
              Override default NPC 30-day feed URL.
            </span>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Advanced (optional)
            </h3>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Custom Headers (JSON)
                </label>
                <textarea
                  value={form.headers}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, headers: e.target.value }))
                  }
                  className="h-20 border rounded px-3 py-2 text-xs font-mono"
                  placeholder='{"X-Custom": "value"}'
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Cookie
                </label>
                <input
                  value={form.cookie}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cookie: e.target.value }))
                  }
                  className="h-10 border rounded px-3 text-xs font-mono"
                  placeholder="session=..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  User Agent
                </label>
                <input
                  value={form.userAgent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, userAgent: e.target.value }))
                  }
                  className="h-10 border rounded px-3 text-xs"
                  placeholder="Mozilla/5.0..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={props.onClose}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={queueMutation.status === "pending"}
              className="px-4 py-2 bg-[#4EA8A1] text-white rounded text-sm hover:bg-[#3F8C86] disabled:opacity-50"
            >
              {queueMutation.status === "pending"
                ? "Queueing..."
                : "Queue Scrape"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Jobs modal for viewing scrape job history
function JobsModal(props: {
  onClose: () => void;
  onSelectJob: (jobId: string) => void;
}) {
  const [filters, setFilters] = useState<{
    status?: "queued" | "running" | "success" | "error";
    page: number;
  }>({ page: 1 });

  const { data, isLoading } = useScrapeJobs({
    type: "npc-recent-30-days",
    ...filters,
    limit: 10,
  });

  function getStatusBadge(status: string) {
    const map: Record<string, string> = {
      queued: "bg-yellow-100 text-yellow-700",
      running: "bg-blue-100 text-blue-700",
      success: "bg-green-100 text-green-700",
      error: "bg-red-100 text-red-700",
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${
      map[status] || "bg-gray-100 text-gray-700"
    }`;
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "success":
        return <FiCheckCircle className="text-green-600" />;
      case "error":
        return <FiAlertCircle className="text-red-600" />;
      case "running":
        return <FiRefreshCw className="text-blue-600 animate-spin" />;
      case "queued":
        return <FiClock className="text-yellow-600" />;
      default:
        return null;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={props.onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Scrape Jobs</h2>
          <button
            onClick={props.onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 border-b flex gap-2">
          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value as any,
                page: 1,
              }))
            }
            className="h-10 border rounded px-3 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="text-center text-gray-500 py-8">
              Loading jobs...
            </div>
          )}

          {!isLoading && data?.items.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No scrape jobs found.
            </div>
          )}

          {!isLoading && data && data.items.length > 0 && (
            <div className="space-y-3">
              {data.items.map((job) => (
                <div
                  key={job.jobId}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="font-mono text-sm text-gray-600">
                          {job.jobId}
                        </span>
                        <span className={getStatusBadge(job.status)}>
                          {job.status}
                        </span>
                      </div>

                      {job.params && (
                        <div className="text-xs text-gray-600">
                          Limit: {job.params.limit || "∞"} | Max Pages:{" "}
                          {job.params.maxPages || "∞"}
                        </div>
                      )}

                      {job.stats && (
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Fetched:</span>{" "}
                            <strong>{job.stats.totalFetched || 0}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500">Inserted:</span>{" "}
                            <strong className="text-green-600">
                              {job.stats.inserted || 0}
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-500">Skipped:</span>{" "}
                            <strong className="text-yellow-600">
                              {job.stats.skippedExisting || 0}
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-500">Failed:</span>{" "}
                            <strong className="text-red-600">
                              {job.stats.failed || 0}
                            </strong>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Started: {formatAnyDate(job.startedAt)} |{" "}
                        {job.finishedAt
                          ? `Finished: ${formatAnyDate(job.finishedAt)}`
                          : "In progress..."}
                      </div>

                      {job.errorMessage && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {job.errorMessage}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => props.onSelectJob(job.jobId)}
                      className="px-3 py-1 text-xs bg-[#4EA8A1] text-white rounded hover:bg-[#3F8C86]"
                    >
                      View Listings
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isLoading && data && data.total > (data.pageSize || 10) && (
          <div className="border-t px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Page {data.page} of{" "}
              {Math.ceil(data.total / (data.pageSize || 10))}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
                }
                disabled={filters.page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={
                  filters.page >= Math.ceil(data.total / (data.pageSize || 10))
                }
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
