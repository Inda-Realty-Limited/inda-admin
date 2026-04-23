import { useState } from "react";
import {
  CheckCircle2,
  Edit3,
  AlertTriangle,
  FileText,
  MapPin,
  Home,
  Calendar,
  DollarSign,
  Shield,
  Zap,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2
} from "lucide-react";
import { DocumentType, PropertyUploadData } from "./types";


interface ReviewExtractedInfoProps {
  data: PropertyUploadData;
  onEdit: (field: string, value: any) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string;
}


export function ReviewExtractedInfo({
  data,
  onEdit,
  onConfirm,
  onBack,
  isLoading = false,
  error
}: ReviewExtractedInfoProps) {
  const aiData = data.aiInferredData;
  const confirmed = data.confirmedData;
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "property-identity",
    "legal-ownership",
    "land-details"
  ]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  // Handle field edits - store locally and propagate to parent
  const handleFieldEdit = (fieldKey: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [fieldKey]: value }));
    onEdit(fieldKey, value);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };


  const isSectionExpanded = (sectionId: string) => expandedSections.includes(sectionId);


  // Calculate overall confidence from available AI data
  const calculateOverallConfidence = () => {
    const confidenceValues = [
      aiData?.confidence?.propertyType,
      aiData?.confidence?.ownerName,
      aiData?.confidence?.landSize,
      aiData?.confidence?.bedrooms,
    ].filter(Boolean) as number[];

    if (confidenceValues.length === 0) return 0;
    return Math.round(confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length);
  };

  // Get actual document types from uploaded documents
  const getActualDocumentTypes = (): string[] => {
    const uploadedTypes: string[] = data.documents
      .map(d => d.type)
      .filter((t): t is DocumentType => !!t && t !== 'Other');

    // If we have API-detected types, merge them
    const apiTypes: string[] = (aiData?._rawApiResponse?.documentTypes || [])
      .filter((t: string | undefined) => !!t && t.toLowerCase() !== 'unknown');

    // Combine and deduplicate
    const allTypes = [...new Set([...uploadedTypes, ...apiTypes])];
    return allTypes.length > 0 ? allTypes : ['No documents classified'];
  };

  const actualDocumentTypes = getActualDocumentTypes();

  // Map real data to UI structure - only use AI-extracted or user-confirmed data
  const displayData = {
    // PROPERTY IDENTIFICATION
    propertyIdentity: {
      address: data.address || "Not detected",
      propertyType: confirmed?.propertyType || (data.propertyFlowType === "land-only" ? "Land Only" : data.propertyFlowType === "off-plan" ? "Off-Plan" : data.propertyFlowType === "completed" ? "Completed" : undefined) || aiData?.propertyType || "Not detected",
      titleType: confirmed?.titleType || (data.declaredDocuments?.length ? data.declaredDocuments.map(d => d.type).join(", ") : undefined) || aiData?.documentAnalysis?.titleType || "Not detected",
      plotNumber: aiData?.location || "Not detected",
      stateJurisdiction: data.addressState || aiData?.documentAnalysis?.state || "Not detected",
      lgaJurisdiction: data.addressLga || aiData?.documentAnalysis?.lga || "Not detected",
      confidence: aiData?.confidence?.propertyType || 0
    },


    // LEGAL & OWNERSHIP
    legalOwnership: {
      currentOwner: aiData?.ownerName || "Not detected",
      registrationNumber: aiData?.documentAnalysis?.registrationNumber || "Not detected",
      issueDate: aiData?.yearAcquired?.toString() || "Not detected",
      titleNumber: aiData?.documentAnalysis?.titleNumber || "Not detected",
      previousOwner: aiData?.previousOwners?.[0] || "Not detected",
      transferDate: aiData?.documentAnalysis?.transferDate || "Not detected",
      acquisitionType: aiData?.acquisitionMethod || "Not detected",
      governorsConsent: {
        status: aiData?.documentAnalysis?.governorsConsent?.status || "Not detected",
        number: aiData?.documentAnalysis?.governorsConsent?.number || "Not detected",
        date: aiData?.documentAnalysis?.governorsConsent?.date || "Not detected"
      },
      powerOfAttorney: {
        exists: aiData?.documentAnalysis?.powerOfAttorney?.exists || false,
        details: aiData?.documentAnalysis?.powerOfAttorney?.details || "Not detected"
      },
      confidence: aiData?.confidence?.ownerName || 0
    },


    // LAND DETAILS
    landDetails: {
      landSize: confirmed?.landSize || aiData?.landSize || "Not detected",
      landSizeSource: aiData?.documentAnalysis?.landSizeSource || "Not detected",
      surveyNumber: aiData?.documentAnalysis?.surveyNumber || "Not detected",
      surveyDate: aiData?.documentAnalysis?.surveyDate || "Not detected",
      surveyorName: aiData?.documentAnalysis?.surveyorName || "Not detected",
      surveyorLicense: aiData?.documentAnalysis?.surveyorLicense || "Not detected",
      gpsCoordinates: aiData?.documentAnalysis?.gpsCoordinates || "Not detected",
      boundaryDescriptions: aiData?.documentAnalysis?.boundaryDescriptions || "Not detected",
      confidence: aiData?.confidence?.landSize || 0
    },


    // LEASE DETAILS (if applicable)
    leaseDetails: {
      leaseType: aiData?.documentAnalysis?.leaseType || "Not detected",
      leaseStartDate: aiData?.documentAnalysis?.leaseStartDate || "Not detected",
      leaseExpiryDate: aiData?.documentAnalysis?.leaseExpiryDate || "Not detected",
      remainingYears: aiData?.documentAnalysis?.remainingYears || "Not detected",
      groundRent: aiData?.documentAnalysis?.groundRent || "Not detected",
      groundRentStatus: aiData?.documentAnalysis?.groundRentStatus || "Not detected",
      confidence: aiData?.confidence?.lease || 0
    },


    // FINANCIAL
    financial: {
      purchasePrice: data.askingPrice ? `₦${data.askingPrice.toLocaleString()}` : "Not set",
      purchaseDate: aiData?.yearAcquired?.toString() || "Not detected",
      paymentTerms: aiData?.documentAnalysis?.paymentTerms || "Not detected",
      outstandingBalance: aiData?.documentAnalysis?.outstandingBalance || "Not detected",
      propertyTax: {
        year: aiData?.documentAnalysis?.propertyTax?.year || "Not detected",
        amount: aiData?.documentAnalysis?.propertyTax?.amount || "Not detected",
        status: aiData?.documentAnalysis?.propertyTax?.status || "Not detected",
        assessedValue: aiData?.documentAnalysis?.propertyTax?.assessedValue || "Not detected"
      },
      confidence: aiData?.confidence?.financial || 0
    },


    // REGULATORY
    regulatory: {
      buildingApproval: {
        approvalNumber: aiData?.documentAnalysis?.buildingApproval?.approvalNumber || "Not detected",
        approvedUse: confirmed?.propertyType || (data.propertyFlowType === "land-only" ? "Land Only" : data.propertyFlowType === "off-plan" ? "Off-Plan" : data.propertyFlowType === "completed" ? "Completed" : undefined) || aiData?.propertyType || "Not detected",
        floors: aiData?.documentAnalysis?.buildingApproval?.floors || "Not detected",
        buildingArea: confirmed?.landSize || aiData?.landSize || "Not detected",
        approvedBedrooms: data.bedroomsInput?.toString() || aiData?.bedrooms?.toString() || "Not detected",
        zoningCompliance: aiData?.documentAnalysis?.buildingApproval?.zoningCompliance || "Not detected",
        approvalDate: aiData?.documentAnalysis?.buildingApproval?.approvalDate || "Not detected"
      },
      confidence: aiData?.confidence?.regulatory || 0
    },


    // UTILITIES
    utilities: {
      electricity: {
        provider: aiData?.documentAnalysis?.utilities?.electricity?.provider || "Not detected",
        meterNumber: aiData?.documentAnalysis?.utilities?.electricity?.meterNumber || "Not detected",
        accountHolder: aiData?.ownerName || "Not detected",
        connectionStatus: aiData?.documentAnalysis?.utilities?.electricity?.connectionStatus || "Not detected",
        serviceAddress: data.address || "Not detected"
      },
      water: {
        provider: aiData?.documentAnalysis?.utilities?.water?.provider || "Not detected",
        connectionStatus: aiData?.documentAnalysis?.utilities?.water?.connectionStatus || "Not detected",
        serviceAddress: data.address || "Not detected"
      },
      confidence: aiData?.confidence?.utilities || 0
    },


    // CONSTRUCTION & PHYSICAL (from photos + documents)
    constructionPhysical: {
      propertyType: confirmed?.propertyType || (data.propertyFlowType === "land-only" ? "Land Only" : data.propertyFlowType === "off-plan" ? "Off-Plan" : data.propertyFlowType === "completed" ? "Completed" : undefined) || aiData?.propertyType || "Not detected",
      bedrooms: confirmed?.bedrooms?.toString() || (data.bedroomsInput ? data.bedroomsInput.toString() : undefined) || aiData?.bedrooms?.toString() || "Not detected",
      bathrooms: confirmed?.bathrooms?.toString() || (data.bathroomsInput ? data.bathroomsInput.toString() : undefined) || aiData?.bathrooms?.toString() || "Not detected",
      floors: aiData?.documentAnalysis?.buildingApproval?.floors || "Not detected",
      roofType: aiData?.photoAnalysis?.roofType || "Not detected",
      propertyCondition: aiData?.photoAnalysis?.propertyCondition || "Not detected",
      constructionStage: aiData?.constructionStatus || "Not detected",
      finishingQuality: aiData?.photoAnalysis?.finishingQuality || "Not detected",
      occupancyStatus: aiData?.currentUse || "Not detected",
      visibleAmenities: aiData?.amenities || [],
      confidence: aiData?.confidence?.bedrooms || 0
    },


    // VERIFICATION STATUS
    verificationStatus: {
      // Documents count - use uploaded documents array (legal docs only, not photos)
      documentsVerified: data.documents.filter(d => d.type).length,
      totalDocuments: data.documents.length,
      // Photos count - use uploaded photos array
      photosAnalyzed: data.photos.length,
      // Use transformed confidence or calculated confidence
      overallConfidence: aiData?.confidence?.overall ?? calculateOverallConfidence(),
      flaggedIssues: aiData?.flags || [],
      // Additional risk info from API
      riskScore: aiData?._rawApiResponse?.riskScore,
      riskLevel: aiData?._rawApiResponse?.riskLevel,
      documentTypes: aiData?._rawApiResponse?.documentTypes || data.documents.map(d => d.type).filter(Boolean),
    }
  };


  const EditableField = ({
    label,
    value: originalValue,
    fieldKey,
    multiline = false
  }: {
    label: string;
    value: string;
    fieldKey: string;
    multiline?: boolean;
  }) => {
    const isEditing = editingField === fieldKey;
    // Use edited value if available, otherwise use original
    const displayValue = editedValues[fieldKey] !== undefined ? editedValues[fieldKey] : originalValue;
    // For input, start with empty string if "Not detected", otherwise use current value
    const inputValue = editedValues[fieldKey] !== undefined
      ? editedValues[fieldKey]
      : (originalValue === "Not detected" ? "" : originalValue);


    return (
      <div className="flex items-start justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 -mx-4">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
          {isEditing ? (
            multiline ? (
              <textarea
                className="w-full px-3 py-2 border border-[#4ea8a1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ea8a1]"
                value={inputValue}
                onChange={(e) => handleFieldEdit(fieldKey, e.target.value)}
                onBlur={() => setEditingField(null)}
                autoFocus
                rows={3}
                placeholder="Enter value..."
              />
            ) : (
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#4ea8a1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ea8a1]"
                value={inputValue}
                onChange={(e) => handleFieldEdit(fieldKey, e.target.value)}
                onBlur={() => setEditingField(null)}
                autoFocus
                placeholder="Enter value..."
              />
            )
          ) : (
            <div className={`text-base font-semibold ${displayValue === "Not detected" ? "text-gray-400 italic" : "text-gray-900"}`}>
              {displayValue || "Not detected"}
            </div>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setEditingField(fieldKey)}
            className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit this field"
          >
            <Edit3 className="w-4 h-4 text-gray-400 hover:text-[#4ea8a1]" />
          </button>
        )}
      </div>
    );
  };


  const SectionHeader = ({
    icon: Icon,
    title,
    itemCount,
    confidence,
    sectionId
  }: {
    icon: any;
    title: string;
    itemCount: number;
    confidence: number;
    sectionId: string;
  }) => {
    const isExpanded = isSectionExpanded(sectionId);

    return (
      <button
        onClick={() => toggleSection(sectionId)}
        className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 hover:from-gray-100 hover:to-gray-50 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#4ea8a1] bg-opacity-10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#4ea8a1]" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{itemCount} fields extracted</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-900">{confidence}% Confidence</span>
            </div>
            <p className="text-xs text-gray-500">AI-verified</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Extracted Information</h1>
              <p className="text-gray-600">AI has extracted data from your documents and photos. Review and edit if needed.</p>
            </div>
          </div>


          {/* Overall Status */}
          <div className={`bg-gradient-to-br ${
            displayData.verificationStatus.flaggedIssues.length > 0 || displayData.verificationStatus.riskLevel === 'high'
              ? 'from-amber-50 to-white border-amber-200'
              : 'from-green-50 to-white border-green-200'
          } border rounded-xl p-6`}>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Overall Confidence</div>
                <div className={`text-3xl font-bold ${
                  displayData.verificationStatus.overallConfidence >= 70 ? 'text-green-600' :
                  displayData.verificationStatus.overallConfidence >= 40 ? 'text-amber-600' : 'text-red-600'
                }`}>{displayData.verificationStatus.overallConfidence}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Documents Verified</div>
                <div className={`text-3xl font-bold ${
                  displayData.verificationStatus.documentsVerified === displayData.verificationStatus.totalDocuments
                    ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {displayData.verificationStatus.documentsVerified}/{displayData.verificationStatus.totalDocuments}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Photos Analyzed</div>
                <div className="text-3xl font-bold text-gray-900">{displayData.verificationStatus.photosAnalyzed}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Flagged Issues</div>
                <div className={`text-3xl font-bold ${
                  displayData.verificationStatus.flaggedIssues.length > 0 ? 'text-amber-600' : 'text-green-600'
                }`}>{displayData.verificationStatus.flaggedIssues.length}</div>
              </div>
            </div>

            {displayData.verificationStatus.flaggedIssues.length === 0 ? (
              <div className="mt-4 flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">All data looks good! No issues detected.</span>
              </div>
            ) : (() => {
              // Group issues by source type
              const documentIssues = displayData.verificationStatus.flaggedIssues.filter(
                (f: any) => f.sourceType === 'document'
              );
              const photoIssues = displayData.verificationStatus.flaggedIssues.filter(
                (f: any) => f.sourceType === 'photo'
              );
              const otherIssues = displayData.verificationStatus.flaggedIssues.filter(
                (f: any) => !f.sourceType || (f.sourceType !== 'document' && f.sourceType !== 'photo')
              );

              return (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-semibold">
                      {displayData.verificationStatus.flaggedIssues.length} issue{displayData.verificationStatus.flaggedIssues.length !== 1 ? 's' : ''} detected - please review
                    </span>
                  </div>
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-3">
                    {/* Document Issues */}
                    {documentIssues.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <FileText className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">Document Issues ({documentIssues.length})</span>
                        </div>
                        <div className="space-y-1">
                          {documentIssues.map((flag: any, idx: number) => (
                            <div key={`doc-${idx}`} className="text-xs text-amber-800 bg-amber-100 rounded px-2 py-1">
                              {typeof flag === 'string' ? flag : flag.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photo Issues */}
                    {photoIssues.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">Photo Issues ({photoIssues.length})</span>
                        </div>
                        <div className="space-y-1">
                          {photoIssues.map((flag: any, idx: number) => (
                            <div key={`photo-${idx}`} className="text-xs text-amber-800 bg-amber-100 rounded px-2 py-1">
                              {typeof flag === 'string' ? flag : flag.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other/General Issues */}
                    {otherIssues.length > 0 && (
                      <div>
                        {(documentIssues.length > 0 || photoIssues.length > 0) && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Info className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">General Issues ({otherIssues.length})</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          {otherIssues.map((flag: any, idx: number) => (
                            <div key={`other-${idx}`} className="text-xs text-amber-800 bg-amber-100 rounded px-2 py-1">
                              {typeof flag === 'string' ? flag : flag.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>


        {/* Extraction Sections */}
        <div className="space-y-4">
          {/* 1. Property Identification */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <SectionHeader
              icon={Home}
              title="Property Identification"
              itemCount={6}
              confidence={displayData.propertyIdentity.confidence}
              sectionId="property-identity"
            />
            {isSectionExpanded("property-identity") && (
              <div className="p-6">
                <EditableField
                  label="Property Address"
                  value={displayData.propertyIdentity.address}
                  fieldKey="address"
                />
                <EditableField
                  label="Property Type"
                  value={displayData.propertyIdentity.propertyType}
                  fieldKey="propertyType"
                />
                <EditableField
                  label="Title Type"
                  value={displayData.propertyIdentity.titleType}
                  fieldKey="titleType"
                />
                <EditableField
                  label="Plot Number"
                  value={displayData.propertyIdentity.plotNumber}
                  fieldKey="plotNumber"
                />
                <EditableField
                  label="State"
                  value={displayData.propertyIdentity.stateJurisdiction}
                  fieldKey="state"
                />
                <EditableField
                  label="LGA"
                  value={displayData.propertyIdentity.lgaJurisdiction}
                  fieldKey="lga"
                />

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Source Documents</p>
                      <p className="text-xs text-blue-800">{actualDocumentTypes.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* 2. Legal & Ownership */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <SectionHeader
              icon={Shield}
              title="Legal & Ownership"
              itemCount={9}
              confidence={displayData.legalOwnership.confidence}
              sectionId="legal-ownership"
            />
            {isSectionExpanded("legal-ownership") && (
              <div className="p-6">
                <EditableField
                  label="Current Owner"
                  value={displayData.legalOwnership.currentOwner}
                  fieldKey="currentOwner"
                />
                <EditableField
                  label="Registration Number"
                  value={displayData.legalOwnership.registrationNumber}
                  fieldKey="registrationNumber"
                />
                <EditableField
                  label="Title Issue Date"
                  value={displayData.legalOwnership.issueDate}
                  fieldKey="issueDate"
                />
                <EditableField
                  label="Title Number"
                  value={displayData.legalOwnership.titleNumber}
                  fieldKey="titleNumber"
                />
                <EditableField
                  label="Previous Owner"
                  value={displayData.legalOwnership.previousOwner}
                  fieldKey="previousOwner"
                />
                <EditableField
                  label="Transfer Date"
                  value={displayData.legalOwnership.transferDate}
                  fieldKey="transferDate"
                />
                <EditableField
                  label="Acquisition Type"
                  value={displayData.legalOwnership.acquisitionType}
                  fieldKey="acquisitionType"
                />

                {/* Governor's Consent */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Governor's Consent</h4>
                  <EditableField
                    label="Status"
                    value={displayData.legalOwnership.governorsConsent.status}
                    fieldKey="gcStatus"
                  />
                </div>


                {/* Power of Attorney */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Power of Attorney</h4>
                  <EditableField
                    label="POA Status"
                    value={displayData.legalOwnership.powerOfAttorney.details}
                    fieldKey="poaStatus"
                  />
                </div>


                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Source Documents</p>
                      <p className="text-xs text-blue-800">{actualDocumentTypes.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* 3. Land Details */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <SectionHeader
              icon={MapPin}
              title="Land Details & Survey"
              itemCount={7}
              confidence={displayData.landDetails.confidence}
              sectionId="land-details"
            />
            {isSectionExpanded("land-details") && (
              <div className="p-6">
                <EditableField
                  label="Land Size"
                  value={displayData.landDetails.landSize}
                  fieldKey="landSize"
                />
                <div className="py-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-600 mb-1">Data Source</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <div className="text-base font-semibold text-green-700">{displayData.landDetails.landSizeSource}</div>
                  </div>
                </div>
                <EditableField
                  label="Survey Number"
                  value={displayData.landDetails.surveyNumber}
                  fieldKey="surveyNumber"
                />
                <EditableField
                  label="Survey Date"
                  value={displayData.landDetails.surveyDate}
                  fieldKey="surveyDate"
                />
                <EditableField
                  label="Licensed Surveyor"
                  value={displayData.landDetails.surveyorName}
                  fieldKey="surveyorName"
                />
                <EditableField
                  label="Surveyor License"
                  value={displayData.landDetails.surveyorLicense}
                  fieldKey="surveyorLicense"
                />
                <EditableField
                  label="GPS Coordinates"
                  value={displayData.landDetails.gpsCoordinates}
                  fieldKey="gpsCoordinates"
                />
                <EditableField
                  label="Boundary Descriptions"
                  value={displayData.landDetails.boundaryDescriptions}
                  fieldKey="boundaryDescriptions"
                  multiline
                />


                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Source Documents</p>
                      <p className="text-xs text-blue-800">{actualDocumentTypes.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* 4. Lease Details */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <SectionHeader
              icon={Calendar}
              title="Lease Details"
              itemCount={6}
              confidence={displayData.leaseDetails.confidence}
              sectionId="lease-details"
            />
            {isSectionExpanded("lease-details") && (
              <div className="p-6">
                <EditableField
                  label="Lease Type"
                  value={displayData.leaseDetails.leaseType}
                  fieldKey="leaseType"
                />
                <EditableField
                  label="Lease Start Date"
                  value={displayData.leaseDetails.leaseStartDate}
                  fieldKey="leaseStartDate"
                />
                <EditableField
                  label="Lease Expiry Date"
                  value={displayData.leaseDetails.leaseExpiryDate}
                  fieldKey="leaseExpiryDate"
                />
                <EditableField
                  label="Remaining Lease Period"
                  value={displayData.leaseDetails.remainingYears}
                  fieldKey="remainingYears"
                />
                <EditableField
                  label="Ground Rent (Annual)"
                  value={displayData.leaseDetails.groundRent}
                  fieldKey="groundRent"
                />
                <EditableField
                  label="Ground Rent Status"
                  value={displayData.leaseDetails.groundRentStatus}
                  fieldKey="groundRentStatus"
                />


                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Source Documents</p>
                      <p className="text-xs text-blue-800">{actualDocumentTypes.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* 5. Financial Information */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <SectionHeader
              icon={DollarSign}
              title="Financial Information"
              itemCount={7}
              confidence={displayData.financial.confidence}
              sectionId="financial"
            />
            {isSectionExpanded("financial") && (
              <div className="p-6">
                <EditableField
                  label="Purchase Price"
                  value={displayData.financial.purchasePrice}
                  fieldKey="purchasePrice"
                />
                <EditableField
                  label="Purchase Date"
                  value={displayData.financial.purchaseDate}
                  fieldKey="purchaseDate"
                />
                <EditableField
                  label="Payment Terms"
                  value={displayData.financial.paymentTerms}
                  fieldKey="paymentTerms"
                />
                <EditableField
                  label="Outstanding Balance"
                  value={displayData.financial.outstandingBalance}
                  fieldKey="outstandingBalance"
                />


                {/* Property Tax */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Property Tax (Latest)</h4>
                  <EditableField
                    label="Tax Year"
                    value={displayData.financial.propertyTax.year}
                    fieldKey="taxYear"
                  />
                  <EditableField
                    label="Amount Paid"
                    value={displayData.financial.propertyTax.amount}
                    fieldKey="taxAmount"
                  />
                  <EditableField
                    label="Payment Status"
                    value={displayData.financial.propertyTax.status}
                    fieldKey="taxStatus"
                  />
                  <EditableField
                    label="Assessed Value"
                    value={displayData.financial.propertyTax.assessedValue}
                    fieldKey="assessedValue"
                  />
                </div>


                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Source Documents</p>
                      <p className="text-xs text-blue-800">{actualDocumentTypes.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* 6. Regulatory Compliance */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <SectionHeader
              icon={FileText}
              title="Regulatory Compliance"
              itemCount={7}
              confidence={displayData.regulatory.confidence}
              sectionId="regulatory"
            />
            {isSectionExpanded("regulatory") && (
              <div className="p-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Building Approval</h4>
                <EditableField
                  label="Approval Number"
                  value={displayData.regulatory.buildingApproval.approvalNumber}
                  fieldKey="approvalNumber"
                />
                <EditableField
                  label="Approved Use"
                  value={displayData.regulatory.buildingApproval.approvedUse}
                  fieldKey="approvedUse"
                />
                <EditableField
                  label="Number of Floors"
                  value={displayData.regulatory.buildingApproval.floors}
                  fieldKey="floors"
                />
                <EditableField
                  label="Building Area"
                  value={displayData.regulatory.buildingApproval.buildingArea}
                  fieldKey="buildingArea"
                />
                <EditableField
                  label="Approved Bedrooms"
                  value={displayData.regulatory.buildingApproval.approvedBedrooms}
                  fieldKey="approvedBedrooms"
                />
                <EditableField
                  label="Zoning Compliance"
                  value={displayData.regulatory.buildingApproval.zoningCompliance}
                  fieldKey="zoningCompliance"
                />
                <EditableField
                  label="Approval Date"
                  value={displayData.regulatory.buildingApproval.approvalDate}
                  fieldKey="approvalDate"
                />


                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Source Documents</p>
                      <p className="text-xs text-blue-800">{actualDocumentTypes.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* 7. Utilities */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <SectionHeader
              icon={Zap}
              title="Utilities & Services"
              itemCount={7}
              confidence={displayData.utilities.confidence}
              sectionId="utilities"
            />
            {isSectionExpanded("utilities") && (
              <div className="p-6">
                {/* Electricity */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Electricity</h4>
                  <EditableField
                    label="Provider"
                    value={displayData.utilities.electricity.provider}
                    fieldKey="electricityProvider"
                  />
                  <EditableField
                    label="Meter Number"
                    value={displayData.utilities.electricity.meterNumber}
                    fieldKey="meterNumber"
                  />
                  <EditableField
                    label="Account Holder"
                    value={displayData.utilities.electricity.accountHolder}
                    fieldKey="electricityAccountHolder"
                  />
                  <EditableField
                    label="Connection Status"
                    value={displayData.utilities.electricity.connectionStatus}
                    fieldKey="electricityStatus"
                  />
                </div>


                {/* Water */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Water</h4>
                  <EditableField
                    label="Provider"
                    value={displayData.utilities.water.provider}
                    fieldKey="waterProvider"
                  />
                  <EditableField
                    label="Connection Status"
                    value={displayData.utilities.water.connectionStatus}
                    fieldKey="waterStatus"
                  />
                </div>


                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Source Documents</p>
                      <p className="text-xs text-blue-800">{actualDocumentTypes.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* 8. Construction & Physical (from Photos) */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <SectionHeader
              icon={ImageIcon}
              title="Construction & Physical Details"
              itemCount={10}
              confidence={displayData.constructionPhysical.confidence}
              sectionId="construction-physical"
            />
            {isSectionExpanded("construction-physical") && (
              <div className="p-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">Extracted from {displayData.verificationStatus.photosAnalyzed} Photos via Computer Vision</span>
                  </div>
                  <p className="text-xs text-purple-800">AI analyzed property images to extract physical characteristics</p>
                </div>


                <EditableField
                  label="Property Type"
                  value={displayData.constructionPhysical.propertyType}
                  fieldKey="physicalPropertyType"
                />
                <EditableField
                  label="Bedrooms"
                  value={displayData.constructionPhysical.bedrooms}
                  fieldKey="bedrooms"
                />
                <EditableField
                  label="Bathrooms"
                  value={displayData.constructionPhysical.bathrooms}
                  fieldKey="bathrooms"
                />
                <EditableField
                  label="Floors"
                  value={displayData.constructionPhysical.floors}
                  fieldKey="physicalFloors"
                />
                <EditableField
                  label="Roof Type"
                  value={displayData.constructionPhysical.roofType}
                  fieldKey="roofType"
                />
                <EditableField
                  label="Property Condition"
                  value={displayData.constructionPhysical.propertyCondition}
                  fieldKey="propertyCondition"
                />
                <EditableField
                  label="Construction Stage"
                  value={displayData.constructionPhysical.constructionStage}
                  fieldKey="constructionStage"
                />
                <EditableField
                  label="Finishing Quality"
                  value={displayData.constructionPhysical.finishingQuality}
                  fieldKey="finishingQuality"
                />
                <EditableField
                  label="Occupancy Status"
                  value={displayData.constructionPhysical.occupancyStatus}
                  fieldKey="occupancyStatus"
                />


                {/* Amenities */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Visible Amenities (AI-Detected)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {displayData.constructionPhysical.visibleAmenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>


                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Source</p>
                      <p className="text-xs text-blue-800">
                        Computer Vision Analysis of {displayData.verificationStatus.photosAnalyzed} Property Photos
                        {actualDocumentTypes.length > 0 && actualDocumentTypes[0] !== 'No documents classified' &&
                          ` + ${actualDocumentTypes.join(', ')} Cross-Verification`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
          >
            ← Back to Upload
          </button>


          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-sm text-gray-600">Overall Data Quality</p>
              <p className="text-2xl font-bold text-green-600">{displayData.verificationStatus.overallConfidence}% Verified</p>
            </div>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-8 py-3 bg-[#4ea8a1] text-white rounded-lg hover:bg-[#3d9691] transition-colors font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm & Generate Report
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>


        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2">💡 What happens next?</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>✅ We'll generate a comprehensive buyer-facing property report</li>
                <li>✅ All extracted data will be used for market analysis and risk scoring</li>
                <li>✅ You can still edit property details after confirmation</li>
                <li>✅ Missing documents? You can upload them later to improve report quality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



