import Head from "next/head";
import { useRouter } from "next/router";
import { FiLock, FiMail } from "react-icons/fi";

export default function AdminSignIn() {
  const router = useRouter();
  function handleLogin() {
    if (typeof window !== "undefined") {
      localStorage.setItem("inda_token", "demo_token");
    }
    router.push("/dashboard/overview");
  }
  return (
    <div className="min-h-screen bg-[#fff] flex items-center justify-center px-4">
      <Head>
        <title>Admin Sign In — Inda</title>
      </Head>
      <div className="relative w-full max-w-2xl bg-[#E5E5E573] rounded-2xl shadow-sm p-10">
        {/* Brand top-right */}
        <div className="absolute right-8 top-6 text-[#4EA8A1] font-bold text-2xl">
          Inda
        </div>

        {/* Title */}
        <div className="text-center mt-4 mb-8">
          <h1 className="text-3xl font-extrabold text-[#4EA8A1]">Welcome!</h1>
          <p className="mt-2 text-[#6B7280]">
            Please log in to Admin Dashboard
          </p>
        </div>

        <form className="space-y-4">
          {/* Email */}
          <div className="relative">
            <FiMail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/95"
              size={18}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full h-12 bg-[#4EA8A1] text-white placeholder-white/95 rounded-md pl-11 pr-4 outline-none border border-transparent focus:ring-2 focus:ring-[#4EA8A1]"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4EA8A1]"
              size={18}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full h-12 bg-white text-[#101820] placeholder-[#9CA3AF] rounded-md pl-11 pr-4 outline-none border border-[#4EA8A1] focus:ring-2 focus:ring-[#4EA8A1]"
            />
          </div>

          {/* Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleLogin}
              className="block mx-auto h-10 w-full rounded-md bg-[#4EA8A1] text-white font-semibold hover:opacity-95"
            >
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
