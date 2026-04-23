export type UploadPhase =
  | "upload"
  | "processing"
  | "confirmation"
  | "enhancement"
  | "preview"
  | "complete";

export type PropertyCategory =
  | "land"
  | "detached"
  | "semi-detached"
  | "apartment"
  | "commercial"
  | "mixed-use";

export type PropertyFlowType = "completed" | "off-plan" | "land-only";

export type DocumentType =
  | "Title Document (C of O, Deed, etc.)"
  | "Survey Plan"
  | "Deed of Assignment"
  | "Deed of Sublease"
  | "Building Approval"
  | "Tax Receipt"
  | "Ground Rent Receipt"
  | "Utility Bill"
  | "Purchase Receipt"
  | "Governor's Consent"
  | "Power of Attorney"
  | "Other";

export type PhotoCategory =
  | "exterior"
  | "interior"
  | "amenities"
  | "construction";

export type PhotoLabel =
  | "Bedroom"
  | "Master Bedroom"
  | "Bathroom"
  | "Living Room"
  | "Kitchen"
  | "Dining Room"
  | "Exterior Front"
  | "Exterior Back"
  | "Exterior Side"
  | "Street View"
  | "Estate/Development View"
  | "Neighborhood"
  | "Access Road"
  | "Compound Entrance"
  | "Swimming Pool"
  | "Generator"
  | "Gym"
  | "Parking"
  | "Garden"
  | "Balcony"
  | "Construction Progress"
  | "Architectural Rendering"
  | "Floor Plan"
  | "Site Plan"
  | "Land/Plot"
  | "Other";

export interface UploadedDocument {
  id: string;
  file: File;
  type?: DocumentType;
  ocrStatus?: "pending" | "processing" | "complete" | "failed";
  extractedData?: DocumentOCRData;
}

/**
 * Represents a document type that the property has, regardless of whether
 * the actual file was uploaded. Used to track which documents exist for a
 * property even when the seller hasn't uploaded them for verification.
 */
export interface DeclaredDocument {
  id: string;
  type: DocumentType;
  uploaded: boolean;
  file?: File;
  ocrStatus?: "pending" | "processing" | "complete" | "failed";
  extractedData?: DocumentOCRData;
}

export interface DocumentOCRData {
  ownerName?: string;
  registrationNumber?: string;
  issueDate?: string;
  plotNumber?: string;
  landSize?: string;
  coordinates?: string;
  propertyType?: string;
  previousOwner?: string;
  acquisitionType?: "purchase" | "allocation" | "inheritance" | "gift";
  surveyNumber?: string;
  surveyDate?: string;
  boundaries?: string;
  confidence: {
    ownerName: number;
    registrationNumber: number;
    landSize: number;
    overall: number;
  };
}

export interface UploadedPhoto {
  id: string;
  file: File;
  category?: PhotoCategory;
  label?: PhotoLabel;
  customLabel?: string;
  preview: string;
  aiAnalysis?: PhotoAIAnalysis;
}

export interface PhotoAIAnalysis {
  detectedRooms?: Array<{
    type: "bedroom" | "bathroom" | "living" | "kitchen" | "dining";
    confidence: number;
  }>;
  detectedAmenities?: Array<{
    name: string;
    confidence: number;
  }>;
  constructionStage?: {
    stage: "foundation" | "structure" | "roofing" | "finishing" | "complete";
    completionPercentage: number;
    confidence: number;
  };
  propertyCondition?: {
    rating: "excellent" | "good" | "fair" | "poor";
    finishQuality: "luxury" | "standard" | "basic";
    confidence: number;
  };
  occupancyStatus?: {
    status: "vacant" | "furnished" | "occupied";
    confidence: number;
  };
}

export interface AIInferredData {
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  landSize?: string;
  ownerName?: string;
  yearAcquired?: number;
  acquisitionMethod?: string;
  previousOwners?: string[];
  amenities?: string[];
  constructionStatus?: string;
  completionPercentage?: number;
  currentUse?: "owner-occupied" | "rented" | "vacant" | "commercial";
  hasEncumbrances?: boolean;
  hasDisputes?: boolean;
  suggestedPriceRange?: { min: number; max: number };
  marketComparables?: Array<{ address: string; price: number }>;
  location?: string;
  documentAnalysis?: {
    titleType?: string;
    state?: string;
    lga?: string;
    registrationNumber?: string;
    titleNumber?: string;
    transferDate?: string;
    governorsConsent?: { status?: string; number?: string; date?: string };
    powerOfAttorney?: { exists?: boolean; details?: string };
    landSizeSource?: string;
    surveyNumber?: string;
    surveyDate?: string;
    surveyorName?: string;
    surveyorLicense?: string;
    gpsCoordinates?: string;
    boundaryDescriptions?: string;
    leaseType?: string;
    leaseStartDate?: string;
    leaseExpiryDate?: string;
    remainingYears?: string;
    groundRent?: string;
    groundRentStatus?: string;
    paymentTerms?: string;
    outstandingBalance?: string;
    propertyTax?: {
      year?: string;
      amount?: string;
      status?: string;
      assessedValue?: string;
    };
    buildingApproval?: {
      approvalNumber?: string;
      floors?: string;
      zoningCompliance?: string;
      approvalDate?: string;
    };
    utilities?: {
      electricity?: {
        provider?: string;
        meterNumber?: string;
        connectionStatus?: string;
      };
      water?: { provider?: string; connectionStatus?: string };
    };
  };
  photoAnalysis?: {
    roofType?: string;
    propertyCondition?: string;
    finishingQuality?: string;
  };
  confidence: {
    [key: string]: number;
  };
  flags: Array<{
    type: "warning" | "error" | "info";
    field: string;
    message: string;
    requiresVerification: boolean;
    sourceType?: "document" | "photo";
  }>;

