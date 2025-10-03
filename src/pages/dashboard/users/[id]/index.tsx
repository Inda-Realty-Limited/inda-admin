import { useAdminUser } from "@/api";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiXCircle,
} from "react-icons/fi";

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { data, isLoading, isError } = useAdminUser(id);

  const fullName =
    (data?.firstName || "") + (data?.lastName ? " " + data.lastName : "") ||
    "—";

  return (
    <div className="space-y-6 pb-8">
      <Head>
        <title>User Detail — Inda Admin</title>
      </Head>

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#4EA8A1] hover:text-[#3d8882] transition-colors"
      >
        <FiArrowLeft size={18} /> Back to Users
      </button>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading user details...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load user.
        </div>
      )}

      {!isLoading && !isError && !data && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No user found.
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
                    User Profile
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-[#4EA8A1] text-white shadow-sm">
                      <FiUser size={14} className="mr-2" />
                      {fullName}
                    </span>
                    {data.isVerified ? (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold uppercase bg-green-500 text-white">
                        <FiCheckCircle size={14} className="mr-1.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold uppercase bg-gray-400 text-white">
                        <FiXCircle size={14} className="mr-1.5" />
                        Unverified
                      </span>
                    )}
                    {data.isBlocked ? (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold uppercase bg-red-500 text-white">
                        <FiShield size={14} className="mr-1.5" />
                        Blocked
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <section className="grid gap-6 p-6 md:grid-cols-3">
              <SummaryCard
                title="User ID"
                value={String(data._id || "—")}
                icon={<FiFileText size={16} />}
              />
              <SummaryCard
                title="Created"
                value={fmtDate(data.createdAt, true)}
                helper="Account registration"
                icon={<FiCalendar size={16} />}
              />
              <SummaryCard
                title="Last Updated"
                value={fmtDate(data.updatedAt, true)}
                helper="Profile last modified"
                icon={<FiCalendar size={16} />}
              />
            </section>
          </div>

          {/* User Information Card */}
          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-6 py-4 border-b-2 border-[#4EA8A1]/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                  <FiUser size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">
                    Contact Information
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold">
                    User Details
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  label="Full Name"
                  value={fullName}
                  icon={<FiUser size={12} />}
                />
                <DetailField
                  label="Email Address"
                  value={String(data.email || "—")}
                  icon={<FiMail size={12} />}
                />
                <DetailField
                  label="Phone Number"
                  value={String(data.phoneNumber || data.phone || "—")}
                  icon={<FiPhone size={12} />}
                />
                <DetailField
                  label="Account Status"
                  value={
                    data.isBlocked
                      ? "BLOCKED"
                      : data.isVerified
                      ? "VERIFIED"
                      : "UNVERIFIED"
                  }
                  icon={<FiShield size={12} />}
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
                  Raw User Data
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
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
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
