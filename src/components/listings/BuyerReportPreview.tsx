/**
 * BUYER REPORT PREVIEW
 *
 * Shows what the verification report will look like to buyers.
 * Used in:
 * 1. Upload wizard preview (before publishing)
 * 2. Seller dashboard (to see what buyers see)
 */

import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Home,
  Bed,
  Bath,
  FileText,
  ImageIcon,
  Calendar,
  Shield,
  XCircle,
} from "lucide-react";
import { PropertyUploadData } from "./types";

interface BuyerReportPreviewProps {
  data: PropertyUploadData;
  savedListing?: any; // The actual saved listing from the backend
  mode?: "preview" | "published"; // Preview = draft, Published = live
}

export function BuyerReportPreview({
  data,
  savedListing,
}: BuyerReportPreviewProps) {
  // Use saved listing data if available, otherwise fall back to local data
  const listing = savedListing || {};

  // Extract data with fallbacks - prefer saved listing data
  const propertyType =
    listing.propertyType ||
    data.confirmedData?.propertyType ||
    data.aiInferredData?.propertyType ||
    "";
  const bedrooms =
    listing.bedrooms ||
    data.confirmedData?.bedrooms ||
    data.aiInferredData?.bedrooms;
  const bathrooms =
    listing.bathrooms ||
    data.confirmedData?.bathrooms ||
    data.aiInferredData?.bathrooms;
  const displayAddress =
    listing.fullAddress || listing.microlocation || data.address || "";
  const displayPrice = Number(listing.purchasePrice) || data.askingPrice || 0;
  const displayTitle =
    listing.title ||
    `${bedrooms || ""}${propertyType} in ${displayAddress.split(",")[0]}`;
  const size = listing.size || data.confirmedData?.landSize || "";
  const isOffPlan = propertyType.toLowerCase().includes("off-plan");

  // Get image URLs from saved listing or local previews
  // Use photosWithMeta (new structure) with fallback to imageUrls (legacy)
  const backendImageUrls: string[] =
    listing.photosWithMeta?.map((p: any) => p.url) || listing.imageUrls || [];
  const hasBackendImages = backendImageUrls.length > 0;

  // Get documents from saved listing
  // Use documentsWithMeta (new structure) with fallback to legalDocs (legacy)
  const backendDocuments = listing.documentsWithMeta || [];
  const backendDocCount =
    backendDocuments.length || listing.legalDocs?.length || 0;

  // Get declared document types (all documents the property has, uploaded or not)
  const backendDeclaredDocs = listing.declaredDocumentTypes || [];
  const localDeclaredDocs = data.declaredDocuments || [];
  const allDeclaredDocs =
    backendDeclaredDocs.length > 0 ? backendDeclaredDocs : localDeclaredDocs;

  // Get enhancement data from saved listing or local state
  const enhancedData = {
    virtualTourUrl: listing.virtualTourUrl || data.enhancedData?.virtualTourUrl,
    paymentPlans: listing.paymentPlans || data.enhancedData?.paymentPlans,
    developerInfo: listing.developerInfo || data.enhancedData?.developerInfo,
    expectedCompletion:
      listing.expectedCompletion || data.enhancedData?.expectedCompletion,
    constructionMilestones:
      listing.constructionMilestones ||
      data.enhancedData?.constructionMilestones,
    lastConstructionUpdate: data.enhancedData?.lastConstructionUpdate,
  };

  // Calculate completeness score
  const calculateCompletenessScore = () => {
    let score = 0;
    let total = 0;

    // Basic info (40%)
    total += 40;
    if (displayAddress) score += 10;
    if (displayPrice) score += 10;
    if (bedrooms) score += 10;
    if (bathrooms) score += 10;

    // Documents (40%)
    total += 40;
    const declaredCount = allDeclaredDocs.length;
    const uploadedDocCount = allDeclaredDocs.filter(
      (d: any) => d.uploaded,
    ).length;
    // Declared types give partial credit, uploaded files give full credit
    if (declaredCount >= 2 && uploadedDocCount >= 2) score += 40;
    else if (declaredCount >= 2 && uploadedDocCount >= 1) score += 30;
    else if (declaredCount >= 2) score += 20;
    else if (declaredCount >= 1) score += 10;

    // Photos (20%)
    total += 20;
    const photoCount = hasBackendImages
      ? backendImageUrls.length
      : data.photos?.length || 0;
    if (photoCount >= 5) score += 20;
    else if (photoCount >= 3) score += 10;
    else if (photoCount >= 1) score += 5;

    return Math.round((score / total) * 100);
  };

  const completenessScore = calculateCompletenessScore();
  const totalDeclaredCount = allDeclaredDocs.length;
  const totalUploadedCount = allDeclaredDocs.filter(
    (d: any) => d.uploaded,
  ).length;

  // Check for title and survey documents in declared types
  const hasTitle =
    allDeclaredDocs.some(
      (d: any) =>
        d?.type?.includes("Title") || d?.type?.includes("Certificate"),
    ) ||
    backendDocuments.some(
      (d: any) =>
        d?.type?.includes("Title") || d?.type?.includes("Certificate"),
    );
  const hasSurvey =
    allDeclaredDocs.some((d: any) => d?.type?.includes("Survey")) ||
    backendDocuments.some((d: any) => d?.type?.includes("Survey"));

  // Check if title/survey docs were actually uploaded (not just declared)
  const hasTitleUploaded =
    allDeclaredDocs.some(
      (d: any) =>
        d.uploaded &&
        (d?.type?.includes("Title") || d?.type?.includes("Certificate")),
    ) ||
    backendDocuments.some(
      (d: any) =>
        d?.type?.includes("Title") || d?.type?.includes("Certificate"),
    );
  const hasSurveyUploaded =
    allDeclaredDocs.some(
      (d: any) => d.uploaded && d?.type?.includes("Survey"),
    ) || backendDocuments.some((d: any) => d?.type?.includes("Survey"));

  // Determine verification status
  const getVerificationStatus = () => {
    if (completenessScore >= 80 && hasTitleUploaded && hasSurveyUploaded) {
      return {
        level: "high",
        label: "High Confidence",
        color: "green",
        icon: CheckCircle2,
      };
    } else if (completenessScore >= 50) {
      return {
        level: "medium",
        label: "Preliminary Analysis",
        color: "yellow",
        icon: AlertTriangle,
      };
    } else {
      return {
        level: "low",
        label: "Incomplete Information",
        color: "red",
        icon: AlertTriangle,
      };
    }
  };

  const status = getVerificationStatus();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {displayTitle}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {displayAddress || "Location"}
                  </span>
                </div>
                {bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span className="text-sm">{bedrooms} beds</span>
                  </div>
                )}
                {bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span className="text-sm">{bathrooms} baths</span>
                  </div>
                )}
                {size && (
                  <div className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    <span className="text-sm">{size}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#4ea8a1]">
                ₦{displayPrice ? displayPrice.toLocaleString() : "0"}
              </p>
              <p className="text-sm text-gray-500">
                {propertyType || "Property Type"}
              </p>
            </div>
          </div>

          {/* Verification Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              status.color === "green"
                ? "bg-green-50 text-green-700"
                : status.color === "yellow"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-700"
            }`}
          >
            <StatusIcon className="w-5 h-5" />
            <span className="font-medium">{status.label}</span>
            <span className="text-sm opacity-75">
              • {completenessScore}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Property Photos
          </h2>
          {hasBackendImages ? (
            // Show images from backend (GCS URLs)
            <div className="grid grid-cols-3 gap-4">
              {backendImageUrls.slice(0, 6).map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative"
                >
                  <img
                    src={url}
                    alt={`Property photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : data.photos.length > 0 ? (
            // Fallback to local previews
            <div className="grid grid-cols-3 gap-4">
              {data.photos.slice(0, 6).map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative"
                >
                  <img
                    src={photo.preview}
                    alt={photo.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs">
                    {photo.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No photos uploaded yet</p>
              </div>
            </div>
          )}
          {(hasBackendImages ? backendImageUrls.length : data.photos.length) >
            6 && (
            <p className="text-sm text-gray-500 mt-2">
              +{" "}
              {(hasBackendImages
                ? backendImageUrls.length
                : data.photos.length) - 6}{" "}
              more photos
            </p>
          )}
        </div>
      </div>

      {/* Off-Plan Construction Progress */}
      {isOffPlan && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Construction Progress
              </h2>
              {enhancedData.lastConstructionUpdate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Last Updated:{" "}
                    {new Date(
                      enhancedData.lastConstructionUpdate,
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Milestones */}
            {enhancedData.constructionMilestones &&
              enhancedData.constructionMilestones.length > 0 && (
                <div className="space-y-3">
                  {enhancedData.constructionMilestones.map(
                    (milestone: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            milestone.status === "complete"
                              ? "bg-green-100 text-green-600"
                              : milestone.status === "in-progress"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {milestone.status === "complete" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {milestone.name}
                          </p>
                          {milestone.expectedDate && (
                            <p className="text-sm text-gray-500">
                              Expected:{" "}
                              {new Date(
                                milestone.expectedDate,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            milestone.status === "complete"
                              ? "bg-green-100 text-green-700"
                              : milestone.status === "in-progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {milestone.status?.replace("-", " ") || "pending"}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}

            {/* Expected Completion */}
            {enhancedData.expectedCompletion && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    Expected Completion:{" "}
                    {new Date(
                      enhancedData.expectedCompletion,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhancement Info (Virtual Tour, Payment Plans, Developer Info) */}
      {(enhancedData.virtualTourUrl ||
        enhancedData.paymentPlans ||
        enhancedData.developerInfo) && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h2>
            <div className="space-y-4">
              {enhancedData.virtualTourUrl && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-1">Virtual Tour</p>
                  <a
                    href={enhancedData.virtualTourUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4ea8a1] hover:underline text-sm"
                  >
                    {enhancedData.virtualTourUrl}
                  </a>
                </div>
              )}
              {enhancedData.paymentPlans && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-1">
                    Payment Plans
                  </p>
                  <p className="text-sm text-gray-600">
                    {enhancedData.paymentPlans}
                  </p>
                </div>
              )}
              {enhancedData.developerInfo && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-1">
                    Developer Information
                  </p>
                  <p className="text-sm text-gray-600">
                    {enhancedData.developerInfo}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Verification */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Document Verification
          </h2>

          {/* Disclaimer */}
          {status.level !== "high" && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">
                    Preliminary Analysis - Based on uploaded documents only.
                  </p>
                  <p>
                    Full verification with market comparables and registry
                    checks available for ₦50,000
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Document Checklist - Show each declared document type */}
          {allDeclaredDocs.length > 0 ? (
            <div className="space-y-3">
              {allDeclaredDocs.map((doc: any, idx: number) => {
                const isUploaded =
                  doc.uploaded ||
                  backendDocuments.some((bd: any) => bd.type === doc.type);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {isUploaded ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.type}</p>
                      {isUploaded ? (
                        <p className="text-sm text-green-600">
                          Uploaded and scanned for verification
                        </p>
                      ) : (
                        <p className="text-sm text-amber-600">
                          Declared by seller - document has not been uploaded
                          for verification
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{totalDeclaredCount}</span>{" "}
                  document type{totalDeclaredCount !== 1 ? "s" : ""} declared
                  {totalUploadedCount > 0 && (
                    <span className="text-green-600 font-medium">
                      {" "}
                      &bull; {totalUploadedCount} uploaded for verification
                    </span>
                  )}
                  {totalDeclaredCount - totalUploadedCount > 0 && (
                    <span className="text-amber-600 font-medium">
                      {" "}
                      &bull; {totalDeclaredCount - totalUploadedCount} not
                      uploaded for verification
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            /* Fallback for legacy listings without declared types */
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {hasTitle ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Title Document</p>
                  <p className="text-sm text-gray-600">
                    {hasTitle ? "Uploaded and scanned" : "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {hasSurvey ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Survey Plan</p>
                  <p className="text-sm text-gray-600">
                    {hasSurvey ? "Uploaded and scanned" : "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Additional Documents
                  </p>
                  <p className="text-sm text-gray-600">
                    {backendDocCount || data.documents.length} document(s)
                    uploaded
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Confidence */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#4ea8a1]/10 to-[#f59e0b]/10 rounded-lg">
            <Shield className="w-6 h-6 text-[#4ea8a1]" />
            <div>
              <p className="font-medium text-gray-900">
                AI Analysis Confidence: {completenessScore}%
              </p>
              <p className="text-sm text-gray-600">
                {status.level === "high"
                  ? "High confidence in property details. Ready for buyer inquiries."
                  : "More information needed for comprehensive analysis. Consider uploading additional documents."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
