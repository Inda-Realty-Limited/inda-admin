import { useRouter } from "next/router";
import { useEffect } from "react";
export default function LegacyAgentsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/agents");
  }, [router]);
  return null;
}
