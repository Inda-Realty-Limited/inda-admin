import { useAdminPayments } from "@/api";
import PaymentReconciliationModal from "@/components/PaymentReconciliationModal";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import { formatPrice } from "@/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FiCopy, FiRefreshCw } from "react-icons/fi";

export default function PaymentsView() {
  const router = useRouter();
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    sort: "-createdAt",
    q: "",
    plan: "",
    provider: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const { data, isLoading, isError, refetch } = useAdminPayments(params);

  function update<K extends keyof typeof params>(
    key: K,
    val: (typeof params)[K]
  ) {
    setParams((p) => ({
      ...p,
      [key]: val,
      page: key === "page" ? (val as number) : 1,
    }));
  }

  const currentPage = params.page || 1;
  const itemsPerPage = params.limit || 20;
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleView = useCallback(
    (row: Record<string, unknown>) => {
      const id = typeof row["_id"] === "string" ? row["_id"] : undefined;
      if (id) router.push(`/dashboard/transactions/${id}`);
    },
    [router]
  );

  const handleRefund = useCallback((row: Record<string, unknown>) => {
    console.log("Refund payment", row);
  }, []);

  const columns: TableColumn[] = useMemo(
    () => [
      {
        key: "reference",
        label: "Reference",
        render: (value: unknown) => {
          const ref = typeof value === "string" ? value : "";
          if (!ref) return <span className="text-xs">—</span>;
          const short =
            ref.length > 34 ? ref.slice(0, 22) + "…" + ref.slice(-8) : ref;
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
          const isCopied = copiedRef === ref;
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
      {
        key: "plan",
        label: "Plan",
        render: (value: unknown) => {
          const v = typeof value === "string" ? value : "";
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
      {
        key: "amountNGN",
        label: "Amount",
        align: "right" as const,
        render: (value: unknown) => {
          if (typeof value === "number")
            return <span className="font-medium">{formatPrice(value)}</span>;
          return "—";
        },
      },
      {
        key: "provider",
        label: "Provider",
        render: (value: unknown) =>
          typeof value === "string" ? (
            <span className="uppercase text-[11px] tracking-wide font-medium bg-gray-100 px-2 py-0.5 rounded">
              {value}
            </span>
          ) : (
            "—"
          ),
      },
      {
        key: "payer",
        label: "Payer",
        render: (_value: unknown, row: Record<string, unknown>) => {
          // Derive payer from verifyResponse.data.customer.name/email or fallback to userId
          let display: string | null = null;
          const verifyResponse = row["verifyResponse"];
          if (verifyResponse && typeof verifyResponse === "object") {
            const vrData = (verifyResponse as Record<string, unknown>)["data"];
            if (vrData && typeof vrData === "object") {
              const customer = (vrData as Record<string, unknown>)["customer"];
              if (customer && typeof customer === "object") {
                const cName = (customer as Record<string, unknown>)["name"];
                const cEmail = (customer as Record<string, unknown>)["email"];
                if (typeof cName === "string" && cName.trim()) display = cName;
                else if (typeof cEmail === "string" && cEmail.trim())
                  display = cEmail;
              }
            }
          }
          if (!display) {
            const userId = row["userId"];
            if (typeof userId === "string" && userId.length > 10) {
              display = userId.slice(0, 6) + "…" + userId.slice(-4);
            } else if (typeof userId === "string") {
              display = userId;
            }
          }
          return display ? (
            <span className="text-xs font-medium" title={display}>
              {display}
            </span>
          ) : (
            "—"
          );
        },
      },
      {
        key: "status",
        label: "Status",
        align: "center" as const,
        render: (value: unknown) => {
          const v = typeof value === "string" ? value.toLowerCase() : "";
          const color =
            v === "success" || v === "successful"
              ? "text-green-600 bg-green-100"
              : v === "pending"
              ? "text-yellow-700 bg-yellow-100"
              : v === "failed" || v === "error"
              ? "text-red-600 bg-red-100"
              : "text-gray-600 bg-gray-100";
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
            >
              {v ? v.charAt(0).toUpperCase() + v.slice(1) : "Unknown"}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        label: "Created",
        align: "center" as const,
        render: (value: unknown, row: Record<string, unknown>) => {
          const created = value;
          const paid = row["paidAt"]; // could show hint if paid
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
          // If paidAt differs, append a subtle indicator
          let paidSuffix = "";
          if (paid && typeof paid === "string" && paid !== created) {
            const pd = new Date(paid);
            if (!isNaN(pd.getTime())) {
              paidSuffix = `\nPaid: ${pd.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}`;
            }
          }
          return (
            <span
              className="whitespace-pre leading-tight text-xs"
              title={main + paidSuffix}
            >
              {main}
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
              onClick={() => handleView(row)}
            >
              View
            </TableButton>
            <TableButton
              variant="danger"
              size="sm"
              onClick={() => handleRefund(row)}
            >
              Refund
            </TableButton>
          </div>
        ),
      },
    ],
    [copiedRef, handleRefund, handleView]
  );

  return (
    <div className="space-y-4">
      <Head>
        <title>Transactions — Inda Admin</title>
      </Head>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and manage platform transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 bg-white border-2 border-[#4EA8A1] text-[#4EA8A1] rounded-lg hover:bg-[#4EA8A1] hover:text-white text-sm font-bold transition-all flex items-center gap-2"
            onClick={() => setShowReconciliation(true)}
          >
            <FiRefreshCw size={16} />
            Reconcile
          </button>
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
          placeholder="Search by reference or payer"
          value={params.q}
          onChange={(e) => update("q", e.target.value)}
        />
        {params.q && (
          <button
            type="button"
            className="text-xs text-[#4EA8A1] px-2 py-1 rounded hover:bg-[#4EA8A1]/10"
            onClick={() => update("q", "")}
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
        {(params.plan ||
          params.provider ||
          params.status ||
          params.startDate ||
          params.endDate) && (
          <button
            type="button"
            onClick={() => {
              setParams((p) => ({
                ...p,
                plan: "",
                provider: "",
                status: "",
                startDate: "",
                endDate: "",
                page: 1,
              }));
            }}
            className="text-xs text-[#4EA8A1] hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid gap-4 md:grid-cols-5 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Plan</label>
            <select
              value={params.plan}
              onChange={(e) => update("plan", e.target.value)}
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
              value={params.provider}
              onChange={(e) => update("provider", e.target.value)}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
            >
              <option value="">Any</option>
              <option value="flutterwave">Flutterwave</option>
              <option value="paystack">Paystack</option>
              <option value="stripe">Stripe</option>
              <option value="free">Free</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Status</label>
            <select
              value={params.status}
              onChange={(e) => update("status", e.target.value)}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
            >
              <option value="">Any</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">From</label>
            <input
              type="date"
              value={params.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">To</label>
            <input
              type="date"
              value={params.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="h-9 rounded border border-gray-300 px-2 text-sm focus:outline-none"
            />
          </div>
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading transactions...
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load transactions.
        </div>
      )}

      {!isLoading && !isError && (
        <Table
          columns={columns}
          data={data?.items || []}
          emptyMessage="No transactions found."
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

      {showReconciliation && (
        <PaymentReconciliationModal
          onClose={() => setShowReconciliation(false)}
          onSuccess={() => {
            setShowReconciliation(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
