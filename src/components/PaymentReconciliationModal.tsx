import {
  ReconcilePayload,
  ReconciliationResponse,
  ReconciliationResult,
  useReconcilePayments,
} from "@/api";
import { formatPrice } from "@/utils";
import { useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiShieldOff,
  FiX,
} from "react-icons/fi";

interface PaymentReconciliationModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PaymentReconciliationModal({
  onClose,
  onSuccess,
}: PaymentReconciliationModalProps) {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0] // Today's date in YYYY-MM-DD
  );
  const [plan, setPlan] = useState("");
  const [userId, setUserId] = useState("");
  const [statuses, setStatuses] = useState<string[]>(["pending"]);
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<ReconciliationResponse | null>(null);

  const mutation = useReconcilePayments();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const payload: ReconcilePayload = {
      date,
      dryRun,
      ...(statuses.length > 0 && { statuses }),
      ...(plan && { plan }),
      ...(userId && { userId }),
    };

    try {
      const data = await mutation.mutateAsync(payload);
      setResult(data);
      if (!dryRun && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Reconciliation error:", error);
    }
  };

  const handleConfirm = async () => {
    setDryRun(false);
    const payload: ReconcilePayload = {
      date,
      dryRun: false,
      ...(statuses.length > 0 && { statuses }),
      ...(plan && { plan }),
      ...(userId && { userId }),
    };

    try {
      const data = await mutation.mutateAsync(payload);
      setResult(data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Reconciliation error:", error);
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reconciliation-${date}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!result) return;
    const headers = [
      "Reference",
      "Plan",
      "Amount (NGN)",
      "Before Status",
      "After Status",
      "Verification Status",
      "Paid At",
      "Email Sent",
      "Action",
      "Error",
    ];
    const rows = result.results.map((r) => [
      r.reference,
      r.plan || "",
      r.amountNGN?.toString() || "",
      r.beforeStatus,
      r.afterStatus,
      r.verificationStatus,
      r.paidAt || "",
      r.emailSent ? "Yes" : "No",
      r.action,
      r.error || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reconciliation-${date}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleStatus = (status: string) => {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4EA8A1] to-[#3d8882] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiRefreshCw size={24} />
              Payment Reconciliation
            </h2>
            <p className="mt-1 text-sm text-white/90">
              Verify and update payment statuses with Flutterwave
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Filter Form */}
          {!result && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gradient-to-br from-[#E8F5F4] to-white border-2 border-[#4EA8A1]/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCalendar size={18} className="text-[#4EA8A1]" />
                  Filter Settings
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Date - Required */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full h-11 rounded-lg border-2 border-gray-300 px-4 text-sm font-medium focus:outline-none focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Transactions created on this date (UTC) will be checked
                    </p>
                  </div>

                  {/* Plan Filter */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Plan (Optional)
                    </label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full h-11 rounded-lg border-2 border-gray-300 px-4 text-sm font-medium focus:outline-none focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 transition-all"
                    >
                      <option value="">All Plans</option>
                      <option value="instant">Instant</option>
                      <option value="deepDive">Deep Dive</option>
                      <option value="deeperDive">Deeper Dive</option>
                      <option value="free">Free</option>
                    </select>
                  </div>

                  {/* User ID Filter */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      User ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Limit to specific user"
                      className="w-full h-11 rounded-lg border-2 border-gray-300 px-4 text-sm font-medium focus:outline-none focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 transition-all"
                    />
                  </div>

                  {/* Status Chips */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Payment Statuses
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["pending", "success", "failed"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => toggleStatus(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            statuses.includes(status)
                              ? "bg-[#4EA8A1] text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Select which payment statuses to check
                    </p>
                  </div>

                  {/* Dry Run Toggle */}
                  <div className="md:col-span-2 flex items-center gap-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <input
                      type="checkbox"
                      id="dryRun"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#4EA8A1] focus:ring-[#4EA8A1]"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="dryRun"
                        className="text-sm font-bold text-gray-900 cursor-pointer flex items-center gap-2"
                      >
                        <FiShieldOff className="text-yellow-600" />
                        Dry Run Mode (Preview Only)
                      </label>
                      <p className="text-xs text-gray-600 mt-0.5">
                        When enabled, no changes will be made to the database.
                        Review results first, then run again without dry run.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!date || mutation.isPending}
                  className="px-8 py-3 bg-[#4EA8A1] text-white rounded-lg font-bold hover:bg-[#3d8882] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#4EA8A1]/20 transition-all flex items-center gap-2"
                >
                  {mutation.isPending ? (
                    <>
                      <FiClock className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw />
                      {dryRun ? "Preview Reconciliation" : "Run Reconciliation"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Dry Run Warning Banner */}
              {result.dryRun && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 flex items-start gap-4">
                  <FiAlertCircle
                    size={24}
                    className="text-yellow-600 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-900 mb-1">
                      Preview Mode - No Changes Made
                    </h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      This is a dry run. The actions shown below have NOT been
                      applied to the database. Review the results and click
                      &quot;Apply Changes&quot; to execute.
                    </p>
                    <button
                      onClick={handleConfirm}
                      disabled={mutation.isPending}
                      className="px-6 py-2.5 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      <FiCheckCircle />
                      Apply Changes (Run Without Dry Run)
                    </button>
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {!result.dryRun && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 flex items-start gap-4">
                  <FiCheckCircle
                    size={24}
                    className="text-green-600 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-green-900 mb-1">
                      Reconciliation Complete
                    </h4>
                    <p className="text-sm text-green-800">
                      Payment statuses have been updated. Emails sent where
                      applicable.
                    </p>
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-6">
                <SummaryCard
                  label="Examined"
                  value={result.totals.examined}
                  color="bg-blue-100 text-blue-700"
                />
                <SummaryCard
                  label="Marked Success"
                  value={result.totals.markedSuccess}
                  color="bg-green-100 text-green-700"
                />
                <SummaryCard
                  label="Updated Other"
                  value={result.totals.updatedOther}
                  color="bg-purple-100 text-purple-700"
                />
                <SummaryCard
                  label="Unchanged"
                  value={result.totals.unchanged}
                  color="bg-gray-100 text-gray-700"
                />
                <SummaryCard
                  label="Emails Sent"
                  value={result.totals.emailSent}
                  color="bg-teal-100 text-teal-700"
                />
                <SummaryCard
                  label="Errors"
                  value={result.totals.errors}
                  color="bg-red-100 text-red-700"
                />
              </div>

              {/* Export Buttons */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-600">
                  Export results for audit trail
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <FiDownload size={14} />
                    JSON
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <FiDownload size={14} />
                    CSV
                  </button>
                </div>
              </div>

              {/* Results Table */}
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#E8F5F4] to-[#D4ECE9] px-5 py-3.5 border-b-2 border-[#4EA8A1]/20">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-800">
                    Reconciliation Results ({result.results.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                          Reference
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                          Plan
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                          Before
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                          After
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                          Verification
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {result.results.map((item, index) => (
                        <ResultRow key={index} result={item} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setDryRun(true);
                  }}
                  className="px-6 py-3 border-2 border-[#4EA8A1] text-[#4EA8A1] rounded-lg font-bold hover:bg-[#4EA8A1]/10 transition-all"
                >
                  Run Another Check
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 bg-[#4EA8A1] text-white rounded-lg font-bold hover:bg-[#3d8882] shadow-lg shadow-[#4EA8A1]/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 bg-white">
      <span className={`text-3xl font-extrabold ${color} px-3 py-1 rounded-lg`}>
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 text-center">
        {label}
      </span>
    </div>
  );
}

function ResultRow({ result }: { result: ReconciliationResult }) {
  const isError = result.error || result.action === "error";
  const isSuccess =
    result.action === "marked-success" ||
    result.action === "would-mark-success";

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${
        isError ? "bg-red-50" : isSuccess ? "bg-green-50" : ""
      }`}
    >
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-gray-900 block max-w-[180px] truncate">
          {result.reference}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-medium text-gray-700">
          {result.plan
            ? result.plan === "deepDive"
              ? "Deep Dive"
              : result.plan === "deeperDive"
              ? "Deeper Dive"
              : result.plan
            : "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-xs font-bold text-gray-900">
          {result.amountNGN ? formatPrice(result.amountNGN) : "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <StatusBadge status={result.beforeStatus} />
      </td>
      <td className="px-4 py-3 text-center">
        <StatusBadge status={result.afterStatus} />
      </td>
      <td className="px-4 py-3 text-center">
        <StatusBadge status={result.verificationStatus} />
      </td>
      <td className="px-4 py-3 text-center">
        {result.emailSent ? (
          <FiCheckCircle className="text-green-600 mx-auto" size={16} />
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
              isError
                ? "bg-red-200 text-red-800"
                : isSuccess
                ? "bg-green-200 text-green-800"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {result.action.replace(/-/g, " ")}
          </span>
          {result.error && (
            <span className="text-[10px] text-red-600 font-medium">
              {result.error}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color =
    normalized === "success" || normalized === "successful"
      ? "bg-green-100 text-green-700"
      : normalized === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : normalized === "failed" || normalized === "error"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${color}`}
    >
      {status}
    </span>
  );
}
