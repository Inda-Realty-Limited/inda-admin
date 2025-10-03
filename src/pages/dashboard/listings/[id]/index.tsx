import { useAdminListing } from "@/api";
import { formatPrice } from "@/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiHome,
  FiMapPin,
  FiTrendingUp,
} from "react-icons/fi";

export default function ListingDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { data, isLoading, isError } = useAdminListing(id);

  const fmvValue = get(data, "analytics.fmv.valueNGN");
  const indaScore = get(data, "indaScore.finalScore");

  return (
    <div className="space-y-6 pb-8">
      <Head>
        <title>Listing Detail — Inda Admin</title>
      </Head>

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#4EA8A1] hover:text-[#3d8882] transition-colors"
      >
        <FiArrowLeft size={18} /> Back to Listings
      </button>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading listing details...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load listing.
        </div>
      )}

      {!isLoading && !isError && !data && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No listing found.
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
                    {String(data.title || "Property Listing")}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-[#4EA8A1] text-white shadow-sm">
                      <FiHome size={14} className="mr-2" />
                      {String(
                        data.propertyTypeStd || data.propertyType || "Property"
                      )}
                    </span>
                    {data.listingStatus ? (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold uppercase bg-gray-700 text-white">
                        {String(data.listingStatus)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <section className="grid gap-6 p-6 md:grid-cols-4">
              <SummaryCard
                title="Price"
                value={price(data.priceNGN)}
                icon={<FiDollarSign size={16} />}
              />
              <SummaryCard
                title="Fair Market Value"
                value={price(fmvValue)}
                helper="Analytics estimate"
                icon={<FiTrendingUp size={16} />}
              />
              <SummaryCard
                title="Inda Score"
                value={num(indaScore)}
                helper="Quality rating"
                icon={<FiTrendingUp size={16} />}
              />
              <SummaryCard
                title="Location"
                value={String(
                  data.microlocationStd || data.lga || data.state || "—"
                )}
                icon={<FiMapPin size={16} />}
              />
            </section>
          </div>

          {/* Property Details */}
          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-6 py-4 border-b-2 border-[#4EA8A1]/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                  <FiHome size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">
                    Property Details
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold">
                    Specifications & Information
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField
                  label="Listing ID"
                  value={String(data._id || "—")}
                  icon={<FiFileText size={12} />}
                />
                <DetailField
                  label="Property Type"
                  value={String(
                    data.propertyTypeStd || data.propertyType || "—"
                  )}
                  icon={<FiHome size={12} />}
                />
                <DetailField
                  label="Bedrooms"
                  value={num(data.bedrooms)}
                  icon={<FiHome size={12} />}
                />
                <DetailField
                  label="Bathrooms"
                  value={num(data.bathrooms)}
                  icon={<FiHome size={12} />}
                />
                <DetailField
                  label="Size (sqm)"
                  value={num(data.sizeSqm)}
                  icon={<FiHome size={12} />}
                />
                <DetailField
                  label="Status"
                  value={String(data.listingStatus || "—")}
                  icon={<FiFileText size={12} />}
                />
                <DetailField
                  label="Created"
                  value={fmtDate(data.createdAt, true)}
                  icon={<FiCalendar size={12} />}
                  className="sm:col-span-2"
                />
                <DetailField
                  label="Last Updated"
                  value={fmtDate(data.updatedAt, true)}
                  icon={<FiCalendar size={12} />}
                />
              </div>
            </div>
          </div>

          {/* Raw Data */}
          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-6 py-4 border-b-2 border-[#4EA8A1]/20">
              <div className="flex items-center gap-2.5">
                <FiFileText size={18} className="text-[#4EA8A1]" />
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-800">
                  Raw Listing Data
                </h2>
              </div>
            </div>
            <div className="p-6">
              <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 font-mono leading-relaxed">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
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
        <p className="text-lg font-extrabold text-gray-900 break-all">
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

function DetailField({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="min-h-[44px] flex items-center px-4 py-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 break-all">
        {value}
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

function num(v: unknown) {
  return typeof v === "number" ? v.toString() : "—";
}

function price(v: unknown) {
  return typeof v === "number" ? formatPrice(v) : "—";
}

function get(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce(
      (acc: any, key) =>
        acc && typeof acc === "object" ? acc[key] : undefined,
      obj as Record<string, unknown>
    );
}
