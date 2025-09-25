import { useAdminListing } from "@/api";
import { formatPrice } from "@/utils";
import Head from "next/head";
import { useRouter } from "next/router";

export default function ListingDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { data, isLoading, isError } = useAdminListing(id);

  return (
    <div className="space-y-4">
      <Head>
        <title>Listing Detail — Inda Admin</title>
      </Head>
      <button
        onClick={() => router.back()}
        className="text-sm text-[#4EA8A1] hover:underline"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold">Listing Detail</h1>
      {isLoading && (
        <div className="text-sm text-gray-500">Loading listing...</div>
      )}
      {isError && (
        <div className="text-sm text-red-600">Failed to load listing.</div>
      )}
      {!isLoading && !isError && !data && (
        <div className="text-sm">No data found.</div>
      )}
      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-lg">Summary</h2>
            <Detail label="ID" value={String(data._id || "—")} />
            <Detail label="Title" value={String(data.title || "—")} />
            <Detail
              label="Type"
              value={String(data.propertyTypeStd || data.propertyType || "—")}
            />
            <Detail label="Beds" value={num(data.bedrooms)} />
            <Detail label="Baths" value={num(data.bathrooms)} />
            <Detail label="Size (sqm)" value={num(data.sizeSqm)} />
            <Detail label="Price (NGN)" value={price(data.priceNGN)} />
            <Detail
              label="Location"
              value={String(
                data.microlocationStd || data.lga || data.state || "—"
              )}
            />
            <Detail label="Status" value={String(data.listingStatus || "—")} />
            <Detail label="Created" value={fmtDate(data.createdAt)} />
            <Detail label="Updated" value={fmtDate(data.updatedAt)} />
          </div>
          <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="font-semibold text-lg">Analytics</h2>
            <Detail
              label="FMV"
              value={price(get(data, "analytics.fmv.valueNGN"))}
            />
            <Detail
              label="Inda Score"
              value={num(get(data, "indaScore.finalScore"))}
            />
            <h2 className="font-semibold text-lg mt-4">Raw</h2>
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
function num(v: unknown) {
  return typeof v === "number" ? v.toString() : "—";
}
function price(v: unknown) {
  return typeof v === "number" ? formatPrice(v) : "—";
}
function get(obj: any, path: string) {
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined),
      obj
    );
}
