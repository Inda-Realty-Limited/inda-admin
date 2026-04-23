import { useState } from "react";
import {
    TrendingUp,
    Video,
    User,
    Calendar,
    X,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { PropertyUploadData } from "./types";

interface Phase4EnhancementProps {
    enhancedData?: PropertyUploadData['enhancedData'];
    propertyType?: string;
    onAdd: (field: string, value: any) => void;
    onSkip: () => void;
    onComplete: () => void;
    isLoading?: boolean;
    error?: string;
}

export function Phase4Enhancement({
    enhancedData,
    propertyType,
    onAdd,
    onSkip,
    onComplete,
    isLoading,
    error
}: Phase4EnhancementProps) {
    const [virtualTour, setVirtualTour] = useState(enhancedData?.virtualTourUrl || "");
    const [paymentPlans, setPaymentPlans] = useState(enhancedData?.paymentPlans || "");
    const [developerInfo, setDeveloperInfo] = useState(enhancedData?.developerInfo || "");

    // Off-plan specific fields
    const [expectedCompletion, setExpectedCompletion] = useState(enhancedData?.expectedCompletion || "");
    const [milestones, setMilestones] = useState<Array<{
        name: string;
        expectedDate: string;
        status: "complete" | "in-progress" | "pending";
    }>>(enhancedData?.constructionMilestones || [
        { name: "Foundation Complete", expectedDate: "", status: "pending" },
        { name: "Roofing Complete", expectedDate: "", status: "pending" },
        { name: "Finishing Phase", expectedDate: "", status: "pending" }
    ]);

    const isOffPlan = propertyType?.toLowerCase().includes("off-plan") ||
        propertyType?.toLowerCase().includes("construction");

    const hasAnyEnhancement = virtualTour || paymentPlans || developerInfo ||
        (isOffPlan && expectedCompletion);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#e8f5f4] to-white border border-[#4ea8a1]/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <TrendingUp className="w-6 h-6 text-[#4ea8a1] mt-0.5" />
                    <div>
                        <h3 className="font-medium text-gray-900 mb-1">Boost Your Listing (Optional)</h3>
                        <p className="text-sm text-gray-600">
                            Adding these details can increase buyer interest by up to 60%. You can skip and add them later.
                        </p>
                    </div>
                </div>
            </div>

            {/* Enhancement Options */}
            <div className="space-y-4">
                {/* Virtual Tour */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Video className="w-5 h-5 text-[#4ea8a1]" />
                        <span className="font-medium text-gray-900">Virtual Tour Link</span>
                        <span className="text-xs text-gray-500 bg-green-100 text-green-700 px-2 py-1 rounded">+40% interest</span>
                    </div>
                    <input
                        type="url"
                        value={virtualTour}
                        onChange={(e) => {
                            setVirtualTour(e.target.value);
                            onAdd("virtualTourUrl", e.target.value);
                        }}
                        placeholder="https://tour.example.com/property"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Add a link to your virtual tour or video walkthrough</p>
                </div>

                {/* Payment Plans */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <span>₦</span>
                        <span className="font-medium text-gray-900">Payment Plans</span>
                        <span className="text-xs text-gray-500 bg-green-100 text-green-700 px-2 py-1 rounded">+35% inquiries</span>
                    </div>
                    <textarea
                        value={paymentPlans}
                        onChange={(e) => {
                            setPaymentPlans(e.target.value);
                            onAdd("paymentPlans", e.target.value);
                        }}
                        placeholder="E.g., Outright: 5% discount | 6 months: 50% down + 50% over 6 months | 12 months: 40% down + 60% over 12 months"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Describe available payment options</p>
                </div>

                {/* Developer Info */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-[#4ea8a1]" />
                        <span className="font-medium text-gray-900">Developer/Warranty Info</span>
                        <span className="text-xs text-gray-500 bg-green-100 text-green-700 px-2 py-1 rounded">+25% trust</span>
                    </div>
                    <textarea
                        value={developerInfo}
                        onChange={(e) => {
                            setDeveloperInfo(e.target.value);
                            onAdd("developerInfo", e.target.value);
                        }}
                        placeholder="E.g., Landwey Investment Ltd - 15+ years, 3,000+ units. 10-year structural warranty included."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Add developer track record and warranty details</p>
                </div>

                {/* Off-Plan Construction Schedule */}
                {isOffPlan && (
                    <>
                        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-900">Off-Plan Schedule (Important!)</span>
                                <span className="text-xs text-white bg-blue-600 px-2 py-1 rounded">Required for Off-Plan</span>
                            </div>

                            {/* Expected Completion Date */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Expected Completion Date
                                </label>
                                <input
                                    type="date"
                                    value={expectedCompletion}
                                    onChange={(e) => {
                                        setExpectedCompletion(e.target.value);
                                        onAdd("expectedCompletion", e.target.value);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
                                />
                                <p className="text-xs text-gray-600 mt-1">When do you expect construction to be complete?</p>
                            </div>

                            {/* Construction Milestones */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Construction Milestones
                                </label>
                                <p className="text-xs text-gray-600 mb-3">
                                    Add key milestones so buyers can track progress. You'll update these monthly with photos.
                                </p>

                                <div className="space-y-3">
                                    {milestones.map((milestone, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={milestone.name}
                                                    onChange={(e) => {
                                                        const updated = [...milestones];
                                                        updated[idx].name = e.target.value;
                                                        setMilestones(updated);
                                                        onAdd("constructionMilestones", updated);
                                                    }}
                                                    placeholder="Milestone name (e.g., Foundation Complete)"
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent mb-2"
                                                />
                                                <input
                                                    type="date"
                                                    value={milestone.expectedDate}
                                                    onChange={(e) => {
                                                        const updated = [...milestones];
                                                        updated[idx].expectedDate = e.target.value;
                                                        setMilestones(updated);
                                                        onAdd("constructionMilestones", updated);
                                                    }}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
                                                />
                                            </div>
                                            <select
                                                value={milestone.status}
                                                onChange={(e) => {
                                                    const updated = [...milestones];
                                                    updated[idx].status = e.target.value as "complete" | "in-progress" | "pending";
                                                    setMilestones(updated);
                                                    onAdd("constructionMilestones", updated);
                                                }}
                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#4ea8a1] focus:border-transparent"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="complete">Complete</option>
                                            </select>
                                            {milestones.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        const updated = milestones.filter((_, i) => i !== idx);
                                                        setMilestones(updated);
                                                        onAdd("constructionMilestones", updated);
                                                    }}
                                                    className="text-red-600 hover:text-red-700 p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        const updated = [...milestones, { name: "", expectedDate: "", status: "pending" as const }];
                                        setMilestones(updated);
                                    }}
                                    className="mt-3 w-full px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-[#4ea8a1] hover:text-[#4ea8a1] text-sm font-medium"
                                >
                                    + Add Another Milestone
                                </button>
                            </div>

                            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                <p className="text-xs text-blue-800">
                                    <strong>💡 Pro Tip:</strong> You'll be reminded monthly to upload construction progress photos.
                                    Regular updates keep buyers engaged and build trust!
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                    onClick={onSkip}
                    disabled={isLoading}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
                >
                    Skip - Publish Now
                </button>
                <button
                    onClick={onComplete}
                    disabled={isLoading}
                    className="px-6 py-3 bg-[#4ea8a1] text-white rounded-lg hover:bg-[#3d9691] font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            {hasAnyEnhancement ? "Save & Publish Property" : "Publish Property"}
                            <CheckCircle2 className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
