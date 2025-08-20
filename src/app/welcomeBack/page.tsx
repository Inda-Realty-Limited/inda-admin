import "../globals.css";

const listing = [
  { name: "Properties", amount: 12345, crease: "+12 this week" },
  { name: "Developers", amount: 678, crease: "" },
  { name: "Agents", amount: 910, crease: "" },
  { name: "Claimed Profiles", amount: 1121, crease: "" },
  { name: "Pending Requests", amount: 131, crease: "" },
  { name: "Users", amount: 1289, crease: "+12 this week" },
  { name: "New Sales Requests", amount: 16, crease: "" },
];

export default function welcomeBack() {
  const presentDay = new Date();
  return (
    <div className="m-10 my-20">
      <h1 className="font-bold text-6xl max-xl:text-4xl max-sm:text-2xl">
        Welcome back, Admin
      </h1>
      <p className="text-[#4EA8A1] pt-3 pb-5">Today is </p>
      <div className="flex flex-wrap">
        {listing.map((list) => {
          return (
            <div
              key={list.name}
              className="w-1/5 p-5 pl-0 max-xl:w-1/4 max-lg:w-1/3 max-md:w-1/2 max-sm:w-full"
            >
              <div className="p-5 bg-[#4ea8a129] rounded-xl h-38">
                <p className="font-semibold">{list.name}</p>
                <h2 className="font-bold text-2xl py-3">{list.amount}</h2>
                <p className="text-[#08872B]">{list.crease}</p>
              </div>
              <button className="bg-[#4EA8A1] text-[#f9f9f9] rounded-lg w-full mt-3 p-3">
                Manage {list.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
