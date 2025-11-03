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
  { id: 0, title: "Basic Info", description: "Enter property and Inda details" },
  { id: 1, title: "Verification", description: "Add legal and verification details" },
  { id: 2, title: "Uploads", description: "Attach images and finalize listing" },
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

  const { data: existingListing, isLoading } = useAdminListing(listingId);
  const methods = useForm<FormValues>({ mode: "onBlur", defaultValues });
  const { register, handleSubmit, trigger, reset, watch, formState } = methods;

  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing(listingId || "");
  const mutation = isEditMode ? updateMutation : createMutation;

  // ✅ Populate form once existing data is loaded
  useEffect(() => {
    if (existingListing && isEditMode && !isLoading) {
      console.log("Populating form with existing listing:", existingListing);
      reset({ ...defaultValues, ...existingListing });
    }
  }, [existingListing, isEditMode, isLoading, reset]);

  const goNext = async () => {
    const valid = await trigger();
    if (!valid) return;
    setStep((s) => (s < 2 ? (s + 1) as Step : s));
  };

  const goPrev = () => setStep((s) => (s > 0 ? (s - 1) as Step : s));

  const handleClose = () => {
    reset(defaultValues);
    setStep(0);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload = toPayload(values);
    console.log("Submitting listing payload...");

    try {
      await mutation.mutateAsync(payload);
      console.log("✅ Listing saved successfully");
      onSuccess?.();
      handleClose(); // only closes on success
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
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
      }
      if (name === "amenityImages" && value.amenityImages) {
        const urls = Array.from(value.amenityImages).map((f) =>
          URL.createObjectURL(f)
        );
        setAmenityPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#4EA8A1]/20 overflow-hidden">
        {/* HEADER */}
        <header className="flex-shrink-0 flex items-start justify-between gap-4 border-b border-[#4EA8A1]/20 bg-gradient-to-r from-[#E8F5F4] to-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Edit Inda Listing" : "Add Inda Listing"}
            </h2>
            <p className="text-sm text-gray-600">
              Step {step + 1} of 3 — {steps[step].description}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#4EA8A1] hover:text-[#3d8882]"
            type="button"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="flex-shrink-0 px-6 pt-6">
          <StepIndicator current={step} />
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={onSubmit}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6 custom-scrollbar"
          >
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
                  <UploadBox label="Title Documents" {...register("titleDocs")} multiple />
                  <UploadBox label="Legal Documents" {...register("legalDocs")} multiple />
                </div>

                <div>
                  <h3 className="text-[#4EA8A1] font-semibold mb-3">Property Images</h3>
                  <UploadBox label="Property Images" {...register("propertyImages")} multiple />
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
                  <h3 className="text-[#4EA8A1] font-semibold mb-3">Amenity Images</h3>
                  <UploadBox label="Amenity Images" {...register("amenityImages")} multiple />
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
                    {mutation.isPending ? "Saving..." : "Add Listing"} <FiCheck size={16} />
                  </button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

/* ------------------ HELPERS ------------------ */
function toPayload(values: FormValues): CreateListingPayload {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value && !(value instanceof FileList)) {
      formData.append(key, value as string);
    }
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
    onClick={(e) => e.stopPropagation()} // 🧠 prevent bubbling that closes modal
  >
    <FiUpload className="text-[#4EA8A1]" size={24} />
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <input
      type="file"
      className="hidden"
      multiple={multiple}
      {...props}
      onClick={(e) => e.stopPropagation()} // ✅ double protection
    />
  </label>
);

