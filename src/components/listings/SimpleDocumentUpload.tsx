import { Upload, X, FileText, AlertCircle, Check } from "lucide-react";
import { DocumentType, DeclaredDocument } from "./types";

interface SimpleDocumentUploadProps {
  declaredDocuments: DeclaredDocument[];
  onDeclareDocument: (type: DocumentType) => void;
  onRemoveDeclaredDocument: (id: string) => void;
  onDocumentFileUpload: (declaredDocId: string, file: File) => void;
  onRemoveDocumentFile: (declaredDocId: string) => void;
  error?: string;
}

export function SimpleDocumentUpload({
  declaredDocuments,
  onDeclareDocument,
  onRemoveDeclaredDocument,
  onDocumentFileUpload,
  onRemoveDocumentFile,
  error,
}: SimpleDocumentUploadProps) {
  const documentTypes: DocumentType[] = [
    "Title Document (C of O, Deed, etc.)",
    "Survey Plan",
    "Deed of Assignment",
    "Deed of Sublease",
    "Building Approval",
    "Tax Receipt",
    "Ground Rent Receipt",
    "Utility Bill",
    "Purchase Receipt",
    "Governor's Consent",
    "Power of Attorney",
    "Other",
  ];

  // Filter out already-declared types (except "Other" which can be declared multiple times)
  const availableTypes = documentTypes.filter(
    (type) =>
      type === "Other" || !declaredDocuments.some((d) => d.type === type),
  );

  const hasTitleDoc = declaredDocuments.some(
    (d) => d.type === "Title Document (C of O, Deed, etc.)",
  );
  const hasSurveyPlan = declaredDocuments.some((d) => d.type === "Survey Plan");
  const uploadedCount = declaredDocuments.filter((d) => d.uploaded).length;
  const notUploadedCount = declaredDocuments.filter((d) => !d.uploaded).length;

  const handleFileSelect = (declaredDocId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      return; // File too large
    }

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      return; // Unsupported format
    }

    onDocumentFileUpload(declaredDocId, file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        1. Property Documents <span className="text-red-500">*</span>
      </label>
      <p className="text-sm text-gray-600 mb-3">
        Select which documents this property has. You can optionally upload the
        files for verification.
      </p>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-900 mb-1">
              How this works:
            </p>
            <p className="text-xs text-blue-700">
              <strong>1. Select document types</strong> your property has
              (required). <strong>2. Upload files</strong> if available
              (optional but recommended). Documents not uploaded will be marked
              as <strong>&quot;not uploaded for verification&quot;</strong> on
              the report.
            </p>
          </div>
        </div>
      </div>

      {/* Add Document Type Dropdown */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Add a document type this property has:
        </label>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              onDeclareDocument(e.target.value as DocumentType);
              e.target.value = "";
            }
          }}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent bg-white"
        >
          <option value="">-- Select a document type to add --</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Declared Documents List */}
      {declaredDocuments.length > 0 && (
        <div className="space-y-3 mb-4">
          {declaredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <FileText
                    className={`w-5 h-5 flex-shrink-0 ${doc.uploaded ? "text-[#4ea8a1]" : "text-amber-500"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {doc.type}
                    </p>
                    {doc.uploaded && doc.file ? (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {doc.file.name} ({(doc.file.size / 1024).toFixed(0)} KB)
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600">
                        Not uploaded &mdash; will show as &quot;not
                        verified&quot; on report
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveDeclaredDocument(doc.id)}
                  className="text-red-600 hover:text-red-800 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* File Upload Area */}
              {doc.uploaded && doc.file ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-xs text-green-700">
                    File uploaded for verification
                  </span>
                  <button
                    onClick={() => onRemoveDocumentFile(doc.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id={`doc-upload-${doc.id}`}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(doc.id, e.target.files)}
                    className="hidden"
                  />
                  <label
                    htmlFor={`doc-upload-${doc.id}`}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-[#4ea8a1] hover:text-[#4ea8a1] cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload file (optional) &mdash; PDF, JPG, PNG up to 10MB
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status Summary */}
      {declaredDocuments.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 mb-2">
                Document Summary:
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {hasTitleDoc ? (
                    <span className="text-green-600 text-xs">
                      &#10003; Title Document
                    </span>
                  ) : (
                    <span className="text-orange-600 text-xs">
                      &#9675; Title Document (recommended)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasSurveyPlan ? (
                    <span className="text-green-600 text-xs">
                      &#10003; Survey Plan
                    </span>
                  ) : (
                    <span className="text-orange-600 text-xs">
                      &#9675; Survey Plan (recommended)
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {declaredDocuments.length} document type
                  {declaredDocuments.length !== 1 ? "s" : ""} declared
                  {uploadedCount > 0 && (
                    <span className="text-green-600 font-medium">
                      {" "}
                      &bull; {uploadedCount} uploaded
                    </span>
                  )}
                  {notUploadedCount > 0 && (
                    <span className="text-amber-600 font-medium">
                      {" "}
                      &bull; {notUploadedCount} not uploaded
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
