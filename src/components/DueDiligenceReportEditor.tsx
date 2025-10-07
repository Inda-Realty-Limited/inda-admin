import {
  useAdminDueDiligenceReport,
  useSaveDueDiligenceReport,
  type DueDiligenceOrderContext,
  type DueDiligenceReport,
  type DueDiligenceReportPayload,
} from "@/api";
import { formatPrice } from "@/utils";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useEffect, useMemo, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  type FieldArray,
  type SubmitHandler,
  type UseFieldArrayReturn,
  type UseFormRegister,
} from "react-hook-form";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFilePlus,
  FiPlus,
  FiSave,
  FiTrash2,
} from "react-icons/fi";

interface DueDiligenceReportEditorProps {
  groupId: string;
}

type ChecklistItemForm = {
  title: string;
  status: string;
  note?: string;
};

type AttachmentForm = {
  title?: string;
  url: string;
  key?: string;
  contentType?: string;
};

type FormValues = {
  reportId: string;
  status: string;
  reportDate: string;
  clientName: string;
  analystName: string;
  confidenceLevel: string;
  executiveSummary: string;
  propertyOverview: {
    propertyType: string;
    location: string;
    landSizeSqm?: string;
    yearBuilt?: string;
    keyFindings: { value: string }[];
  };
  valuationAnalysis: {
    askingPriceNGN?: string;
    fairMarketValueNGN?: string;
    valueOpportunityNGN?: string;
    recommendation: string;
    summary: string;
  };
  legalVerification: ChecklistItemForm[];
  surveyVerification: ChecklistItemForm[];
  marketContext: {
    comparablePricePerSqmNGN?: string;
    subjectPricePerSqmNGN?: string;
    valueDeltaPercent?: string;
    rentalYields: {
      longTerm?: string;
      shortTerm?: string;
      marketAverage?: string;
    };
    marketScore?: string;
    investmentGrade: string;
  };
  finalVerdict: {
    verdict: string;
    summary: string;
    legalCompliancePercent?: string;
    surveyAccuracyPercent?: string;
    marketPositionSummary: string;
  };
  attachments: AttachmentForm[];
};

const confidenceOptions = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const verdictOptions = [
  { value: "proceed", label: "Proceed" },
  { value: "monitor", label: "Monitor" },
  { value: "decline", label: "Decline" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "final", label: "Final" },
];

const checklistStatuses = [
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "issue", label: "Issue" },
  { value: "not_applicable", label: "Not Applicable" },
];

