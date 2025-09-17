import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminPropertyLayout from "../components/AdminPropertyLayout";
import AuthGuard from "../components/AuthGuard";
import AdminLayout from "../components/layouts/AdminLayout";
import "../styles/globals.css";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isDashboard = router.pathname.startsWith("/dashboard");
  const isPropertySection = [
    "/dashboard/admin-inputs",
    "/dashboard/auto-calculated",
    "/dashboard/ai-summaries",
    "/dashboard/reviews",
  ].some((r) => router.pathname.startsWith(r));

  let content = <Component {...pageProps} />;
  if (isDashboard) {
    if (isPropertySection) {
      content = <AdminPropertyLayout>{content}</AdminPropertyLayout>;
    }
    content = (
      <AuthGuard>
        <AdminLayout>{content}</AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Inda Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {content}
    </QueryClientProvider>
  );
}
