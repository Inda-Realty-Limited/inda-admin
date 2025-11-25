import React from 'react';

interface AutoCalculatedTabProps {
  listingId?: string;
  data?: any;
}

export const AutoCalculatedTab: React.FC<AutoCalculatedTabProps> = ({ 
  listingId, 
  data 
}) => {
  const fields = [
    { label: "Fair Market Value (FMV)", placeholder: "$500,000" },
    { label: "Financing Interest Rate (%)", placeholder: "4.5%" },
    { label: "Financing Term (Years)", placeholder: "30" },
    { label: "Holding Period", placeholder: "5 years" },
    { label: "Avg Rental Yield (%) – Long Term", placeholder: "8.5%" },
    { label: "Avg Rental Yield (%) – Short Term", placeholder: "12%" },
    { label: "Projected Annual Appreciation (Local)", placeholder: "3%" },
    { label: "Projected Annual Appreciation (FX & Inflation Adjusted)", placeholder: "2.8%" },
    { label: "Total Expense", placeholder: "$50,000" },
    { label: "Asset Value Change (Net) Last 6 Months", placeholder: "+5%" },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Financial Metrics
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {fields.map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <input
              type="text"
              readOnly
              placeholder={field.placeholder}
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm focus:border-[#4EA8A1] focus:ring-[#4EA8A1] p-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
