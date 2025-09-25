import {
  useAdminMicrolocation,
  useAdminMicrolocations,
  type MicrolocationFilters,
} from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import Head from "next/head";
import { useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function MicrolocationsView() {
  const [filters, setFilters] = useState<MicrolocationFilters>({
    page: 1,
    limit: 20,
    sort: "-createdAt",
    q: "",
    state: "",
    macroLocation: "",
    clusterType: "",
    tag: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  function update<K extends keyof MicrolocationFilters>(
    key: K,
    val: MicrolocationFilters[K]
  ) {
    setFilters((f) => ({
      ...f,
      [key]: val,
      page: key === "page" ? (val as number) : 1,
    }));
  }

  const { data, isLoading, isError, refetch } = useAdminMicrolocations(filters);
  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 20;
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: detail, isLoading: loadingDetail } = useAdminMicrolocation(
    selectedId || undefined
  );

  const columns: TableColumn[] = useMemo(
    () => [
      {
        key: "microlocationTag",
        label: "Tag",
        render: (value: unknown) =>
          typeof value === "string" ? (
            <span className="text-[11px] font-mono bg-gray-100 rounded px-2 py-1">
              {value}
            </span>
          ) : (
            "—"
          ),
      },
      {
        key: "microLocation",
        label: "Micro",
        render: (value: unknown, row: Record<string, unknown>) => {
          const name = typeof value === "string" ? value : "";
          const cluster =
            typeof row["clusterType"] === "string"
              ? (row["clusterType"] as string)
              : "";
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{name || "—"}</span>
              {cluster && (
                <span className="text-[10px] text-gray-500 truncate">
                  {cluster}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "macroLocation",
        label: "Macro",
        render: (value: unknown) => (typeof value === "string" ? value : "—"),
      },
      {
        key: "state",
        label: "State",
        render: (value: unknown) => (typeof value === "string" ? value : "—"),
      },
      {
        key: "avg_1bed_price_sqm",
        label: "1BR ₦/sqm",
        align: "right",
        render: (value: unknown) =>
          typeof value === "number" ? value.toLocaleString() : "—",
      },
      {
        key: "avg_2bed_price_sqm",
        label: "2BR ₦/sqm",
        align: "right",
        render: (value: unknown) =>
          typeof value === "number" ? value.toLocaleString() : "—",
      },
      {
        key: "avg_3bed_price_sqm",
        label: "3BR ₦/sqm",
        align: "right",
        render: (value: unknown) =>
          typeof value === "number" ? value.toLocaleString() : "—",
      },
      {
        key: "avg_land_price_sqm",
        label: "Land ₦/sqm",
        align: "right",
        render: (value: unknown) =>
          typeof value === "number" ? value.toLocaleString() : "—",
      },
      {
        key: "createdAt",
        label: "Added",
        align: "center",
        render: (value: unknown) => {
          let date: Date | null = null;
          if (value instanceof Date) date = value;
          else if (typeof value === "string") {
            const d = new Date(value);
            if (!isNaN(d.getTime())) date = d;
          }
          return date
            ? date.toLocaleDateString("en-US", {
                year: "2-digit",
                month: "short",
                day: "2-digit",
              })
            : "—";
        },
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (_: unknown, row: Record<string, unknown>) => {
          const id = typeof row["_id"] === "string" ? row["_id"] : null;
          return (
            <div className="flex justify-center">
              <TableButton
                size="sm"
                variant="secondary"
                onClick={() => id && setSelectedId(id)}
              >
                View
              </TableButton>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Head>
        <title>Microlocations — Inda Admin</title>
      </Head>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Microlocations</h1>
          <p className="text-sm text-gray-600 mt-1">
            Explore and manage microlocation intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg hover:bg-[#4EA8A1]/90 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="border border-[#4EA8A1] text-[#4EA8A1] flex items-center h-11 rounded-lg px-3">
        <CiSearch size={18} className="mr-2" />
        <input
          className="w-full border-none focus:outline-none placeholder:text-[#4EA8A1] bg-transparent"
          placeholder="Search tag, micro or macro location"
          value={filters.q || ""}
          onChange={(e) => update("q", e.target.value)}
        />
        {filters.q && (
          <button
            type="button"
            className="text-xs text-[#4EA8A1] px-2 py-1 rounded hover:bg-[#4EA8A1]/10"
            onClick={() => update("q", "")}
          >
            Clear
          </button>
        )}
      </div>

      {/* Advanced toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2 border text-sm rounded-lg transition-colors ${
            showAdvanced
              ? "bg-[#4EA8A1] border-[#4EA8A1] text-white"
              : "border-[#4EA8A1] text-[#4EA8A1] hover:bg-[#4EA8A1] hover:text-white"
          }`}
        >
          <span>⚙️</span>
          Advanced Filter
        </button>
        {(filters.state ||
          filters.macroLocation ||
          filters.clusterType ||
          filters.tag) && (
          <button
            type="button"
            onClick={() =>
              setFilters((f) => ({
                ...f,
                state: "",
                macroLocation: "",
                clusterType: "",
                tag: "",
                page: 1,
              }))
            }
            className="text-xs text-[#4EA8A1] hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid gap-4 md:grid-cols-5 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">State</label>
            <input
              value={filters.state || ""}
              onChange={(e) => update("state", e.target.value)}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              placeholder="e.g. Lagos"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Macro Location
            </label>
            <input
              value={filters.macroLocation || ""}
              onChange={(e) => update("macroLocation", e.target.value)}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Cluster Type
            </label>
            <input
              value={filters.clusterType || ""}
              onChange={(e) => update("clusterType", e.target.value)}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              placeholder="e.g. premium"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Tag</label>
            <input
              value={filters.tag || ""}
              onChange={(e) => update("tag", e.target.value)}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              placeholder="unique tag"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Sort</label>
            <select
              value={filters.sort}
              onChange={(e) => update("sort", e.target.value)}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
            >
              <option value="-createdAt">Newest</option>
              <option value="microLocation">Micro A-Z</option>
              <option value="-microLocation">Micro Z-A</option>
              <option value="state">State A-Z</option>
              <option value="-state">State Z-A</option>
            </select>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading microlocations...
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load microlocations.
        </div>
      )}

      {!isLoading && !isError && (
        <Table
          columns={columns}
          data={data?.items || []}
          emptyMessage="No microlocations found."
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

      {selectedId && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setSelectedId(null)}
          />
          <aside className="w-full max-w-md h-full bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Microlocation Details</h2>
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto text-sm space-y-4">
              {loadingDetail && <div className="text-gray-500">Loading...</div>}
              {!loadingDetail && detail && (
                <div className="space-y-4">
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Identity
                    </h3>
                    <dl className="grid grid-cols-2 gap-2">
                      <dt className="text-gray-500">Tag</dt>
                      <dd className="font-mono break-all">
                        {String(detail.microlocationTag || "—")}
                      </dd>
                      <dt className="text-gray-500">Micro</dt>
                      <dd>{String(detail.microLocation || "—")}</dd>
                      <dt className="text-gray-500">Macro</dt>
                      <dd>{String(detail.macroLocation || "—")}</dd>
                      <dt className="text-gray-500">State</dt>
                      <dd>{String(detail.state || "—")}</dd>
                      <dt className="text-gray-500">Country</dt>
                      <dd>{String(detail.country || "—")}</dd>
                      <dt className="text-gray-500">Cluster</dt>
                      <dd>{String(detail.clusterType || "—")}</dd>
                    </dl>
                  </section>
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Pricing (₦ / sqm)
                    </h3>
                    <dl className="grid grid-cols-2 gap-2">
                      <dt className="text-gray-500">1 Bed</dt>
                      <dd>
                        {typeof detail.avg_1bed_price_sqm === "number"
                          ? detail.avg_1bed_price_sqm.toLocaleString()
                          : "—"}
                      </dd>
                      <dt className="text-gray-500">2 Bed</dt>
                      <dd>
                        {typeof detail.avg_2bed_price_sqm === "number"
                          ? detail.avg_2bed_price_sqm.toLocaleString()
                          : "—"}
                      </dd>
                      <dt className="text-gray-500">3 Bed</dt>
                      <dd>
                        {typeof detail.avg_3bed_price_sqm === "number"
                          ? detail.avg_3bed_price_sqm.toLocaleString()
                          : "—"}
                      </dd>
                      <dt className="text-gray-500">Studio</dt>
                      <dd>
                        {typeof detail.avg_studio_price_sqm === "number"
                          ? detail.avg_studio_price_sqm.toLocaleString()
                          : "—"}
                      </dd>
                      <dt className="text-gray-500">Land</dt>
                      <dd>
                        {typeof detail.avg_land_price_sqm === "number"
                          ? detail.avg_land_price_sqm.toLocaleString()
                          : "—"}
                      </dd>
                    </dl>
                  </section>
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Accessibility & Scores
                    </h3>
                    <dl className="grid grid-cols-2 gap-2">
                      <dt className="text-gray-500">Transport</dt>
                      <dd>
                        {typeof detail.transport_score === "number"
                          ? detail.transport_score
                          : "—"}
                      </dd>
                      <dt className="text-gray-500">Schools</dt>
                      <dd>
                        {typeof detail.school_quality_score === "number"
                          ? detail.school_quality_score
                          : "—"}
                      </dd>
                      <dt className="text-gray-500">Hospitals</dt>
                      <dd>
                        {typeof detail.hospital_access_score === "number"
                          ? detail.hospital_access_score
                          : "—"}
                      </dd>
                      <dt className="text-gray-500">Airport (km)</dt>
                      <dd>
                        {typeof detail.proximity_airport_km === "number"
                          ? detail.proximity_airport_km
                          : "—"}
                      </dd>
                      <dt className="text-gray-500">Rent/Purchase Ratio</dt>
                      <dd>
                        {typeof detail.rental_vs_purchase_demand_ratio ===
                        "number"
                          ? detail.rental_vs_purchase_demand_ratio
                          : "—"}
                      </dd>
                    </dl>
                  </section>
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Timestamps
                    </h3>
                    <dl className="grid grid-cols-2 gap-2">
                      <dt className="text-gray-500">Created</dt>
                      <dd>
                        {detail.createdAt
                          ? new Date(
                              detail.createdAt as string
                            ).toLocaleString()
                          : "—"}
                      </dd>
                      <dt className="text-gray-500">Updated</dt>
                      <dd>
                        {detail.updatedAt
                          ? new Date(
                              detail.updatedAt as string
                            ).toLocaleString()
                          : "—"}
                      </dd>
                    </dl>
                  </section>
                  {Array.isArray(detail.aliases) &&
                    detail.aliases.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                          Aliases
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {detail.aliases.map((a: unknown, i: number) => (
                            <li key={i}>{String(a)}</li>
                          ))}
                        </ul>
                      </section>
                    )}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
