import { useAdminOrderGroup } from "@/api";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  FiArrowLeft,
  FiCalendar,
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";

export default function OrderGroupDetailPage() {
  const router = useRouter();
  const { groupId } = router.query as { groupId?: string };
  const { data, isLoading, isError } = useAdminOrderGroup(groupId);

  const plans = Array.isArray(data?.plans) ? (data?.plans as any[]) : [];
  // Sort plans by paidAt desc
  plans.sort((a, b) => {
    const ad = a?.paidAt ? new Date(a.paidAt).getTime() : 0;
    const bd = b?.paidAt ? new Date(b.paidAt).getTime() : 0;
    return bd - ad;
  });

  return (
    <div className="space-y-6 pb-8">
      <Head>
        <title>Order Group Detail — Inda Admin</title>
      </Head>

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#4EA8A1] hover:text-[#3d8882] transition-colors"
      >
        <FiArrowLeft size={18} /> Back to Orders
      </button>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading order group details...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load order group.
        </div>
      )}

      {!isLoading && !isError && !data && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No order group found.
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          {/* Header Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] p-6 border-b-2 border-[#4EA8A1]/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-extrabold text-gray-900">
                    Order Group
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-[#4EA8A1] text-white shadow-sm">
                      <FiShoppingBag size={14} className="mr-2" />
                      {plans.length} Purchase{plans.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <section className="grid gap-6 p-6 md:grid-cols-4">
              <SummaryCard
                title="User ID"
                value={String(data.userId || "—")}
                icon={<FiUser size={16} />}
              />
              <SummaryCard
                title="Listing ID"
                value={String(data.listingId || "—")}
                icon={<FiHome size={16} />}
              />
              <SummaryCard
                title="First Paid"
                value={fmtDate(data.firstPaidAt, true)}
                helper="Initial purchase"
                icon={<FiCalendar size={16} />}
              />
              <SummaryCard
                title="Last Paid"
                value={fmtDate(data.lastPaidAt, true)}
                helper="Most recent purchase"
                icon={<FiCalendar size={16} />}
              />
            </section>
          </div>

          {/* Plans Table */}
          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-6 py-4 border-b-2 border-[#4EA8A1]/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                  <FiPackage size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">
                    Purchased Plans
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold">
                    Transaction History
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {plans.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-8">
                  No plans found.
                </div>
              )}
              {plans.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                          Plan
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                          Reference
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                          Provider
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                          Paid At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {plans.map((p, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">
                            {prettyPlan(p.plan)}
                          </td>
                          <td
                            className="px-4 py-3 font-mono text-xs text-gray-700 max-w-xs truncate"
                            title={p.reference}
                          >
                            {p.reference || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="uppercase text-xs bg-gray-100 rounded px-2.5 py-1 font-bold text-gray-700">
                              {p.provider || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {fmtDate(p.paidAt, true)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* User Data */}
          {data.user && (
            <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-6 py-4 border-b-2 border-[#4EA8A1]/20">
                <div className="flex items-center gap-2.5">
                  <FiUser size={18} className="text-[#4EA8A1]" />
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-800">
                    User Information
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-72 font-mono leading-relaxed">
                  {JSON.stringify(data.user, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Listing Data */}
          {data.listing && (
            <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-6 py-4 border-b-2 border-[#4EA8A1]/20">
                <div className="flex items-center gap-2.5">
                  <FiHome size={18} className="text-[#4EA8A1]" />
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-800">
                    Listing Information
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-72 font-mono leading-relaxed">
                  {JSON.stringify(data.listing, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: string;
  helper?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#4EA8A1]">{icon}</span>}
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
          {title}
        </p>
      </div>
      <div className="min-h-[56px] flex flex-col justify-center px-4 py-3 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg">
        <p className="text-sm font-extrabold text-gray-900 break-all">
          {value}
        </p>
        {helper && (
          <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
}

function fmtDate(v: unknown, withTime: boolean) {
  if (!v) return "—";
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      : {}),
  });
}

function prettyPlan(p: unknown) {
  if (typeof p !== "string") return "—";
  switch (p) {
    case "instant":
      return "Instant";
    case "deepDive":
      return "Deep Dive";
    case "deeperDive":
      return "Deeper Dive";
    case "free":
      return "Free";
    default:
      return p;
  }
}
