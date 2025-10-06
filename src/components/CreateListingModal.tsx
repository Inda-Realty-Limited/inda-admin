/* eslint-disable @next/next/no-img-element */
import { useCreateListing, type CreateListingPayload } from "@/api";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiMapPin,
  FiTrendingUp,
  FiUpload,
  FiX,
} from "react-icons/fi";

interface CreateListingModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type FormValues = {
  title: string;
  listingType: "sale" | "rent";
  listingStatus: string;
  propertyTypeStd: string;
  propertyRef: string;
  source: string;
  description: string;
  state: string;
  lga: string;
  microlocationStd: string;
  address: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sizeSqm?: number | null;
  priceNGN: number | null;
  listingUrl: string;
  coverImageFile: FileList | null;
  galleryFiles: FileList | null;
  agentName: string;
  agentPhone: string;
};

type Step = 0 | 1 | 2;

const steps: Array<{
  id: Step;
  title: string;
  description: string;
}> = [
  {
    id: 0,
    title: "Basic details",
    description: "Set the listing identity and publication status.",
  },
  {
    id: 1,
    title: "Location & specs",
    description: "Add geographic data and core property specs.",
  },
  {
    id: 2,
    title: "Pricing & media",
    description: "Confirm pricing, narrative copy, and imagery.",
  },
];

const stepFields: Record<Step, Array<keyof FormValues>> = {
  0: [
    "title",
    "listingType",
    "listingStatus",
    "propertyTypeStd",
    "propertyRef",
    "source",
    "description",
  ],
  1: [
    "state",
    "lga",
    "microlocationStd",
    "address",
    "bedrooms",
    "bathrooms",
    "sizeSqm",
  ],
  2: [
    "priceNGN",
    "listingUrl",
    "coverImageFile",
    "galleryFiles",
    "agentName",
    "agentPhone",
  ],
};

const defaultValues: FormValues = {
  title: "",
  listingType: "sale",
  listingStatus: "active",
  propertyTypeStd: "",
  propertyRef: "",
  source: "admin",
  description: "",
  state: "",
  lga: "",
  microlocationStd: "",
  address: "",
  bedrooms: null,
  bathrooms: null,
  sizeSqm: null,
  priceNGN: null,
  listingUrl: "",
  coverImageFile: null,
  galleryFiles: null,
  agentName: "",
  agentPhone: "",
};

