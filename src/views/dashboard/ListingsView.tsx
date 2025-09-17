import { useAdminListings, type ListingFilters } from "@/api";
import Head from "next/head";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function ListingsView() {
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    limit: 20,
    sort: "-createdAt",
  });
  const { data, isLoading, isError, refetch } = useAdminListings(filters);

  function update<K extends keyof ListingFilters>(
    key: K,
    val: ListingFilters[K]
  ) {
    setFilters((f) => ({
      ...f,
      [key]: val,
      page: key === "page" ? (val as number) : 1,
    }));
  }

  return (
    <div className="space-y-4">
      <Head>
        <title>Listings — Inda Admin</title>
      </Head>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Listings</h1>
        <button onClick={() => refetch()} className="text-sm text-[#4EA8A1]">
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1 border border-[#4EA8A1] text-[#4EA8A1] flex items-center h-11 rounded-lg px-3">
          <CiSearch size={18} className="mr-2" />
          <input
            className="w-full border-none focus:outline-none placeholder:text-[#4EA8A1]"
            placeholder="Search by title or URL"
            value={filters.q || ""}
            onChange={(e) => update("q", e.target.value)}
          />
        </div>
        <select
          className="h-11 rounded-lg border border-black/10 px-3 bg-white"
          value={filters.status || ""}
          onChange={(e) =>
            update(
              "status",
              (e.target.value || undefined) as "active" | "sold" | undefined
            )
          }
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {isLoading && <div className="text-sm text-black/60">Loading…</div>}
      {isError && (
        <div className="text-sm text-red-600">Failed to load listings.</div>
      )}

      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <div className="grid grid-cols-6 gap-3 px-4 py-2 text-xs font-semibold text-black/70 border-b border-black/5">
          <div className="col-span-2">Title</div>
          <div>Type</div>
          <div>Status</div>
          <div>Microlocation</div>
          <div>Created</div>
        </div>
        <div>
          {data?.items?.map((lRaw, idx) => {
            const l = lRaw as {
              id?: string;
              _id?: string;
              listingUrl?: string;
              title?: string;
              propertyType?: string;
              status?: string;
              listingStatus?: string;
              microlocationStd?: string;
              lga?: string;
              createdAt?: string | number | Date;
            };
            const key = l.id || l._id || l.listingUrl || String(idx);
            return (
              <div
                key={key}
                className="grid grid-cols-6 gap-3 px-4 py-3 text-sm border-b border-black/5"
              >
                <div
                  className="col-span-2 truncate"
                  title={l.title || l.listingUrl}
                >
                  {l.title || l.listingUrl || "—"}
                </div>
                <div>{l.propertyType || "—"}</div>
                <div className="capitalize">
                  {l.status || l.listingStatus || "—"}
                </div>
                <div className="truncate" title={l.microlocationStd || l.lga}>
                  {l.microlocationStd || l.lga || "—"}
                </div>
                <div>
                  {l.createdAt
                    ? new Date(
                        l.createdAt as string | number | Date
                      ).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            );
          })}
          {data && data.items?.length === 0 && (
            <div className="px-4 py-6 text-sm text-black/60">
              No listings found.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <button
          disabled={(filters.page || 1) <= 1}
          onClick={() => update("page", (filters.page || 1) - 1)}
          className="px-3 py-1 rounded bg-black/5 disabled:opacity-50"
        >
          Prev
        </button>
        <div>Page {filters.page || 1}</div>
        <button
          onClick={() => update("page", (filters.page || 1) + 1)}
          className="px-3 py-1 rounded bg-black/5"
        >
          Next
        </button>
      </div>
    </div>
  );
}
