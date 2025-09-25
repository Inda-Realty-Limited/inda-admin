import { useAdminPayment } from "@/api";
import Head from "next/head";
import { useRouter } from "next/router";

export default function TransactionDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { data, isLoading, isError } = useAdminPayment(id);

  return (
    <div className="space-y-4">
      <Head>
        <title>Transaction Detail — Inda Admin</title>
      </Head>
      <button
        className="text-sm text-[#4EA8A1] hover:underline"
        onClick={() => router.back()}
      >
        &larr; Back
      </button>
      <h1 className="text-2xl font-bold">Transaction Detail</h1>
      {isLoading && (
        <div className="text-sm text-gray-500">Loading transaction...</div>
      )}
      {isError && (
        <div className="text-sm text-red-600">Failed to load transaction.</div>
      )}
      {!isLoading && !isError && !data && (
        <div className="text-sm">No data found.</div>
      )}
      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-lg">Summary</h2>
            <Item label="Reference" value={String(data.reference || "—")} />
            <Item label="Plan" value={String(data.plan || "—")} />
            <Item
              label="Amount (NGN)"
              value={
                typeof data.amountNGN === "number"
                  ? data.amountNGN.toLocaleString()
                  : "—"
              }
            />
            <Item label="Provider" value={String(data.provider || "—")} />
            <Item label="Status" value={String(data.status || "—")} />
            <Item label="Created" value={formatDate(data.createdAt)} />
            <Item label="Paid" value={formatDate(data.paidAt)} />
          </div>
          <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-lg">Meta</h2>
            <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded max-h-72">
              {JSON.stringify(data.verifyResponse, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
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

function formatDate(val: unknown) {
  if (!val) return "—";
  const d = new Date(val as any);
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
