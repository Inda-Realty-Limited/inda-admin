import "../globals.css";
import { CiSearch } from "react-icons/ci";
import { RiArrowDropDownLine } from "react-icons/ri";

const listing = [
  {
    property: "The Grand Residences",
    status: "Completed",
    type: "Property Name",
    price: "$550,000",
    date: "2023-08-15",
    actions: "",
  },
];

export default function allListings() {
  return (
    <div className="m-20 border-solid border-1 border-[#E5E5E5] rounded-xl p-20">
      <div>
        <div>
          <h1 className="font-bold text-4xl mb-10 inline-block">
            All Listings
          </h1>
          <div className="text-right">
            <button className="text-right bg-[#e5e5e5] p-3 mb-5 rounded-lg">
              Add New Listing
            </button>
          </div>
        </div>
        <div className="border-solid border-1 border-[#4ea8a1] text-[#4ea8a1] flex p-3 rounded-lg mb-7">
          <CiSearch size={30} className=" text-[#4ea8a1] pr-5" />
          <input
            className="w-full border-none focus:outline-none"
            placeholder="Search by property name or address"
          />
        </div>
        <div className="mb-5">
          <button className="bg-[#4ea8a199] text-[#f9f9f9] mr-10 p-2 w-50 rounded-lg">
            Completed Status
            <RiArrowDropDownLine size={40} className="inline-block" />
          </button>
          <button className="bg-[#4ea8a199] text-[#f9f9f9] mr-10 w-50 p-2 rounded-lg">
            Type <RiArrowDropDownLine size={40} className="inline-block" />
          </button>
          <button className="bg-[#4ea8a199] text-[#f9f9f9] mr-10 p-2 w-50 rounded-lg">
            Price Range{" "}
            <RiArrowDropDownLine size={40} className="inline-block" />
          </button>
          <button className="bg-[#4ea8a199] text-[#f9f9f9] mr-10 p-2 w-50 rounded-lg">
            Date Added
            <RiArrowDropDownLine
              size={40}
              className="inline-block p-2 rounded-lg"
            />
          </button>
        </div>
        <div>
          <div className="grid grid-cols-6 gap-x-10 w-full mb-5 text-xl text-[#101820] font-semibold">
            <div className="col-span-1 text-center">PROPERTY</div>
            <div className="col-span-1 text-center">COMPLETION STATUS</div>
            <div className="col-span-1 text-center">TYPE</div>
            <div className="col-span-1 text-center">PRICE RANGE</div>
            <div className="col-span-1 text-center">DATE ADDED</div>
            <div className="col-span-1 text-center">ACTIONS</div>
          </div>
        </div>
        <div>
          {listing.map((list) => {
            return (
              <div
                key={list.property}
                className="grid  grid-cols-6 gap-x-10 w-full mb-10"
              >
                <div className="col-span-1 text-center">{list.property}</div>
                <div className="bg-[#4ea8a129] p-3 rounded-lg col-span-1 text-center">
                  {list.status}
                </div>
                <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1 text-center">
                  {list.type}
                </div>
                <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1 text-center">
                  {list.price}
                </div>
                <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1 text-center">
                  {list.date}
                </div>
                <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1 text-center">
                  {list.actions}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
