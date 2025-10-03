import {
  useAdminMicrolocation,
  useAdminMicrolocationListingsSummary,
  useAdminMicrolocationMeta,
  useAdminMicrolocations,
  useAdminMicrolocationStats,
  useCreateMicrolocation,
  usePatchMicrolocationMetrics,
  useRestoreMicrolocation,
  useSoftDeleteMicrolocation,
  useUpdateMicrolocation,
  useUpdateMicrolocationGeo,
  useMicrolocationDataset,
  useCreateMicrolocationDatasetItem,
  usePatchMicrolocationDatasetItem,
  useDeleteMicrolocationDatasetItem,
  type MicrolocationFilters,
  type MicrolocationDatasetType,
} from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import Head from "next/head";
import { useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function MicrolocationsView() {
  const [tab, setTab] = useState<
    "browse" | "fmv" | "appreciation" | "yields"
  >("browse");
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
  // Fetch meta + stats for richer UI
  const { data: meta } = useAdminMicrolocationMeta();
  const { data: stats } = useAdminMicrolocationStats();

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
  const [showCreate, setShowCreate] = useState(false);
  const [identityEdit, setIdentityEdit] = useState(false);
  const [metricsEdit, setMetricsEdit] = useState(false);
  const [geoEdit, setGeoEdit] = useState(false);

  // Local draft forms
  const [createDraft, setCreateDraft] = useState({
    country: "",
    state: "",
    macroLocation: "",
    microLocation: "",
    clusterType: "",
    microlocationTag: "",
  });
  const [identityDraft, setIdentityDraft] = useState<Record<string, string>>(
    {}
  );
  const [metricsDraft, setMetricsDraft] = useState<
    Record<string, number | string>
  >({});
  const [geoDraft, setGeoDraft] = useState<{ lat?: string; lng?: string }>({});
  const { data: detail, isLoading: loadingDetail } = useAdminMicrolocation(
    selectedId || undefined
  );
  const { data: listingSummary } = useAdminMicrolocationListingsSummary(
    selectedId || undefined
  );

  // Instantiate mutations bound to current selection
  const createMutation = useCreateMicrolocation();
  const updateMutation = useUpdateMicrolocation(selectedId || "");
  const patchMetrics = usePatchMicrolocationMetrics(selectedId || "");
  const updateGeo = useUpdateMicrolocationGeo(selectedId || "");
  const softDelete = useSoftDeleteMicrolocation(selectedId || "");
  const restoreMutation = useRestoreMicrolocation(selectedId || "");

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
        key: "flags",
        label: "Flags",
        align: "center",
        render: (_: unknown, row: Record<string, unknown>) => {
          const hasGeo = !!(
            row["geoPoint"] && typeof row["geoPoint"] === "object"
          );
          // metrics heuristic: any numeric field with _price_sqm or score
          let hasMetrics = false;
          for (const k in row) {
            if (
              /(_price_sqm|score|ratio|trend)/i.test(k) &&
              typeof row[k] === "number"
            ) {
              hasMetrics = true;
              break;
            }
          }
          return (
            <div className="flex items-center justify-center gap-1">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  hasGeo
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
                title={hasGeo ? "Has Geo" : "No Geo"}
              >
                geo
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  hasMetrics
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
                title={hasMetrics ? "Has Metrics" : "No Metrics"}
              >
                met
              </span>
            </div>
          );
        },
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
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#4EA8A1] hover:bg-[#3F8C86] text-white rounded-lg text-sm transition-colors"
          >
            New
          </button>
          <button
            onClick={() => exportCsv(data?.items || [])}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {[
          { key: "browse", label: "Browse" },
          { key: "fmv", label: "FMV Dataset" },
          { key: "appreciation", label: "Appreciation Dataset" },
          { key: "yields", label: "Yields Dataset" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
              tab === t.key
                ? "bg-[#4EA8A1] text-white border-[#4EA8A1]"
                : "border-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search (only for Browse) */}
      {tab === "browse" && (
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
        {(filters.q ||
          filters.state ||
          filters.macroLocation ||
          filters.clusterType ||
          filters.tag) && (
          <button
            type="button"
            className="ml-2 text-xs text-red-600 px-2 py-1 rounded hover:bg-red-50"
            onClick={() =>
              setFilters({
                page: 1,
                limit: 20,
                sort: "-createdAt",
                q: "",
                state: "",
                macroLocation: "",
                clusterType: "",
                tag: "",
              })
            }
          >
            Reset All
          </button>
        )}
        </div>
      )}

      {/* Advanced toggle (only for Browse) */}
      {tab === "browse" && (
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
      )}

      {tab === "browse" && showAdvanced && (
        <div className="grid gap-4 md:grid-cols-5 bg-white border border-gray-200 rounded-lg p-4">
          {/* State */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">State</label>
            {meta?.states?.length ? (
              <select
                value={filters.state || ""}
                onChange={(e) => update("state", e.target.value)}
                className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              >
                <option value="">Any</option>
                {meta.states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={filters.state || ""}
                onChange={(e) => update("state", e.target.value)}
                className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
                placeholder="e.g. Lagos"
              />
            )}
          </div>
          {/* Macro */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Macro Location
            </label>
            {meta?.macroLocations?.length ? (
              <select
                value={filters.macroLocation || ""}
                onChange={(e) => update("macroLocation", e.target.value)}
                className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              >
                <option value="">Any</option>
                {meta.macroLocations.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={filters.macroLocation || ""}
                onChange={(e) => update("macroLocation", e.target.value)}
                className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              />
            )}
          </div>
          {/* Cluster Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Cluster Type
            </label>
            {meta?.clusterTypes?.length ? (
              <select
                value={filters.clusterType || ""}
                onChange={(e) => update("clusterType", e.target.value)}
                className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              >
                <option value="">Any</option>
                {meta.clusterTypes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={filters.clusterType || ""}
                onChange={(e) => update("clusterType", e.target.value)}
                className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
                placeholder="e.g. premium"
              />
            )}
          </div>
          {/* Tag */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Tag</label>
            {meta?.tags?.length ? (
              <select
                value={filters.tag || ""}
                onChange={(e) => update("tag", e.target.value)}
                className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
              >
                <option value="">Any</option>
                {meta.tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={filters.tag || ""}
                onChange={(e) => update("tag", e.target.value)}
                className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
                placeholder="unique tag"
              />
            )}
          </div>
          {/* Sort */}
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

      {/* Stats Bar */}
      {!isLoading && !isError && stats && (
        <div className="grid sm:grid-cols-5 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard
            label="With Geo"
            value={stats.withGeo}
            suffix={
              stats.percentWithGeo != null
                ? ` (${stats.percentWithGeo}%)`
                : undefined
            }
          />
          <StatCard
            label="With Metrics"
            value={stats.withAnyMetric}
            suffix={
              stats.percentWithAnyMetric != null
                ? ` (${stats.percentWithAnyMetric}%)`
                : undefined
            }
          />
          <StatCard
            label="Avg 1BR ₦/sqm"
            value={average(data?.items, "avg_1bed_price_sqm")}
            isNumber
          />
          <StatCard
            label="Avg 3BR ₦/sqm"
            value={average(data?.items, "avg_3bed_price_sqm")}
            isNumber
          />
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

      {/* Browse tab content */}
      {tab === "browse" && !isLoading && !isError && (
        <>
          <Table
            columns={columns}
            data={data?.items || []}
            emptyMessage="No microlocations found."
          />
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => update("page", p)}
              className="mt-6"
            />
          )}
        </>
      )}

      {/* Dataset tabs */}
      {tab !== "browse" && (
        <MicrolocationDatasetTab dataset={tab as MicrolocationDatasetType} />
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
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          setIdentityEdit((v) => !v);
                          setIdentityDraft({
                            macroLocation: String(detail.macroLocation || ""),
                            state: String(detail.state || ""),
                            country: String(detail.country || ""),
                            clusterType: String(detail.clusterType || ""),
                          });
                        }}
                        className="text-xs text-[#4EA8A1] hover:underline"
                      >
                        {identityEdit ? "Cancel" : "Edit Identity"}
                      </button>
                    </div>
                    {identityEdit && (
                      <form
                        className="mt-3 space-y-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!selectedId) return;
                          updateMutation.mutate(identityDraft as any, {
                            onSuccess: () => setIdentityEdit(false),
                          });
                        }}
                      >
                        {Object.entries(identityDraft).map(([k, v]) => (
                          <div key={k} className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wide text-gray-500">
                              {k}
                            </label>
                            <input
                              value={v}
                              onChange={(e) =>
                                setIdentityDraft((d) => ({
                                  ...d,
                                  [k]: e.target.value,
                                }))
                              }
                              className="h-8 border rounded px-2 text-xs"
                            />
                          </div>
                        ))}
                        <button
                          type="submit"
                          disabled={updateMutation.status === "pending"}
                          className="w-full h-8 bg-[#4EA8A1] text-white rounded text-xs disabled:opacity-50"
                        >
                          {updateMutation.status === "pending"
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </form>
                    )}
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
                        <section>
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Metrics & Geo
                            </h3>
                            <button
                              onClick={() => setMetricsEdit((v) => !v)}
                              className="text-[10px] text-[#4EA8A1] hover:underline"
                            >
                              {metricsEdit ? "Cancel Metrics" : "Edit Metrics"}
                            </button>
                            <button
                              onClick={() => setGeoEdit((v) => !v)}
                              className="text-[10px] text-[#4EA8A1] hover:underline"
                            >
                              {geoEdit ? "Cancel Geo" : "Set Geo"}
                            </button>
                          </div>
                          {metricsEdit && (
                            <form
                              className="space-y-2 mb-3"
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!selectedId) return;
                                patchMetrics.mutate(metricsDraft, {
                                  onSuccess: () => setMetricsEdit(false),
                                });
                              }}
                            >
                              <div className="grid grid-cols-2 gap-2">
                                {Object.keys(detail)
                                  .filter((k) =>
                                    /(_price_sqm|score|ratio|trend)/i.test(k)
                                  )
                                  .slice(0, 8)
                                  .map((k) => (
                                    <div
                                      key={k}
                                      className="flex flex-col gap-1"
                                    >
                                      <label
                                        className="text-[10px] uppercase tracking-wide text-gray-500 truncate"
                                        title={k}
                                      >
                                        {k}
                                      </label>
                                      <input
                                        type="number"
                                        defaultValue={
                                          typeof detail[k] === "number"
                                            ? (detail[k] as number)
                                            : undefined
                                        }
                                        onChange={(e) =>
                                          setMetricsDraft((d) => ({
                                            ...d,
                                            [k]: Number(e.target.value),
                                          }))
                                        }
                                        className="h-8 border rounded px-2 text-xs"
                                      />
                                    </div>
                                  ))}
                              </div>
                              <button
                                type="submit"
                                disabled={patchMetrics.status === "pending"}
                                className="w-full h-8 bg-[#4EA8A1] text-white rounded text-xs disabled:opacity-50"
                              >
                                {patchMetrics.status === "pending"
                                  ? "Saving..."
                                  : "Save Metrics"}
                              </button>
                            </form>
                          )}
                          {geoEdit && (
                            <form
                              className="space-y-2"
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!selectedId) return;
                                if (geoDraft.lat && geoDraft.lng) {
                                  updateGeo.mutate(
                                    {
                                      lat: Number(geoDraft.lat),
                                      lng: Number(geoDraft.lng),
                                    },
                                    { onSuccess: () => setGeoEdit(false) }
                                  );
                                }
                              }}
                            >
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase tracking-wide text-gray-500">
                                    Lat
                                  </label>
                                  <input
                                    value={geoDraft.lat || ""}
                                    onChange={(e) =>
                                      setGeoDraft((d) => ({
                                        ...d,
                                        lat: e.target.value,
                                      }))
                                    }
                                    className="h-8 border rounded px-2 text-xs"
                                    placeholder="6.45"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase tracking-wide text-gray-500">
                                    Lng
                                  </label>
                                  <input
                                    value={geoDraft.lng || ""}
                                    onChange={(e) =>
                                      setGeoDraft((d) => ({
                                        ...d,
                                        lng: e.target.value,
                                      }))
                                    }
                                    className="h-8 border rounded px-2 text-xs"
                                    placeholder="3.48"
                                  />
                                </div>
                              </div>
                              <button
                                type="submit"
                                disabled={updateGeo.status === "pending"}
                                className="w-full h-8 bg-[#4EA8A1] text-white rounded text-xs disabled:opacity-50"
                              >
                                {updateGeo.status === "pending"
                                  ? "Saving..."
                                  : "Save Geo"}
                              </button>
                            </form>
                          )}
                        </section>
                        <section>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                            Danger / Lifecycle
                          </h3>
                          <button
                            onClick={() =>
                              detail.isDeleted
                                ? restoreMutation.mutate(undefined, {
                                    onSuccess: () => setSelectedId(null),
                                  })
                                : softDelete.mutate(undefined, {
                                    onSuccess: () => setSelectedId(null),
                                  })
                            }
                            disabled={
                              softDelete.status === "pending" ||
                              restoreMutation.status === "pending"
                            }
                            className={`w-full h-8 rounded text-xs font-medium border transition-colors ${
                              detail.isDeleted
                                ? "border-green-600 text-green-700 hover:bg-green-50"
                                : "border-red-600 text-red-700 hover:bg-red-50"
                            } disabled:opacity-50`}
                          >
                            {softDelete.status === "pending" ||
                            restoreMutation.status === "pending"
                              ? "Processing..."
                              : detail.isDeleted
                              ? "Restore"
                              : "Soft Delete"}
                          </button>
                        </section>
                      </dd>
                      <dt className="text-gray-500">Land</dt>
                      <dd>
                        {typeof detail.avg_land_price_sqm === "number"
                          ? detail.avg_land_price_sqm.toLocaleString()
                          : "—"}
                      </dd>
                    </dl>
                  </section>
                  {listingSummary && (
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        Listings Summary
                      </h3>
                      <dl className="grid grid-cols-2 gap-2">
                        <dt className="text-gray-500">Total Listings</dt>
                        <dd>{numberOrDash(listingSummary.totalListings)}</dd>
                        <dt className="text-gray-500">Avg Price</dt>
                        <dd>
                          {numberOrDash(listingSummary.avgPriceNGN, true)}
                        </dd>
                        <dt className="text-gray-500">Min Price</dt>
                        <dd>
                          {numberOrDash(listingSummary.minPriceNGN, true)}
                        </dd>
                        <dt className="text-gray-500">Max Price</dt>
                        <dd>
                          {numberOrDash(listingSummary.maxPriceNGN, true)}
                        </dd>
                      </dl>
                    </section>
                  )}
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
      {showCreate && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setShowCreate(false)}
          />
          <div className="w-full max-w-md h-full bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold">New Microlocation</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <form
              className="p-4 space-y-3 overflow-y-auto text-sm"
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(createDraft, {
                  onSuccess: () => {
                    setShowCreate(false);
                    setCreateDraft({
                      country: "",
                      state: "",
                      macroLocation: "",
                      microLocation: "",
                      clusterType: "",
                      microlocationTag: "",
                    });
                  },
                });
              }}
            >
              {Object.entries(createDraft).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wide text-gray-500">
                    {k}
                  </label>
                  <input
                    required
                    value={v}
                    onChange={(e) =>
                      setCreateDraft((d) => ({ ...d, [k]: e.target.value }))
                    }
                    className="h-9 border rounded px-2 text-xs"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={createMutation.status === "pending"}
                className="w-full h-9 bg-[#4EA8A1] text-white rounded text-xs disabled:opacity-50"
              >
                {createMutation.status === "pending" ? "Creating..." : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper small stat card
function StatCard({
  label,
  value,
  suffix,
  isNumber,
}: {
  label: string;
  value: unknown;
  suffix?: string;
  isNumber?: boolean;
}) {
  const display =
    typeof value === "number"
      ? isNumber
        ? value.toLocaleString()
        : value.toLocaleString()
      : "—";
  return (
    <div className="rounded-lg bg-white border border-gray-200 p-3 flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
        {label}
      </span>
      <span className="text-lg font-semibold text-gray-800">
        {display}
        {suffix && (
          <span className="text-xs font-normal text-gray-500 ml-1">
            {suffix}
          </span>
        )}
      </span>
    </div>
  );
}

function average(items: unknown[] | undefined, key: string) {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  let sum = 0;
  let count = 0;
  for (const it of items) {
    if (it && typeof it === "object") {
      const v = (it as Record<string, unknown>)[key];
      if (typeof v === "number") {
        sum += v;
        count++;
      }
    }
  }
  if (!count) return undefined;
  return Math.round(sum / count);
}

function numberOrDash(v: unknown, money = false) {
  if (typeof v !== "number") return "—";
  return money ? v.toLocaleString() : v.toLocaleString();
}

// Mutations (hooks usage) placed after component; declare below to avoid re-renders inside main logic
// NOTE: For file organization we could lift into a custom hook, but kept inline for brevity.

// Utility: export current table data to CSV
function exportCsv(items: Record<string, unknown>[]) {
  if (!items.length) return;
  const cols = Array.from(
    new Set(
      items
        .flatMap((it) => Object.keys(it))
        .filter((k) => typeof k === "string" && !k.startsWith("__"))
    )
  );
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const header = cols.join(",");
  const rows = items.map((it) =>
    cols.map((c) => escape((it as any)[c])).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `microlocations_export_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Hook composition wrapper (kept outside component earlier for separation – but we already invoked inside component)

// Dataset tab component with generic JSON CRUD
function MicrolocationDatasetTab({
  dataset,
}: {
  dataset: MicrolocationDatasetType;
}) {
  const [params, setParams] = useState({ page: 1, limit: 20, q: "", state: "", microlocation: "" });
  const { data, isLoading, isError } = useMicrolocationDataset(dataset, params);
  const createItem = useCreateMicrolocationDatasetItem(dataset);
  const [editorOpen, setEditorOpen] = useState<{
    mode: "create" | "edit" | null;
    id?: string;
    json?: string;
  }>({ mode: null });
  const patchItem = usePatchMicrolocationDatasetItem(dataset, editorOpen.id || "");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteItem = useDeleteMicrolocationDatasetItem(dataset, deletingId || "");

  const items = data?.items || [];
  const cols = inferColumns(items);

  function onSave() {
    if (!editorOpen.mode) return;
    try {
      const payload = editorOpen.json ? (JSON.parse(editorOpen.json) as Record<string, unknown>) : {};
      if (editorOpen.mode === "create") {
        createItem.mutate(payload, { onSuccess: () => setEditorOpen({ mode: null }) });
      } else if (editorOpen.mode === "edit" && editorOpen.id) {
        patchItem.mutate(payload, { onSuccess: () => setEditorOpen({ mode: null }) });
      }
    } catch (e) {
      alert("Invalid JSON: " + (e as Error).message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={params.q}
          onChange={(e) => setParams((p) => ({ ...p, q: e.target.value, page: 1 }))}
          placeholder="Search..."
          className="h-9 border rounded px-2 text-sm"
        />
        <input
          value={params.state}
          onChange={(e) => setParams((p) => ({ ...p, state: e.target.value, page: 1 }))}
          placeholder="State"
          className="h-9 border rounded px-2 text-sm"
        />
        <input
          value={params.microlocation}
          onChange={(e) => setParams((p) => ({ ...p, microlocation: e.target.value, page: 1 }))}
          placeholder="Microlocation"
          className="h-9 border rounded px-2 text-sm"
        />
        <button
          onClick={() => setEditorOpen({ mode: "create", json: "{\n  \"state\": \"\",\n  \"microlocation\": \"\",\n  \"value\": 0\n}" })}
          className="px-3 py-2 bg-[#4EA8A1] text-white rounded text-sm"
        >
          Add Item
        </button>
      </div>

      {isLoading && (
        <div className="rounded border bg-white p-8 text-center text-gray-500">Loading dataset…</div>
      )}
      {isError && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">Failed to load dataset.</div>
      )}
      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {cols.map((c) => (
                  <th key={c} className="px-3 py-2 text-left font-medium whitespace-nowrap">{c}</th>
                ))}
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={cols.length + 1} className="px-3 py-8 text-center text-gray-500">No items</td>
                </tr>
              )}
              {items.map((it, idx) => {
                const id = String((it as Record<string, unknown>)._id || "");
                return (
                  <tr key={id || idx} className={idx % 2 ? "bg-white" : "bg-gray-50/50"}>
                    {cols.map((c) => (
                      <td key={c} className="px-3 py-2 align-top whitespace-nowrap max-w-[240px] truncate" title={stringifyCell((it as any)[c])}>
                        {stringifyCell((it as any)[c])}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() =>
                          setEditorOpen({
                            mode: "edit",
                            id,
                            json: JSON.stringify(it, null, 2),
                          })
                        }
                        className="px-2 py-1 text-xs rounded border mr-2 text-[#4EA8A1] border-[#4EA8A1] hover:bg-[#4EA8A1] hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(id)}
                        className="px-2 py-1 text-xs rounded border text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-600">Total: {data.total.toLocaleString()}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setParams((p) => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }))}
              className="px-2 py-1 rounded border"
            >
              Prev
            </button>
            <span>
              Page {params.page} / {Math.max(1, Math.ceil((data.total || 0) / (params.limit || 20)))}
            </span>
            <button
              onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
              className="px-2 py-1 rounded border"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {(editorOpen.mode === "create" || editorOpen.mode === "edit") && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setEditorOpen({ mode: null })} />
          <div className="w-full max-w-lg h-full bg-white border-l shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {editorOpen.mode === "create" ? "Add Dataset Item" : "Edit Dataset Item"}
              </h3>
              <button className="text-xs text-gray-500" onClick={() => setEditorOpen({ mode: null })}>Close</button>
            </div>
            <div className="p-4 space-y-3 text-sm overflow-y-auto">
              <p className="text-gray-600 text-xs">
                Edit the JSON body. Include state/microlocation keys as needed.
              </p>
              <textarea
                value={editorOpen.json}
                onChange={(e) => setEditorOpen((o) => ({ ...o, json: e.target.value }))}
                className="w-full h-[60vh] border rounded p-2 font-mono text-xs"
              />
              <button
                onClick={onSave}
                disabled={createItem.status === "pending" || patchItem.status === "pending"}
                className="w-full h-9 bg-[#4EA8A1] text-white rounded text-xs disabled:opacity-50"
              >
                {createItem.status === "pending" || patchItem.status === "pending" ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setDeletingId(null)} />
          <div className="w-full max-w-sm h-full bg-white border-l shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold">Confirm Delete</h3>
              <button className="text-xs text-gray-500" onClick={() => setDeletingId(null)}>Close</button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <p>Delete item <span className="font-mono">{deletingId}</span>?</p>
              <button
                onClick={() => deleteItem.mutate(undefined, { onSuccess: () => setDeletingId(null) })}
                disabled={deleteItem.status === "pending"}
                className="w-full h-9 bg-red-600 text-white rounded text-xs disabled:opacity-50"
              >
                {deleteItem.status === "pending" ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function inferColumns(items: unknown[]): string[] {
  if (!Array.isArray(items) || items.length === 0) return ["_id"];
  const keys = new Set<string>();
  for (const it of items) {
    if (it && typeof it === "object") {
      Object.keys(it as Record<string, unknown>)
        .filter((k) => !k.startsWith("__"))
        .slice(0, 12)
        .forEach((k) => keys.add(k));
    }
    if (keys.size >= 12) break;
  }
  return Array.from(keys);
}

function stringifyCell(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
