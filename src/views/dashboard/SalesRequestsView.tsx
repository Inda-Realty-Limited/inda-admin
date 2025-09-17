import { useAdminPayments } from "@/api";
import Head from "next/head";
import { useState } from "react";

export default function SalesRequestsView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminPayments({
    page,
    limit: 20,
    sort: "-createdAt",
  });

  return (
    <div className="space-y-4">
      <Head>
        <title>Sales Requests — Inda Admin</title>
      </Head>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Requests</h1>
        <button onClick={() => refetch()} className="text-sm text-[#4EA8A1]">
          Refresh
        </button>
      </div>
      {isLoading && <div className="text-sm text-black/60">Loading…</div>}
      {isError && (
        <div className="text-sm text-red-600">Failed to load payments.</div>
      )}
      <div className="rounded-xl border border-black/5 bg-white">
        <div className="grid grid-cols-5 gap-3 px-4 py-2 text-xs font-semibold text-black/70 border-b border-black/5">
          <div>Reference</div>
          <div>Plan</div>
          <div>Status</div>
          <div>Provider</div>
          <div>Paid At</div>
        </div>
        <div>
          {data?.items?.map((pRaw, idx) => {
            const p = pRaw as {
              id?: string;
              _id?: string;
              reference?: string;
              plan?: string;
              status?: string;
              provider?: string;
              paidAt?: string | number | Date;
            };
            return (
              <div
                key={p.id || p._id || p.reference || idx}
                className="grid grid-cols-5 gap-3 px-4 py-3 text-sm border-b border-black/5"
              >
                <div className="truncate" title={p.reference}>
                  {p.reference || "—"}
                </div>
                <div>{p.plan || "—"}</div>
                <div className="capitalize">{p.status || "—"}</div>
                <div className="capitalize">{p.provider || "—"}</div>
                <div>
                  {p.paidAt
                    ? new Date(
                        p.paidAt as string | number | Date
                      ).toLocaleString()
                    : "—"}
                </div>
              </div>
            );
          })}
          {data && data.items?.length === 0 && (
            <div className="px-4 py-6 text-sm text-black/60">
              No sales requests yet.
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded bg-black/5 disabled:opacity-50"
        >
          Prev
        </button>
        <div>Page {page}</div>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-black/5"
        >
          Next
        </button>
      </div>
    </div>
  );
}
