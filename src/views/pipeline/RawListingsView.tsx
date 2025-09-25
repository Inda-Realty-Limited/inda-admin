import {
  useAdminRawListings,
  useProcessRawListings,
  useScrapeNpc,
  useScrapeNpcBatch,
  useScrapePremiumLagos,
  type RawListingsFilters,
} from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import Head from "next/head";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function RawListingsView() {
  const [filters, setFilters] = useState<RawListingsFilters>({
    page: 1,
    limit: 20,
    sort: "-scrapedAt",
    includePayload: "false",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandId, setExpandId] = useState<string | null>(null);

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
  const scrapeNpc = useScrapeNpc();
  const scrapeNpcBatch = useScrapeNpcBatch();
  const scrapePremium = useScrapePremiumLagos();

  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 20;
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const columns: TableColumn[] = [
    {
      key: "source",
      label: "Source",
      render: (v) => (typeof v === "string" ? v : "—"),
    },
    {
      key: "listingUrl",
      label: "URL",
      render: (v) =>
        typeof v === "string" ? (
          <a
            href={v}
            target="_blank"
            rel="noreferrer"
            className="text-[#4EA8A1] hover:underline truncate max-w-[240px] inline-block align-top"
          >
            {v}
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "scrapedAt",
      label: "Scraped",
      align: "center",
      render: (v) => formatDate(v),
    },
    {
      key: "processedAt",
      label: "Processed",
      align: "center",
      render: (v) => formatDate(v),
    },
    {
      key: "lastClassification",
      label: "Class",
      align: "center",
      render: (v) => badge(v),
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

  function badge(v: unknown) {
    if (!v || typeof v !== "string") return "—";
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    const map: Record<string, string> = {
      uptodate: "bg-green-100 text-green-700",
      past: "bg-gray-200 text-gray-700",
      failed: "bg-red-100 text-red-700",
    };
    return (
      <span className={`${base} ${map[v] || "bg-blue-100 text-blue-700"}`}>
        {v}
      </span>
    );
  }

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
        scrapeNpc={(body) => scrapeNpc.mutate(body)}
        scrapeNpcBatch={(body) => scrapeNpcBatch.mutate(body)}
        scrapePremium={(body) => scrapePremium.mutate(body)}
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
            <KeyValue
              label="Scraped At"
              value={formatAnyDate(item.scrapedAt)}
            />
            <KeyValue
              label="Processed At"
              value={formatAnyDate(item.processedAt)}
            />
            <KeyValue
              label="Classification"
              value={item.lastClassification as any}
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

// High-level pipeline actions component (scrape / process)
function PipelineActions(props: {
  process: () => void;
  processing: boolean;
  scrapeNpc: (body: Record<string, unknown>) => void;
  scrapeNpcBatch: (body: Record<string, unknown>) => void;
  scrapePremium: (body: Record<string, unknown>) => void;
}) {
  const [mode, setMode] = useState<"npc" | "npcBatch" | "premium" | null>(null);
  const [form, setForm] = useState<Record<string, string | number | boolean>>({
    url: "",
    startUrl: "",
    limit: 50,
    maxPages: 5,
  });

  function submit() {
    if (mode === "npc")
      props.scrapeNpc({
        url: form.url,
        maxPages: form.maxPages,
        limit: form.limit,
      });
    if (mode === "npcBatch")
      props.scrapeNpcBatch({
        startUrl: form.startUrl,
        maxPages: form.maxPages,
        limit: form.limit,
      });
    if (mode === "premium")
      props.scrapePremium({ limit: form.limit, maxPages: form.maxPages });
    setMode(null);
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={props.process}
          disabled={props.processing}
          className="px-3 py-2 bg-[#4EA8A1] text-white rounded-md text-sm disabled:opacity-50"
        >
          {props.processing ? "Processing…" : "Process Raw → Listings"}
        </button>
        <button
          onClick={() => setMode("npc")}
          className="px-3 py-2 bg-[#4EA8A1] hover:bg-[#3F8C86] text-white rounded-md text-sm transition-colors"
        >
          Scrape NPC
        </button>
        <button
          onClick={() => setMode("npcBatch")}
          className="px-3 py-2 bg-[#4EA8A1] hover:bg-[#3F8C86] text-white rounded-md text-sm transition-colors"
        >
          NPC Batch
        </button>
        <button
          onClick={() => setMode("premium")}
          className="px-3 py-2 bg-[#367972] hover:bg-[#2F6963] text-white rounded-md text-sm transition-colors"
        >
          Premium Lagos
        </button>
        {mode && (
          <button
            onClick={() => setMode(null)}
            className="px-3 py-2 text-sm text-gray-600 underline"
          >
            Cancel
          </button>
        )}
      </div>
      {mode && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="grid md:grid-cols-5 gap-3 items-end"
        >
          {mode === "npc" && (
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Start URL
              </label>
              <input
                value={form.url as any}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                className="h-9 border rounded px-2 text-sm"
                required
              />
            </div>
          )}
          {mode === "npcBatch" && (
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Batch Start URL
              </label>
              <input
                value={form.startUrl as any}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startUrl: e.target.value }))
                }
                className="h-9 border rounded px-2 text-sm"
                required
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Limit</label>
            <input
              type="number"
              value={form.limit as any}
              onChange={(e) =>
                setForm((f) => ({ ...f, limit: Number(e.target.value) }))
              }
              className="h-9 border rounded px-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Max Pages
            </label>
            <input
              type="number"
              value={form.maxPages as any}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxPages: Number(e.target.value) }))
              }
              className="h-9 border rounded px-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-1">
            <button
              type="submit"
              className="h-9 bg-[#4EA8A1] hover:bg-[#3F8C86] text-white rounded text-sm transition-colors"
            >
              Run
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
