import { useRouter } from "next/router";
import { useEffect } from "react";

export default function LegacyAllListingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/listings");
  }, [router]);
  return null;
}
