import { useAdminUsers } from "@/api";
import Head from "next/head";
import { useState } from "react";

export default function UsersView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    limit: 20,
    sort: "-createdAt",
  });

  return (
    <div className="space-y-4">
      <Head>
        <title>Users — Inda Admin</title>
      </Head>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button onClick={() => refetch()} className="text-sm text-[#4EA8A1]">
          Refresh
        </button>
      </div>
      {isLoading && <div className="text-sm text-black/60">Loading…</div>}
      {isError && (
        <div className="text-sm text-red-600">Failed to load users.</div>
      )}
      <div className="rounded-xl border border-black/5 bg-white">
        <div className="grid grid-cols-4 gap-3 px-4 py-2 text-xs font-semibold text-black/70 border-b border-black/5">
          <div>Name</div>
          <div>Email</div>
          <div>Status</div>
          <div>Joined</div>
        </div>
        <div>
          {data?.items?.map((uRaw, idx) => {
            const u = uRaw as {
              id?: string;
              _id?: string;
              firstName?: string;
              lastName?: string;
              email?: string;
              isVerified?: boolean;
              createdAt?: string | number | Date;
            };
            return (
              <div
                key={u.id || u._id || idx}
                className="grid grid-cols-4 gap-3 px-4 py-3 text-sm border-b border-black/5"
              >
                <div>
                  {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                </div>
                <div>{u.email ?? "—"}</div>
                <div>{u.isVerified ? "Verified" : "Unverified"}</div>
                <div>
                  {u.createdAt
                    ? new Date(
                        u.createdAt as string | number | Date
                      ).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            );
          })}
          {data && data.items?.length === 0 && (
            <div className="px-4 py-6 text-sm text-black/60">
              No users found.
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
