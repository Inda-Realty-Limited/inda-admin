import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  companyName: string;
  companyType: string;
  registrationNumber: string;
  dateCreated: string;
  [key: string]: unknown;
}

interface ApiResponse {
  success: boolean;
  data: User[];
}

export default function proUsersView() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    q: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(
        "https://inda-pro-backend.onrender.com/api/auth/get-all-users"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const result: ApiResponse = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search query
  useEffect(() => {
    if (!filters.q.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = filters.q.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.companyName.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
    // Reset to first page when search changes
    setFilters((f) => ({ ...f, page: 1 }));
  }, [filters.q, users]);

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
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get paginated data
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

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
        render: (value: unknown) => {
          return typeof value === "string" && value.length > 0 ? value : "—";
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
        key: "phoneNumber",
        label: "Phone",
        render: (value: unknown) => {
          const phone = typeof value === "string" && value.length > 0 ? value : "";
          return phone ? (
            <span className="font-mono text-sm">{phone}</span>
          ) : (
            "—"
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
              case "agent":
                return "text-blue-600 bg-blue-100";
              case "moderator":
                return "text-green-600 bg-green-100";
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
        key: "companyName",
        label: "Company",
        render: (value: unknown) => {
          return typeof value === "string" && value.length > 0 ? value : "—";
        },
      },
      {
        key: "companyType",
        label: "Company Type",
        render: (value: unknown) => {
          return typeof value === "string" && value.length > 0 ? value : "—";
        },
      },
      {
        key: "dateCreated",
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
            {typeof row["id"] === "string" && (
              <TableButton
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/dashboard/prousers/${row["id"]}`)}
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
            onClick={() => fetchUsers()}
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
          placeholder="Search by name, email or company"
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
          data={paginatedUsers}
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