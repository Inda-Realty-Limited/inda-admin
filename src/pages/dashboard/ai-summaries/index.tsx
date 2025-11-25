import React from "react";

interface AISummariesTabProps {
  listingId?: string;
  data?: any;
}

export const AISummariesTab: React.FC<AISummariesTabProps> = ({
  listingId,
  data,
}) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        AI Summaries & Prompts
      </h3>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Executive Summary
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Concise analysis of investment potential and next steps
          </p>
          <textarea
            rows={4}
            readOnly
            className="w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm p-3 focus:border-[#4EA8A1] focus:ring-[#4EA8A1]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key Strengths
          </label>
          <textarea
            rows={3}
            readOnly
            className="w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm p-3 focus:border-[#4EA8A1] focus:ring-[#4EA8A1]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Risk Factors
          </label>
          <textarea
            rows={3}
            readOnly
            className="w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm p-3 focus:border-[#4EA8A1] focus:ring-[#4EA8A1]"
          />
        </div>
      </div>
    </div>
  );
};
