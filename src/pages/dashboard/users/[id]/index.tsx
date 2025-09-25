import { useAdminUser } from "@/api";
import Head from "next/head";
import { useRouter } from "next/router";

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { data, isLoading, isError } = useAdminUser(id);

  return (
    <div className="space-y-4">
      <Head>
        <title>User Detail — Inda Admin</title>
      </Head>
      <button
        onClick={() => router.back()}
        className="text-sm text-[#4EA8A1] hover:underline"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold">User Detail</h1>
      {isLoading && (
        <div className="text-sm text-gray-500">Loading user...</div>
      )}
      {isError && (
        <div className="text-sm text-red-600">Failed to load user.</div>
      )}
      {!isLoading && !isError && !data && (
        <div className="text-sm">No data found.</div>
      )}
      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-lg">Profile</h2>
            <Detail label="ID" value={String(data._id || "—")} />
            <Detail
              label="Name"
              value={
                (data.firstName || "") +
                  (data.lastName ? " " + data.lastName : "") || "—"
              }
            />
            <Detail label="Email" value={String(data.email || "—")} />
            <Detail
              label="Phone"
              value={String(data.phoneNumber || data.phone || "—")}
            />
            <Detail label="Verified" value={data.isVerified ? "Yes" : "No"} />
            <Detail label="Blocked" value={data.isBlocked ? "Yes" : "No"} />
            <Detail label="Created" value={fmtDate(data.createdAt)} />
            <Detail label="Updated" value={fmtDate(data.updatedAt)} />
          </div>
          <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-lg">Raw</h2>
            <pre className="text-xs bg-gray-50 p-3 rounded max-h-96 overflow-auto">
              {JSON.stringify(data, null, 2)}
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
