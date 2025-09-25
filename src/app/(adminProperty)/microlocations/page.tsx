import dynamic from "next/dynamic";

const MicrolocationsView = dynamic(
  () => import("@/views/dashboard/MicrolocationsView"),
  { ssr: false }
);

export default function MicrolocationsPage() {
  return <MicrolocationsView />;
}
