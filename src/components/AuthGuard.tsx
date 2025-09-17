import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Props = { children: React.ReactNode };

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Simple client-side check; replace with real auth as needed
    const token =
      typeof window !== "undefined" ? localStorage.getItem("inda_token") : null;
    if (!token) {
      router.replace("/adminSignIn");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-[#6B7280]">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
