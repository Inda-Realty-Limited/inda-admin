export interface QuestionnaireFileRef {
  url: string;
  name?: string | null;
  contentType?: string | null;
  sizeBytes?: number | null;
  key?: string | null;
  bucket?: string | null;
}

export interface PropertyBasics {
  propertyDescription?: string | null;
  propertyAddress: string;
  listingLink?: string | null;
  propertyTypeCategory?: string | null;
  propertyType: string;
  propertyTypeOther?: string | null;
  propertyStatus: string;
  propertyStatusOther?: string | null;
}

export interface LegalDocuments {
  certificateOfOccupancyOrDeed?: QuestionnaireFileRef[] | null;
  surveyPlan?: QuestionnaireFileRef[] | null;
  governorsConsent?: QuestionnaireFileRef[] | null;
  zoningOrPermit?: QuestionnaireFileRef[] | null;
  [key: string]: QuestionnaireFileRef[] | null | undefined;
}

export interface BuyerInformation {
  fullName: string;
  email: string;
  phoneNumber: string;
  contactNotes?: string | null;
}

export interface SellerInformation {
  sellerType: string;
  sellerTypeOther?: string | null;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
}

export interface SiteAccessInformation {
  contactName: string;
  contactPhone: string;
  specialInstructions?: string | null;
}

export interface AdminNote {
  timestamp: string;
  note: string;
  statusChange: string;
}

export interface QuestionnaireMetadata {
  adminNotes?: AdminNote[];
  cancellationReason?: string;
  cancelledAt?: string;
  [key: string]: unknown;
}

export interface QuestionnaireUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  [key: string]: unknown;
}

export interface QuestionnaireListing {
  _id: string;
  url?: string;
  title?: string;
  location?: string;
  price?: number;
  [key: string]: unknown;
}

export type QuestionnairePlan = "deepDive" | "deeperDive";
export type QuestionnaireStatus = "submitted" | "paid" | "cancelled";

export interface Questionnaire {
  _id: string;
  userId: QuestionnaireUser;
  listingId?: QuestionnaireListing | null;
  plan: QuestionnairePlan;
  status: QuestionnaireStatus;
  propertyBasics: PropertyBasics;
  legalDocuments?: LegalDocuments | null;
  buyerInformation: BuyerInformation;
  sellerInformation?: SellerInformation | null;
  siteAccess?: SiteAccessInformation | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt?: string | null;
  lastPaymentReference?: string | null;
  metadata?: QuestionnaireMetadata;
  [key: string]: unknown;
}

export interface QuestionnaireStats {
  total: number;
  byStatus: Record<QuestionnaireStatus, number>;
  byPlan: Record<QuestionnairePlan, number>;
  recentSubmissions: number;
  revenue: {
    total: number;
    byPlan: Record<QuestionnairePlan, number>;
  };
  [key: string]: unknown;
}

export interface QuestionnairePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  [key: string]: unknown;
}

export interface QuestionnaireListResponse {
  questionnaires: Questionnaire[];
  pagination: QuestionnairePagination;
}

export interface QuestionnaireDetailResponse {
  questionnaire: Questionnaire;
  payment?: Record<string, unknown> | null;
}

export interface QuestionnaireUserSubmissions {
  user: QuestionnaireUser;
  questionnaires: Questionnaire[];
  total: number;
}

export type QuestionnaireSortField =
  | "createdAt"
  | "paidAt"
  | "status"
  | "plan"
  | string;

export type QuestionnaireSortOrder = "asc" | "desc";

export interface QuestionnaireFilters {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
  userId?: string;
  listingId?: string;
  search?: string;
  sortBy?: QuestionnaireSortField;
  sortOrder?: QuestionnaireSortOrder;
  startDate?: string;
  endDate?: string;
}
