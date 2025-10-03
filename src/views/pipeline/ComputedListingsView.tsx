import {
  useAdminComputedListings,
  useBatchComputeListings,
  useComputeListing,
  useAdminComputedByUrl,
  usePatchComputedListing,
  useDeleteComputedAiReport,
  type ComputedListingsFilters,
} from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import Head from "next/head";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function ComputedListingsView() {
  const [filters, setFilters] = useState<ComputedListingsFilters>({
    page: 1,
    limit: 20,
    sort: "-computedAt",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [computeMode, setComputeMode] = useState<"single" | "batch" | null>(
    null
  );
  const [input, setInput] = useState<{
    url?: string;
    id?: string;
    minScore?: number;
  }>({});
  const [lookupUrl, setLookupUrl] = useState<string>("");
  const [overrideEditor, setOverrideEditor] = useState<{
    id?: string;
    json?: string;
  } | null>(null);

  function update<K extends keyof ComputedListingsFilters>(
    key: K,
    val: ComputedListingsFilters[K]
  ) {
    setFilters((f) => ({
      ...f,
      [key]: val,
      page: key === "page" ? (val as number) : 1,
    }));
  }

  const { data, isLoading, isError, refetch } =
    useAdminComputedListings(filters);
  const computeSingle = useComputeListing();
  const computeBatch = useBatchComputeListings();
  const { data: byUrlData, refetch: refetchByUrl } = useAdminComputedByUrl(
    lookupUrl || undefined
  );
  const patchOverride = usePatchComputedListing(overrideEditor?.id || "");
  const deleteAiReport = useDeleteComputedAiReport(overrideEditor?.id || "");

  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 20;
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const columns: TableColumn[] = [
    {
      key: "listingUrl",
      label: "Listing URL",
      render: (v) =>
        typeof v === "string" ? (
          <a
            href={v}
            target="_blank"
            rel="noreferrer"
            className="text-[#4EA8A1] hover:underline truncate max-w-[240px] inline-block"
          >
            {v}
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "state",
      label: "State",
      render: (v) => (typeof v === "string" ? v : "—"),
    },
    {
      key: "lga",
      label: "LGA",
      render: (v) => (typeof v === "string" ? v : "—"),
    },
    {
      key: "microlocationStd",
      label: "Microlocation",
      render: (v) => (typeof v === "string" ? v : "—"),
    },
    {
      key: "indaScore",
      label: "Score",
      align: "center",
      render: (v) => scoreBadge(extractScore(v)),
    },
    {
      key: "computedAt",
      label: "Computed",
      align: "center",
      render: (v) => formatDate(v),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_v, row) => (
        <div className="flex justify-center">
          <TableButton
            size="sm"
            variant="secondary"
            onClick={() => console.log("View computed", row)}
          >
            View
          </TableButton>
          <TableButton
            size="sm"
            variant="primary"
            onClick={() => {
              const id =
                typeof row["_id"] === "string" ? (row["_id"] as string) : "";
              const minimal = Object.fromEntries(
                Object.entries(row).filter(([k]) =>
                  ["_id", "listingUrl", "indaScore", "override"].includes(k)
                )
              );
              setOverrideEditor({ id, json: JSON.stringify(minimal, null, 2) });
            }}
          >
            Override
          </TableButton>
          <TableButton
            size="sm"
            variant="danger"
            onClick={() => {
              const id =
                typeof row["_id"] === "string" ? (row["_id"] as string) : "";
              setOverrideEditor({ id, json: "" });
            }}
          >
            Delete AI
          </TableButton>
        </div>
      ),
    },
  ];

  function extractScore(v: unknown) {
    if (!v || typeof v !== "object") return undefined;
    const final = (v as any).finalScore;
    if (typeof final === "number") return final;
    return undefined;
  }
  function scoreBadge(score?: number) {
    if (typeof score !== "number") return "—";
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    const variant =
      score >= 80
        ? "bg-green-100 text-green-700"
        : score >= 60
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";
    return <span className={`${base} ${variant}`}>{score}</span>;
  }
  function formatDate(v: unknown) {
    if (!v) return "—";
    const d = new Date(v as any);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString();
  }

  function exportCsv() {
    const items = (data?.items as Record<string, unknown>[] | undefined) || [];
    if (!items.length) return;
    const cols = Array.from(
      new Set(items.flatMap((it: Record<string, unknown>) => Object.keys(it)))
    );
    const rows = [
      cols.join(","),
      ...items.map((it: Record<string, unknown>) =>
        cols
          .map((c) => {
            const val = it[c];
            return JSON.stringify(val ?? "");
          })
          .join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `computed_listings_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function runSingle() {
    const query: Record<string, unknown> = {};
    if (input.url) query.url = input.url;
    if (input.id) query.id = input.id;
    computeSingle.mutate({ query });
    setComputeMode(null);
  }
  function runBatch() {
    const q: Record<string, unknown> = { save: true };
    if (filters.state) q.state = filters.state;
    if (filters.lga) q.lga = filters.lga;
    if (filters.q) q.q = filters.q;
    computeBatch.mutate(q);
    setComputeMode(null);
  }

  return (
    <div className="space-y-4">
      <Head>
        <title>Computed Listings — Inda Admin</title>
      </Head>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Computed Listings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Listings with analytics & Inda scores
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
        <div className="grid md:grid-cols-5 gap-3 items-end">
          <div className="flex flex-col gap-1 md:col-span-3">
            <label className="text-xs font-medium text-gray-600">
              Find by URL
            </label>
            <input
              value={lookupUrl}
              onChange={(e) => setLookupUrl(e.target.value)}
              className="h-9 border rounded px-2 text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-1">
            <button
              onClick={() => refetchByUrl()}
              disabled={!lookupUrl}
              className="h-9 bg-[#4EA8A1] hover:bg-[#3F8C86] text-white rounded text-sm disabled:opacity-50"
            >
              Lookup
            </button>
          </div>
          {byUrlData && (
            <div className="md:col-span-5 text-xs text-gray-700">
              <div className="p-2 rounded border bg-gray-50 overflow-x-auto">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(byUrlData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border border-[#4EA8A1] text-[#4EA8A1] flex items-center h-11 rounded-lg px-3">
        <CiSearch size={18} className="mr-2" />
        <input
          className="w-full border-none focus:outline-none placeholder:text-[#4EA8A1] bg-transparent"
          placeholder="Search by URL, microlocation"
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
            <label className="text-xs font-medium text-gray-600">State</label>
            <input
              value={filters.state || ""}
              onChange={(e) => update("state", e.target.value)}
              className="h-9 border rounded px-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">LGA</label>
            <input
              value={filters.lga || ""}
              onChange={(e) => update("lga", e.target.value)}
              className="h-9 border rounded px-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Min Score
            </label>
            <input
              type="number"
              value={filters.minScore ?? ""}
              onChange={(e) =>
                update(
                  "minScore",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="h-9 border rounded px-2 text-sm"
            />
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
              value={filters.sort || "-computedAt"}
              onChange={(e) => update("sort", e.target.value)}
              className="h-9 border rounded px-2 text-sm"
            >
              <option value="-computedAt">Newest</option>
              <option value="computedAt">Oldest</option>
              <option value="microlocationStd">Microlocation A-Z</option>
              <option value="-microlocationStd">Microlocation Z-A</option>
              <option value="state">State A-Z</option>
              <option value="-state">State Z-A</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <button
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 20,
                  sort: "-computedAt",
                  q: "",
                  state: "",
                  lga: "",
                  minScore: undefined,
                })
              }
              className="h-9 border border-red-300 text-red-600 rounded text-xs hover:bg-red-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setComputeMode("single")}
            className="px-3 py-2 bg-[#4EA8A1] hover:bg-[#3F8C86] text-white rounded-md text-sm transition-colors"
          >
            Compute Single
          </button>
          <button
            onClick={() => setComputeMode("batch")}
            className="px-3 py-2 bg-[#367972] hover:bg-[#2F6963] text-white rounded-md text-sm transition-colors"
          >
            Batch Compute
          </button>
          {(computeSingle.status === "pending" ||
            computeBatch.status === "pending") && (
            <span className="text-xs text-gray-500">Running compute…</span>
          )}
          {(computeSingle.status === "success" ||
            computeBatch.status === "success") && (
            <span className="text-xs text-green-600">Done</span>
          )}
        </div>
        {computeMode === "single" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSingle();
            }}
            className="grid md:grid-cols-5 gap-3 items-end"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">URL</label>
              <input
                value={input.url || ""}
                onChange={(e) =>
                  setInput((i) => ({ ...i, url: e.target.value }))
                }
                className="h-9 border rounded px-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Listing ID
              </label>
              <input
                value={input.id || ""}
                onChange={(e) =>
                  setInput((i) => ({ ...i, id: e.target.value }))
                }
                className="h-9 border rounded px-2 text-sm"
                placeholder="Mongo _id"
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
        {computeMode === "batch" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runBatch();
            }}
            className="grid md:grid-cols-5 gap-3 items-end"
          >
            <p className="text-xs text-gray-600 md:col-span-3">
              Runs compute across current filter slice (state/lga/q). Uses
              save=true. Long operations: keep this tab open.
            </p>
            <div className="flex flex-col gap-1 md:col-span-1">
              <button
                type="submit"
                className="h-9 bg-[#367972] hover:bg-[#2F6963] text-white rounded text-sm transition-colors"
              >
                Run Batch
              </button>
            </div>
          </form>
        )}
      </div>

      {isLoading && (
        <div className="p-8 text-center text-gray-500 border rounded bg-white">
          Loading computed listings...
        </div>
      )}
      {isError && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded">
          Failed to load computed listings.
        </div>
      )}

      {!isLoading && !isError && (
        <Table
          columns={columns}
          data={data?.items || []}
          emptyMessage="No computed listings found."
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

      {overrideEditor && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOverrideEditor(null)}
          />
          <div className="w-full max-w-lg h-full bg-white border-l shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold">Override / AI Report</h3>
              <button
                className="text-xs text-gray-500"
                onClick={() => setOverrideEditor(null)}
              >
                Close
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm overflow-y-auto">
              <p className="text-xs text-gray-600">
                Edit override fields (e.g. overrideScore, flags). Leave blank
                and click Delete AI to remove the AI report.
              </p>
              <textarea
                value={overrideEditor.json}
                onChange={(e) =>
                  setOverrideEditor((o) =>
                    o ? { ...o, json: e.target.value } : o
                  )
                }
                className="w-full h-[60vh] border rounded p-2 font-mono text-xs"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    try {
                      const body = overrideEditor?.json
                        ? JSON.parse(overrideEditor.json)
                        : {};
                      if (!overrideEditor?.id) return;
                      patchOverride.mutate(body, {
                        onSuccess: () => setOverrideEditor(null),
                      });
                    } catch (e) {
                      alert("Invalid JSON: " + (e as Error).message);
                    }
                  }}
                  disabled={
                    !overrideEditor?.id || patchOverride.status === "pending"
                  }
                  className="px-3 py-2 bg-[#4EA8A1] text-white rounded text-sm disabled:opacity-50"
                >
                  {patchOverride.status === "pending"
                    ? "Saving…"
                    : "Save Override"}
                </button>
                <button
                  onClick={() =>
                    overrideEditor?.id &&
                    deleteAiReport.mutate(undefined, {
                      onSuccess: () => setOverrideEditor(null),
                    })
                  }
                  disabled={
                    !overrideEditor?.id || deleteAiReport.status === "pending"
                  }
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-50"
                >
                  {deleteAiReport.status === "pending"
                    ? "Deleting…"
                    : "Delete AI Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
