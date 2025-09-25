import { useAdminOrders } from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import { formatPrice } from "@/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FiCopy } from "react-icons/fi";

export default function OrdersView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const limit = 20;
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useAdminOrders(page, limit);

  const currentPage = page;
  const itemsPerPage = limit;
  // Heuristic: if we received a full page, assume there MAY be another; otherwise this is the last page.
  const length = data?.items?.length || 0;
  const totalItems =
    length === itemsPerPage
      ? currentPage * itemsPerPage // unknown if more exist
      : (currentPage - 1) * itemsPerPage + length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const columns: TableColumn[] = useMemo(
    () => [
      // Reference (from most recent plan) with copy button
      {
        key: "reference",
        label: "Reference",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const plans = Array.isArray(row["plans"])
            ? (row["plans"] as unknown[])
            : [];
          let latest: Record<string, unknown> | null = null;
          // pick latest by paidAt
          for (const p of plans) {
            if (p && typeof p === "object") {
              if (!latest) latest = p as Record<string, unknown>;
              else {
                const lp = latest["paidAt"];
                const cp = (p as Record<string, unknown>)["paidAt"];
                const ld = lp ? new Date(lp as string) : null;
                const cd = cp ? new Date(cp as string) : null;
                if (cd && ld && cd.getTime() > ld.getTime())
                  latest = p as Record<string, unknown>;
              }
            }
          }
          const ref =
            latest && typeof latest["reference"] === "string"
              ? (latest["reference"] as string)
              : "";
          if (!ref) return <span className="text-xs">—</span>;
          const short =
            ref.length > 34 ? ref.slice(0, 22) + "…" + ref.slice(-8) : ref;
          const isCopied = copiedRef === ref;
          const handleCopy = () => {
            if (navigator?.clipboard) {
              navigator.clipboard.writeText(ref).then(() => {
                setCopiedRef(ref);
                setTimeout(
                  () => setCopiedRef((c) => (c === ref ? null : c)),
                  1500
                );
              });
            }
          };
          return (
            <div className="flex items-center gap-2 max-w-[220px]">
              <span className="font-mono text-[11px] truncate" title={ref}>
                {short}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] border transition-colors ${
                  isCopied
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-[#4EA8A1] text-[#4EA8A1] hover:bg-[#4EA8A1] hover:text-white"
                }`}
                aria-label="Copy reference"
              >
                <FiCopy size={10} /> {isCopied ? "Copied" : "Copy"}
              </button>
            </div>
          );
        },
      },
      // Plan
      {
        key: "plan",
        label: "Plan",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const plans = Array.isArray(row["plans"])
            ? (row["plans"] as unknown[])
            : [];
          const plan =
            plans[0] && typeof plans[0] === "object"
              ? (plans[0] as Record<string, unknown>)["plan"]
              : null;
          const v = typeof plan === "string" ? plan : "";
          const pretty =
            v === "instant"
              ? "Instant"
              : v === "deepDive"
              ? "Deep Dive"
              : v === "deeperDive"
              ? "Deeper Dive"
              : v === "free"
              ? "Free"
              : v || "—";
          return <span className="text-xs font-medium">{pretty}</span>;
        },
      },
      // User
      {
        key: "user",
        label: "User",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const user = row["user"];
          if (user && typeof user === "object") {
            const first = (user as Record<string, unknown>)["firstName"];
            const last = (user as Record<string, unknown>)["lastName"];
            const email = (user as Record<string, unknown>)["email"];
            const nameParts = [first, last].filter(
              (p) => typeof p === "string" && p.trim()
            ) as string[];
            const name =
              nameParts.join(" ") || (typeof email === "string" ? email : "");
            if (name)
              return (
                <span
                  className="text-xs font-medium"
                  title={typeof email === "string" ? email : undefined}
                >
                  {name}
                </span>
              );
          }
          return "—";
        },
      },
      // Listing Title
      {
        key: "listing",
        label: "Listing",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const listing = row["listing"];
          if (listing && typeof listing === "object") {
            const title = (listing as Record<string, unknown>)["title"];
            if (typeof title === "string") {
              const short =
                title.length > 36 ? title.slice(0, 33) + "…" : title;
              return (
                <span className="text-xs" title={title}>
                  {short}
                </span>
              );
            }
          }
          return "—";
        },
      },
      // Listing Price
      {
        key: "priceNGN",
        label: "Price",
        align: "right" as const,
        render: (_value: unknown, row: Record<string, unknown>) => {
          const listing = row["listing"];
          let price: unknown = undefined;
          if (listing && typeof listing === "object")
            price = (listing as Record<string, unknown>)["priceNGN"];
          if (typeof price === "number")
            return <span className="font-medium">{formatPrice(price)}</span>;
          return "—";
        },
      },
      // Provider
      {
        key: "provider",
        label: "Provider",
        render: (_value: unknown, row: Record<string, unknown>) => {
          const plans = Array.isArray(row["plans"])
            ? (row["plans"] as unknown[])
            : [];
          const provider =
            plans[0] && typeof plans[0] === "object"
              ? (plans[0] as Record<string, unknown>)["provider"]
              : null;
          return typeof provider === "string" ? (
            <span className="uppercase text-[10px] tracking-wide font-medium bg-gray-100 px-2 py-0.5 rounded">
              {provider}
            </span>
          ) : (
            "—"
          );
        },
      },
      // Paid date/time (lastPaidAt)
      {
        key: "lastPaidAt",
        label: "Paid At",
        align: "center" as const,
        render: (value: unknown, row: Record<string, unknown>) => {
          let created: unknown = value;
          if (!created) created = row["firstPaidAt"];
          let date: Date | null = null;
          if (created instanceof Date) date = created;
          else if (typeof created === "string" || typeof created === "number") {
            const d = new Date(created);
            if (!isNaN(d.getTime())) date = d;
          }
          if (!date) return "—";
          const main = date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          return (
            <span className="whitespace-pre leading-tight text-xs" title={main}>
              {main}
            </span>
          );
        },
      },
      // Actions
      {
        key: "actions",
        label: "Actions",
        align: "center" as const,
        render: (_value: unknown, row: Record<string, unknown>) => (
          <div className="flex items-center justify-center gap-2">
            <TableButton
              variant="secondary"
              size="sm"
              onClick={() => handleView(row)}
            >
              View
            </TableButton>
            <TableButton
              variant="danger"
              size="sm"
              onClick={() => handleCancel(row)}
            >
              Cancel
            </TableButton>
          </div>
        ),
      },
    ],
    [copiedRef]
  );

  function handleView(row: Record<string, unknown>) {
    const userId = typeof row["userId"] === "string" ? row["userId"] : null;
    const listingId =
      typeof row["listingId"] === "string" ? row["listingId"] : null;
    if (userId) {
      const groupId = `${userId}:${listingId || "null"}`;
      router.push(`/dashboard/orders/${groupId}`);
    }
  }
  function handleCancel(row: Record<string, unknown>) {
    console.log("Cancel order", row);
  }

  return (
    <div className="space-y-4">
      <Head>
        <title>Orders — Inda Admin</title>
      </Head>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg hover:bg-[#4EA8A1]/90 text-sm"
            onClick={() => refetch()}
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
          placeholder="Search by user, listing or reference"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        {q && (
          <button
            type="button"
            className="text-xs text-[#4EA8A1] px-2 py-1 rounded hover:bg-[#4EA8A1]/10"
            onClick={() => {
              setQ("");
              setPage(1);
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filter Toggle */}
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
        {(planFilter || providerFilter) && (
          <button
            type="button"
            onClick={() => {
              setPlanFilter("");
              setProviderFilter("");
              setPage(1);
            }}
            className="text-xs text-[#4EA8A1] hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid gap-4 md:grid-cols-4 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Plan</label>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
            >
              <option value="">Any</option>
              <option value="instant">Instant</option>
              <option value="deepDive">Deep Dive</option>
              <option value="deeperDive">Deeper Dive</option>
              <option value="free">Free</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Provider
            </label>
            <select
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
            >
              <option value="">Any</option>
              <option value="flutterwave">Flutterwave</option>
              <option value="paystack">Paystack</option>
              <option value="stripe">Stripe</option>
              <option value="free">Free</option>
            </select>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading orders...
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load orders.
        </div>
      )}

      {!isLoading && !isError && (
        <Table
          columns={columns}
          data={data?.items || []}
          emptyMessage="No orders found."
        />
      )}

      {!isLoading && !isError && (data?.items?.length || 0) > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setPage(p)}
          className="mt-6"
        />
      )}
    </div>
  );
}
