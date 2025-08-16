// "use client";

// import { useState } from "react";

const broadInputFields = [
  { label: "Property ID", row: 1, col: 1 },
  { label: "Listing Platform URL", row: 1, col: 2 },
  { label: "Agent Name", row: 2, col: 1 },
  { label: "Contact Info on Listing (Phone)", row: 2, col: 2 },
  { label: "Agent Claimed? (Y/N)", row: 3, col: 1 },
  { label: "Developer Project", row: 3, col: 2 },
  { label: "Title/Property Name", row: 4, col: 1 },
  { label: "Listing Scraped/Uploaded Date", row: 4, col: 2 },
  { label: "Full Address", row: 5, col: 1, colSpan: 2 },
  { label: "State", row: 6, col: 1 },
  { label: "LGA", row: 6, col: 2 },
  { label: "Microlocation", row: 7, col: 1 },
  { label: "Property Type", row: 7, col: 2 },
];

// const narrowInputFields = [
//   { label: "Number of Units", row: 6, col: 1 },
//   { label: "Size (sqm)", row: 6, col: 1 },
//   { label: "State", row: 6, col: 1 },
//   { label: "Developer Name", row: 6, col: 1 },
//   { label: "Project Status", row: 6, col: 1 },
//   { label: "Delivery Timeline", row: 6, col: 1 },
//   { label: "Property tax", row: 6, col: 1 },
//   { label: "Source of Listing", row: 6, col: 1 },
//   { label: "Listing Verified?", row: 6, col: 1 },
//   { label: "Document Verified?", row: 6, col: 1 },
//   { label: "Zoning", row: 6, col: 1 },
//   { label: "Source of Historical Data", row: 6, col: 1 },
//   { label: "Property tax", row: 6, col: 1 },
//   { label: "Any Government Acquisition ID", row: 6, col: 1 },
//   { label: "Mortgage Options", row: 6, col: 1 },
// ];

// const historyField = [
//   { label: "Year Built", row: 1, col: 1 },
//   { label: "Year First Sold", row: 1, col: 2 },
//   { label: "Listing Price (#)", row: 1, col: 3 },
//   { label: "Historical Sale Prices", row: 1, col: 4 },
//   { label: "Current Rent (Monthly)", row: 2, col: 1 },
//   { label: "Annual Maintenance Cost", row: 2, col: 2 },
//   { label: "Vacancy Rate", row: 2, col: 3 },
//   { label: "Historical Rent", row: 2, col: 4 },
// ];

