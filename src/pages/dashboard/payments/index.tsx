import dynamic from "next/dynamic";
const PaymentsView = dynamic(() => import("@/views/dashboard/PaymentsView"), {
  ssr: false,
});
export default function PaymentsPage() {
  return <PaymentsView />;
}
