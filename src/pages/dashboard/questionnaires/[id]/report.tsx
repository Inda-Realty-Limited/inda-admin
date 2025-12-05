import { useRouter } from "next/router";
import DeeperDiveAdminInput from "@/components/deepAndDeeperDive";

export default function QuestionnaireReportPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <DeeperDiveAdminInput />
    </div>
  );
}
