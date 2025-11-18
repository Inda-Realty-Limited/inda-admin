import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiUpload,
  FiChevronDown,
  FiX,
  FiFile,
} from "react-icons/fi";

// Actual API hook
const useAdminListing = (id?: string) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`https://pcphc7xyrz.us-east-1.awsapprunner.com/admin/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch listing: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result.data || result);
      } catch (error) {
        console.error("Error fetching listing:", error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return { data, isLoading };
};

// Generate MongoDB-like ObjectId
const generateMongoId = () =>
  Math.random().toString(16).substring(2, 10) +
  Math.random().toString(16).substring(2, 10) +
  Date.now().toString(16).substring(0, 6);

interface CreateListingModalProps {
  listingId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type FormValues = {
  indaTag: string;
  listingPlatformUrl: string;
  title: string;
  size: string;
  amenities: string;
  propertyType: string[];
  propertySubType: string[];
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
};

type UploadedFile = {
  file: File;
  preview: string;
  uploaded: boolean;
  url?: string;
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

const propertyTypeOptions = [
  "Residential",
  "Commercial",
  "Industrial",
  "Land",
  "Agricultural",
  "Mixed-Use",
  "Special Purpose (e.g., schools, hospitals, worship centres)",
];

const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const bathroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const propertySubTypeOptions = [
  "Apartment / Flat",
  "Bungalow",
  "Duplex",
  "Terrace / Townhouse",
  "Penthouse",
  "Detached House",
  "Semi-Detached House",
  "Studio Apartment",
  "Mini Flat (1-bedroom)",
  "Mansion / Villa",
  "Shared Apartment",
  "Office Space",
  "Shop / Retail Space",
  "Warehouse",
  "Hotel / Lodge",
  "Restaurant / Bar",
  "Event Center",
  "Co-working Space",
  "Mall / Plaza",
  "Bank Building",
  "Filling Station",
  "Factory",
  "Workshop",
  "Storage Facility",
  "Distribution Center",
  "Industrial Complex",
  "Residential Land",
  "Commercial Land",
  "Industrial Land",
  "Mixed-Use Land",
  "Agricultural Land",
  "Recreational Land",
  "Estate Land / Layout",
  "Farm Land",
  "Ranch",
  "Fish Pond",
  "Orchard",
  "Plantation",
  "Residential + Commercial Building",
  "Office + Retail",
  "Apartment + Shop Front",
  "School / Educational Facility",
  "Hospital / Clinic",
  "Religious Building (Church, Mosque)",
  "Government Facility",
  "Hotel / Resort Property",
  "Sports Complex",
];

const defaultValues: FormValues = {
  title: "",
  indaTag: "",
  listingPlatformUrl: "",
  size: "",
  amenities: "",
  propertyType: [],
  propertySubType: [],
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
};

export default function CreateListingModal({
  listingId,
  onClose,
  onSuccess,
}: CreateListingModalProps) {
  const isEditMode = !!listingId;
  const [step, setStep] = useState<Step>(0);
  const [activeTab, setActiveTab] = useState<"admin" | "auto" | "ai" | "reviews">("admin");
  const [formData, setFormData] = useState<FormValues>(defaultValues);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [propertySubTypeDropdownOpen, setPropertySubTypeDropdownOpen] = useState(false);
  const [bedroomDropdownOpen, setBedroomDropdownOpen] = useState(false);
  const [bathroomDropdownOpen, setBathroomDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload states
  const [titleDocs, setTitleDocs] = useState<UploadedFile[]>([]);
  const [legalDocs, setLegalDocs] = useState<UploadedFile[]>([]);
  const [propertyImages, setPropertyImages] = useState<UploadedFile[]>([]);
  const [amenityImages, setAmenityImages] = useState<UploadedFile[]>([]);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    client: false,
    rating: false,
    date: false,
  });

  const { data: existingListing, isLoading } = useAdminListing(listingId);

  // ✅ PREFILL FORM DATA IN EDIT MODE
  useEffect(() => {
    if (existingListing && isEditMode && !isLoading) {
      console.log("📝 Prefilling form with existing listing:", existingListing);
      
      // Handle arrays properly - convert comma-separated strings to arrays if needed
      const propertyTypeArray = Array.isArray(existingListing.propertyType)
        ? existingListing.propertyType
        : typeof existingListing.propertyType === "string"
        ? existingListing.propertyType.split(",").map((s: string) => s.trim())
        : [];

      const propertySubTypeArray = Array.isArray(existingListing.propertySubType)
        ? existingListing.propertySubType
        : typeof existingListing.propertySubType === "string"
        ? existingListing.propertySubType.split(",").map((s: string) => s.trim())
        : [];

      setFormData({
        indaTag: existingListing.indaTag || "",
        listingPlatformUrl: existingListing.listingPlatformUrl || "",
        title: existingListing.title || "",
        size: existingListing.size || "",
        amenities: existingListing.amenities || "",
        propertyType: propertyTypeArray,
        propertySubType: propertySubTypeArray,
        bedrooms: existingListing.bedrooms || "",
        bathrooms: existingListing.bathrooms || "",
        fullAddress: existingListing.fullAddress || "",
        microlocation: existingListing.microlocation || "",
        buildYear: existingListing.buildYear || "",
        condition: existingListing.condition || "",
        currentOwnerSeller: existingListing.currentOwnerSeller || "",
        sellerIndaTag: existingListing.sellerIndaTag || "",
        listingLink: existingListing.listingLink || "",
        purchasePrice: existingListing.purchasePrice || "",
        titleVerification: existingListing.titleVerification || "",
        litigationCheck: existingListing.litigationCheck || "",
        surveyPlanVerification: existingListing.surveyPlanVerification || "",
        zoningCompliance: existingListing.zoningCompliance || "",
        developmentApprovalCheck: existingListing.developmentApprovalCheck || "",
        encumbrances: existingListing.encumbrances || "",
      });
    }
  }, [existingListing, isEditMode, isLoading]);

  // Auto-generate indaTag when modal opens and NOT in edit mode
  useEffect(() => {
    if (!isEditMode) {
      setFormData((prev) => ({
        ...prev,
        indaTag: generateMongoId(),
      }));
    }
  }, [isEditMode]);

  // Fetch reviews when the Reviews tab is active
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, currentPage]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const token = localStorage.getItem("admin_token");
      const url = `https://pcphc7xyrz.us-east-1.awsapprunner.com/admin/reviews?page=${currentPage}&limit=50&status=all&sortBy=recent`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "OK" && data.data) {
        setReviews(data.data.reviews || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalResults(data.data.pagination?.totalResults || 0);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviewsError(
        error instanceof Error ? error.message : "Failed to load reviews"
      );
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePropertyType = (type: string) => {
    setFormData((prev) => {
      const current = prev.propertyType;
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, propertyType: updated };
    });
  };

  const togglePropertySubType = (subType: string) => {
    setFormData((prev) => {
      const current = prev.propertySubType;
      const updated = current.includes(subType)
        ? current.filter((t) => t !== subType)
        : [...current, subType];
      return { ...prev, propertySubType: updated };
    });
  };

  const handleFileSelect = (
    files: FileList | null,
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
    }));

    setter((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) => {
    setter((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const goNext = () => {
    setStep((s) => (s < 2 ? ((s + 1) as Step) : s));
  };

  const goPrev = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s));

  const handleClose = () => {
    // Clean up file previews
    [...titleDocs, ...legalDocs, ...propertyImages, ...amenityImages].forEach(
      (f) => {
        URL.revokeObjectURL(f.preview);
      }
    );

    setFormData(defaultValues);
    setTitleDocs([]);
    setLegalDocs([]);
    setPropertyImages([]);
    setAmenityImages([]);
    setStep(0);
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append basic form data
      formDataToSend.append("indaTag", formData.indaTag);
      formDataToSend.append("listingPlatformUrl", formData.listingPlatformUrl);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("size", formData.size);
      formDataToSend.append("amenities", formData.amenities);
      formDataToSend.append("propertyType", formData.propertyType.join(","));
      formDataToSend.append("propertySubType", formData.propertySubType.join(","));
      formDataToSend.append("bedrooms", formData.bedrooms);
      formDataToSend.append("bathrooms", formData.bathrooms);
      formDataToSend.append("fullAddress", formData.fullAddress);
      formDataToSend.append("microlocation", formData.microlocation);
      formDataToSend.append("buildYear", formData.buildYear);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("currentOwnerSeller", formData.currentOwnerSeller);
      formDataToSend.append("sellerIndaTag", formData.sellerIndaTag);
      formDataToSend.append("listingLink", formData.listingLink);
      formDataToSend.append("purchasePrice", formData.purchasePrice);
      formDataToSend.append("titleVerification", formData.titleVerification);
      formDataToSend.append("litigationCheck", formData.litigationCheck);
      formDataToSend.append("surveyPlanVerification", formData.surveyPlanVerification);
      formDataToSend.append("zoningCompliance", formData.zoningCompliance);
      formDataToSend.append("developmentApprovalCheck", formData.developmentApprovalCheck);
      formDataToSend.append("encumbrances", formData.encumbrances);

      // Append files
      titleDocs.forEach((doc) => {
        formDataToSend.append("titleDocs", doc.file);
      });

      legalDocs.forEach((doc) => {
        formDataToSend.append("legalDocs", doc.file);
      });

      propertyImages.forEach((img) => {
        formDataToSend.append("propertyImages", img.file);
      });

      amenityImages.forEach((img) => {
        formDataToSend.append("amenityImages", img.file);
      });

      const token = localStorage.getItem("admin_token");
      
      // ✅ Use PUT for edit mode, POST for create mode
      const url = isEditMode
        ? `https://pcphc7xyrz.us-east-1.awsapprunner.com/admin/listings/${listingId}`
        : "https://pcphc7xyrz.us-east-1.awsapprunner.com/admin/listings";
      
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        alert(`✅ Listing ${isEditMode ? "updated" : "created"} successfully!`);
        onSuccess?.();
        handleClose();
      } else {
        throw new Error(result.message || `Failed to ${isEditMode ? "update" : "create"} listing`);
      }
    } catch (error) {
      console.error(`❌ Error ${isEditMode ? "updating" : "creating"} listing:`, error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : `Failed to ${isEditMode ? "update" : "create"} listing`
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewAction = async (
    reviewId: string,
    action: "approve" | "reject"
  ) => {
    try {
      console.log(`${action} review:`, reviewId);
      fetchReviews();
    } catch (error) {
      console.error(`Error ${action}ing review:`, error);
      alert(`Failed to ${action} review. Please try again.`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-[#90EE90]";
    if (rating >= 3.5) return "bg-[#FFE87C]";
    if (rating >= 2.5) return "bg-[#FFD580]";
    return "bg-[#FFB6C1]";
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return `${"⭐".repeat(fullStars)} (${rating.toFixed(1)})`;
  };

  // Show loading state while fetching existing listing in edit mode
  if (isEditMode && isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4EA8A1] border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading listing data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#4EA8A1]/20 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Edit Listing" : "Create New Listing"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
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

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === "admin" && (
            <div className="space-y-6">
              <StepIndicator current={step} />

              {/* STEP 1 */}
              {step === 0 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    label="Inda Tag"
                    value={formData.indaTag}
                    readOnly
                  />

                  <TextField
                    label="Listing Platform Url"
                    value={formData.listingPlatformUrl}
                    onChange={(e) =>
                      handleInputChange("listingPlatformUrl", e.target.value)
                    }
                  />
                  <TextField
                    label="Size"
                    value={formData.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                  />
                  <TextField
                    label="Amenities"
                    value={formData.amenities}
                    onChange={(e) =>
                      handleInputChange("amenities", e.target.value)
                    }
                  />

                  {/* Property Type Dropdown */}
                  <div className="relative">
                    <label className="block text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Property Type
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPropertyDropdownOpen(!propertyDropdownOpen)
                        }
                        className="mt-1 w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-left flex items-center justify-between focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 outline-none bg-white"
                      >
                        <span
                          className={
                            formData.propertyType.length === 0
                              ? "text-gray-400"
                              : "text-gray-900"
                          }
                        >
                          {formData.propertyType.length === 0
                            ? "Select what applies"
                            : `${formData.propertyType.length} selected`}
                        </span>
                        <FiChevronDown
                          className={`transition-transform ${
                            propertyDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </label>

                    {propertyDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-lg border-2 border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                        <div className="p-4 space-y-3">
                          {propertyTypeOptions.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                            >
                              <input
                                type="checkbox"
                                checked={formData.propertyType.includes(option)}
                                onChange={() => togglePropertyType(option)}
                                className="w-4 h-4 rounded border-gray-300 text-[#4EA8A1] focus:ring-[#4EA8A1]"
                              />
                              <span className="text-sm text-gray-700">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Property Sub-Type Dropdown */}
                  <div className="relative">
                    <label className="block text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Property Sub-Types
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPropertySubTypeDropdownOpen(
                            !propertySubTypeDropdownOpen
                          )
                        }
                        className="mt-1 w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-left flex items-center justify-between focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 outline-none bg-white"
                      >
                        <span
                          className={
                            formData.propertySubType.length === 0
                              ? "text-gray-400"
                              : "text-gray-900"
                          }
                        >
                          {formData.propertySubType.length === 0
                            ? "Select what applies"
                            : `${formData.propertySubType.length} selected`}
                        </span>
                        <FiChevronDown
                          className={`transition-transform ${
                            propertySubTypeDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </label>

                    {propertySubTypeDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-lg border-2 border-gray-200 bg-white shadow-lg max-h-80 overflow-y-auto">
                        <div className="p-4 space-y-3">
                          {propertySubTypeOptions.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                            >
                              <input
                                type="checkbox"
                                checked={formData.propertySubType.includes(
                                  option
                                )}
                                onChange={() => togglePropertySubType(option)}
                                className="w-4 h-4 rounded border-gray-300 text-[#4EA8A1] focus:ring-[#4EA8A1]"
                              />
                              <span className="text-sm text-gray-700">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bedrooms Dropdown */}
                  <div className="relative">
                    <label className="block text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Bedrooms
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setBedroomDropdownOpen(!bedroomDropdownOpen)
                        }
                        className="mt-1 w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-left flex items-center justify-between focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 outline-none bg-white"
                      >
                        <span
                          className={
                            formData.bedrooms
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          {formData.bedrooms || "Select No of Bedrooms"}
                        </span>
                        <FiChevronDown
                          className={`transition-transform ${
                            bedroomDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </label>

                    {bedroomDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-lg border-2 border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                        <div className="p-4 space-y-2">
                          {bedroomOptions.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                            >
                              <input
                                type="checkbox"
                                checked={formData.bedrooms === option}
                                onChange={() => {
                                  handleInputChange("bedrooms", option);
                                  setBedroomDropdownOpen(false);
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-[#4EA8A1] focus:ring-[#4EA8A1]"
                              />
                              <span className="text-sm text-gray-700">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bathrooms Dropdown */}
                  <div className="relative">
                    <label className="block text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Bathrooms
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setBathroomDropdownOpen(!bathroomDropdownOpen)
                        }
                        className="mt-1 w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-left flex items-center justify-between focus:border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]/20 outline-none bg-white"
                      >
                        <span
                          className={
                            formData.bathrooms
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          {formData.bathrooms || "Select No of Bathrooms"}
                        </span>
                        <FiChevronDown
                          className={`transition-transform ${
                            bathroomDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </label>

                    {bathroomDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-lg border-2 border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                        <div className="p-4 space-y-2">
                          {bathroomOptions.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                            >
                              <input
                                type="checkbox"
                                checked={formData.bathrooms === option}
                                onChange={() => {
                                  handleInputChange("bathrooms", option);
                                  setBathroomDropdownOpen(false);
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-[#4EA8A1] focus:ring-[#4EA8A1]"
                              />
                              <span className="text-sm text-gray-700">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <TextField
                    label="Full Address"
                    value={formData.fullAddress}
                    onChange={(e) =>
                      handleInputChange("fullAddress", e.target.value)
                    }
                  />
                  <TextField
                    label="Microlocation"
                    value={formData.microlocation}
                    onChange={(e) =>
                      handleInputChange("microlocation", e.target.value)
                    }
                  />
                  <TextField
                    label="Build Year"
                    value={formData.buildYear}
                    onChange={(e) =>
                      handleInputChange("buildYear", e.target.value)
                    }
                  />
                  <TextField
                    label="Condition"
                    value={formData.condition}
                    onChange={(e) =>
                      handleInputChange("condition", e.target.value)
                    }
                  />
                  <TextField
                    label="Current Owner Seller"
                    value={formData.currentOwnerSeller}
                    onChange={(e) =>
                      handleInputChange("currentOwnerSeller", e.target.value)
                    }
                  />
                </div>
              )}

              {/* STEP 2 */}
              {step === 1 && (
                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    { key: "sellerIndaTag", label: "Seller Inda Tag" },
                    { key: "listingLink", label: "Listing Link" },
                    { key: "purchasePrice", label: "Purchase Price" },
                    { key: "titleVerification", label: "Title Verification" },
                    { key: "litigationCheck", label: "Litigation Check" },
                    {
                      key: "surveyPlanVerification",
                      label: "Survey Plan Verification",
                    },
                    { key: "zoningCompliance", label: "Zoning Compliance" },
                    {
                      key: "developmentApprovalCheck",
                      label: "Development Approval Check",
                    },
                    { key: "encumbrances", label: "Encumbrances" },
                  ].map((field) => (
                    <TextField
                      key={field.key}
                      label={field.label}
                      value={formData[field.key as keyof FormValues] as string}
                      onChange={(e) =>
                        handleInputChange(
                          field.key as keyof FormValues,
                          e.target.value
                        )
                      }
                    />
                  ))}
                </div>
              )}

              {/* STEP 3 */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FileUploadBox
                      label="Title Documents"
                      files={titleDocs}
                      onFileSelect={(files) =>
                        handleFileSelect(files, setTitleDocs)
                      }
                      onRemove={(index) => removeFile(index, setTitleDocs)}
                    />
                    <FileUploadBox
                      label="Legal Documents"
                      files={legalDocs}
                      onFileSelect={(files) =>
                        handleFileSelect(files, setLegalDocs)
                      }
                      onRemove={(index) => removeFile(index, setLegalDocs)}
                    />
                  </div>
                  <div>
                    <h3 className="text-[#4EA8A1] font-semibold mb-3">
                      Property Images
                    </h3>
                    <FileUploadBox
                      label="Property Images"
                      files={propertyImages}
                      onFileSelect={(files) =>
                        handleFileSelect(files, setPropertyImages)
                      }
                      onRemove={(index) => removeFile(index, setPropertyImages)}
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <h3 className="text-[#4EA8A1] font-semibold mb-3">
                      Amenity Images
                    </h3>
                    <FileUploadBox
                      label="Amenity Images"
                      files={amenityImages}
                      onFileSelect={(files) =>
                        handleFileSelect(files, setAmenityImages)
                      }
                      onRemove={(index) => removeFile(index, setAmenityImages)}
                      accept="image/*"
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
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
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#4EA8A1] px-5 py-2 text-sm font-bold text-white hover:bg-[#3d8882] disabled:opacity-60"
                    >
                      {isSubmitting ? "Saving..." : "Add Listing"}{" "}
                      <FiCheck size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Auto Calculated Tab */}
          {activeTab === "auto" && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Financial Metrics
              </h3>
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

          {/* ========== REVIEWS TAB ========== */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <input
                  type="text"
                  placeholder="🔍 Search reviews"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border-0 bg-[#5DABA4] text-white placeholder-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]"
                />
              </div>

              {/* Quick Filters */}
              <div className="border border-gray-300 rounded-md p-4 bg-white">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Quick Filters
                </p>
                <div className="flex gap-6">
                  {["client", "rating", "date"].map((filter) => (
                    <label
                      key={filter}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={filters[filter as keyof typeof filters]}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            [filter]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#4EA8A1]"
                      />
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {reviewsLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#4EA8A1] border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading reviews...</p>
                </div>
              )}

              {/* Error State */}
              {reviewsError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-700 text-sm">
                    <strong>Error:</strong> {reviewsError}
                  </p>
                  <button
                    onClick={fetchReviews}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Table */}
              {!reviewsLoading && !reviewsError && (
                <>
                  <div className="overflow-x-auto rounded-md border border-gray-300 bg-white">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#5DABA4]">
                        <tr>
                          {[
                            "Reviewer",
                            "Transaction Type",
                            "Rating",
                            "Date",
                            "Review",
                            "Status",
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
                        {reviews.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No reviews found
                            </td>
                          </tr>
                        ) : (
                          reviews.map((review) => (
                            <tr
                              key={review._id}
                              className="hover:bg-gray-50 transition"
                            >
                              <td className="px-4 py-3 text-gray-800 font-medium">
                                {review.userId?.firstName}{" "}
                                {review.userId?.lastName}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {review.userId?.email}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    review.transactionType === "Bought"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {review.transactionType}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-md px-2 py-1 text-xs font-semibold text-gray-800 ${getRatingColor(
                                      review.ratings?.averageRating || 0
                                    )}`}
                                  >
                                    {getRatingStars(
                                      review.ratings?.averageRating || 0
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="rounded-md px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                                  {formatDate(review.createdAt)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700 max-w-xs">
                                <div
                                  className="truncate"
                                  title={review.detailedFeedback}
                                >
                                  {review.detailedFeedback}
                                </div>
                                {review.tags && review.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {review.tags.map(
                                      (tag: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-gray-200 px-2 py-0.5 rounded"
                                        >
                                          {tag}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    review.status === "approved"
                                      ? "bg-green-100 text-green-700"
                                      : review.status === "rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {review.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <button
                                    onClick={() =>
                                      window.open(review.listingUrl, "_blank")
                                    }
                                    className="text-[#5DABA4] font-semibold hover:underline"
                                  >
                                    View
                                  </button>
                                  <span className="text-gray-400">|</span>
                                  <button
                                    onClick={() =>
                                      handleReviewAction(review._id, "approve")
                                    }
                                    disabled={review.status === "approved"}
                                    className="text-[#5DABA4] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Approve
                                  </button>
                                  <span className="text-gray-400">|</span>
                                  <button
                                    onClick={() =>
                                      handleReviewAction(review._id, "reject")
                                    }
                                    disabled={review.status === "rejected"}
                                    className="text-red-500 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-gray-600">
                        Showing page {currentPage} of {totalPages} (
                        {totalResults} total reviews)
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-1 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Helper Components */
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

type FileUploadBoxProps = {
  label: string;
  files: UploadedFile[];
  onFileSelect: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  accept?: string;
};

const FileUploadBox = ({
  label,
  files,
  onFileSelect,
  onRemove,
  accept,
}: FileUploadBoxProps) => {
  return (
    <div>
      <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#4EA8A1] hover:bg-[#E8F5F4] px-6 py-8 text-center cursor-pointer">
        <FiUpload className="text-[#4EA8A1]" size={24} />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <input
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </label>

      {files && files.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {files.map((f, idx) => (
            <div
              key={idx}
              className="relative rounded-lg overflow-hidden border border-gray-200 bg-white"
            >
              {f.file.type.startsWith("image/") ? (
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="h-24 w-full object-cover"
                />
              ) : (
                <div className="flex h-24 items-center justify-center">
                  <FiFile size={24} className="text-gray-500" />
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute top-1 right-1 rounded-full bg-white p-1 text-gray-600 hover:bg-gray-100"
                title="Remove file"
              >
                <FiX size={14} />
              </button>
              <div className="p-2 text-xs text-gray-600 truncate">
                {f.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
