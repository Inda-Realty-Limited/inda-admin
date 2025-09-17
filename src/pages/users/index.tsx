import { useRouter } from "next/router";
import { useEffect } from "react";
export default function LegacyUsersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/users");
  }, [router]);
  return null;
}
