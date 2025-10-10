import { useAdminListings, useDeleteListing, type ListingFilters } from "@/api";
import CreateListingModal from "@/components/CreateListingModal";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import { formatPrice } from "@/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function ListingsView() {
  const router = useRouter();
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    limit: 20,
    sort: "-createdAt",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(
    null
  );
  const { data, isLoading, isError, refetch } = useAdminListings(filters);

  const deleteMutation = useDeleteListing(deletingListingId || "");

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

  // Execute delete when deletingListingId is set
  useEffect(() => {
    if (deletingListingId) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          setDeletingListingId(null);
          refetch();
        },
        onError: (error) => {
          console.error("Delete error:", error);
          alert(
            "Failed to delete listing. Please try again or contact support."
          );
          setDeletingListingId(null);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletingListingId]);

  // Calculate pagination data
  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 20;
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Action handlers
  const handleEdit = useCallback((row: Record<string, unknown>) => {
    const id = typeof row["_id"] === "string" ? row["_id"] : null;
    if (id) {
      setEditingListingId(id);
    }
  }, []);

  const handleDelete = useCallback((row: Record<string, unknown>) => {
    const id = typeof row["_id"] === "string" ? row["_id"] : null;
    const title =
      typeof row["title"] === "string" ? row["title"] : "this listing";

    if (!id) return;

    setDeleteConfirm({ id, title });
  }, []);

  const handleRowClick = useCallback(
    (row: Record<string, unknown>) => {
      const id = typeof row["_id"] === "string" ? row["_id"] : null;

      if (id) {
        router.push(`/dashboard/listings/${id}`);
      }
    },
    [router]
  );

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
              onClick={(e) => e.stopPropagation()}
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
        key: "actions",
        label: "Actions",
        align: "center" as const,
        render: (_value: unknown, row: Record<string, unknown>) => (
          <div
            className="flex items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <TableButton
              variant="primary"
              size="sm"
              onClick={() => handleEdit(row)}
            >
              Edit
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
    [handleDelete, handleEdit]
  );

  return (
    <>
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
            <button
              className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg hover:bg-[#3F8C86] transition-colors text-sm"
              onClick={() => setIsCreateOpen(true)}
            >
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
            onRowClick={handleRowClick}
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
      {isCreateOpen && (
        <CreateListingModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            refetch();
            setIsCreateOpen(false);
          }}
        />
      )}
      {editingListingId && (
        <CreateListingModal
          listingId={editingListingId}
          onClose={() => setEditingListingId(null)}
          onSuccess={() => {
            refetch();
            setEditingListingId(null);
          }}
        />
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-red-200 overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-red-200 bg-red-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <FiAlertTriangle className="text-red-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Delete Listing
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
                type="button"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to permanently delete this listing?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-3">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {deleteConfirm.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {deleteConfirm.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeletingListingId(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
