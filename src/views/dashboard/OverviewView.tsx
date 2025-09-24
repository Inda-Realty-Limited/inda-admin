import { useAdminOverview } from "@/api";
import { formatPrice } from "@/utils";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiHome,
  FiInbox,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiUpload,
  FiUser,
  FiZap,
} from "react-icons/fi";

// Map API data to the cards structure
function toCards(data: ReturnType<typeof useAdminOverview>["data"]) {
  const d = data;
  return [
    {
      name: "Properties",
      amount: d?.properties?.total ?? 0,
      crease:
        d?.properties?.addedThisWeek != null
          ? `+${d?.properties?.addedThisWeek} this week`
          : "",
    },
    { name: "Developers", amount: d?.developers?.total ?? 0, crease: "" },
    { name: "Agents", amount: d?.agents?.total ?? 0, crease: "" },
    {
      name: "Claimed Profiles",
      amount: d?.claimedProfiles?.total ?? 0,
      crease: "",
    },
    {
      name: "Pending Requests",
      amount: d?.pendingRequests?.total ?? 0,
      crease: "",
    },
    {
      name: "Users",
      amount: d?.users?.total ?? 0,
      crease:
        d?.users?.addedThisWeek != null
          ? `+${d?.users?.addedThisWeek} this week`
          : "",
    },
    {
      name: "New Sales Requests",
      amount: d?.newSalesRequests?.total ?? 0,
      crease: "",
    },
  ];
}

