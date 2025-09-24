import { useAdminListings, type ListingFilters } from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import { formatPrice } from "@/utils";
import Head from "next/head";
import { useMemo, useState } from "react";
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

  // Calculate pagination data
  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 20;
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Define table columns based on real API data structure
  const columns: TableColumn[] = useMemo(
    () => [
      {
        key: "source",
        label: "Source",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const src = row["source"];
          return typeof src === "string" && src.length > 0 ? src : "Admin";
        },
      },
      {
        key: "title",
        label: "Title",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const t = row["title"];
          const title = typeof t === "string" && t.length > 0 ? t : "Untitled";
          const urlVal = row["listingUrl"];
          const url =
            typeof urlVal === "string" && urlVal.length > 0
              ? urlVal
              : undefined;

          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4EA8A1] hover:underline font-medium"
              title={title}
            >
              {title}
            </a>
          ) : (
            <span className="font-medium" title={title}>
              {title}
            </span>
          );
        },
      },
      {
        key: "propertyRef",
        label: "Ref ID",
        render: (value: unknown) => (
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
            {typeof value === "string" && value.length > 0 ? value : "—"}
          </span>
        ),
      },
      {
        key: "propertyTypeStd",
        label: "Type",
        render: (value: unknown) =>
          typeof value === "string" && value.length > 0 ? value : "—",
      },
      {
        key: "bedrooms",
        label: "Beds",
        align: "center" as const,
        render: (value: unknown) => (typeof value === "number" ? value : "—"),
      },
      {
        key: "bathrooms",
        label: "Baths",
        align: "center" as const,
        render: (value: unknown) => (typeof value === "number" ? value : "—"),
      },
      {
        key: "sizeSqm",
        label: "Size (sqm)",
        align: "center" as const,
        render: (value: unknown) =>
          typeof value === "number" ? value.toLocaleString() : "—",
      },
      {
        key: "priceNGN",
        label: "Price (NGN)",
        align: "right" as const,
        render: (value: unknown) =>
          typeof value === "number" ? (
            <span className="font-medium">{formatPrice(value)}</span>
          ) : (
            "—"
          ),
      },
      {
        key: "microlocationStd",
        label: "Location",
        render: (value: unknown, row: Record<string, unknown>) => {
          const lgaVal = row["lga"];
          const strVal =
            typeof value === "string" && value.length > 0 ? value : undefined;
          const lga =
            typeof lgaVal === "string" && lgaVal.length > 0
              ? lgaVal
              : undefined;
          const location = strVal || lga || "—";
          return (
            <span title={location} className="truncate">
              {location}
            </span>
          );
        },
      },
      {
        key: "analytics",
        label: "FMV (NGN)",
        align: "right" as const,
        render: (value: unknown) => {
          let fmvValue: number | undefined;
          if (value && typeof value === "object") {
            const fmv = (value as Record<string, unknown>)["fmv"];
            if (fmv && typeof fmv === "object") {
              const v = (fmv as Record<string, unknown>)["valueNGN"];
              if (typeof v === "number") fmvValue = v;
            }
          }
          return typeof fmvValue === "number" ? (
            <span className="font-medium">{formatPrice(fmvValue)}</span>
          ) : (
            "—"
          );
        },
      },
      {
        key: "indaScore",
        label: "Inda Score",
        align: "center" as const,
        render: (value: unknown) => {
          let score: number | undefined;
          if (value && typeof value === "object") {
            const s = (value as Record<string, unknown>)["finalScore"];
            if (typeof s === "number") score = s;
          }
          if (!score) return "—";

          const getScoreColor = (score: number) => {
            if (score >= 80) return "text-green-600 bg-green-100";
            if (score >= 60) return "text-yellow-600 bg-yellow-100";
            return "text-red-600 bg-red-100";
          };

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                score
              )}`}
            >
              {score}
            </span>
          );
        },
      },
      {
        key: "listingStatus",
        label: "Status",
        align: "center" as const,
        render: (value: unknown) => {
          const val = typeof value === "string" ? value : "";
          const getStatusColor = (status: string) => {
            switch (status) {
              case "active":
                return "text-green-600 bg-green-100";
              case "sold":
                return "text-blue-600 bg-blue-100";
              default:
                return "text-gray-600 bg-gray-100";
            }
          };

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                val
              )}`}
            >
              {val || "Unknown"}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        align: "center" as const,
        render: (_value: unknown, row: Record<string, unknown>) => (
          <div className="flex items-center justify-center gap-2">
            <TableButton
              variant="secondary"
              size="sm"
              onClick={() => handleFlag(row)}
            >
              Flag
            </TableButton>
            <TableButton
              variant="danger"
              size="sm"
              onClick={() => handleDelete(row)}
            >
              Delete
            </TableButton>
          </div>
        ),
      },
    ],
    []
  );

  // Action handlers
  const handleFlag = (row: Record<string, unknown>) => {
    console.log("Flag listing:", row);
    // Implement flag functionality
  };

  const handleDelete = (row: Record<string, unknown>) => {
    console.log("Delete listing:", row);
    // Implement delete functionality
  };

  return (
    <div className="space-y-4">
      <Head>
        <title>Listings — Inda Admin</title>
      </Head>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Listings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and review all property listings in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg hover:bg-[#4EA8A1]/90 transition-colors text-sm">
            Export Data
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Add Listing
          </button>
          <button
            onClick={() => refetch()}
            className="text-sm text-[#4EA8A1] hover:text-[#4EA8A1]/80"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="border border-[#4EA8A1] text-[#4EA8A1] flex items-center h-11 rounded-lg px-3">
        <CiSearch size={18} className="mr-2" />
        <input
          className="w-full border-none focus:outline-none placeholder:text-[#4EA8A1]"
          placeholder="Search by title or URL"
          value={filters.q || ""}
          onChange={(e) => update("q", e.target.value)}
        />
      </div>

      {/* Advanced Filter */}
      <div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#4EA8A1] text-[#4EA8A1] rounded-lg hover:bg-[#4EA8A1] hover:text-white transition-colors w-fit">
          <span className="text-sm">⚙️</span>
          Advanced Filter
        </button>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading listings...
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load listings. Please try again.
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Table
          columns={columns}
          data={data?.items || []}
          emptyMessage="No listings found. Try adjusting your filters."
        />
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => update("page", page)}
          className="mt-6"
        />
      )}
    </div>
  );
}
