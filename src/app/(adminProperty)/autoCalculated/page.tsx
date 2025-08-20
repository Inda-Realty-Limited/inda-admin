const financialMetricsFields = [
  { label: "Inflation-Adjusted Price", row: 1, col: 1 },
  { label: "Annualized Price Growth (1%)", row: 1, col: 2 },
  { label: "Annual Gross Rent", row: 2, col: 1 },
  { label: "Rental Appreciation Rate", row: 2, col: 2 },
  { label: "Total Purchase Cost", row: 3, col: 1 },
  { label: "Capital Gains Estimate", row: 3, col: 2 },
  { label: "ROI (%)", row: 4, col: 1 },
  { label: "Annualized ROI (%)", row: 4, col: 2 },
  { label: "Expected 5-Year Sale Price", row: 5, col: 1 },
  { label: "Rental Yield", row: 5, col: 2 },
];

const riskAssessmentFields = [
  { label: "Net Yield", row: 1, col: 1 },
  { label: "Mortgage Monthly Payment", row: 1, col: 2 },
  { label: "RICS-Style Fair Market Value", row: 2, col: 1 },
  { label: "Market Liquidity Risk Score", row: 2, col: 2 },
  { label: "Developer Risk Level", row: 3, col: 1 },
  { label: "Legal Risk Score", row: 3, col: 2 },
];

export default function autoCalculated() {
  return (
    <div className="mt-10">
      <div className="border-solid border-1 border-[#E5E5E5] rounded-4xl p-10 mb-10">
        <h1 className="text-4xl text-[#101820] mb-10 font-bold w-full">
          Finacial Metrics
        </h1>
        <div className="grid grid-rows-5 grid-cols-2 gap-x-50 gap-y-10 max-lg:gap-x-30 max-md:gap-x-15">
          {financialMetricsFields.map((field) => (
            <div
              key={field.label}
              className={`row-start-${field.row} row-end-${
                field.row + 1
              } col-start-${field.col} col-end-${field.col + 1}`}
            >
              <label className="label">{field.label}</label>
              <input className="input w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="border-solid border-1 border-[#E5E5E5] rounded-4xl p-10">
        <h1 className="text-4xl text-[#101820] mb-10 font-bold w-full">
          Risk Assessment
        </h1>
        <div className="grid grid-rows-3 grid-cols-2 gap-x-50 gap-y-10 max-lg:gap-x-30 max-md:gap-x-15">
          {riskAssessmentFields.map((field) => (
            <div
              key={field.label}
              className={`row-start-${field.row} row-end-${
                field.row + 1
              } col-start-${field.col} col-end-${field.col + 1}`}
            >
              <label className="label">{field.label}</label>
              <input className="input w-full" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-semibold py-5">Inda Score</h1>
      </div>
    </div>
  );
}