export default function CreateListingModal({
  onClose,
  onSuccess,
}: CreateListingModalProps) {
  const [step, setStep] = useState<Step>(0);
  const methods = useForm<FormValues>({
    mode: "onBlur",
    defaultValues,
  });
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    reset,
  } = methods;

  const mutation = useCreateListing();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputId = useId();
  const galleryInputId = useId();

  const coverFileList = methods.watch("coverImageFile");
  const galleryFileList = methods.watch("galleryFiles");

  useEffect(() => {
    if (coverFileList && coverFileList.length > 0) {
      const file = coverFileList[0];
      const url = URL.createObjectURL(file);
      setCoverPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      return () => {
        URL.revokeObjectURL(url);
      };
    }

    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [coverFileList]);

  useEffect(() => {
    if (galleryFileList && galleryFileList.length > 0) {
      const urls = Array.from(galleryFileList).map((file) =>
        URL.createObjectURL(file)
      );
      setGalleryPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return urls;
      });
      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    }

    setGalleryPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
  }, [galleryFileList]);

  const coverImageErrorMessage = errors.coverImageFile?.message
    ? String(errors.coverImageFile.message)
    : undefined;
  const galleryErrorMessage = errors.galleryFiles?.message
    ? String(errors.galleryFiles.message)
    : undefined;

  const coverImageRegister = register("coverImageFile", {
    required: "Cover image is required",
    validate: {
      isImage: (files: FileList | null) => {
        if (!files || files.length === 0) return true;
        return files[0].type.startsWith("image/") || "File must be an image";
      },
      maxSize: (files: FileList | null) => {
        if (!files || files.length === 0) return true;
        return files[0].size <= 5 * 1024 * 1024 || "Max file size is 5MB";
      },
    },
  });

  const galleryRegister = register("galleryFiles", {
    required: "Add at least one gallery image",
    validate: {
      isImage: (files: FileList | null) => {
        if (!files || files.length === 0) return true;
        return Array.from(files).every((file) => file.type.startsWith("image/"))
          ? true
          : "All files must be images";
      },
      maxSize: (files: FileList | null) => {
        if (!files || files.length === 0) return true;
        return Array.from(files).every((file) => file.size <= 5 * 1024 * 1024)
          ? true
          : "Each file must be 5MB or less";
      },
      maxCount: (files: FileList | null) => {
        if (!files) return true;
        return files.length <= 10 || "Upload up to 10 images";
      },
    },
  });

  const handleClose = () => {
    reset(defaultValues);
    setStep(0);
    setUploadError(null);
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setGalleryPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
    onClose();
  };

  const goNext = async () => {
    const fields = stepFields[step];
    const valid = await trigger(fields as (keyof FormValues)[]);
    if (!valid) return;
    setStep((prev): Step => {
      switch (prev) {
        case 0:
          return 1;
        case 1:
          return 2;
        default:
          return 2;
      }
    });
  };

  const goPrev = () => {
    setStep((prev): Step => {
      switch (prev) {
        case 2:
          return 1;
        case 1:
          return 0;
        default:
          return 0;
      }
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    setUploadError(null);
    try {
      const payload = toPayload(values);
      await mutation.mutateAsync(payload);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Create listing error:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to create listing. Please try again."
      );
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-[#4EA8A1]/20 overflow-hidden">
        <header className="flex items-start justify-between gap-4 border-b border-[#4EA8A1]/20 bg-gradient-to-r from-[#E8F5F4] to-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add a manual listing
            </h2>
            <p className="text-sm text-gray-600">
              Step {step + 1} of 3 — {steps[step].description}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#4EA8A1] hover:text-[#3d8882] transition-colors"
            aria-label="Close"
            type="button"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="px-6 pt-6">
          <StepIndicator current={step} />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="px-6 pb-6 pt-4 space-y-6">
            {step === 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Listing title"
                  placeholder="Spacious 4-bedroom duplex"
                  error={errors.title?.message}
                  required
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 5,
                      message: "Title should be at least 5 characters",
                    },
                  })}
                />
                <SelectField
                  label="Listing type"
                  options={[
                    { label: "For Sale", value: "sale" },
                    { label: "For Rent", value: "rent" },
                  ]}
                  error={errors.listingType?.message}
                  required
                  {...register("listingType", {
                    required: "Choose sale or rent",
                  })}
                />
                <SelectField
                  label="Listing status"
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Sold", value: "sold" },
                    { label: "Draft", value: "draft" },
                  ]}
                  error={errors.listingStatus?.message}
                  required
                  {...register("listingStatus", {
                    required: "Status is required",
                  })}
                />
                <TextField
                  label="Standard property type"
                  placeholder="Detached duplex"
                  error={errors.propertyTypeStd?.message}
                  required
                  {...register("propertyTypeStd", {
                    required: "Property type is required",
                  })}
                />
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                    Reference ID
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`${baseFieldClasses} ${
                        errors.propertyRef ? errorClasses : ""
                      }`}
                      placeholder="NPC-12345"
                      {...register("propertyRef", {
                        required: "Provide a unique reference",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const id = `INDA-ADMIN-${crypto.randomUUID()}`;
                        methods.setValue("propertyRef", id, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                      className="whitespace-nowrap px-3 py-2 text-sm font-semibold rounded-lg border border-[#4EA8A1] text-[#4EA8A1] hover:bg-[#4EA8A1] hover:text-white transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.propertyRef?.message && (
                    <p className="text-xs font-semibold text-red-600">
                      {errors.propertyRef.message}
                    </p>
                  )}
                </div>
                <TextField
                  label="Source"
                  placeholder="admin"
                  error={errors.source?.message}
                  required
                  {...register("source", {
                    required: "Source is required",
                  })}
                />
                <div className="md:col-span-2">
                  <TextareaField
                    label="Short description"
                    placeholder="Highlight the most compelling selling points."
                    rows={4}
                    error={errors.description?.message}
                    required
                    {...register("description", {
                      required: "Description is required",
                      minLength: {
                        value: 20,
                        message: "Add at least 20 characters",
                      },
                    })}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="State"
                  placeholder="Lagos"
                  error={errors.state?.message}
                  required
                  {...register("state", {
                    required: "State is required",
                  })}
                />
                <TextField
                  label="Local Government Area"
                  placeholder="Lekki"
                  error={errors.lga?.message}
                  required
                  {...register("lga", {
                    required: "LGA is required",
                  })}
                />
                <TextField
                  label="Microlocation"
                  placeholder="Lekki Phase 1"
                  error={errors.microlocationStd?.message}
                  required
                  {...register("microlocationStd", {
                    required: "Microlocation is required",
                  })}
                />
                <TextField
                  label="Street address"
                  placeholder="12 Admiralty Way"
                  error={errors.address?.message}
                  required
                  {...register("address", {
                    required: "Address is required",
                  })}
                />
                <NumberField
                  label="Bedrooms"
                  placeholder="4"
                  error={errors.bedrooms?.message}
                  {...register("bedrooms", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Bedrooms cannot be negative" },
                  })}
                />
                <NumberField
                  label="Bathrooms"
                  placeholder="3"
                  error={errors.bathrooms?.message}
                  {...register("bathrooms", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Bathrooms cannot be negative" },
                  })}
                />
                <NumberField
                  label="Size (sqm)"
                  placeholder="250"
                  error={errors.sizeSqm?.message}
                  {...register("sizeSqm", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Size cannot be negative" },
                  })}
                />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5 md:grid-cols-2">
                <NumberField
                  label="Listing price (NGN)"
                  placeholder="120000000"
                  error={errors.priceNGN?.message}
                  required
                  {...register("priceNGN", {
                    required: "Price is required",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Price must be 0 or more",
                    },
                  })}
                />
                <TextField
                  label="Listing URL"
                  placeholder="https://..."
                  error={errors.listingUrl?.message}
                  {...register("listingUrl")}
                />

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Cover image <span className="text-red-500">*</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      JPG or PNG, max 5MB
                    </span>
                  </div>
                  <label
                    htmlFor={coverInputId}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer ${
                      coverImageErrorMessage
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-gray-50 hover:border-[#4EA8A1] hover:bg-[#E8F5F4]"
                    }`}
                  >
                    <FiUpload
                      size={24}
                      className={
                        coverImageErrorMessage
                          ? "text-red-400"
                          : "text-[#4EA8A1]"
                      }
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Click to upload cover image
                    </span>
                    <span className="text-xs text-gray-500">
                      or drag and drop
                    </span>
                    <input
                      id={coverInputId}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...coverImageRegister}
                      ref={(node) => {
                        coverImageRegister.ref(node);
                        coverInputRef.current = node;
                      }}
                    />
                  </label>
                  {coverImageErrorMessage && (
                    <p className="text-xs font-semibold text-red-600">
                      {coverImageErrorMessage}
                    </p>
                  )}
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-48 w-full rounded-lg border border-gray-200 object-cover"
                    />
                  )}
                </div>

                <TextField
                  label="Agent name"
                  placeholder="Jane Doe"
                  error={errors.agentName?.message}
                  required
                  {...register("agentName", {
                    required: "Agent name is required",
                  })}
                />
                <TextField
                  label="Agent phone"
                  placeholder="0803 000 0000"
                  error={errors.agentPhone?.message}
                  required
                  {...register("agentPhone", {
                    required: "Agent contact is required",
                  })}
                />

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Gallery images <span className="text-red-500">*</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Upload up to 10 images (JPG or PNG, max 5MB each)
                    </span>
                  </div>
                  <label
                    htmlFor={galleryInputId}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer ${
                      galleryErrorMessage
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-gray-50 hover:border-[#4EA8A1] hover:bg-[#E8F5F4]"
                    }`}
                  >
                    <FiUpload
                      size={24}
                      className={
                        galleryErrorMessage ? "text-red-400" : "text-[#4EA8A1]"
                      }
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Click to upload gallery images
                    </span>
                    <span className="text-xs text-gray-500">
                      or drag and drop
                    </span>
                    <input
                      id={galleryInputId}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      {...galleryRegister}
                      ref={(node) => {
                        galleryRegister.ref(node);
                        galleryInputRef.current = node;
                      }}
                    />
                  </label>
                  {galleryErrorMessage && (
                    <p className="text-xs font-semibold text-red-600">
                      {galleryErrorMessage}
                    </p>
                  )}
                  {galleryPreviews.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {galleryPreviews.map((preview, idx) => (
                        <div
                          key={`${preview}-${idx}`}
                          className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                        >
                          <img
                            src={preview}
                            alt={`Gallery preview ${idx + 1}`}
                            className="h-32 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {uploadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {uploadError}
              </div>
            )}

            {mutation.isError && !uploadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to create listing. Please review the details and try
                again.
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500">
                {step === 0 && (
                  <span className="inline-flex items-center gap-1">
                    <FiTrendingUp className="text-[#4EA8A1]" size={14} />
                    Start with the essentials
                  </span>
                )}
                {step === 1 && (
                  <span className="inline-flex items-center gap-1">
                    <FiMapPin className="text-[#4EA8A1]" size={14} />
                    Capture precise location data
                  </span>
                )}
                {step === 2 && (
                  <span className="inline-flex items-center gap-1">
                    <FiCheck className="text-[#4EA8A1]" size={14} />
                    Final review before publishing
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiArrowLeft size={16} />
                    Back
                  </button>
                )}

                {step < 2 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#4EA8A1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d8882] transition-colors"
                  >
                    Continue
                    <FiArrowRight size={16} />
                  </button>
                )}

                {step === 2 && (
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#4EA8A1] px-5 py-2 text-sm font-bold text-white hover:bg-[#3d8882] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {mutation.isPending ? "Saving..." : "Create listing"}
                    {!mutation.isPending && <FiCheck size={16} />}
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

function toPayload(values: FormValues): CreateListingPayload {
  const coverFile = values.coverImageFile?.item(0) ?? null;
  if (!coverFile) {
    throw new Error("Cover image is required before publishing.");
  }

  const galleryList = values.galleryFiles;
  const galleryFiles = galleryList ? Array.from(galleryList) : [];
  if (galleryFiles.length === 0) {
    throw new Error("Please add at least one gallery image before publishing.");
  }

  const formData = new FormData();
  formData.append("title", values.title);
  formData.append("propertyTypeStd", values.propertyTypeStd);
  formData.append("listingStatus", values.listingStatus);
  formData.append("listingType", values.listingType);
  formData.append("propertyRef", values.propertyRef);
  formData.append("source", values.source);
  formData.append("description", values.description);
  formData.append("state", values.state);
  formData.append("lga", values.lga);
  formData.append("microlocationStd", values.microlocationStd);
  formData.append("address", values.address);

  if (typeof values.bedrooms === "number" && !Number.isNaN(values.bedrooms)) {
    formData.append("bedrooms", String(values.bedrooms));
  }
  if (typeof values.bathrooms === "number" && !Number.isNaN(values.bathrooms)) {
    formData.append("bathrooms", String(values.bathrooms));
  }
  if (typeof values.sizeSqm === "number" && !Number.isNaN(values.sizeSqm)) {
    formData.append("sizeSqm", String(values.sizeSqm));
  }
  if (typeof values.priceNGN === "number" && !Number.isNaN(values.priceNGN)) {
    formData.append("priceNGN", String(values.priceNGN));
  }
  if (values.listingUrl) {
    formData.append("listingUrl", values.listingUrl);
  }

  formData.append("coverImage", coverFile, coverFile.name);
  galleryFiles.forEach((file) => {
    formData.append("gallery", file, file.name);
  });

  const agentPayload = {
    name: values.agentName,
    phone: values.agentPhone,
  };
  formData.append("agent", JSON.stringify(agentPayload));

  return formData;
}

function StepIndicator({ current }: { current: Step }) {
  return (
    <ol className="flex items-center justify-between gap-3">
      {steps.map((step, idx) => {
        const isActive = current === step.id;
        const isCompleted = current > step.id;
        return (
          <li key={step.id} className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                  isCompleted
                    ? "border-[#4EA8A1] bg-[#4EA8A1] text-white"
                    : isActive
                    ? "border-[#4EA8A1] text-[#4EA8A1]"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? <FiCheck size={16} /> : idx + 1}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Step {idx + 1}
                </p>
                <p className="text-sm font-bold text-gray-800">{step.title}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: Array<{ label: string; value: string }>;
};

const baseFieldClasses =
  "mt-1 w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-[#4EA8A1] focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20 transition-colors";

const errorClasses = "border-red-300 focus:border-red-400 focus:ring-red-200";

const labelClasses =
  "text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between";

const errorTextClasses = "mt-1 text-xs font-semibold text-red-600";

const FieldWrapper = ({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <label className="block text-left">
    <span className={labelClasses}>
      {label}
      {required ? <span className="text-red-500">*</span> : null}
    </span>
    {children}
    {error && <p className={errorTextClasses}>{error}</p>}
  </label>
);

const TextField = ({
  label,
  error,
  className,
  required,
  ...props
}: FieldProps & { required?: boolean }) => (
  <FieldWrapper label={label} error={error} required={required}>
    <input
      type="text"
      className={`${baseFieldClasses} ${error ? errorClasses : ""} ${
        className || ""
      }`}
      {...props}
    />
  </FieldWrapper>
);

const NumberField = ({
  label,
  error,
  className,
  required,
  ...props
}: FieldProps & { required?: boolean }) => (
  <FieldWrapper label={label} error={error} required={required}>
    <input
      type="number"
      className={`${baseFieldClasses} ${error ? errorClasses : ""} ${
        className || ""
      }`}
      {...props}
    />
  </FieldWrapper>
);

const TextareaField = ({
  label,
  error,
  className,
  rows = 3,
  required,
  ...props
}: TextareaProps & { required?: boolean }) => (
  <FieldWrapper label={label} error={error} required={required}>
    <textarea
      rows={rows}
      className={`${baseFieldClasses} ${error ? errorClasses : ""} ${
        className || ""
      } resize-none`}
      {...props}
    />
  </FieldWrapper>
);

const SelectField = ({
  label,
  error,
  className,
  options,
  required,
  ...props
}: SelectProps & { required?: boolean }) => (
  <FieldWrapper label={label} error={error} required={required}>
    <select
      className={`${baseFieldClasses} ${error ? errorClasses : ""} ${
        className || ""
      }`}
      {...props}
    >
      <option value="" disabled hidden>
        Select an option
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FieldWrapper>
);
