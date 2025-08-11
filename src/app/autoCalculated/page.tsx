export default function autoCalculated() {
  return (
    <div className="mt-10">
      <div className="border-solid border-1 border-[#E5E5E5] rounded-4xl p-10 mb-10">
        <h1 className="text-4xl text-[#101820] mb-10 font-bold w-full">
          Finacial Metrics
        </h1>
        <div className="grid grid-rows-5 grid-cols-2 gap-x-50 gap-y-10 max-lg:gap-x-30 max-md:gap-x-15">
          <div className="row-start-1 row-end-2 col-start-1 col-end-2">
            <label className="label">Inflation-Adjusted Price</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-1 row-end-2 col-start-2 col-end-3">
            <label className="label">Annualized Price Growth (1%)</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-2 row-end-3 col-start-1 col-end-2">
            <label className="label">Annual Gross Rent</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-2 row-end-3 col-start-2 col-end-3">
            <label className="label">Rental Appreciation Rate</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-3 row-end-4 col-start-1 col-end-2">
            <label className="label">Total Purchase Cost</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-3 row-end-4 col-start-2 col-end-3">
            <label className="label">Capital Gains Estimate</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-4 row-end-5 col-start-1 col-end-2">
            <label className="label">ROI (%)</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-4 row-end-5 col-start-2 col-end-3">
            <label className="label">Annualized ROI (%)</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-5 row-end-6 col-start-1 col-end-2">
            <label className="label">Expected 5-Year Sale Price</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-5 row-end-6 col-start-2 col-end-3">
            <label className="label">Rental Yield</label>
            <input className="input w-full" />
          </div>
        </div>
      </div>
      <div className="border-solid border-1 border-[#E5E5E5] rounded-4xl p-10">
        <h1 className="text-4xl text-[#101820] mb-10 font-bold w-full">
          Risk Assessment
        </h1>
        <div className="grid grid-rows-3 grid-cols-2 gap-x-50 gap-y-10 max-lg:gap-x-30 max-md:gap-x-15">
          <div className="row-start-1 row-end-2 col-start-1 col-end-2">
            <label className="label">Net Yield</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-1 row-end-2 col-start-2 col-end-3">
            <label className="label">Mortgage Monthly Payment</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-2 row-end-3 col-start-1 col-end-2">
            <label className="label">RICS-Style Fair Market Value</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-2 row-end-3 col-start-2 col-end-3">
            <label className="label">Market Liquidity Risk Score</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-3 row-end-4 col-start-1 col-end-2">
            <label className="label">Developer Risk Level</label>
            <input className="input w-full" />
          </div>
          <div className="row-start-3 row-end-4 col-start-2 col-end-3">
            <label className="label">Legal Risk Score</label>
            <input className="input w-full" />
          </div>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-semibold py-5">Inda Score</h1>
      </div>
    </div>
  );
}
