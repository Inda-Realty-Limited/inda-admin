import dynamic from "next/dynamic";

const SettingsView = dynamic(() => import("@/views/dashboard/SettingsView"), {
  ssr: false,
});

export default function SettingsPage() {
  return <SettingsView />;
}
