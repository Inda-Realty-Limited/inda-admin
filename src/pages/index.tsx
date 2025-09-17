import { useRouter } from "next/router";
import { useEffect } from "react";

export default function IndexPage() {
  const router = useRouter();
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("inda_token") : null;
    router.replace(token ? "/dashboard/overview" : "/adminSignIn");
  }, [router]);
  return null;
}
