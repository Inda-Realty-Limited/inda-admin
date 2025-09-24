import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  FiClock,
  FiHome,
  FiList,
  FiLogOut,
  FiMenu,
  FiTrendingUp,
  FiUser,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

type Props = { children: React.ReactNode };

const navItems: Array<{
  label: string;
  href: string;
  icon: React.ElementType;
}> = [
  { label: "Overview", href: "/dashboard/overview", icon: FiHome },
  { label: "Listings", href: "/dashboard/listings", icon: FiList },
  { label: "Developers", href: "/dashboard/developers", icon: FiUsers },
  { label: "Agents", href: "/dashboard/agents", icon: FiUserCheck },
  {
    label: "Claimed Profiles",
    href: "/dashboard/claimed-profiles",
    icon: FiUser,
  },
  {
    label: "Pending Requests",
    href: "/dashboard/pending-requests",
    icon: FiClock,
  },
  { label: "Users", href: "/dashboard/users", icon: FiUsers },
  {
    label: "Sales Requests",
    href: "/dashboard/sales-requests",
    icon: FiTrendingUp,
  },
];

export default function AdminLayout({ children }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-[#E5E5E5]">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            aria-label="Toggle sidebar"
            className="md:hidden p-2 text-[#4EA8A1]"
            onClick={() => setOpen((v) => !v)}
          >
            <FiMenu size={22} />
          </button>
          <Link
            href="/dashboard/overview"
            className="font-extrabold text-[#4EA8A1] tracking-wide"
          >
            Inda Admin
          </Link>
          <span />
        </div>
      </header>

      {/* App shell: account for fixed header height */}
      <div className="pt-14">
        {/* Sidebar (fixed, full height) */}
        <aside
          className={`fixed left-0 top-14 h-[calc(100vh-56px)] w-56 bg-white border-r border-[#E5E5E5] p-3 md:p-4 transform transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 flex flex-col`}
        >
          <nav className="space-y-1 flex-1 overflow-y-auto">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active =
                router.pathname === href || router.pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                    active
                      ? "bg-[#4EA8A1] text-white"
                      : "text-[#101820] hover:bg-[#F3F4F6]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-[#E5E5E5]">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  try {
                    localStorage.removeItem("admin_token");
                    localStorage.removeItem("admin_profile");
                  } catch {}
                }
                router.push("/adminSignIn");
              }}
              className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-[#b91c1c] hover:bg-[#FFF1F2]"
            >
              <FiLogOut size={18} />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </aside>

        {/* Main content, offset for sidebar on md+ */}
        <main className="min-w-0 w-full md:w-[calc(100%-14rem)] md:ml-56 px-4 md:px-4 py-4 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
