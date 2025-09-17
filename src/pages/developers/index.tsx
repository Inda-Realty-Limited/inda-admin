import { useRouter } from "next/router";
import { useEffect } from "react";
export default function LegacyDevelopersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/developers");
  }, [router]);
  return null;
}
