import { useState } from "react";
import { CheckCircle2, TrendingUp, Eye, AlertTriangle, Info } from "lucide-react";
import { PropertyUploadData } from "./types";


export interface Phase5CompleteProps {
    uploadData: PropertyUploadData;
    savedListing?: {
        _id?: string;
        indaTag?: string;
        [key: string]: any;
    };
    onViewProperty: () => void;
    onClose: () => void;
}


export function Phase5Complete({
    uploadData,
    savedListing,
    onViewProperty,
    onClose
}: Phase5CompleteProps) {
    const [copied, setCopied] = useState(false);

    // Generate shareable link using the actual listing ID
    const listingId = savedListing?._id || savedListing?.indaTag;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://investinda.com";
    const shareableLink = listingId
        ? `${baseUrl}/property/${listingId}`
        : `${baseUrl}/listings`;

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(shareableLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    const missingFields = uploadData.aiInferredData?.flags
        ?.filter((f: any) => f.requiresVerification)
        .map((f: any) => f.field) || [];

    // Get data from savedListing (actual saved data) with fallback to uploadData
    const displayPrice = savedListing?.purchasePrice
        || savedListing?.priceNGN
        || uploadData.askingPrice
        || 0;
    const displayLocation = savedListing?.fullAddress
        || savedListing?.address
        || savedListing?.microlocation
        || uploadData.address
        || "N/A";
    const displayPropertyType = savedListing?.propertyType
        || uploadData.confirmedData?.propertyType
        || "N/A";

    // Calculate tiered completeness with weighted categories
    const calculateCompleteness = () => {
        const isFilled = (value: any) => value !== undefined && value !== null && value !== "" && value !== 0;
        const hasItems = (arr: any[] | undefined) => Array.isArray(arr) && arr.length > 0;

        // ESSENTIAL (40% weight) - Property type, Price, Address, Photos
        const essentialFields = [
            isFilled(savedListing?.propertyType || uploadData.confirmedData?.propertyType),
            isFilled(savedListing?.purchasePrice || savedListing?.priceNGN || uploadData.askingPrice),
            isFilled(savedListing?.fullAddress || savedListing?.address || uploadData.address),
            hasItems(savedListing?.images) || hasItems(uploadData.photos),
        ];
        const essentialScore = (essentialFields.filter(Boolean).length / essentialFields.length) * 40;

        // PROPERTY DETAILS (25% weight) - Bedrooms, Bathrooms, Size, Year built, Features
        const detailFields = [
            isFilled(savedListing?.bedrooms || uploadData.confirmedData?.bedrooms),
            isFilled(savedListing?.bathrooms || uploadData.confirmedData?.bathrooms),
            isFilled(savedListing?.size || uploadData.confirmedData?.landSize),
            isFilled(savedListing?.buildYear || uploadData.aiInferredData?.yearBuilt),
            hasItems(savedListing?.features) || hasItems(savedListing?.amenities) || hasItems(uploadData.aiInferredData?.amenities),
        ];
        const detailScore = (detailFields.filter(Boolean).length / detailFields.length) * 25;

        // LEGAL/DOCUMENTS (20% weight) - Documents uploaded, Title type, Owner name
        const legalFields = [
            hasItems(savedListing?.legalDocs) || hasItems(uploadData.documents),
            isFilled(savedListing?.titleType || uploadData.confirmedData?.titleType || uploadData.aiInferredData?.documentAnalysis?.titleType),
            isFilled(savedListing?.ownerName || uploadData.aiInferredData?.ownerName),
        ];
        const legalScore = (legalFields.filter(Boolean).length / legalFields.length) * 20;

        // ENHANCED (15% weight) - Virtual tour, Description, Construction status
        const enhancedFields = [
            isFilled(savedListing?.virtualTourUrl || uploadData.enhancedData?.virtualTourUrl),
            isFilled(savedListing?.description),
            isFilled(savedListing?.constructionStatus || uploadData.aiInferredData?.constructionStatus),
        ];
        const enhancedScore = (enhancedFields.filter(Boolean).length / enhancedFields.length) * 15;

        return Math.round(essentialScore + detailScore + legalScore + enhancedScore);
    };
    const completeness = calculateCompleteness();


    return (
        <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-50 to-[#e8f5f4] border border-green-200 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Property Published Successfully!</h3>
                <p className="text-gray-600">
                    Your listing is now live and ready to attract buyers. Share the link below to start getting inquiries.
                </p>
            </div>


            {/* Shareable Link Card */}
            <div className="bg-white border-2 border-[#4ea8a1] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-[#4ea8a1]" />
                    <h4 className="font-semibold text-gray-900">Your Shareable Property Link</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Share this link via WhatsApp, email, or social media. Track views and inquiries in your dashboard.
                </p>

                {/* Link Display & Copy */}
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="text"
                        value={shareableLink}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700"
                    />
                    <button
                        onClick={handleCopyLink}
                        className="px-4 py-3 bg-[#4ea8a1] text-white rounded-lg hover:bg-[#3d9691] font-medium whitespace-nowrap"
                    >
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                </div>


                {/* Quick Share Buttons */}
                <div className="flex gap-2">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent('Check out this property: ' + shareableLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center text-sm font-medium"
                    >
                        Share on WhatsApp
                    </a>
                    <a
                        href={`mailto:?subject=Property Listing&body=${encodeURIComponent('Check out this property: ' + shareableLink)}`}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center text-sm font-medium"
                    >
                        Share via Email
                    </a>
                </div>
            </div>


            {/* Property Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Listing Summary</h4>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Property Type</p>
                        <p className="font-medium text-gray-900">{displayPropertyType}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="font-medium text-gray-900">
                            &#8358;{typeof displayPrice === 'string'
                                ? parseInt(displayPrice.replace(/[^0-9]/g, '') || '0').toLocaleString()
                                : displayPrice.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <p className="font-medium text-gray-900">{displayLocation}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Completeness</p>
                        <p className={`font-medium ${completeness >= 80 ? 'text-green-600' : completeness >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {completeness}%
                        </p>
                    </div>
                </div>

                {missingFields.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900 mb-1">Items Requiring Attention</p>
                                <p className="text-xs text-yellow-700">
                                    These items may slow down deal closure. Consider adding them to improve buyer confidence:
                                </p>
                                <ul className="mt-2 space-y-1">
                                    {uploadData.aiInferredData?.flags?.map((flag: any, i: number) => (
                                        flag.requiresVerification && (
                                            <li key={i} className="text-xs text-yellow-800">- {flag.message}</li>
                                        )
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                    onClick={onViewProperty}
                    className="flex-1 px-6 py-3 bg-[#4ea8a1] text-white rounded-lg hover:bg-[#3d9691] font-medium flex items-center justify-center gap-2"
                >
                    <Eye className="w-5 h-5" />
                    View Property
                </button>
                <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                    Close
                </button>
            </div>


            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">What happens next?</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>- Buyers can view your property report immediately via the shareable link</li>
                            <li>- You'll receive WhatsApp notifications when buyers request more information</li>
                            <li>- Track views, shares, and inquiries in your dashboard analytics</li>
                            <li>- You can edit or enhance this listing anytime from your properties page</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
