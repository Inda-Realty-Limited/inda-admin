import dynamic from "next/dynamic";
const OrdersView = dynamic(() => import("@/views/dashboard/OrdersView"), {
  ssr: false,
});
export default function OrdersPage() {
  return <OrdersView />;
}