export default function AdminInput() {
  // const [submit, setSubmit] = useState<boolean>(false);
  // const [formData, setFormData] = useState<FormData>({

  // });
  // //   const [amenity, setAmenity] = useState("");
  // //   const [showUpload, setShowUpload] = useState(false);

  // function handleChange(field:string, value: FieldValue){
  //   setFormData((prev) => {
  //     return(
  //     ...prev,
  //      [field]: value)
  //   })
  // }

  // function handleCancel(){
  //   setFormData{}
  // }

  return (
    <div className="mt-7">
      <form>
        <div>
          <div>
            <div className="grid gap-x-50 grid-rows-7 grid-cols-2 gap-y-6 mb-8 max-2xl:gap-x-40 max-xl:gap-x-30 max-lg:gap-x-20">
              {broadInputFields.map((broad) => {
                return (
                  <div
                    key={broad.label}
                    className={`row-start-${broad.row} row-end-${
                      broad.row + 1
                    } col-start-${broad.col} col-end-[${
                      broad.col + 1
                    } col-span-${broad.colSpan}`}
                  >
                    <label className="label">{broad.label}</label>
                    <input className="input w-full" />
                  </div>
                );
              })}
            </div>
            <div className="grid gap-x-20 gap-y-6 grid-rows-5 grid-cols-3 mb-8 max-xl:gap-x-10 max-lg:grid-rows-8 max-lg:grid-cols-2 max-lg:gap-x-20 max-lg:gap-y-6">
              <div className="row-start-1 row-end-2 col-start-1 col-end-2 max-lg:row-start-1 max-lg:row-end-2 max-lg:col-start-1  max-lg:col-end-2">
                <label className="label">Number of Units</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-2 row-end-3 col-start-1 col-end-2 max-lg:row-start-3 max-lg:row-end-4 max-lg:col-start-1  max-lg:col-end-2">
                <label className="label">Developer Name</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-3 row-end-4 col-start-1 col-end-2 max-lg:row-start-4 max-lg:row-end-5 max-lg:col-start-2  max-lg:col-end-3">
                <label className="label">Property tax</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-4 row-end-5 col-start-1 col-end-2 max-lg:row-start-6 max-lg:row-end-7 max-lg:col-start-1  max-lg:col-end-2">
                <label className="label">Document Verified?</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-5 row-end-6 col-start-1 col-end-2 max-lg:row-start-7 max-lg:row-end-8 max-lg:col-start-2  max-lg:col-end-3">
                <label className="label">Property tax</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-1 row-end-2 col-start-2 col-end-3 max-lg:row-start-1 max-lg:row-end-2 max-lg:col-start-2  max-lg:col-end-3">
                <label className="label">Size (sqm)</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-2 row-end-3 col-start-2 col-end-3 max-lg:row-start-3 max-lg:row-end-4 max-lg:col-start-2  max-lg:col-end-3">
                <label className="label">Project Status</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-3 row-end-4 col-start-2 col-end-3 max-lg:row-start-5 max-lg:row-end-6 max-lg:col-start-1  max-lg:col-end-2">
                <label className="label">Source of Listing</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-4 row-end-5 col-start-2 col-end-3 max-lg:row-start-6 max-lg:row-end-7 max-lg:col-start-2  max-lg:col-end-3">
                <label className="label">Zoning</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-5 row-end-6 col-start-2 col-end-3 max-lg:row-start-8 max-lg:row-end-9 max-lg:col-start-1  max-lg:col-end-2">
                <label className="label">Any Government Acquisition ID</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-1 row-end-2 col-start-3 col-end-4 max-lg:row-start-2 max-lg:row-end-3 max-lg:col-start-1 max-lg:col-end-3">
                <div className="grid gap-x-5 grid-rows-1 grid-cols-2 max-lg:gap-x-15  max-md:gap-x-5">
                  <div className="row-start-1 row-end-2 col-start-1 col-end-2">
                    <label className="label">Bedrooms</label>
                    <input className="input lg:w-33 max-lg:w-60 max-md:w-45" />
                  </div>
                  <div className="row-start-1 row-end-2 col-start-2 col-end-3">
                    <label className="label">Bathrooms</label>
                    <input className="input lg:w-33 max-lg:w-60 max-md:w-45" />
                  </div>
                </div>
              </div>
              <div className="row-start-2 row-end-3 col-start-3 col-end-4 max-lg:row-start-4 max-lg:row-end-5 max-lg:col-start-1  max-lg:col-end-2">
                <label className="label">Delivery Timeline</label>
                <input className="input  w-full" />
              </div>
              <div className="row-start-3 row-end-4 col-start-3 col-end-4 max-lg:row-start-5 max-lg:row-end-6 max-lg:col-start-2  max-lg:col-end-3">
                <label className="label">Listing Verified?</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-4 row-end-5 col-start-3 col-end-4 max-lg:row-start-7 max-lg:row-end-8 max-lg:col-start-1  max-lg:col-end-2">
                <label className="label">Source of Historical Data</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-5 row-end-6 col-start-3 col-end-4 max-lg:row-start-8 max-lg:row-end-9 max-lg:col-start-2  max-lg:col-end-3">
                <label className="label">Mortgage Options</label>
                <input className="input w-full" />
              </div>
            </div>
            <div className="grid gap-x-10 gap-y-6 grid-rows-2 grid-cols-4 mb-8 max-lg:grid-rows-3 max-lg:grid-cols-3 max-md:grid-rows-4 max-md:grid-cols-2">
              <div className="row-start-1 row-end-2 col-start-1 col-end-2 max-lg:row-start-1 max-lg:row-end-2 max-lg:col-start-1 max-lg:col-end-2 max-md:row-start-1 max-md:row-end-2 max-md:col-start-1 max-md:col-end-2">
                <label className="label">Year Built</label>
                <input className="input w-full" />
              </div>

              <div className="row-start-1 row-end-2 col-start-2 col-end-3 max-lg:row-start-1 max-lg:row-end-2 max-lg:col-start-2 max-lg:col-end-3 max-md:row-start-1 max-md:row-end-2 max-md:col-start-2 max-md:col-end-3">
                <label className="label">Year First Sold</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-2 row-end-3 col-start-4 col-end-5 max-lg:row-start-2 max-lg:row-end-3 max-lg:col-start-2 max-lg:col-end-3 max-md:row-start-3 max-md:row-end-4 max-md:col-start-1 max-md:col-end-2">
                <label className="label">Historical Rent</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-1 row-end-2 col-start-3 col-end-4 max-lg:row-start-1 max-lg:row-end-2 max-lg:col-start-3 max-lg:col-end-4 max-md:row-start-2 max-md:row-end-3 max-md:col-start-1 max-md:col-end-2">
                <label className="label">Listing Price (#)</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-2 row-end-3 col-start-3 col-end-4 max-lg:row-start-2 max-lg:row-end-3 max-lg:col-start-3 max-lg:col-end-4 max-md:row-start-3 max-md:row-end-4 max-md:col-start-2 max-md:col-end-3">
                <label className="label">Vacancy Rate</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-1 row-end-2 col-start-4 col-end-5 max-lg:row-start-2 max-lg:row-end-3 max-lg:col-start-1 max-lg:col-end-2 max-md:row-start-2 max-md:row-end-3 max-md:col-start-2 max-md:col-end-3">
                <label className="label">Historical Sale Prices</label>
                <input className="input w-full" />
              </div>

              <div className="row-start-2 row-end-3 col-start-1 col-end-2 max-lg:row-start-3 max-lg:row-end-4 max-lg:col-start-1 max-lg:col-end-2 max-md:row-start-4 max-md:row-end-5 max-md:col-start-1 max-md:col-end-2">
                <label className="label max-lg:text-xs">
                  Current Rent (Monthly)
                </label>
                <input className="input w-full" />
              </div>
              <div className="row-start-2 row-end-3 col-start-2 col-end-3 max-lg:row-start-3 max-lg:row-end-4 max-lg:col-start-2 max-lg:col-end-3 max-md:row-start-4 max-md:row-end-5 max-md:col-start-2 max-md:col-end-3">
                <label className="label max-lg:text-xs">
                  Annual Maintenance Cost
                </label>
                <input className="input w-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20 max-lg:text-center">
          <h1 className="mb-5 text-[#4EA8A1] text-3xl font-bold">Uploads</h1>
          <div className="flex flex-wrap gap-x-10 gap-y-10">
            <div className="max-lg:mx-auto max-lg:my-0">
              <h2 className="text-center font-semibold mb-3 max-md:w-75">
                Title Documents
              </h2>
              <label htmlFor="fileInput" className="uploads">
                <span className="text-[#4EA8A1]">Click to upload</span> or drag
                and drop
                <br />
                <small>PDF, JPG, PNG(max. 5mb)</small>
              </label>
              <input
                type="file"
                accept=".pdf, .jpg, .png"
                id="fileInput"
                className="hidden"
              />
            </div>

            <div className="max-lg:mx-auto max-lg:my-0">
              <h2 className="text-center font-semibold mb-3 max-md:w-75">
                Upload Litigation Documents
              </h2>
              <label htmlFor="fileInput" className="uploads">
                <span className="text-[#4EA8A1]">Click to upload</span> drag and
                drop
                <br />
                <small>PDF, JPG, PNG(max. 5mb)</small>
              </label>
              <input
                type="file"
                accept=".pdf, .jpg, .png"
                id="fileInput"
                className="hidden"
              />
            </div>
          </div>
          <div>
            <h2 className="my-5 font-semibold">Property Images</h2>
            <div className="flex flex-wrap max-lg:ml-0 gap-y-10">
              <span className="w-1/3 max-xl:w-1/2">
                <label className="property">
                  <span className="text-[#4EA8A1]">Click to upload image</span>
                </label>

                <input className="hidden" type="file" accept=".jpg, .png" />
              </span>
              <span className="w-1/3 max-xl:w-1/2">
                <label className="property">
                  <span className="text-[#4EA8A1]">Click to upload image</span>
                </label>
                <input className="hidden" type="file" accept=".jpg, .png" />
              </span>
              <span className="w-1/3 max-xl:w-1/2">
                <label className="property">
                  <span className="text-[#4EA8A1]">Click to upload image</span>
                </label>
                <input className="hidden" type="file" accept=".jpg, .png" />
              </span>
            </div>
          </div>
          <div>
            <h2 className="my-5 font-semibold">Amenities</h2>
            <div className="flex flex-wrap gap-x-10 gap-y-10">
              <span className="max-lg:mx-auto max-lg:my-0">
                <label className="amenities">
                  <span className="text-[#4EA8A1]">Click to upload image</span>
                </label>

                <input className="hidden" type="file" accept=" .jpg, .png" />
                <h3 className="text-center font-md">Security</h3>
              </span>
              <span className="max-lg:mx-auto max-lg:my-0">
                <label className="amenities">
                  <span className="text-[#4EA8A1]">Click to upload image</span>
                </label>

                <input className="hidden" type="file" accept=" .jpg, .png" />
                <h3 className="text-center font-md">Electricity</h3>
              </span>
              {/* <span>
              <input
                type="text"
                placeholder="Type in a new amenity"
                value={amenity}
                onChange={(e) => setAmenity(e.target.value)}
              />
              <button onClick={() => setShowUpload(true)}>Add amenity</button>

              {showUpload && (
                <label className="amenities">
                  <span className="text-[#4EA8A1]">Click to upload Image</span>
                  <input type="file" className="hidden" />
                </label>
              )}
              {amenity && <h3>{amenity}</h3>}
            </span> */}
            </div>
          </div>
        </div>
        <div className="mt-10 text-right max-lg:text-center">
          <button className="bg-[#E5E5E5] rounded-full w-40 px-10 py-5 mr-5 max-md:w-30 max-md:py-3 font-semibold">
            Cancel
          </button>
          <button className="bg-[#4EA8A1] text-[#F9F9F9] rounded-full w-60 px-10 py-5 max-md:w-50 max-md:py-3 font-semibold">
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}

{
  /* <div className="row-start-1 row-end-2 col-start-1 col-end-2">
                <label className="label">Property ID</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-2 row-end-3 col-start-1 col-end-2">
                <label className="label">Agent Name</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-3 row-end-4 col-start-1 col-end-2">
                <label className="label">Agent Claimed? (Y/N)</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-4 row-end-5 col-start-1 col-end-2">
                <label className="label">Title/Property Name</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-5 row-end-6 col-start-1 col-end-3">
                <label className="label">Full Address</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-6 row-end-7 col-start-1 col-end-2">
                <label className="label">State</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-7 row-end-8 col-start-1 col-end-2">
                <label className="label">Microlocation</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-1 row-end-2 col-start-2 col-end-3">
                <label className="label">Listing Platform URL</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-2 row-end-3 col-start-2 col-end-3">
                <label className="label">Contact Info on Listing (Phone)</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-3 row-end-4 col-start-2 col-end-3">
                <label className="label">Developer Project</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-4 row-end-5 col-start-2 col-end-3">
                <label className="label">Listing Scraped/Uploaded Date</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-6 row-end-7 col-start-2 col-end-3">
                <label className="label">LGA</label>
                <input className="input w-full" />
              </div>
              <div className="row-start-7 row-end-8 col-start-2 col-end-3">
                <label className="label">Property Type</label>
                <input className="input w-full" />
              </div> */
}
