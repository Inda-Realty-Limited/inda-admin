import {
  useAdminProcessedListings,
  useProcessRawListingById,
  useProcessRawListings,
  type ProcessedListingDto,
  type ProcessedListingsFilters,
  type ProcessRawResponse,
  type ProcessRawSyncResponse,
} from "@/api";
import { Pagination, Table, TableButton, TableColumn } from "@/components/ui";
import Head from "next/head";
import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiExternalLink,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

export default function ProcessedListingsView() {
  const [filters, setFilters] = useState<ProcessedListingsFilters>({
    page: 1,
    limit: 20,
    sort: "-processedAt",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [prefilledListingUrl, setPrefilledListingUrl] = useState<string | null>(
    null
  );
  const [lastRunSummary, setLastRunSummary] =
    useState<ProcessRawSyncResponse | null>(null);
  const [lastRunTimestamp, setLastRunTimestamp] = useState<string | null>(null);
  const [lastAsyncJob, setLastAsyncJob] = useState<{
    jobId: string;
    message?: string;
  } | null>(null);

  function update<K extends keyof ProcessedListingsFilters>(
    key: K,
    val: ProcessedListingsFilters[K]
  ) {
    setFilters((f) => ({
      ...f,
      [key]: val,
      page: key === "page" ? (val as number) : 1,
    }));
  }

  const { data, isLoading, isError, refetch } =
    useAdminProcessedListings(filters);

  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 20;
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const detailDoc = data?.items?.find((d) => d._id === detailId);

  const statusColors = {
    uptodate: "bg-green-100 text-green-700",
    past: "bg-orange-100 text-orange-700",
    failed: "bg-red-100 text-red-700",
    skipped: "bg-gray-100 text-gray-600",
  };

  const statusIcons = {
    uptodate: <FiCheckCircle className="inline mr-1" />,
    past: <FiClock className="inline mr-1" />,
    failed: <FiAlertCircle className="inline mr-1" />,
    skipped: <FiX className="inline mr-1" />,
  };

  const columns: TableColumn[] = [
    {
      key: "#",
      label: "#",
      align: "center",
      render: (_v, _row, index) => {
        const rowNumber = (currentPage - 1) * itemsPerPage + (index || 0) + 1;
        return (
          <span className="text-xs font-medium text-gray-600">{rowNumber}</span>
        );
      },
    },
    {
      key: "listingUrl",
      label: "Listing URL",
      render: (v) =>
        typeof v === "string" ? (
          <a
            href={v}
            target="_blank"
            rel="noreferrer"
            className="text-[#4EA8A1] hover:underline truncate max-w-[300px] inline-block align-top text-sm"
            title={v}
          >
            {v.split("/").pop()?.replace(/-/g, " ").substring(0, 50) || v}
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (v, row) => {
        const status = (v as keyof typeof statusColors) || "skipped";
        const doc = row as ProcessedListingDto;
        return (
          <div className="flex flex-col items-center gap-1">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
            >
              {statusIcons[status]}
              {status}
            </span>
            {doc.statusReason && (
              <span className="text-[10px] text-gray-500">
                {doc.statusReason}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "targetCollection",
      label: "Target",
      align: "center",
      render: (v) =>
        v ? (
          <span className="px-2 py-1 rounded text-xs font-mono bg-blue-50 text-blue-700">
            {String(v)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "jobType",
      label: "Job Type",
      align: "center",
      render: (v) =>
        v ? (
          <span className="px-2 py-1 rounded text-xs font-mono bg-purple-50 text-purple-700">
            {String(v)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "processedAt",
      label: "Processed At",
      render: (v) =>
        v ? (
          <span className="text-xs text-gray-600">
            {new Date(String(v)).toLocaleString()}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "lastUpdatedDate",
      label: "Last Updated",
      render: (v) =>
        v ? (
          <span className="text-xs text-gray-600">
            {new Date(String(v)).toLocaleString()}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_v, row) => {
        const doc = row as ProcessedListingDto;
        return (
          <TableButton onClick={() => setDetailId(doc._id)}>
            Details
          </TableButton>
        );
      },
    },
  ];

  // Stats summary
  const stats = {
    total: totalItems,
    uptodate: 0,
    past: 0,
    failed: 0,
    skipped: 0,
  };

  data?.items?.forEach((item) => {
    if (item.status === "uptodate") stats.uptodate++;
    else if (item.status === "past") stats.past++;
    else if (item.status === "failed") stats.failed++;
    else if (item.status === "skipped") stats.skipped++;
  });

  return (
    <>
      <Head>
        <title>Processed Listings | Inda Admin</title>
      </Head>

      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Processed Listings
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review processing outcomes and audit trail
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPrefilledListingUrl(null);
                setShowProcessModal(true);
              }}
              className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg hover:bg-[#3d8680] transition-colors text-sm font-medium"
            >
              <FiRefreshCw className="inline mr-2" />
              Process Raw Listings
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <FiRefreshCw className="inline mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-600 uppercase mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-xs text-green-700 uppercase mb-1">
              Up to Date
            </div>
            <div className="text-2xl font-bold text-green-700">
              {stats.uptodate}
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-xs text-orange-700 uppercase mb-1">
              Archived
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {stats.past}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-xs text-red-700 uppercase mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-700">
              {stats.failed}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-600 uppercase mb-1">Skipped</div>
            <div className="text-2xl font-bold text-gray-600">
              {stats.skipped}
            </div>
          </div>
        </div>

        {lastRunSummary && (
          <div className="mb-4 rounded-lg border border-[#4EA8A1]/40 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#4EA8A1]">
                  Last inline processing run
                </div>
                {lastRunTimestamp && (
                  <div className="text-xs text-gray-500">
                    {new Date(lastRunTimestamp).toLocaleString()}
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1">
                  Processed {lastRunSummary.processed} of {lastRunSummary.total}{" "}
                  raw listings
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLastRunSummary(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-3 text-center">
              <SummaryPill
                label="Processed"
                value={lastRunSummary.processed}
                tone="teal"
              />
              <SummaryPill
                label="Up to date"
                value={lastRunSummary.counts.uptodate}
                tone="green"
              />
              <SummaryPill
                label="Archived"
                value={lastRunSummary.counts.past}
                tone="orange"
              />
              <SummaryPill
                label="Failed"
                value={lastRunSummary.counts.failed}
                tone="red"
              />
              <SummaryPill
                label="Skipped"
                value={lastRunSummary.counts.skipped}
                tone="gray"
              />
            </div>

            {lastRunSummary.results.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold uppercase text-gray-500">
                  Sample outcomes
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr className="text-left">
                        <th className="px-3 py-2 font-medium text-gray-600">
                          #
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-600">
                          URL
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-600">
                          Status
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-600">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {lastRunSummary.results.slice(0, 5).map((result, idx) => (
                        <tr key={`${result.url}-${idx}`} className="align-top">
                          <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                          <td className="px-3 py-2 max-w-[280px] truncate text-[#4EA8A1]">
                            {result.url || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
                                statusColors[
                                  result.status as keyof typeof statusColors
                                ]
                              }`}
                            >
                              {
                                statusIcons[
                                  result.status as keyof typeof statusIcons
                                ]
                              }
                              {result.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {result.statusReason ||
                              result.reason ||
                              result.error ||
                              "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {lastAsyncJob && (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
            <div>
              <div className="font-semibold text-yellow-800">
                Background processing queued
              </div>
              <div className="mt-1">
                Job <span className="font-mono">{lastAsyncJob.jobId}</span> will
                run in the background.
              </div>
              {lastAsyncJob.message && (
                <div className="mt-1 text-xs text-yellow-800">
                  {lastAsyncJob.message}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/adminProperty/pipelineJobs"
                className="text-xs font-medium text-yellow-900 underline"
              >
                View jobs
              </a>
              <button
                type="button"
                onClick={() => setLastAsyncJob(null)}
                className="text-xs text-yellow-800 hover:text-yellow-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search URL, reason, error..."
                value={filters.q || ""}
                onChange={(e) => update("q", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status || ""}
              onChange={(e) =>
                update(
                  "status",
                  e.target.value as ProcessedListingsFilters["status"]
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
            >
              <option value="">All Statuses</option>
              <option value="uptodate">Up to Date</option>
              <option value="past">Archived (Past)</option>
              <option value="failed">Failed</option>
              <option value="skipped">Skipped</option>
            </select>

            {/* Target Collection Filter */}
            <select
              value={filters.targetCollection || ""}
              onChange={(e) =>
                update(
                  "targetCollection",
                  e.target.value as ProcessedListingsFilters["targetCollection"]
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
            >
              <option value="">All Collections</option>
              <option value="Listing">Listing</option>
              <option value="PastListing">PastListing</option>
            </select>

            {/* Advanced Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              {showAdvanced ? "Hide" : "Show"} Advanced
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., npc-recent-30-days"
                  value={filters.jobType || ""}
                  onChange={(e) => update("jobType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Scrape Session ID
                </label>
                <input
                  type="text"
                  placeholder="Job ID from scraper"
                  value={filters.scrapeSessionId || ""}
                  onChange={(e) => update("scrapeSessionId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Listing URL (exact)
                </label>
                <input
                  type="text"
                  placeholder="Full URL"
                  value={filters.listingUrl || ""}
                  onChange={(e) => update("listingUrl", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">
              Error loading processed listings
            </div>
          ) : (
            <Table
              columns={columns}
              data={data?.items || []}
              emptyMessage="No processed listings found"
            />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={(p) => update("page", p)}
            />
          </div>
        )}

        {/* Detail Modal */}
        {detailId && detailDoc && (
          <DetailModal
            doc={detailDoc}
            onClose={() => setDetailId(null)}
            onOpenProcessForm={() => {
              setPrefilledListingUrl(detailDoc.listingUrl || null);
              setShowProcessModal(true);
              setDetailId(null);
            }}
            onRefresh={refetch}
            onInlineComplete={(result: ProcessRawSyncResponse) => {
              setLastAsyncJob(null);
              setLastRunSummary(result);
              setLastRunTimestamp(new Date().toISOString());
            }}
            onAsyncQueued={(jobId: string, message?: string) => {
              setLastAsyncJob({ jobId, message });
            }}
          />
        )}

        {/* Process Modal */}
        {showProcessModal && (
          <ProcessModal
            onClose={() => setShowProcessModal(false)}
            onSuccess={(result: ProcessRawResponse) => {
              setShowProcessModal(false);
              if ("processed" in result) {
                setLastAsyncJob(null);
                setLastRunSummary(result);
                setLastRunTimestamp(new Date().toISOString());
                refetch();
              } else {
                setLastAsyncJob({
                  jobId: result.jobId,
                  message: result.message,
                });
              }
            }}
            prefilledUrl={prefilledListingUrl}
          />
        )}
      </div>
    </>
  );
}

// Detail Modal Component
function DetailModal({
  doc,
  onClose,
  onOpenProcessForm,
  onRefresh,
  onInlineComplete,
  onAsyncQueued,
}: {
  doc: ProcessedListingDto;
  onClose: () => void;
  onOpenProcessForm: () => void;
  onRefresh: () => Promise<unknown>;
  onInlineComplete: (result: ProcessRawSyncResponse) => void;
  onAsyncQueued: (jobId: string, message?: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "detail" | "raw">(
    "overview"
  );
  const [processingMode, setProcessingMode] = useState<
    "inline" | "async" | null
  >(null);

  const processSingleMutation = useProcessRawListingById();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const statusColors = {
    uptodate: "bg-green-100 text-green-700",
    past: "bg-orange-100 text-orange-700",
    failed: "bg-red-100 text-red-700",
    skipped: "bg-gray-100 text-gray-600",
  } as const;

  const statusIcons = {
    uptodate: <FiCheckCircle className="inline mr-1" />,
    past: <FiClock className="inline mr-1" />,
    failed: <FiAlertCircle className="inline mr-1" />,
    skipped: <FiX className="inline mr-1" />,
  } as const;

  const summarizeResult = (result: ProcessRawSyncResponse) => {
    const { counts } = result;
    return (
      `Processed: ${result.processed}/${result.total}\n` +
      `Up to date: ${counts.uptodate}\n` +
      `Archived: ${counts.past}\n` +
      `Failed: ${counts.failed}\n` +
      `Skipped: ${counts.skipped}`
    );
  };

  const handleInlineProcess = async () => {
    if (!doc.rawListingId) {
      onOpenProcessForm();
      return;
    }

    setProcessingMode("inline");
    try {
      const response = await processSingleMutation.mutateAsync({
        id: doc.rawListingId,
        payload: {
          mode: "inline",
          onlyUnprocessed: false,
        },
      });

      if ("processed" in response) {
        alert(`Inline processing complete!\n\n${summarizeResult(response)}`);
        onInlineComplete(response);
      } else {
        alert(
          `Processing job queued!\n\nJob ID: ${response.jobId}\nStatus: ${response.status}`
        );
        onAsyncQueued(response.jobId, response.message);
      }

      await onRefresh();
    } catch (error: any) {
      alert(
        `Unable to reprocess listing: ${error?.message || "Unknown error"}`
      );
    } finally {
      setProcessingMode(null);
    }
  };

  const handleAsyncProcess = async () => {
    if (!doc.rawListingId) {
      onOpenProcessForm();
      return;
    }

    setProcessingMode("async");
    try {
      const response = await processSingleMutation.mutateAsync({
        id: doc.rawListingId,
        payload: {
          mode: "async",
          enqueue: true,
          onlyUnprocessed: false,
        },
      });

      if ("processed" in response) {
        alert(`Inline processing complete!\n\n${summarizeResult(response)}`);
        onInlineComplete(response);
      } else {
        alert(
          `Processing job queued!\n\nJob ID: ${response.jobId}\nStatus: ${response.status}`
        );
        onAsyncQueued(response.jobId, response.message);
      }

      await onRefresh();
    } catch (error: any) {
      alert(
        `Unable to queue async reprocess: ${error?.message || "Unknown error"}`
      );
    } finally {
      setProcessingMode(null);
    }
  };

  const handleSendToCleaning = () => {
    if (!doc.listingUrl) {
      alert("No listing URL available for cleaning workspace.");
      return;
    }
    window.open(
      `/adminProperty/cleanedListings?prefill=${encodeURIComponent(
        doc.listingUrl
      )}`,
      "_blank"
    );
  };

  const isInlineLoading =
    processSingleMutation.isPending && processingMode === "inline";
  const isAsyncLoading =
    processSingleMutation.isPending && processingMode === "async";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Processed Listing Detail
            </h2>
            <p className="text-sm text-gray-600 mt-1">ID: {doc._id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-[#4EA8A1] text-[#4EA8A1]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("detail")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "detail"
                ? "border-[#4EA8A1] text-[#4EA8A1]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Detail Snapshot
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "raw"
                ? "border-[#4EA8A1] text-[#4EA8A1]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Raw Snapshot
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  doc.status === "uptodate"
                    ? "border-green-200 bg-green-50"
                    : doc.status === "past"
                    ? "border-orange-200 bg-orange-50"
                    : doc.status === "failed"
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[doc.status as keyof typeof statusColors]
                      }`}
                    >
                      {statusIcons[doc.status as keyof typeof statusIcons]}
                      {doc.status}
                    </span>
                    {doc.statusReason && (
                      <p className="text-sm text-gray-700 mt-2">
                        Reason: {doc.statusReason}
                      </p>
                    )}
                  </div>
                  {doc.targetCollection && (
                    <span className="px-3 py-1 rounded text-sm font-mono bg-blue-50 text-blue-700">
                      → {doc.targetCollection}
                    </span>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {doc.errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FiAlertCircle className="text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-red-900 mb-1">
                        Error Details
                      </div>
                      <div className="text-sm text-red-700">
                        {doc.errorMessage}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Information */}
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Listing URL" value={doc.listingUrl}>
                  {doc.listingUrl && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => copyToClipboard(doc.listingUrl!)}
                        className="text-xs text-[#4EA8A1] hover:underline"
                      >
                        <FiCopy className="inline mr-1" />
                        Copy
                      </button>
                      <a
                        href={doc.listingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#4EA8A1] hover:underline"
                      >
                        <FiExternalLink className="inline mr-1" />
                        Open
                      </a>
                    </div>
                  )}
                </InfoField>

                <InfoField label="Source" value={doc.source} />

                <InfoField label="Job Type" value={doc.jobType} />

                <InfoField
                  label="Scrape Session ID"
                  value={doc.scrapeSessionId}
                >
                  {doc.scrapeSessionId && (
                    <button
                      onClick={() => copyToClipboard(doc.scrapeSessionId!)}
                      className="text-xs text-[#4EA8A1] hover:underline mt-1"
                    >
                      <FiCopy className="inline mr-1" />
                      Copy
                    </button>
                  )}
                </InfoField>

                <InfoField
                  label="Processed At"
                  value={
                    doc.processedAt
                      ? new Date(doc.processedAt).toLocaleString()
                      : null
                  }
                />

                <InfoField
                  label="Last Updated Date"
                  value={
                    doc.lastUpdatedDate
                      ? new Date(doc.lastUpdatedDate).toLocaleString()
                      : null
                  }
                />

                <InfoField label="Raw Listing ID" value={doc.rawListingId} />
              </div>
            </div>
          )}

          {activeTab === "detail" && (
            <div>
              {doc.detailSnapshot ? (
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto border border-gray-200">
                  {JSON.stringify(doc.detailSnapshot, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No detail snapshot available
                </div>
              )}
            </div>
          )}

          {activeTab === "raw" && (
            <div>
              {doc.rawSnapshot ? (
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto border border-gray-200">
                  {JSON.stringify(doc.rawSnapshot, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No raw snapshot available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 p-6 border-t border-gray-200 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Close
            </button>
            {doc.listingUrl && (
              <button
                onClick={handleSendToCleaning}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <FiExternalLink className="inline mr-2" />
                Send to Cleaning
              </button>
            )}
            <button
              onClick={onOpenProcessForm}
              className="px-4 py-2 border border-[#4EA8A1] text-[#4EA8A1] rounded-lg hover:bg-[#ebf5f4] transition-colors text-sm font-medium"
            >
              Advanced Form
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAsyncProcess}
              disabled={isAsyncLoading}
              className="px-4 py-2 border border-[#4EA8A1] text-[#4EA8A1] rounded-lg hover:bg-[#ebf5f4] transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAsyncLoading ? (
                <>
                  <FiRefreshCw className="inline mr-2 animate-spin" />
                  Queuing...
                </>
              ) : (
                <>
                  <FiRefreshCw className="inline mr-2" />
                  Queue Async
                </>
              )}
            </button>
            <button
              onClick={handleInlineProcess}
              disabled={isInlineLoading}
              className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg hover:bg-[#3d8680] transition-colors text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isInlineLoading ? (
                <>
                  <FiRefreshCw className="inline mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiRefreshCw className="inline mr-2" />
                  Reprocess Inline
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Info Field Helper
function InfoField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-sm text-gray-900">
        {value || "—"}
        {children}
      </div>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "teal" | "green" | "orange" | "red" | "gray";
}) {
  const toneClasses: Record<
    "teal" | "green" | "orange" | "red" | "gray",
    { bg: string; text: string }
  > = {
    teal: { bg: "bg-[#4EA8A1]/10", text: "text-[#2f6b67]" },
    green: { bg: "bg-green-50", text: "text-green-700" },
    orange: { bg: "bg-orange-50", text: "text-orange-700" },
    red: { bg: "bg-red-50", text: "text-red-700" },
    gray: { bg: "bg-gray-50", text: "text-gray-600" },
  } as const;

  const palette = toneClasses[tone];

  return (
    <div
      className={`rounded-lg border border-gray-200 px-3 py-3 ${palette.bg}`}
    >
      <div className={`text-[11px] font-semibold uppercase ${palette.text}`}>
        {label}
      </div>
      <div className={`text-xl font-bold ${palette.text}`}>{value}</div>
    </div>
  );
}

// Process Modal Component
function ProcessModal({
  onClose,
  onSuccess,
  prefilledUrl,
}: {
  onClose: () => void;
  onSuccess: (result: ProcessRawResponse) => void;
  prefilledUrl?: string | null;
}) {
  const [form, setForm] = useState({
    source: "NPC",
    limit: prefilledUrl ? 1 : 50,
    since: "",
    onlyUnprocessed: !prefilledUrl,
    scrapeSessionId: "",
    jobType: "",
    rawListingIdsText: "",
    listingUrlsText: prefilledUrl || "",
    headers: "",
    cookie: "",
    userAgent: "",
    mode: "inline" as "inline" | "async",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const processMutation = useProcessRawListings();

  useEffect(() => {
    if (prefilledUrl) {
      setForm((prev) => ({
        ...prev,
        listingUrlsText: prefilledUrl,
        limit: 1,
        onlyUnprocessed: false,
      }));
    }
  }, [prefilledUrl]);

  const parseList = (value: string) =>
    value
      .split(/[\n,]/)
      .map((entry) => entry.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: Record<string, unknown> = {
      source: form.source,
      limit: form.limit,
      onlyUnprocessed: form.onlyUnprocessed,
    };

    if (form.since) payload.since = form.since;
    if (form.scrapeSessionId) payload.scrapeSessionId = form.scrapeSessionId;
    if (form.jobType) payload.jobType = form.jobType;

    const rawIds = parseList(form.rawListingIdsText);
    if (rawIds.length > 0) payload.rawListingIds = rawIds;

    const listingUrls = parseList(form.listingUrlsText);
    if (listingUrls.length > 0) {
      payload.listingUrls = listingUrls;
      if (!payload.limit) {
        payload.limit = listingUrls.length;
      }
    }

    if (form.mode === "async") {
      payload.mode = "async";
      payload.enqueue = true;
      payload.async = true;
    } else {
      payload.mode = "inline";
    }

    try {
      if (form.headers) {
        payload.headers = JSON.parse(form.headers);
      }
    } catch {
      alert("Invalid JSON in headers field");
      return;
    }

    if (form.cookie) payload.cookie = form.cookie;
    if (form.userAgent) payload.userAgent = form.userAgent;

    try {
      const result = await processMutation.mutateAsync(payload as any);
      if ("processed" in result) {
        const { counts } = result;
        alert(
          `Inline processing complete!\n\n` +
            `Processed: ${result.processed}/${result.total}\n` +
            `Up to date: ${counts.uptodate}\n` +
            `Archived: ${counts.past}\n` +
            `Failed: ${counts.failed}\n` +
            `Skipped: ${counts.skipped}`
        );
      } else {
        alert(
          `Processing job queued!\n\nJob ID: ${result.jobId}\nStatus: ${result.status}`
        );
      }
      onSuccess(result);
    } catch (err: any) {
      alert(`Processing failed: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Process Raw Listings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Promote raw listings to Listing or PastListing collections
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <FiAlertCircle className="inline mr-2" />
              Choose inline mode for immediate results or async mode to enqueue
              a background job. Provide IDs or URLs to target specific rows.
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limit (max rows to process)
                </label>
                <input
                  type="number"
                  value={form.limit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      limit: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
                />
              </div>

              {/* Since */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Since (ISO timestamp, optional)
                </label>
                <input
                  type="text"
                  placeholder="2025-10-01T00:00:00Z"
                  value={form.since}
                  onChange={(e) => setForm({ ...form, since: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Run mode
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="mode"
                    value="inline"
                    checked={form.mode === "inline"}
                    onChange={() => setForm({ ...form, mode: "inline" })}
                    className="h-4 w-4 text-[#4EA8A1] focus:ring-[#4EA8A1]"
                  />
                  Inline (process now)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="mode"
                    value="async"
                    checked={form.mode === "async"}
                    onChange={() => setForm({ ...form, mode: "async" })}
                    className="h-4 w-4 text-[#4EA8A1] focus:ring-[#4EA8A1]"
                  />
                  Async (queue background job)
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Inline mode streams results immediately. Async mode creates a
                job visible in the pipeline jobs dashboard.
              </p>
            </div>

            {/* Only Unprocessed */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="onlyUnprocessed"
                checked={form.onlyUnprocessed}
                onChange={(e) =>
                  setForm({ ...form, onlyUnprocessed: e.target.checked })
                }
                className="w-4 h-4 text-[#4EA8A1] focus:ring-[#4EA8A1] border-gray-300 rounded"
              />
              <label
                htmlFor="onlyUnprocessed"
                className="text-sm font-medium text-gray-700"
              >
                Only process unprocessed rows
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scrape Session ID
                </label>
                <input
                  type="text"
                  value={form.scrapeSessionId}
                  onChange={(e) =>
                    setForm({ ...form, scrapeSessionId: e.target.value })
                  }
                  placeholder="Optional job/session identifier"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <input
                  type="text"
                  value={form.jobType}
                  onChange={(e) =>
                    setForm({ ...form, jobType: e.target.value })
                  }
                  placeholder="e.g. process-raw-listings"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raw Listing IDs (optional)
              </label>
              <textarea
                value={form.rawListingIdsText}
                onChange={(e) =>
                  setForm({ ...form, rawListingIdsText: e.target.value })
                }
                rows={3}
                placeholder="abc123, def456 or one per line"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#4EA8A1]"
              />
              <p className="mt-1 text-xs text-gray-500">
                When provided, only these raw listing IDs will be processed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Listing URLs (optional)
              </label>
              <textarea
                value={form.listingUrlsText}
                onChange={(e) =>
                  setForm({ ...form, listingUrlsText: e.target.value })
                }
                rows={3}
                placeholder="https://example.com/listing-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#4EA8A1]"
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste full URLs (comma or newline separated) to reprocess
                specific listings.
              </p>
            </div>

            {/* Advanced */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-[#4EA8A1] hover:underline"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Headers (JSON)
                  </label>
                  <textarea
                    value={form.headers}
                    onChange={(e) =>
                      setForm({ ...form, headers: e.target.value })
                    }
                    rows={3}
                    placeholder='{"Accept": "text/html"}'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#4EA8A1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cookie
                  </label>
                  <input
                    type="text"
                    value={form.cookie}
                    onChange={(e) =>
                      setForm({ ...form, cookie: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#4EA8A1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Agent
                  </label>
                  <input
                    type="text"
                    value={form.userAgent}
                    onChange={(e) =>
                      setForm({ ...form, userAgent: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4EA8A1]"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={processMutation.isPending}
            className="px-4 py-2 bg-[#4EA8A1] text-white rounded-lg hover:bg-[#3d8680] transition-colors text-sm font-medium disabled:opacity-50"
          >
            {processMutation.isPending ? (
              <>
                <FiRefreshCw className="inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FiRefreshCw className="inline mr-2" />
                Start Processing
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
