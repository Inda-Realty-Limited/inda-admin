import { useAdminPayment } from "@/api";
import { formatPrice } from "@/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiUser,
} from "react-icons/fi";

export default function TransactionDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { data, isLoading, isError } = useAdminPayment(id);

  const handleCopyReference = () => {
    if (data?.reference && navigator?.clipboard) {
      navigator.clipboard.writeText(String(data.reference));
    }
  };

  const statusVariant =
    data?.status === "success" || data?.status === "successful"
      ? "success"
      : data?.status === "pending"
      ? "warning"
      : "danger";

  const statusColor =
    statusVariant === "success"
      ? "bg-green-500 text-white"
      : statusVariant === "warning"
      ? "bg-yellow-500 text-white"
      : "bg-red-500 text-white";

  const planLabel =
    data?.plan === "instant"
      ? "Instant"
      : data?.plan === "deepDive"
      ? "Deep Dive"
      : data?.plan === "deeperDive"
      ? "Deeper Dive"
      : data?.plan === "free"
      ? "Free"
      : String(data?.plan || "—");

  // Extract customer info from verifyResponse
  let customerName = "—";
  let customerEmail = "—";
  if (data?.verifyResponse && typeof data.verifyResponse === "object") {
    const vrData = (data.verifyResponse as Record<string, unknown>)["data"];
    if (vrData && typeof vrData === "object") {
      const customer = (vrData as Record<string, unknown>)["customer"];
      if (customer && typeof customer === "object") {
        const cName = (customer as Record<string, unknown>)["name"];
        const cEmail = (customer as Record<string, unknown>)["email"];
        if (typeof cName === "string" && cName) customerName = cName;
        if (typeof cEmail === "string" && cEmail) customerEmail = cEmail;
      }
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <Head>
        <title>Transaction Detail — Inda Admin</title>
      </Head>

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#4EA8A1] hover:text-[#3d8882] transition-colors"
      >
        <FiArrowLeft size={18} /> Back to Transactions
      </button>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading transaction details...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load transaction.
        </div>
      )}

      {!isLoading && !isError && !data && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No transaction found.
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
                    Transaction Details
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-[#4EA8A1] text-white shadow-sm">
                      {planLabel}
                    </span>
                    <span
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold uppercase ${statusColor}`}
                    >
                      {String(data.status || "Unknown")}
                    </span>
                    {data.reference ? (
                      <button
                        onClick={handleCopyReference}
                        className="inline-flex items-center gap-2 text-xs text-gray-700 font-mono bg-white/80 px-3 py-1 rounded-md border border-gray-300 hover:bg-white transition-colors"
                      >
                        {String(data.reference).length > 30
                          ? `${String(data.reference).slice(0, 20)}...${String(
                              data.reference
                            ).slice(-6)}`
                          : String(data.reference)}
                        <FiCopy size={12} />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <section className="grid gap-6 p-6 md:grid-cols-3">
              <SummaryCard
                title="Amount"
                value={
                  typeof data.amountNGN === "number"
                    ? formatPrice(data.amountNGN)
                    : "—"
                }
                helper={`Provider: ${String(
                  data.provider || "—"
                ).toUpperCase()}`}
                icon={<FiDollarSign size={16} />}
              />
              <SummaryCard
                title="Created"
                value={formatDate(data.createdAt, true)}
                helper="Transaction initiated"
                icon={<FiCalendar size={16} />}
              />
              <SummaryCard
                title="Paid At"
                value={
                  data.paidAt ? formatDate(data.paidAt, true) : "Not yet paid"
                }
                helper={data.paidAt ? "Payment completed" : "Awaiting payment"}
                icon={<FiCheckCircle size={16} />}
              />
            </section>
          </div>

          {/* Payment Receipt Section */}
          <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-6 py-4 border-b-2 border-[#4EA8A1]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                    <FiCreditCard size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">
                      Payment Receipt
                    </h2>
                    <p className="text-xs text-gray-600 font-semibold">
                      Transaction Information
                    </p>
                  </div>
                </div>
                {(data.status === "success" ||
                  data.status === "successful") && (
                  <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
                    <FiCheckCircle size={16} />
                    <span className="text-xs font-extrabold uppercase">
                      Verified
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  label="Transaction ID"
                  value={String(data._id || "—")}
                  icon={<FiFileText size={12} />}
                />
                <DetailField
                  label="Reference"
                  value={String(data.reference || "—")}
                  icon={<FiFileText size={12} />}
                />
                <DetailField
                  label="Plan"
                  value={planLabel}
                  icon={<FiCreditCard size={12} />}
                />
                <DetailField
                  label="Amount"
                  value={
                    typeof data.amountNGN === "number"
                      ? formatPrice(data.amountNGN)
                      : "—"
                  }
                  icon={<FiDollarSign size={12} />}
                />
                <DetailField
                  label="Provider"
                  value={String(data.provider || "—").toUpperCase()}
                  icon={<FiCreditCard size={12} />}
                />
                <DetailField
                  label="Status"
                  value={String(data.status || "—").toUpperCase()}
                  icon={<FiCheckCircle size={12} />}
                />
                <DetailField
                  label="Created At"
                  value={formatDate(data.createdAt, true)}
                  icon={<FiCalendar size={12} />}
                />
                <DetailField
                  label="Paid At"
                  value={
                    data.paidAt ? formatDate(data.paidAt, true) : "Not paid"
                  }
                  icon={<FiClock size={12} />}
                />
              </div>

              {/* Customer Information */}
              {customerName !== "—" || customerEmail !== "—" || data.userId ? (
                <div className="pt-4 border-t-2 border-dashed border-gray-200">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-800 mb-3 flex items-center gap-2">
                    <FiUser size={14} className="text-[#4EA8A1]" />
                    Customer Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailField label="Name" value={customerName} />
                    <DetailField label="Email" value={customerEmail} />
                    {data.userId ? (
                      <DetailField
                        label="User ID"
                        value={String(data.userId)}
                        className="sm:col-span-2"
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Listing Information */}
              {data.listingId ? (
                <div className="pt-4 border-t-2 border-dashed border-gray-200">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-800 mb-3 flex items-center gap-2">
                    <FiFileText size={14} className="text-[#4EA8A1]" />
                    Related Listing
                  </h3>
                  <DetailField
                    label="Listing ID"
                    value={String(data.listingId)}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Verification Response */}
          {data.verifyResponse && (
            <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-6 py-4 border-b-2 border-[#4EA8A1]/20">
                <div className="flex items-center gap-2.5">
                  <FiFileText size={18} className="text-[#4EA8A1]" />
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-800">
                    Verification Response
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 font-mono leading-relaxed">
                  {JSON.stringify(data.verifyResponse, null, 2)}
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
        <p className="text-xl font-extrabold text-gray-900">{value}</p>
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

function formatDate(val: unknown, withTime: boolean) {
  if (!val) return "—";
  const d = new Date(val as string);
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
