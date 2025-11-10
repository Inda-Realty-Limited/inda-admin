import {
  useAdminListing,
  useCreateListing,
  useUpdateListing,
  type CreateListingPayload,
} from "@/api";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiUpload,
  FiX,
} from "react-icons/fi";

interface CreateListingModalProps {
  listingId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type FormValues = {
  indaTag: string;
  listingPlatformUrl: string;
  size: string;
  amenities: string;
  propertyType: string;
  propertySubType: string;
  bedrooms: string;
  bathrooms: string;
  fullAddress: string;
  microlocation: string;
  buildYear: string;
  condition: string;
  currentOwnerSeller: string;
  sellerIndaTag: string;
  listingLink: string;
  purchasePrice: string;
  titleVerification: string;
  litigationCheck: string;
  surveyPlanVerification: string;
  zoningCompliance: string;
  developmentApprovalCheck: string;
  encumbrances: string;
  titleDocs?: FileList | null;
  legalDocs?: FileList | null;
  propertyImages?: FileList | null;
  amenityImages?: FileList | null;
};

type Step = 0 | 1 | 2;

const steps = [
  {
    id: 0,
    title: "Basic Info",
    description: "Enter property and Inda details",
  },
  {
    id: 1,
    title: "Verification",
    description: "Add legal and verification details",
  },
  {
    id: 2,
    title: "Uploads",
    description: "Attach images and finalize listing",
  },
];

const defaultValues: FormValues = {
  indaTag: "",
  listingPlatformUrl: "",
  size: "",
  amenities: "",
  propertyType: "",
  propertySubType: "",
  bedrooms: "",
  bathrooms: "",
  fullAddress: "",
  microlocation: "",
  buildYear: "",
  condition: "",
  currentOwnerSeller: "",
  sellerIndaTag: "",
  listingLink: "",
  purchasePrice: "",
  titleVerification: "",
  litigationCheck: "",
  surveyPlanVerification: "",
  zoningCompliance: "",
  developmentApprovalCheck: "",
  encumbrances: "",
  titleDocs: null,
  legalDocs: null,
  propertyImages: null,
  amenityImages: null,
};

export default function CreateListingModal({
  listingId,
  onClose,
  onSuccess,
}: CreateListingModalProps) {
  const isEditMode = !!listingId;
  const [step, setStep] = useState<Step>(0);

  // 🟩 New: Tab State
  const [activeTab, setActiveTab] = useState<
    "admin" | "auto" | "ai" | "reviews"
  >("admin");

  const { data: existingListing, isLoading } = useAdminListing(listingId);
  const methods = useForm<FormValues>({ mode: "onBlur", defaultValues });
  const { register, handleSubmit, trigger, reset, watch, formState } = methods;

  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing(listingId || "");
  const mutation = isEditMode ? updateMutation : createMutation;

  // ✅ Populate form once existing data is loaded
  useEffect(() => {
    if (existingListing && isEditMode && !isLoading) {
      reset({ ...defaultValues, ...existingListing });
    }
  }, [existingListing, isEditMode, isLoading, reset]);

  const goNext = async () => {
    const valid = await trigger();
    if (!valid) return;
    setStep((s) => (s < 2 ? ((s + 1) as Step) : s));
  };

  const goPrev = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s));

  const handleClose = () => {
    reset(defaultValues);
    setStep(0);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload = toPayload(values);
    try {
      await mutation.mutateAsync(payload);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("❌ Error creating/updating listing:", error);
      alert("Error while saving listing. Please try again.");
    }
  });

  // Image Previews
  const [propertyPreviews, setPropertyPreviews] = useState<string[]>([]);
  const [amenityPreviews, setAmenityPreviews] = useState<string[]>([]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "propertyImages" && value.propertyImages) {
        const urls = Array.from(value.propertyImages).map((f) =>
          URL.createObjectURL(f)
        );
        setPropertyPreviews(urls);
      }
      if (name === "amenityImages" && value.amenityImages) {
        const urls = Array.from(value.amenityImages).map((f) =>
          URL.createObjectURL(f)
        );
        setAmenityPreviews(urls);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#4EA8A1]/20 overflow-hidden">
        {/* 🟩 Header Section */}
        <header className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Property Listings Management
            </h2>
            <p className="text-sm text-gray-500">Last Updated: 8/8/2025</p>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-6 border-b border-gray-200">
            {[
              { id: "admin", label: "Admin Inputs" },
              { id: "auto", label: "Auto Calculated" },
              { id: "ai", label: "AI Summaries" },
              { id: "reviews", label: "Reviews" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#4EA8A1] text-[#4EA8A1]"
                    : "border-transparent text-gray-600 hover:text-[#4EA8A1]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* 🟩 Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === "admin" && (
            <FormProvider {...methods}>
              <form
                onSubmit={onSubmit}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                className="flex-1 overflow-y-auto px-2 pb-6 pt-4 space-y-6 custom-scrollbar"
              >
                <StepIndicator current={step} />

                {/* STEP 1 */}
                {step === 0 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    {[
                      "indaTag",
                      "listingPlatformUrl",
                      "size",
                      "amenities",
                      "propertyType",
                      "propertySubType",
                      "bedrooms",
                      "bathrooms",
                      "fullAddress",
                      "microlocation",
                      "buildYear",
                      "condition",
                      "currentOwnerSeller",
                    ].map((field) => (
                      <TextField
                        key={field}
                        label={field.replace(/([A-Z])/g, " $1")}
                        {...register(field as keyof FormValues)}
                      />
                    ))}
                  </div>
                )}

                {/* STEP 2 */}
                {step === 1 && (
                  <div className="grid gap-5 md:grid-cols-2">
                    {[
                      "sellerIndaTag",
                      "listingLink",
                      "purchasePrice",
                      "titleVerification",
                      "litigationCheck",
                      "surveyPlanVerification",
                      "zoningCompliance",
                      "developmentApprovalCheck",
                      "encumbrances",
                    ].map((field) => (
                      <TextField
                        key={field}
                        label={field.replace(/([A-Z])/g, " $1")}
                        {...register(field as keyof FormValues)}
                      />
                    ))}
                  </div>
                )}

                {/* STEP 3 */}
                {step === 2 && (
                  <div className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                      <UploadBox
                        label="Title Documents"
                        {...register("titleDocs")}
                        multiple
                      />
                      <UploadBox
                        label="Legal Documents"
                        {...register("legalDocs")}
                        multiple
                      />
                    </div>

                    <div>
                      <h3 className="text-[#4EA8A1] font-semibold mb-3">
                        Property Images
                      </h3>
                      <UploadBox
                        label="Property Images"
                        {...register("propertyImages")}
                        multiple
                      />
                      {propertyPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          {propertyPreviews.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              className="rounded-lg border object-cover h-28 w-full"
                              alt={`Property Preview ${i}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-[#4EA8A1] font-semibold mb-3">
                        Amenity Images
                      </h3>
                      <UploadBox
                        label="Amenity Images"
                        {...register("amenityImages")}
                        multiple
                      />
                      {amenityPreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 mt-3">
                          {amenityPreviews.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              className="rounded-lg border object-cover h-24 w-full"
                              alt={`Amenity Preview ${i}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FOOTER */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={goPrev}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <FiArrowLeft size={16} /> Back
                    </button>
                  )}
                  <div className="flex items-center gap-3 ml-auto">
                    {step < 2 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#4EA8A1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d8882]"
                      >
                        Continue <FiArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#4EA8A1] px-5 py-2 text-sm font-bold text-white hover:bg-[#3d8882] disabled:opacity-60"
                      >
                        {mutation.isPending ? "Saving..." : "Add Listing"}{" "}
                        <FiCheck size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </FormProvider>
          )}

          {/* ========== AUTO CALCULATED TAB ========== */}
          {activeTab === "auto" && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Financial Metrics
              </h3>

              {/* --- Top Section --- */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Fair Market Value (FMV)", placeholder: "$500,000" },
                  { label: "Financing Interest Rate (%)", placeholder: "4.5%" },
                  { label: "Financing Term (Years)", placeholder: "30" },
                  { label: "Holding Period", placeholder: "5 years" },
                  {
                    label: "Avg Rental Yield (%) – Long Term",
                    placeholder: "8.5%",
                  },
                  {
                    label: "Avg Rental Yield (%) – Short Term",
                    placeholder: "12%",
                  },
                  {
                    label: "Projected Annual Appreciation (Local)",
                    placeholder: "3%",
                  },
                  {
                    label:
                      "Projected Annual Appreciation (FX & Inflation Adjusted)",
                    placeholder: "2.8%",
                  },
                  { label: "Total Expense", placeholder: "$50,000" },
                  {
                    label: "Asset Value Change (Net) Last 6 Months",
                    placeholder: "+5%",
                  },
                ].map((field, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#4EA8A1] focus:ring-[#4EA8A1] p-2"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>

              {/* --- Bottom Section --- */}
              <div className="pt-8 border-t border-gray-200 grid grid-cols-2 gap-6 mt-8">
                {[
                  {
                    label: "Projected Total Profit – Long Term",
                    placeholder: "$120,000",
                  },
                  {
                    label: "Projected Total Profit – Short Term",
                    placeholder: "$30,000",
                  },
                  { label: "ROI – Long Term Rental", placeholder: "14%" },
                  { label: "ROI – Short Term Rental", placeholder: "20%" },
                  {
                    label: "Annual Rental Income – Long Term",
                    placeholder: "$40,000",
                  },
                  {
                    label: "Annual Rental Income – Short Term",
                    placeholder: "$55,000",
                  },
                ].map((field, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#4EA8A1] focus:ring-[#4EA8A1] p-2"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== AI SUMMARIES TAB ========== */}
          {activeTab === "ai" && (
            <div className="space-y-10">
              <h3 className="text-2xl font-bold text-gray-900">
                AI Summaries and Prompts
              </h3>

              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Executive Summary
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Concise analysis of investment potential and next steps
                  </p>
                  <textarea
                    rows={4}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 shadow-sm focus:border-[#4EA8A1] focus:ring-[#4EA8A1]"
                    placeholder=""
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Key Strengths
                  </h4>
                  <textarea
                    rows={3}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 shadow-sm focus:border-[#4EA8A1] focus:ring-[#4EA8A1]"
                    placeholder=""
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Risk Factors
                  </h4>
                  <textarea
                    rows={3}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 shadow-sm focus:border-[#4EA8A1] focus:ring-[#4EA8A1]"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Inda Score Progress Bar */}
              <div className="pt-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Inda Score
                  </span>
                  <span className="text-sm text-gray-600">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#4EA8A1] h-3 rounded-full transition-all duration-500"
                    style={{ width: "88%" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* ========== REVIEWS TAB (Updated UI) ========== */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <input
                  type="text"
                  placeholder="🔍 Search reviews"
                  className="w-full rounded-md border-0 bg-[#5DABA4] text-white placeholder-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]"
                />
              </div>

              {/* Quick Filters */}
              <div className="border border-gray-300 rounded-md p-4 bg-white">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Quick Filters
                </p>
                <div className="flex gap-6">
                  {["Client", "Rating", "Date"].map((filter) => (
                    <label
                      key={filter}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-[#4EA8A1]"
                      />
                      {filter}
                    </label>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-md border border-gray-300 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#5DABA4]">
                    <tr>
                      {[
                        "Reviewer",
                        "Client",
                        "Rating",
                        "Date",
                        "Review",
                        "Actions",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left font-semibold text-white"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      {
                        reviewer: "Sophia Clark",
                        client: "Landmark Properties",
                        rating: "5 stars",
                        date: "01/11/2025",
                        review:
                          "Smooth process from start to finish. Very professional.",
                      },
                      {
                        reviewer: "Ethan Miller",
                        client: "ABS Developments",
                        rating: "4 stars",
                        date: "08/11/2025",
                        review:
                          "Excellent service and quick responses. Great team!",
                      },
                      {
                        reviewer: "Olivia Davis",
                        client: "John Dunham and Co.",
                        rating: "3 stars",
                        date: "10/11/2025",
                        review:
                          "The service was okay, but communication could be better.",
                      },
                      {
                        reviewer: "Liam Wilson",
                        client: "Park D Limited Prop.",
                        rating: "2 stars",
                        date: "11/11/2025",
                        review:
                          "Sold my property faster than I expected. Amazing work!",
                      },
                      {
                        reviewer: "Ava Moore",
                        client: "Wayne Architectural Ltd.",
                        rating: "5 stars",
                        date: "12/11/2025",
                        review:
                          "Excellent service and quick responses. Great team!",
                      },
                      {
                        reviewer: "Noah Taylor",
                        client: "Peter Dewsbury and Co.",
                        rating: "1 star",
                        date: "14/11/2025",
                        review:
                          "Property wasn't as described. Very disappointing.",
                      },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-gray-800 font-medium">
                          {r.reviewer}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{r.client}</td>

                        {/* ✅ Combined Rating + Date Box */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* ⭐ Rating Box */}
                            <span
                              className={`rounded-md px-2 py-1 text-xs font-semibold text-gray-800 ${
                                r.rating.startsWith("5")
                                  ? "bg-[#90EE90]"
                                  : r.rating.startsWith("4")
                                  ? "bg-[#FFE87C]"
                                  : r.rating.startsWith("3")
                                  ? "bg-[#FFD580]"
                                  : r.rating.startsWith("2")
                                  ? "bg-[#FFB6C1]"
                                  : "bg-[#FFB6C1]"
                              }`}
                            >
                              {r.rating}
                            </span>

                            {/* 📅 Date Box */}
                            <span className="rounded-md px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                              {r.date || "—"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-gray-700">{r.review}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-xs">
                            <button className="text-[#5DABA4] font-semibold hover:underline">
                              View
                            </button>
                            <span className="text-gray-400">|</span>
                            <button className="text-[#5DABA4] font-semibold hover:underline">
                              Approve
                            </button>
                            <span className="text-gray-400">|</span>
                            <button className="text-[#5DABA4] font-semibold hover:underline">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------ HELPERS ------------------ */
function toPayload(values: FormValues): CreateListingPayload {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value && !(value instanceof FileList))
      formData.append(key, value as string);
  });

  const appendFiles = (files: FileList | null | undefined, key: string) => {
    if (!files) return;
    Array.from(files).forEach((file) => formData.append(key, file));
  };

  appendFiles(values.titleDocs, "titleDocs");
  appendFiles(values.legalDocs, "legalDocs");
  appendFiles(values.propertyImages, "propertyImages");
  appendFiles(values.amenityImages, "amenityImages");

  return formData;
}

function StepIndicator({ current }: { current: Step }) {
  return (
    <ol className="flex items-center justify-between gap-3">
      {steps.map((s, idx) => {
        const active = s.id === current;
        const done = s.id < current;
        return (
          <li key={s.id} className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold ${
                  done
                    ? "border-[#4EA8A1] bg-[#4EA8A1] text-white"
                    : active
                    ? "border-[#4EA8A1] text-[#4EA8A1]"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {done ? <FiCheck size={16} /> : idx + 1}
              </div>
              <div className="hidden md:block">
                <p className="text-xs uppercase font-semibold text-gray-500">
                  Step {idx + 1}
                </p>
                <p className="text-sm font-bold text-gray-800">{s.title}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const TextField = ({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block text-left">
    <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
      {label}
    </span>
    <input
      type="text"
      className="mt-1 w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 outline-none"
      {...props}
    />
  </label>
);

const UploadBox = ({
  label,
  multiple,
  ...props
}: {
  label: string;
  multiple?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label
    className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#4EA8A1] hover:bg-[#E8F5F4] px-6 py-8 text-center cursor-pointer"
    onClick={(e) => e.stopPropagation()}
  >
    <FiUpload className="text-[#4EA8A1]" size={24} />
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <input
      type="file"
      className="hidden"
      multiple={multiple}
      {...props}
      onClick={(e) => e.stopPropagation()}
    />
  </label>
);
