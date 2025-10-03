import {
  useAdminCleanedListings,
  useCleanPendingListings,
  useCleanListingsManual,
  type CleanedListingsFilters,
} from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import Head from "next/head";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function CleanedListingsView() {
  const [filters, setFilters] = useState<CleanedListingsFilters>({
    page: 1,
    limit: 20,
    sort: "-createdAt",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  function update<K extends keyof CleanedListingsFilters>(
    key: K,
    val: CleanedListingsFilters[K]
  ) {
    setFilters((f) => ({
      ...f,
      [key]: val,
      page: key === "page" ? (val as number) : 1,
    }));
  }

  const { data, isLoading, isError, refetch } =
    useAdminCleanedListings(filters);
  const cleanPending = useCleanPendingListings();
  const cleanManual = useCleanListingsManual();
  const [manualOpen, setManualOpen] = useState(false);
  const [manualJson, setManualJson] = useState<string>(
    '{\n  "ids": [],\n  "options": {}\n}'
  );

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
      key: "microlocationStd",
      label: "Microlocation",
      render: (v) => (typeof v === "string" ? v : "—"),
    },
    {
      key: "propertyTypeStd",
      label: "Type",
      render: (v) => (typeof v === "string" ? v : "—"),
    },
    {
      key: "bedrooms",
      label: "Beds",
      align: "center",
      render: (v) => (typeof v === "number" ? v : "—"),
    },
    {
      key: "cleanStatus",
      label: "Status",
      align: "center",
      render: (v) => badge(v),
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
            onClick={() => console.log("View cleaned", row)}
          >
            View
          </TableButton>
        </div>
      ),
    },
  ];

  function badge(v: unknown) {
    if (!v || typeof v !== "string") return "—";
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    const map: Record<string, string> = {
      cleaned: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
    };
    return (
      <span className={`${base} ${map[v] || "bg-gray-100 text-gray-600"}`}>
        {v}
      </span>
    );
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
    a.download = `cleaned_listings_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Head>
        <title>Cleaned Listings — Inda Admin</title>
      </Head>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cleaned Listings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Normalized listings produced by the cleaning pipeline
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
          placeholder="Search URL or microlocation"
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
        <div className="grid md:grid-cols-5 gap-4 bg-white p-4 border rounded-lg">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">State</label>
            <input
              value={filters.state || ""}
              onChange={(e) => update("state", e.target.value)}
              className="h-9 border rounded px-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Microlocation
            </label>
            <input
              value={filters.microlocation || ""}
              onChange={(e) => update("microlocation", e.target.value)}
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
              value={filters.sort || "-createdAt"}
              onChange={(e) => update("sort", e.target.value)}
              className="h-9 border rounded px-2 text-sm"
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="microlocationStd">Microlocation A-Z</option>
              <option value="-microlocationStd">Microlocation Z-A</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <button
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 20,
                  sort: "-createdAt",
                  q: "",
                  microlocation: "",
                  state: "",
                })
              }
              className="h-9 border border-red-300 text-red-600 rounded text-xs hover:bg-red-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-3 items-center">
        <button
          onClick={() => cleanPending.mutate({})}
          disabled={cleanPending.status === "pending"}
          className="px-3 py-2 bg-[#4EA8A1] text-white rounded-md text-sm disabled:opacity-50"
        >
          {cleanPending.status === "pending"
            ? "Cleaning…"
            : "Run Pending Clean"}
        </button>
        <button
          onClick={() => setManualOpen(true)}
          className="px-3 py-2 bg-[#4EA8A1] hover:bg-[#3F8C86] text-white rounded-md text-sm transition-colors"
        >
          Manual Clean (JSON)
        </button>
        {cleanPending.status === "pending" && (
          <span className="text-xs text-gray-500">
            Processing pending listings…
          </span>
        )}
      </div>

      {isLoading && (
        <div className="p-8 text-center text-gray-500 border rounded bg-white">
          Loading cleaned listings...
        </div>
      )}
      {isError && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded">
          Failed to load cleaned listings.
        </div>
      )}

      {!isLoading && !isError && (
        <Table
          columns={columns}
          data={data?.items || []}
          emptyMessage="No cleaned listings found."
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

      {manualOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setManualOpen(false)}
          />
          <div className="w-full max-w-lg h-full bg-white border-l shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold">Manual Clean Payload</h3>
              <button
                className="text-xs text-gray-500"
                onClick={() => setManualOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm overflow-y-auto">
              <p className="text-xs text-gray-600">
                Provide the body for POST /admin/clean/listings. Example
                includes ids array and options object. Consult backend for exact
                schema.
              </p>
              <textarea
                value={manualJson}
                onChange={(e) => setManualJson(e.target.value)}
                className="w-full h-[60vh] border rounded p-2 font-mono text-xs"
              />
              <button
                onClick={() => {
                  try {
                    const body = manualJson ? JSON.parse(manualJson) : {};
                    cleanManual.mutate(body, {
                      onSuccess: () => setManualOpen(false),
                    });
                  } catch (e) {
                    alert("Invalid JSON: " + (e as Error).message);
                  }
                }}
                disabled={cleanManual.status === "pending"}
                className="w-full h-9 bg-[#4EA8A1] text-white rounded text-xs disabled:opacity-50"
              >
                {cleanManual.status === "pending"
                  ? "Running…"
                  : "Run Manual Clean"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
