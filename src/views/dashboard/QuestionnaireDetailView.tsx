import {
  useAdminQuestionnaire,
  useAdminQuestionnairesByUser,
  useCancelQuestionnaire,
  useUpdateQuestionnaireStatus,
} from "@/api";
import { TableBadge, TableButton } from "@/components/ui";
import type {
  AdminNote,
  Questionnaire,
  QuestionnaireFileRef,
  QuestionnaireStatus,
} from "@/types/questionnaire";
import { formatPrice } from "@/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiEdit2,
  FiFileText,
  FiHome,
  FiMapPin,
  FiShieldOff,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";

export default function QuestionnaireDetailView() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const { data, isLoading, isError, refetch, isFetching } =
    useAdminQuestionnaire(id);
  const questionnaire = data?.questionnaire;
  const payment = data?.payment as Record<string, unknown> | undefined;

  const userId = questionnaire?.userId?._id;
  const { data: userSubs, isFetching: isFetchingUserSubs } =
    useAdminQuestionnairesByUser(userId);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const cancelMutation = useCancelQuestionnaire();

  const handleBack = () => router.back();

  const handleCancel = () => {
    if (!questionnaire?._id) return;
    if (typeof window !== "undefined") {
      const confirmCancel = window.confirm(
        "Mark this questionnaire as cancelled?"
      );
      if (!confirmCancel) return;
      const reason = window.prompt(
        "Optional reason for cancellation (leave blank to skip):"
      );
      cancelMutation.mutate(
        {
          id: questionnaire._id,
          reason: reason || undefined,
          userId: questionnaire.userId?._id,
        },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    }
  };

  const statusBadgeVariant = useMemo(() => {
    const status = questionnaire?.status;
    if (status === "paid") return "success" as const;
    if (status === "cancelled") return "danger" as const;
    return "warning" as const;
  }, [questionnaire?.status]);

  return (
    <div className="space-y-6 pb-8">
      <Head>
        <title>
          {questionnaire?.userId?.firstName
            ? `${questionnaire.userId.firstName}'s Questionnaire — Inda Admin`
            : "Questionnaire Details — Inda Admin"}
        </title>
      </Head>

      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#4EA8A1] hover:text-[#3d8882] transition-colors"
      >
        <FiArrowLeft size={18} /> Back to Questionnaires
      </button>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading questionnaire...
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load questionnaire.
        </div>
      )}

      {!isLoading && !isError && questionnaire && (
        <>
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] p-6 border-b-2 border-[#4EA8A1]/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-extrabold text-gray-900">
                    Due Diligence Questionnaire
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-extrabold bg-[#4EA8A1] text-white shadow-sm">
                      {questionnaire.plan === "deepDive"
                        ? "Deep Dive"
                        : questionnaire.plan === "deeperDive"
                        ? "Deeper Dive"
                        : questionnaire.plan}
                    </span>
                    <TableBadge
                      variant={statusBadgeVariant}
                      className="uppercase text-xs font-extrabold"
                    >
                      {questionnaire.status}
                    </TableBadge>
                    {questionnaire.lastPaymentReference && (
                      <span className="text-xs text-gray-700 font-mono bg-white/80 px-3 py-1 rounded-md border border-gray-300">
                        {questionnaire.lastPaymentReference}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-[#4EA8A1] bg-white px-4 py-2.5 text-sm font-bold text-[#4EA8A1] hover:bg-[#4EA8A1] hover:text-white transition-all"
                  >
                    <FiEdit2 size={16} /> Update Status
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FiShieldOff size={16} />{" "}
                    {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </div>
            </div>

            <section className="grid gap-6 p-6 md:grid-cols-3">
              <SummaryCard
                title="Submitted"
                value={formatDate(questionnaire.createdAt, true)}
                helper={`Updated ${formatDate(questionnaire.updatedAt, true)}`}
                icon={<FiCalendar size={16} />}
              />
              <SummaryCard
                title="Paid"
                value={
                  questionnaire.paidAt
                    ? formatDate(questionnaire.paidAt, true)
                    : "Not yet paid"
                }
                helper={
                  questionnaire.paidAt
                    ? `Ref: ${questionnaire.lastPaymentReference || "n/a"}`
                    : "Awaiting payment"
                }
                icon={<FiCheckCircle size={16} />}
              />
              <SummaryCard
                title="Amount"
                value={
                  questionnaire.plan === "deeperDive"
                    ? formatPrice(100000)
                    : formatPrice(75000)
                }
                helper={
                  payment && payment["status"]
                    ? `Payment status: ${String(payment["status"])}`
                    : "Plan pricing"
                }
                icon={<FiDollarSign size={16} />}
              />
            </section>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <DetailCard title="User Information" icon={<FiUser size={18} />}>
              <DetailRow label="Name">
                {`${questionnaire.userId?.firstName ?? ""} ${
                  questionnaire.userId?.lastName ?? ""
                }`.trim() || "—"}
              </DetailRow>
              <DetailRow label="Email">
                {questionnaire.userId?.email || "—"}
              </DetailRow>
              <DetailRow label="Phone">
                {questionnaire.userId?.phoneNumber || "—"}
              </DetailRow>
              <DetailRow label="User ID">
                {questionnaire.userId?._id || "—"}
              </DetailRow>
            </DetailCard>

            <DetailCard
              title="Property Information"
              icon={<FiHome size={18} />}
            >
              <DetailRow label="Address">
                {questionnaire.propertyBasics?.propertyAddress || "—"}
              </DetailRow>
              <DetailRow label="Type">
                {questionnaire.propertyBasics?.propertyType || "—"}
              </DetailRow>
              <DetailRow label="Status">
                {questionnaire.propertyBasics?.propertyStatus || "—"}
              </DetailRow>
              {questionnaire.listingId?.title && (
                <DetailRow label="Listing">
                  {questionnaire.listingId.title}
                </DetailRow>
              )}
              {questionnaire.listingId?.location && (
                <DetailRow label="Location">
                  {questionnaire.listingId.location}
                </DetailRow>
              )}
            </DetailCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <DetailCard
              title="Buyer Information"
              icon={<FiShoppingBag size={18} />}
            >
              <DetailRow label="Full Name">
                {questionnaire.buyerInformation?.fullName || "—"}
              </DetailRow>
              <DetailRow label="Email">
                {questionnaire.buyerInformation?.email || "—"}
              </DetailRow>
              <DetailRow label="Phone">
                {questionnaire.buyerInformation?.phoneNumber || "—"}
              </DetailRow>
              {questionnaire.buyerInformation?.contactNotes && (
                <DetailRow label="Notes">
                  {questionnaire.buyerInformation.contactNotes}
                </DetailRow>
              )}
            </DetailCard>

            <DetailCard title="Site Access" icon={<FiMapPin size={18} />}>
              {questionnaire.siteAccess ? (
                <>
                  <DetailRow label="Contact Name">
                    {questionnaire.siteAccess.contactName || "—"}
                  </DetailRow>
                  <DetailRow label="Contact Phone">
                    {questionnaire.siteAccess.contactPhone || "—"}
                  </DetailRow>
                  {questionnaire.siteAccess.specialInstructions && (
                    <DetailRow label="Instructions">
                      {questionnaire.siteAccess.specialInstructions}
                    </DetailRow>
                  )}
                </>
              ) : (
                <DetailRow label="">No site access details provided.</DetailRow>
              )}
            </DetailCard>
          </div>

          {questionnaire.sellerInformation && (
            <DetailCard title="Seller Information">
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="Seller Type">
                  {questionnaire.sellerInformation.sellerType || "—"}
                </DetailRow>
                <DetailRow label="Name">
                  {questionnaire.sellerInformation.sellerName || "—"}
                </DetailRow>
                <DetailRow label="Email">
                  {questionnaire.sellerInformation.sellerEmail || "—"}
                </DetailRow>
                <DetailRow label="Phone">
                  {questionnaire.sellerInformation.sellerPhone || "—"}
                </DetailRow>
              </div>
            </DetailCard>
          )}

          <DocumentsSection questionnaire={questionnaire} />

          <NotesSection notes={questionnaire.metadata?.adminNotes} />

          {payment && (
            <div className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-6 py-4 border-b-2 border-[#4EA8A1]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                      <FiDollarSign size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-900">
                        Payment Receipt
                      </h2>
                      <p className="text-xs text-gray-600 font-semibold">
                        Transaction Details
                      </p>
                    </div>
                  </div>
                  {payment["status"] === "success" && (
                    <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
                      <FiCheckCircle size={16} />
                      <span className="text-xs font-extrabold uppercase">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                  {Object.entries(payment).map(([key, value]) => {
                    // Skip rendering complex objects inline
                    if (typeof value === "object" && value !== null)
                      return null;

                    return (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                          {key === "amount" && <FiDollarSign size={12} />}
                          {key === "createdAt" && <FiCalendar size={12} />}
                          {key === "paidAt" && <FiClock size={12} />}
                          {titleCase(key)}
                        </label>
                        <div className="min-h-[44px] flex items-center px-4 py-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900">
                          {key === "amount" && typeof value === "number"
                            ? formatPrice(value)
                            : key.includes("At") || key.includes("Date")
                            ? formatDate(value, true)
                            : formatValue(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {payment["reference"] &&
                typeof payment["reference"] === "string" ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                          Transaction Reference
                        </span>
                        <span className="text-sm font-mono font-bold text-gray-900">
                          {String(payment["reference"])}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (navigator?.clipboard) {
                            navigator.clipboard.writeText(
                              String(payment["reference"])
                            );
                          }
                        }}
                        className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg text-xs font-bold hover:bg-[#3d8882] transition-all"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {userSubs && userSubs.questionnaires.length > 0 && (
            <DetailCard
              title="Other Questionnaires by User"
              icon={<FiFileText size={16} />}
            >
              {isFetchingUserSubs ? (
                <p className="text-sm text-gray-500">Loading submissions…</p>
              ) : (
                <div className="space-y-3">
                  {userSubs.questionnaires.map((entry) => (
                    <div
                      key={entry._id}
                      className={`flex items-center justify-between rounded-xl border-2 px-5 py-4 transition-all ${
                        entry._id === questionnaire._id
                          ? "border-[#4EA8A1] bg-[#4EA8A1]/5"
                          : "border-gray-300 bg-white hover:border-[#4EA8A1]/50"
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-extrabold text-gray-900">
                          {planLabel(entry.plan)}
                        </span>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                              entry.status === "paid"
                                ? "bg-green-500 text-white"
                                : entry.status === "cancelled"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                            }`}
                          >
                            {entry.status}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            {formatDate(entry.createdAt, true)}
                          </span>
                        </div>
                      </div>
                      {entry._id !== questionnaire._id && (
                        <TableButton
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            router.push(
                              `/dashboard/questionnaires/${entry._id}`
                            )
                          }
                        >
                          View
                        </TableButton>
                      )}
                      {entry._id === questionnaire._id && (
                        <span className="text-xs font-extrabold text-[#4EA8A1] uppercase tracking-wider bg-[#4EA8A1]/10 px-3 py-1.5 rounded-md">
                          Current
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </DetailCard>
          )}
        </>
      )}

      {showStatusModal && questionnaire && (
        <StatusModal
          questionnaire={questionnaire}
          onClose={() => setShowStatusModal(false)}
          onSuccess={() => {
            setShowStatusModal(false);
            refetch();
          }}
        />
      )}

      {isFetching && !isLoading && (
        <div className="text-xs text-gray-500">Refreshing…</div>
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

function DetailCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-5 py-3.5 border-b-2 border-[#4EA8A1]/20">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-[#4EA8A1]">{icon}</span>}
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-800">
            {title}
          </h2>
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
          {label}
        </label>
      )}
      <div className="min-h-[44px] flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900">
        {children}
      </div>
    </div>
  );
}

function DocumentsSection({ questionnaire }: { questionnaire: Questionnaire }) {
  const documents = questionnaire.legalDocuments;
  if (!documents) return null;
  const entries = Object.entries(documents).filter(
    ([, files]) =>
      Array.isArray(files) && (files as QuestionnaireFileRef[]).length > 0
  );
  if (entries.length === 0) return null;

  return (
    <DetailCard title="Legal Documents" icon={<FiFileText size={16} />}>
      <div className="space-y-4">
        {entries.map(([key, files]) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
              {titleCase(key)}
            </label>
            <div className="min-h-[44px] flex flex-col gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
              {(files as QuestionnaireFileRef[]).map((file, index) => {
                const name = file.name || `Document ${index + 1}`;
                const url = file.url;
                const size = file.sizeBytes;
                return (
                  <div
                    key={`${key}-${index}`}
                    className="flex items-center justify-between gap-3 py-1"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">📄</span>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-[#4EA8A1] hover:text-[#3d8882] hover:underline transition-colors truncate"
                        >
                          {name}
                        </a>
                      ) : (
                        <span className="text-sm font-bold text-gray-700 truncate">
                          {name}
                        </span>
                      )}
                    </div>
                    {typeof size === "number" && (
                      <span className="text-[10px] font-bold text-gray-600 bg-white border border-gray-300 px-2.5 py-1 rounded-md whitespace-nowrap">
                        {formatFileSize(size)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DetailCard>
  );
}

function NotesSection({ notes }: { notes?: AdminNote[] }) {
  if (!notes || notes.length === 0) return null;
  return (
    <DetailCard title="Admin Notes" icon={<FiFileText size={16} />}>
      <div className="space-y-3">
        {notes.map((note, index) => (
          <div
            key={`${note.timestamp}-${index}`}
            className="border-2 border-[#4EA8A1]/20 rounded-lg overflow-hidden"
          >
            <div className="bg-[#4EA8A1]/5 px-4 py-2.5 border-b border-[#4EA8A1]/20 flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#4EA8A1]">
                {note.statusChange}
              </span>
              <span className="text-xs font-bold text-gray-600">
                {formatDate(note.timestamp, true)}
              </span>
            </div>
            <div className="px-4 py-3 bg-white">
              <p className="text-sm font-medium text-gray-800 leading-relaxed">
                {note.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DetailCard>
  );
}

function StatusModal({
  questionnaire,
  onClose,
  onSuccess,
}: {
  questionnaire: Questionnaire;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [status, setStatus] = useState<QuestionnaireStatus>(
    questionnaire.status
  );
  const [notes, setNotes] = useState("");
  const mutation = useUpdateQuestionnaireStatus();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(
      {
        id: questionnaire._id,
        status,
        notes: notes || undefined,
        userId: questionnaire.userId?._id,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#4EA8A1] to-[#3d8882] px-6 py-4">
          <h2 className="text-xl font-bold text-white">Update Status</h2>
          <p className="mt-1 text-sm text-white/90">
            Modify the questionnaire status and add an audit note.
          </p>
        </div>
        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuestionnaireStatus)}
              className="h-11 rounded-lg border-2 border-gray-300 px-4 text-sm font-medium focus:outline-none focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 transition-all"
            >
              <option value="submitted">Submitted</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none rounded-lg border-2 border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 transition-all"
              placeholder="e.g. Verified transaction manually via bank statement"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-[#4EA8A1] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#3d8882] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#4EA8A1]/20 transition-all"
            >
              {mutation.isPending ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function planLabel(plan: string) {
  if (plan === "deepDive") return "Deep Dive";
  if (plan === "deeperDive") return "Deeper Dive";
  return plan || "—";
}

function formatDate(value: unknown, withTime: boolean) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
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

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value))
    return value.map((item) => formatValue(item)).join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function formatFileSize(bytes: number) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const size = bytes / Math.pow(1024, index);
  return `${size.toFixed(1)} ${units[index]}`;
}

function titleCase(input: string) {
  return input
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w|\s\w/g, (match) => match.toUpperCase());
}
