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
        render: (value: any, row: any) => row.source || "Admin",
      },
      {
        key: "title",
        label: "Title",
        render: (value: string, row: any) => {
          const title = row.title || "Untitled";
          const url = row.listingUrl;

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
        render: (value: string) => (
          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
            {value || "—"}
          </span>
        ),
      },
      {
        key: "propertyTypeStd",
        label: "Type",
        render: (value: string) => value || "—",
      },
      {
        key: "bedrooms",
        label: "Beds",
        align: "center" as const,
        render: (value: number) => value || "—",
      },
      {
        key: "bathrooms",
        label: "Baths",
        align: "center" as const,
        render: (value: number) => value || "—",
      },
      {
        key: "sizeSqm",
        label: "Size (sqm)",
        align: "center" as const,
        render: (value: number) => (value ? value.toLocaleString() : "—"),
      },
      {
        key: "priceNGN",
        label: "Price (NGN)",
        align: "right" as const,
        render: (value: number) =>
          value ? (
            <span className="font-medium">{formatPrice(value)}</span>
          ) : (
            "—"
          ),
      },
      {
        key: "microlocationStd",
        label: "Location",
        render: (value: string, row: any) => {
          const location = value || row.lga || "—";
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
        render: (value: any, row: any) => {
          const fmvValue = value?.fmv?.valueNGN;
          return fmvValue ? (
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
        render: (value: any) => {
          const score = value?.finalScore;
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
        render: (value: string) => {
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
                value
              )}`}
            >
              {value || "Unknown"}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        align: "center" as const,
        render: (value: any, row: any) => (
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
  const handleFlag = (row: any) => {
    console.log("Flag listing:", row);
    // Implement flag functionality
  };

  const handleDelete = (row: any) => {
    console.log("Delete listing:", row);
    // Implement delete functionality
  };

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

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#4EA8A1] text-[#4EA8A1] rounded-lg hover:bg-[#4EA8A1] hover:text-white transition-colors w-fit">
          <span className="text-sm">⚙️</span>
          Advanced Filter
        </button>
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