export default function OverviewView() {
  const [today, setToday] = useState("");
  useEffect(() => {
    try {
      const fmt = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      setToday(fmt.format(new Date()));
    } catch {
      setToday(new Date().toDateString());
    }
  }, []);

  // Relative time helper
  const fromNow = useCallback((iso: string) => {
    const now = Date.now();
    const t = new Date(iso).getTime();
    const diff = Math.max(0, now - t);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }, []);

  // Fetch admin overview data
  const { data, isLoading, isError } = useAdminOverview();
  // Cards per design
  const cards = useMemo(() => {
    return [
      {
        label: "Total Active Listings",
        value: data?.properties?.total ?? 12345,
        delta: data?.properties?.addedThisWeek ?? 12,
        href: "/dashboard/listings",
        buttonText: "Manage Listings",
      },
      {
        label: "Users",
        value: data?.users?.total ?? 12345,
        delta: data?.users?.addedThisWeek ?? 12,
        href: "/dashboard/users",
        buttonText: "Manage Users",
      },
      {
        label: "Microlocations",
        value: 12345, // placeholder as shown in design
        delta: 12,
        href: "#",
        buttonText: "Manage Microlocation",
      },
      {
        label: "Transactions",
        value: 12345, // format as currency
        delta: 12,
        href: "/dashboard/sales-requests",
        buttonText: "Manage Transaction",
        isCurrency: true,
      },
    ];
  }, [data]);

  // Derived figures for additional panels
  const totals = useMemo(
    () => ({
      properties: data?.properties?.total ?? 0,
      users: data?.users?.total ?? 0,
      agents: data?.agents?.total ?? 0,
      pending: data?.pendingRequests?.total ?? 0,
      sales: data?.newSalesRequests?.total ?? 0,
      developers: data?.developers?.total ?? 0,
      claimed: data?.claimedProfiles?.total ?? 0,
    }),
    [data]
  );

  const sumAll = useMemo(
    () => Object.values(totals).reduce((a, b) => a + b, 0),
    [totals]
  );

  const recentActivity = useMemo(() => {
    const items = data?.recentActivity ?? [];
    return items.slice(0, 5).map((i) => {
      let description = i.title;
      let meta = i.actor ? `by ${i.actor}` : "";

      // Create proper descriptions based on activity type
      switch (i.type) {
        case "payment_success":
          if (i.title.includes("instant")) {
            description = "Instant payment completed successfully";
            meta =
              i.actor === "flutterwave"
                ? "via Flutterwave"
                : i.actor === "free"
                ? "Free tier"
                : `via ${i.actor}`;
          } else if (i.title.includes("free")) {
            description = "Free tier payment processed";
            meta = "No charges applied";
          } else {
            description = "Payment transaction completed";
            meta = i.actor ? `via ${i.actor}` : "";
          }
          break;
        case "user_verified":
          description = `User ${i.title} verified successfully`;
          meta = i.meta?.email ? `Email: ${i.meta.email}` : "";
          break;
        case "listing_created":
          description = `New property listing: "${i.title}"`;
          meta = i.actor ? `Listed by ${i.actor}` : "";
          break;
        default:
          description = i.title;
          meta = i.actor ? `by ${i.actor}` : "";
      }

      return {
        label: description,
        meta: meta,
        when: fromNow(i.createdAt),
        category: i.category,
        type: i.type,
      };
    });
  }, [data, fromNow]);

  // Get icon for activity type
  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case "payment_success":
        return <span className="text-[#4EA8A1] font-bold text-xs">₦</span>;
      case "user_verified":
        return <FiUser className="w-3 h-3 text-[#4EA8A1]" />;
      case "listing_created":
        return <FiHome className="w-3 h-3 text-[#4EA8A1]" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-[#4EA8A1]" />;
    }
  }, []);

  type Tab = "Listings" | "Users" | "Sales" | "Profiles" | "General";

  const getCategory = useCallback(
    (label: string): Exclude<Tab, "All"> | "General" => {
      const l = label.toLowerCase();
      if (l.includes("property")) return "Listings";
      if (l.includes("user")) return "Users";
      if (l.includes("sales")) return "Sales";
      if (l.includes("profile")) return "Profiles";
      return "General";
    },
    []
  );

  const raItems = recentActivity;
  return (
    <div className="space-y-6">
      <Head>
        <title>Overview — Inda Admin</title>
      </Head>
      {/* Header */}
      <div>
        <h1 className="font-bold text-4xl max-xl:text-3xl max-sm:text-2xl">
          Welcome back, Admin
        </h1>
        <p className="text-[#4EA8A1] mt-1">Today is {today}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 w-[70%] lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const hasVal = typeof c.value === "number" && !Number.isNaN(c.value);
          const displayValue = hasVal
            ? c.isCurrency
              ? formatPrice(c.value as number)
              : (c.value as number).toLocaleString()
            : "—";

          return (
            <div key={c.label} className="text-center">
              <div className="rounded-lg bg-[#4EA8A129] p-6 flex flex-col text-center">
                <div className="text-sm text-gray-800 font-medium mb-3">
                  {c.label}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {displayValue}
                </div>
                <div className="text-sm text-green-600 mb-4">
                  {typeof c.delta === "number" ? `+${c.delta} this week` : ""}
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href={c.href}
                  className="block text-center bg-[#4EA8A1] text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-[#4EA8A1]/90 transition-colors"
                >
                  {c.buttonText}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions (row) */}
      <div>
        <h2 className="font-bold text-black/80 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="#"
            className="rounded-lg border border-black/20 px-4 py-2 text-sm bg-transparent hover:bg-black/5 flex items-center gap-2"
          >
            <FiSearch className="w-4 h-4" />
            Scrape Listing
          </Link>
          <Link
            href="#"
            className="rounded-lg border border-black/20 px-4 py-2 text-sm bg-transparent hover:bg-black/5 flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Clean Data
          </Link>
          <Link
            href="/dashboard/listings"
            className="rounded-lg border border-black/20 px-4 py-2 text-sm bg-transparent hover:bg-black/5 flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add listing
          </Link>
          <Link
            href="#"
            className="rounded-lg border border-black/20 px-4 py-2 text-sm bg-transparent hover:bg-black/5 flex items-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Upload CSV
          </Link>
          <Link
            href="#"
            className="rounded-lg border border-black/20 px-4 py-2 text-sm bg-transparent hover:bg-black/5 flex items-center gap-2"
          >
            <FiZap className="w-4 h-4" />
            Compute Results
          </Link>
        </div>
      </div>

      {/* Loading/Error states */}
      {isLoading && (
        <div className="rounded-xl border border-black/5 bg-[#4ea8a129] p-4 text-sm text-black/60">
          Loading overview…
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-black/5 bg-red-50 p-4 text-sm text-red-700">
          Failed to load overview. Please try again.
        </div>
      )}

      {/* Insights row */}
      <div className="grid grid-cols-1 gap-4">
        {/* Recent activity feed */}
        <div>
          <h2 className="font-semibold text-black/80">Recent Activity Feed</h2>
          {raItems.length === 0 ? (
            <div className="mt-6 h-24 flex items-center justify-center text-black/50">
              <div className="flex flex-col items-center gap-2">
                <FiInbox className="text-[#4EA8A1]" />
                <p className="text-sm">No recent activity</p>
              </div>
            </div>
          ) : (
            <ul className="mt-4 space-y-5">
              {raItems.map((item, idx) => (
                <li key={idx} className="relative pl-8">
                  {/* timeline icon + line */}
                  <div className="absolute left-0 top-0 flex flex-col items-center h-full">
                    <div className="h-6 w-6 rounded-full bg-[#E6F2F1] border border-[#4EA8A1] flex items-center justify-center">
                      {getActivityIcon(item.type)}
                    </div>
                    {idx < raItems.length - 1 && (
                      <span className="flex-1 w-px bg-black/10 mt-2" />
                    )}
                  </div>
                  <div className="text-sm text-black/80 font-medium">
                    {item.label}
                  </div>
                  {item.meta && (
                    <div className="text-xs text-black/60 mt-1">
                      {item.meta}
                    </div>
                  )}
                  <div className="text-xs text-[#4EA8A1] mt-1">{item.when}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
