import { useAdminUsers } from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";

export default function UsersView() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sort: "-createdAt",
    q: "",
  });
  const { data, isLoading, isError, refetch } = useAdminUsers(filters);

  function update<K extends keyof typeof filters>(
    key: K,
    val: (typeof filters)[K]
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

  // Action handlers
  const handleEdit = useCallback((row: Record<string, unknown>) => {
    console.log("Edit user:", row);
    // Implement edit functionality
  }, []);

  const handleToggleBlock = useCallback((row: Record<string, unknown>) => {
    console.log("Toggle block user:", row);
    // Implement block/unblock functionality
  }, []);

  // Define table columns
  const columns: TableColumn[] = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const fn = row["firstName"];
          const ln = row["lastName"];
          const firstName = typeof fn === "string" ? fn : "";
          const lastName = typeof ln === "string" ? ln : "";
          const fullName = [firstName, lastName].filter(Boolean).join(" ");
          return fullName || "—";
        },
      },
      {
        key: "email",
        label: "Email",
        render: (value: unknown) => (
          <span className="font-mono text-sm">
            {typeof value === "string" && value.length > 0 ? value : "—"}
          </span>
        ),
      },
      {
        key: "phone",
        label: "Phone",
        render: (value: unknown, row: Record<string, unknown>) => {
          const pn = row["phoneNumber"];
          const phone =
            typeof value === "string" && value.length > 0
              ? value
              : typeof pn === "string" && pn.length > 0
              ? pn
              : "";
          return phone ? (
            <span className="font-mono text-sm">{phone}</span>
          ) : (
            "—"
          );
        },
      },
      {
        key: "isVerified",
        label: "Status",
        align: "center" as const,
        render: (value: unknown) => {
          const v = value === true;
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                v
                  ? "text-green-600 bg-green-100"
                  : "text-orange-600 bg-orange-100"
              }`}
            >
              {v ? "Verified" : "Unverified"}
            </span>
          );
        },
      },
      {
        key: "role",
        label: "Role",
        align: "center" as const,
        render: (value: unknown) => {
          const role =
            typeof value === "string" && value.length > 0 ? value : "User";
          const getRoleColor = (role: string) => {
            switch (role.toLowerCase()) {
              case "admin":
                return "text-purple-600 bg-purple-100";
              case "moderator":
                return "text-blue-600 bg-blue-100";
              default:
                return "text-gray-600 bg-gray-100";
            }
          };

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                role
              )}`}
            >
              {role}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        label: "Joined",
        align: "center" as const,
        render: (value: unknown) => {
          let date: Date | null = null;
          if (value instanceof Date) {
            date = value;
          } else if (typeof value === "string" || typeof value === "number") {
            const d = new Date(value);
            date = isNaN(d.getTime()) ? null : d;
          }
          return date
            ? date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—";
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
              onClick={() => handleEdit(row)}
            >
              Edit
            </TableButton>
            <TableButton
              variant={row.isBlocked ? "secondary" : "danger"}
              size="sm"
              onClick={() => handleToggleBlock(row)}
            >
              {row.isBlocked ? "Unblock" : "Block"}
            </TableButton>
            {typeof row["_id"] === "string" && (
              <TableButton
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/dashboard/users/${row["_id"]}`)}
              >
                View
              </TableButton>
            )}
          </div>
        ),
      },
    ],
    [handleEdit, handleToggleBlock, router]
  );

  return (
    <div className="space-y-4">
      <Head>
        <title>Users — Inda Admin</title>
      </Head>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg hover:bg-[#4EA8A1]/90 transition-colors text-sm">
            Export Users
          </button>
          <button className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg hover:bg-[#3F8C86] transition-colors text-sm">
            Add User
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
          placeholder="Search by name or email"
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
          Loading users...
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load users. Please try again.
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Table
          columns={columns}
          data={data?.items || []}
          emptyMessage="No users found. Try adjusting your filters."
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