export default function DueDiligenceReportEditor({
  groupId,
}: DueDiligenceReportEditorProps) {
  const { data, isLoading, isError, refetch } =
    useAdminDueDiligenceReport(groupId);
  const mutation = useSaveDueDiligenceReport();
  const [showSuccess, setShowSuccess] = useState(false);

  const order = useMemo(
    () => data?.order ?? (null as DueDiligenceOrderContext | null),
    [data]
  );
  const report = useMemo(
    () => data?.report ?? (null as DueDiligenceReport | null),
    [data]
  );

  const defaultValues = useMemo(
    () => buildDefaultValues(report, order),
    [order, report]
  );

  const methods = useForm<FormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  const keyFindingsArray = useFieldArray({
    control,
    name: "propertyOverview.keyFindings",
  });

  const legalArray = useFieldArray({ control, name: "legalVerification" });
  const surveyArray = useFieldArray({ control, name: "surveyVerification" });
  const attachmentArray = useFieldArray({ control, name: "attachments" });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const payload = toPayload(values);
    mutation.mutate(
      { groupId, payload },
      {
        onSuccess: () => {
          setShowSuccess(true);
          refetch();
          setTimeout(() => setShowSuccess(false), 3000);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Due Diligence Report
          </h2>
          <p className="text-sm text-gray-600">
            Create and maintain the official due diligence report for this
            order.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-xs text-gray-500">
          <span>
            Order Group: <strong>{groupId}</strong>
          </span>
          {order?.plan && (
            <span>
              Eligible Plan: <strong>{prettyPlan(order.plan)}</strong>
            </span>
          )}
          {report?.publishedAt && (
            <span className="text-green-600 flex items-center gap-1">
              <FiCheckCircle /> Published {fmtDate(report.publishedAt)}
            </span>
          )}
        </div>
      </header>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading due diligence report...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <FiAlertCircle /> Failed to load due diligence data.
        </div>
      )}

      {!isLoading && !isError && order && (
        <div className="rounded-xl border border-[#4EA8A1]/20 bg-[#E8F5F4]/40 p-4 text-sm text-gray-700 space-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              <strong>User:</strong>{" "}
              {order.user?.name || order.user?.email || "Unknown"}
            </span>
            {order.listing?.title && (
              <span>
                <strong>Listing:</strong> {order.listing.title}
              </span>
            )}
            {order.payments?.length ? (
              <span>
                <strong>Payments:</strong> {order.payments.length} successful
              </span>
            ) : null}
          </div>
          {order.payments?.length ? (
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              {order.payments.map((payment) => (
                <span
                  key={payment.reference}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-[#4EA8A1]/40"
                >
                  <FiClock className="text-[#4EA8A1]" />
                  {payment.reference} · {fmtDate(payment.paidAt)} ·
                  {formatPrice(payment.amountNGN ?? 0)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {showSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
          <FiCheckCircle /> Report saved successfully.
        </div>
      )}

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <section className="grid gap-4 md:grid-cols-2">
            <LabeledInput
              label="Report ID"
              placeholder="IND-2025-0847"
              {...register("reportId")}
            />
            <LabeledInput
              label="Report Date"
              type="date"
              {...register("reportDate")}
            />
            <LabeledSelect
              label="Status"
              options={statusOptions}
              {...register("status")}
            />
            <LabeledSelect
              label="Confidence Level"
              options={confidenceOptions}
              {...register("confidenceLevel")}
            />
            <LabeledInput
              label="Client Name"
              placeholder="Client organisation"
              {...register("clientName")}
            />
            <LabeledInput
              label="Analyst Name"
              placeholder="Lead analyst"
              {...register("analystName")}
            />
          </section>

          <section className="space-y-3">
            <SectionHeader title="Executive Summary" icon={<FiFilePlus />} />
            <LabeledTextarea
              label="Summary"
              rows={4}
              placeholder="Summarise the key insights and recommendation."
              {...register("executiveSummary")}
            />
          </section>

          <section className="space-y-4">
            <SectionHeader title="Property Overview" icon={<FiFilePlus />} />
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledInput
                label="Property Type"
                placeholder="4-Bedroom Duplex"
                {...register("propertyOverview.propertyType")}
              />
              <LabeledInput
                label="Location"
                placeholder="Lekki Phase 1, Lagos"
                {...register("propertyOverview.location")}
              />
              <LabeledInput
                label="Land Size (sqm)"
                type="number"
                min="0"
                {...register("propertyOverview.landSizeSqm")}
              />
              <LabeledInput
                label="Year Built"
                type="number"
                min="1800"
                max="2100"
                {...register("propertyOverview.yearBuilt")}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Key Findings
                </label>
                <button
                  type="button"
                  onClick={() => keyFindingsArray.append({ value: "" })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#4EA8A1]"
                >
                  <FiPlus /> Add finding
                </button>
              </div>
              <div className="space-y-2">
                {keyFindingsArray.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4EA8A1] focus:outline-none"
                      placeholder="Finding"
                      {...register(
                        `propertyOverview.keyFindings.${index}.value` as const
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => keyFindingsArray.remove(index)}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-2 text-gray-500 hover:bg-gray-50"
                      aria-label="Remove key finding"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader title="Valuation Analysis" icon={<FiFilePlus />} />
            <div className="grid gap-4 md:grid-cols-3">
              <LabeledInput
                label="Asking Price (NGN)"
                type="number"
                min="0"
                {...register("valuationAnalysis.askingPriceNGN")}
              />
              <LabeledInput
                label="Fair Market Value (NGN)"
                type="number"
                min="0"
                {...register("valuationAnalysis.fairMarketValueNGN")}
              />
              <LabeledInput
                label="Value Opportunity (NGN)"
                type="number"
                min="0"
                {...register("valuationAnalysis.valueOpportunityNGN")}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledInput
                label="Recommendation"
                placeholder="Proceed"
                {...register("valuationAnalysis.recommendation")}
              />
              <LabeledTextarea
                label="Summary"
                rows={3}
                {...register("valuationAnalysis.summary")}
              />
            </div>
          </section>

          <ChecklistSection
            title="Legal Verification"
            controlArray={legalArray}
            register={register}
            fieldPath="legalVerification"
          />

          <ChecklistSection
            title="Survey Verification"
            controlArray={surveyArray}
            register={register}
            fieldPath="surveyVerification"
          />

          <section className="space-y-4">
            <SectionHeader title="Market Context" icon={<FiFilePlus />} />
            <div className="grid gap-4 md:grid-cols-3">
              <LabeledInput
                label="Comparable Price / sqm (NGN)"
                type="number"
                min="0"
                {...register("marketContext.comparablePricePerSqmNGN")}
              />
              <LabeledInput
                label="Subject Price / sqm (NGN)"
                type="number"
                min="0"
                {...register("marketContext.subjectPricePerSqmNGN")}
              />
              <LabeledInput
                label="Value Delta (%)"
                type="number"
                step="0.1"
                {...register("marketContext.valueDeltaPercent")}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <LabeledInput
                label="Rental Yield (Long Term %)"
                type="number"
                step="0.1"
                {...register("marketContext.rentalYields.longTerm")}
              />
              <LabeledInput
                label="Rental Yield (Short Term %)"
                type="number"
                step="0.1"
                {...register("marketContext.rentalYields.shortTerm")}
              />
              <LabeledInput
                label="Market Average Yield (%)"
                type="number"
                step="0.1"
                {...register("marketContext.rentalYields.marketAverage")}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledInput
                label="Market Score"
                type="number"
                step="0.1"
                {...register("marketContext.marketScore")}
              />
              <LabeledInput
                label="Investment Grade"
                placeholder="Premium"
                {...register("marketContext.investmentGrade")}
              />
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader title="Final Verdict" icon={<FiFilePlus />} />
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledSelect
                label="Verdict"
                options={verdictOptions}
                {...register("finalVerdict.verdict")}
              />
              <LabeledInput
                label="Legal Compliance (%)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register("finalVerdict.legalCompliancePercent")}
              />
              <LabeledInput
                label="Survey Accuracy (%)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register("finalVerdict.surveyAccuracyPercent")}
              />
            </div>
            <LabeledTextarea
              label="Summary"
              rows={3}
              {...register("finalVerdict.summary")}
            />
            <LabeledTextarea
              label="Market Position Summary"
              rows={2}
              {...register("finalVerdict.marketPositionSummary")}
            />
          </section>

          <section className="space-y-4">
            <SectionHeader title="Attachments" icon={<FiFilePlus />} />
            <div className="space-y-3">
              {attachmentArray.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[1fr_1fr_auto]"
                >
                  <LabeledInput
                    label="Title"
                    placeholder="Attachment title"
                    {...register(`attachments.${index}.title` as const)}
                  />
                  <LabeledInput
                    label="URL"
                    placeholder="https://..."
                    required
                    {...register(`attachments.${index}.url` as const)}
                  />
                  <button
                    type="button"
                    onClick={() => attachmentArray.remove(index)}
                    className="mt-6 inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => attachmentArray.append({ title: "", url: "" })}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#4EA8A1] px-4 py-2 text-sm font-semibold text-[#4EA8A1] hover:bg-[#E8F5F4]"
              >
                <FiPlus /> Add attachment
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Regularly updating this report keeps auditors informed and ensures
              compliance records stay accurate.
            </p>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4EA8A1] px-5 py-2 text-sm font-bold text-white hover:bg-[#3d8882] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <FiClock className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FiSave /> Save Report
                  {isDirty && <span className="text-[10px]">(unsaved)</span>}
                </>
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function buildDefaultValues(
  report: DueDiligenceReport | null,
  order: DueDiligenceOrderContext | null
): FormValues {
  const today = new Date().toISOString().slice(0, 10);
  const defaultKeyFindings = report?.propertyOverview?.keyFindings?.length
    ? report.propertyOverview.keyFindings.map((value) => ({ value }))
    : [{ value: "" }];

  return {
    reportId: report?.reportId || "",
    status: report?.status || "draft",
    reportDate: report?.reportDate || today,
    clientName: report?.clientName || deriveClientName(order?.user) || "",
    analystName: report?.analystName || "",
    confidenceLevel: report?.confidenceLevel || "medium",
    executiveSummary: report?.executiveSummary || "",
    propertyOverview: {
      propertyType: report?.propertyOverview?.propertyType || "",
      location:
        report?.propertyOverview?.location ||
        order?.listing?.microlocationStd ||
        "",
      landSizeSqm: report?.propertyOverview?.landSizeSqm?.toString() || "",
      yearBuilt: report?.propertyOverview?.yearBuilt?.toString() || "",
      keyFindings: defaultKeyFindings,
    },
    valuationAnalysis: {
      askingPriceNGN: valueToString(report?.valuationAnalysis?.askingPriceNGN),
      fairMarketValueNGN: valueToString(
        report?.valuationAnalysis?.fairMarketValueNGN
      ),
      valueOpportunityNGN: valueToString(
        report?.valuationAnalysis?.valueOpportunityNGN
      ),
      recommendation: report?.valuationAnalysis?.recommendation || "",
      summary: report?.valuationAnalysis?.summary || "",
    },
    legalVerification: report?.legalVerification?.length
      ? report.legalVerification.map((item) => ({
          title: item.title || "",
          status: item.status || "verified",
          note: item.note || "",
        }))
      : [{ title: "", status: "pending", note: "" }],
    surveyVerification: report?.surveyVerification?.length
      ? report.surveyVerification.map((item) => ({
          title: item.title || "",
          status: item.status || "verified",
          note: item.note || "",
        }))
      : [{ title: "", status: "pending", note: "" }],
    marketContext: {
      comparablePricePerSqmNGN: valueToString(
        report?.marketContext?.comparablePricePerSqmNGN
      ),
      subjectPricePerSqmNGN: valueToString(
        report?.marketContext?.subjectPricePerSqmNGN
      ),
      valueDeltaPercent: valueToString(
        report?.marketContext?.valueDeltaPercent
      ),
      rentalYields: {
        longTerm: valueToString(report?.marketContext?.rentalYields?.longTerm),
        shortTerm: valueToString(
          report?.marketContext?.rentalYields?.shortTerm
        ),
        marketAverage: valueToString(
          report?.marketContext?.rentalYields?.marketAverage
        ),
      },
      marketScore: valueToString(report?.marketContext?.marketScore),
      investmentGrade: report?.marketContext?.investmentGrade || "",
    },
    finalVerdict: {
      verdict: report?.finalVerdict?.verdict || "proceed",
      summary: report?.finalVerdict?.summary || "",
      legalCompliancePercent: valueToString(
        report?.finalVerdict?.legalCompliancePercent
      ),
      surveyAccuracyPercent: valueToString(
        report?.finalVerdict?.surveyAccuracyPercent
      ),
      marketPositionSummary: report?.finalVerdict?.marketPositionSummary || "",
    },
    attachments: report?.attachments?.length
      ? report.attachments.map((item) => ({
          title: item.title,
          url: item.url,
          key: item.key,
          contentType: item.contentType,
        }))
      : [{ title: "", url: "" }],
  };
}

function toPayload(values: FormValues): DueDiligenceReportPayload {
  const payload: DueDiligenceReportPayload = {
    reportId: values.reportId || undefined,
    status: values.status || undefined,
    reportDate: values.reportDate || undefined,
    clientName: values.clientName || undefined,
    analystName: values.analystName || undefined,
    confidenceLevel: values.confidenceLevel || undefined,
    executiveSummary: values.executiveSummary || undefined,
    propertyOverview: {
      propertyType: values.propertyOverview.propertyType || undefined,
      location: values.propertyOverview.location || undefined,
      landSizeSqm: toNumber(values.propertyOverview.landSizeSqm),
      yearBuilt: toNumber(values.propertyOverview.yearBuilt),
      keyFindings: values.propertyOverview.keyFindings
        .map((item) => item.value?.trim())
        .filter(Boolean) as string[],
    },
    valuationAnalysis: {
      askingPriceNGN: toNumber(values.valuationAnalysis.askingPriceNGN),
      fairMarketValueNGN: toNumber(values.valuationAnalysis.fairMarketValueNGN),
      valueOpportunityNGN: toNumber(
        values.valuationAnalysis.valueOpportunityNGN
      ),
      recommendation: values.valuationAnalysis.recommendation || undefined,
      summary: values.valuationAnalysis.summary || undefined,
    },
    legalVerification: values.legalVerification
      .map((item) => ({
        title: item.title?.trim(),
        status: item.status || undefined,
        note: item.note?.trim() || undefined,
      }))
      .filter((item) => item.title || item.status || item.note),
    surveyVerification: values.surveyVerification
      .map((item) => ({
        title: item.title?.trim(),
        status: item.status || undefined,
        note: item.note?.trim() || undefined,
      }))
      .filter((item) => item.title || item.status || item.note),
    marketContext: {
      comparablePricePerSqmNGN: toNumber(
        values.marketContext.comparablePricePerSqmNGN
      ),
      subjectPricePerSqmNGN: toNumber(
        values.marketContext.subjectPricePerSqmNGN
      ),
      valueDeltaPercent: toNumber(values.marketContext.valueDeltaPercent),
      rentalYields: {
        longTerm: toNumber(values.marketContext.rentalYields.longTerm),
        shortTerm: toNumber(values.marketContext.rentalYields.shortTerm),
        marketAverage: toNumber(
          values.marketContext.rentalYields.marketAverage
        ),
      },
      marketScore: toNumber(values.marketContext.marketScore),
      investmentGrade: values.marketContext.investmentGrade || undefined,
    },
    finalVerdict: {
      verdict: values.finalVerdict.verdict || undefined,
      summary: values.finalVerdict.summary || undefined,
      legalCompliancePercent: toNumber(
        values.finalVerdict.legalCompliancePercent
      ),
      surveyAccuracyPercent: toNumber(
        values.finalVerdict.surveyAccuracyPercent
      ),
      marketPositionSummary:
        values.finalVerdict.marketPositionSummary || undefined,
    },
    attachments: values.attachments
      .map((item) => ({
        title: item.title?.trim() || undefined,
        url: item.url?.trim() || "",
        key: item.key || undefined,
        contentType: item.contentType || undefined,
      }))
      .filter((item) => item.url),
  };

  if (!payload.attachments?.length) delete payload.attachments;
  if (!payload.propertyOverview?.keyFindings?.length)
    delete payload.propertyOverview?.keyFindings;
  if (!payload.legalVerification?.length) delete payload.legalVerification;
  if (!payload.surveyVerification?.length) delete payload.surveyVerification;

  return payload;
}

const LabeledInput = ({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className="flex flex-col text-sm text-gray-700 gap-1">
    <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
      {label}
    </span>
    <input
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4EA8A1] focus:outline-none"
      {...props}
    />
  </label>
);

const LabeledTextarea = ({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) => (
  <label className="flex flex-col text-sm text-gray-700 gap-1">
    <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
      {label}
    </span>
    <textarea
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4EA8A1] focus:outline-none"
      {...props}
    />
  </label>
);

const LabeledSelect = ({
  label,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
}) => (
  <label className="flex flex-col text-sm text-gray-700 gap-1">
    <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
      {label}
    </span>
    <select
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#4EA8A1] focus:outline-none"
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const SectionHeader = ({
  title,
  icon,
}: {
  title: string;
  icon?: ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F5F4] text-[#4EA8A1]">
      {icon}
    </span>
    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
      {title}
    </h3>
  </div>
);

function ChecklistSection<
  Path extends "legalVerification" | "surveyVerification"
>({
  title,
  controlArray,
  register,
  fieldPath,
}: {
  title: string;
  controlArray: UseFieldArrayReturn<FormValues, Path, "id">;
  register: UseFormRegister<FormValues>;
  fieldPath: Path;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader title={title} icon={<FiFilePlus />} />
      <div className="space-y-3">
        {controlArray.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[1fr_160px_auto]"
          >
            <LabeledInput
              label="Title"
              placeholder="Document"
              {...register(`${fieldPath}.${index}.title` as const)}
            />
            <LabeledSelect
              label="Status"
              options={checklistStatuses}
              {...register(`${fieldPath}.${index}.status` as const)}
            />
            <button
              type="button"
              onClick={() => controlArray.remove(index)}
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              <FiTrash2 />
            </button>
            <div className="md:col-span-3">
              <LabeledTextarea
                label="Note"
                rows={2}
                placeholder="Additional context"
                {...register(`${fieldPath}.${index}.note` as const)}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            controlArray.append({
              title: "",
              status: "pending",
              note: "",
            } as FieldArray<FormValues, Path>)
          }
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#4EA8A1] px-4 py-2 text-sm font-semibold text-[#4EA8A1] hover:bg-[#E8F5F4]"
        >
          <FiPlus /> Add item
        </button>
      </div>
    </section>
  );
}

function valueToString(value?: number | null): string {
  if (typeof value === "number" && !Number.isNaN(value))
    return value.toString();
  return "";
}

function toNumber(value?: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.toString().trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isNaN(num) ? undefined : num;
}

function fmtDate(value?: string | null): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function prettyPlan(plan?: string | null): string {
  switch (plan) {
    case "deepDive":
      return "Deep Dive";
    case "deeperDive":
      return "Deeper Dive";
    case "instant":
      return "Instant";
    case "free":
      return "Free";
    default:
      return plan || "Unknown";
  }
}

function deriveClientName(
  user?: Record<string, unknown> | null
): string | undefined {
  if (!user) return undefined;
  const first = typeof user.firstName === "string" ? user.firstName : "";
  const last = typeof user.lastName === "string" ? user.lastName : "";
  const company = typeof user.company === "string" ? user.company : "";
  const combined = `${first} ${last}`.trim();
  return combined || company || undefined;
}
