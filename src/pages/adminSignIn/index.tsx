import { adminLogin } from "@/api";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_token", res.token);
        try {
          localStorage.setItem("admin_profile", JSON.stringify(res.admin));
        } catch {}
      }
      router.push("/dashboard/overview");
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg = e?.response?.data?.message || e?.message || "Login failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-white w-full flex items-center justify-center p-4">
      <Head>
        <title>Admin Sign In — Inda</title>
      </Head>
      <div className="relative w-full max-w-[800px] h-[500px] bg-[#E5E5E573] rounded-lg p-8">
        {/* Logo top-right */}
        <div className="absolute right-6 top-0">
          <Image src="/logo.png" alt="Inda Logo" width={100} height={100} />
        </div>

        {/* Title */}
        <div className="text-center mt-8 mb-8">
          <h1 className="text-2xl font-bold text-[#4EA8A1] mb-2">Welcome!</h1>
          <p className="text-gray-600 text-sm">
            Please log in to Admin Dashboard
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Email */}
          <div className="w-full flex justify-center">
            <input
              type="email"
              placeholder="Email"
              className="w-1/2 h-12 bg-[#4EA8A1] mx-auto text-white placeholder-white/90 rounded px-4 outline-none border-none focus:ring-2 focus:ring-[#4EA8A1]/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="w-full flex justify-center">
            <div className="relative w-1/2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full h-12 bg-transparent text-gray-800 placeholder-gray-500 rounded pl-4 pr-10 outline-none border border-gray-300 focus:ring-2 focus:ring-[#4EA8A1]/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#4EA8A1]"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

          {/* Button */}
          <div className="w-full flex justify-center pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-1/3 h-12 bg-[#4EA8A1] mx-auto text-white font-medium rounded hover:bg-[#4EA8A1]/90 disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in…" : "Log In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
