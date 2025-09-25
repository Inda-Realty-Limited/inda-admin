import { useAdminOrderGroup } from "@/api";
import Head from "next/head";
import { useRouter } from "next/router";

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
    <div className="space-y-4">
      <Head>
        <title>Order Group Detail — Inda Admin</title>
      </Head>
      <button
        onClick={() => router.back()}
        className="text-sm text-[#4EA8A1] hover:underline"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold">Order Group Detail</h1>
      {isLoading && (
        <div className="text-sm text-gray-500">Loading order group...</div>
      )}
      {isError && (
        <div className="text-sm text-red-600">Failed to load order group.</div>
      )}
      {!isLoading && !isError && !data && (
        <div className="text-sm">No data found.</div>
      )}
      {data && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200 md:col-span-1">
            <h2 className="font-semibold text-lg">Summary</h2>
            <Detail label="User ID" value={String(data.userId || "—")} />
            <Detail label="Listing ID" value={String(data.listingId || "—")} />
            <Detail label="First Paid" value={fmtDate(data.firstPaidAt)} />
            <Detail label="Last Paid" value={fmtDate(data.lastPaidAt)} />
            <Detail label="Total Purchases" value={plans.length.toString()} />
          </div>
          <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200 md:col-span-2">
            <h2 className="font-semibold text-lg">Plans</h2>
            {plans.length === 0 && <div className="text-sm">No plans.</div>}
            {plans.length > 0 && (
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="text-left px-3 py-2">Plan</th>
                    <th className="text-left px-3 py-2">Reference</th>
                    <th className="text-left px-3 py-2">Provider</th>
                    <th className="text-left px-3 py-2">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium">
                        {prettyPlan(p.plan)}
                      </td>
                      <td
                        className="px-3 py-2 font-mono text-[11px] truncate"
                        title={p.reference}
                      >
                        {p.reference || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span className="uppercase text-[10px] bg-gray-100 rounded px-1.5 py-0.5">
                          {p.provider || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{fmtDate(p.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200 md:col-span-3">
            <h2 className="font-semibold text-lg">User</h2>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-72">
              {JSON.stringify(data.user, null, 2)}
            </pre>
            <h2 className="font-semibold text-lg">Listing</h2>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-72">
              {JSON.stringify(data.listing, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span
        className="text-sm font-semibold text-gray-800 max-w-[60%] text-right truncate"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function fmtDate(v: unknown) {
  if (!v) return "—";
  const d = new Date(v as any);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
