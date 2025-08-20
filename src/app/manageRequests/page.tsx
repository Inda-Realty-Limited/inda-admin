import "../globals.css";
const myOrder = [
  {
    request: "01",
    id: "ORD-20250817-48921",
    type: "Instant Report",
    delivery: "2025-08-15",
    questionnaire: "View",
    action: "Process Order",
  },
];

export default function manageRequests() {
  return (
    <div className="m-30">
      <h1 className="text-4xl font-bold pb-10">Manage Requests</h1>
      <div>
        <div className="grid grid-cols-7 gap-x-10 w-full mb-5 text-xl text-[#4ea8a1] font-semibold text-center">
          <div className="col-span-1">SALES REQUESTS</div>
          <div className="col-span-2">ORDER ID</div>
          <div className="col-span-1">PRODUCT TYPE</div>
          <div className="col-span-1">DELIVERY DATE</div>
          <div className="col-span-1">QUESTIONNAIRE FILLED</div>
          <div className="col-span-1">ACTIONS</div>
        </div>

        <div>
          {myOrder.map((order) => {
            return (
              <div
                key={order.id}
                className="grid  grid-cols-7 gap-x-10 w-full mb-10"
              >
                <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1 text-center">
                  {order.request}
                </div>
                <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-2">
                  {order.id}
                </div>
                <div className="text-center border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1">
                  {order.type}
                </div>
                <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1 text-center">
                  {order.delivery}
                </div>
                <div className="border-solid border-1 border-[#4ea8a1] p-3 rounded-lg col-span-1 text-center">
                  {order.questionnaire}
                </div>
                <button className="bg-[#4ea8a1] text-[#f9f9f9] rounded-lg">
                  {order.action}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