  // Raw API response data for additional context
  _rawApiResponse?: {
    documentCount?: number;
    documentTypes?: string[];
    riskScore?: number;
    riskLevel?: string;
    verificationStatus?: string;
    crossValidationResults?: any;
    recommendations?: any;
    extractions?: any[];
  };
}

// Investment Analysis Data from Real Estate Engine API
export interface PropertyIntelligenceData {
  property_details: {
    price: number;
    location: string;
    specs: {
      bed: number;
      bath: number;
      size: string;
    };
    userId: string;
    title: string;
    features: string;
  };
  location_intelligence: {
    coordinates: {
      lat: number;
      lng: number;
    };
    district: string;
    accessibility: {
      to_victoria_island_minutes: number;
      to_airport_minutes: number;
      to_lekki_ftz_minutes: number;
      to_ikeja_mall_minutes: number;
      to_marina_minutes: number;
      to_third_mainland_bridge_minutes: number;
    };
    nearby_schools: {
      count: number;
      distance_km: number;
      names: string[];
    };
    nearby_hospitals: {
      count: number;
      distance_km: number;
      names: string[];
    };
    nearby_shopping: {
      count: number;
      distance_km: number;
      names: string[];
    };
    infrastructure_projects: {
      [key: string]: {
        distance_km: number;
        expected_value_increase_pct: string;
      };
    };
  };
  investment_analysis: {
    total_investment_breakdown: {
      purchase_price: number;
      legal_fees: number;
      legal_fees_pct: number;
      agency_fees: number;
      agency_fees_pct: number;
      survey_fees: number;
      survey_fees_pct: number;
      stamp_duty: number;
      stamp_duty_pct: number;
      land_registration: number;
      governors_consent: number;
      governors_consent_pct: number;
      total_investment: number;
      additional_costs_pct: number;
    };
    annual_rental_income: {
      net_rental_income: number;
      gross_yield_pct: number;
      net_yield_pct: number;
      rental_range_min: number;
      rental_range_max: number;
    };
    meta: {
      rent_source: string;
    };
  };
  value_projection: {
    annual_appreciation_pct: number;
    historical_avg_pct: number;
    year_1: { value: number; gain_pct: number };
    year_2: { value: number; gain_pct: number };
    year_3: { value: number; gain_pct: number };
    year_4: { value: number; gain_pct: number };
    year_5: { value: number; gain_pct: number };
    projected_gain_5_year: number;
  };
  cash_flow_forecast: {
    year_1: { rental_income: number; expenses: number; net_cash_flow: number };
    year_2: { rental_income: number; expenses: number; net_cash_flow: number };
    year_3: { rental_income: number; expenses: number; net_cash_flow: number };
    year_4: { rental_income: number; expenses: number; net_cash_flow: number };
    year_5: { rental_income: number; expenses: number; net_cash_flow: number };
  };
}

// Request payload for analysis API
export interface AnalysisRequest {
  price: number;
  location: string;
  specs: {
    bed: number;
    bath: number;
    size: string;
  };
  userId: string;
  title: string;
  features: string;
}

export interface PropertyUploadData {
  address: string;
  addressState?: string;
  addressLga?: string;
  addressCity?: string;
  propertyFlowType?: "completed" | "off-plan" | "land-only";
  bedroomsInput?: number;
  bathroomsInput?: number;
  askingPrice: number;
  documents: UploadedDocument[];
  declaredDocuments: DeclaredDocument[];
  photos: UploadedPhoto[];
  aiInferredData?: AIInferredData;
  intelligenceData?: PropertyIntelligenceData; // Investment analysis data
  confirmedData?: {
    propertyType: string;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    landSize?: string;
    currentUse?: string;
    amenities?: string[];
    acquisitionMethod?: string;
    yearAcquired?: number;
    hasEncumbrances: boolean;
    hasDisputes: boolean;
    additionalNotes?: string;
    titleType?: string;
  };
  enhancedData?: {
    virtualTourUrl?: string;
    paymentPlans?: string;
    developerInfo?: string;
    expectedCompletion?: string;
    constructionMilestones?: Array<{
      name: string;
      expectedDate: string;
      status: "complete" | "in-progress" | "pending";
    }>;
    lastConstructionUpdate?: string;
  };
}
