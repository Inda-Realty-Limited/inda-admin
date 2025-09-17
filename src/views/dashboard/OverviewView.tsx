import { useAdminOverview } from "@/api";
import Head from "next/head";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
} from "react";
import {
  FiClock,
  FiDownload,
  FiHome,
  FiInbox,
  FiPlus,
  FiTrendingUp,
  FiUser,
  FiUserCheck,
  FiUsers,
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

  const routeMap: Record<string, string> = {
    Properties: "/dashboard/listings",
    Developers: "/dashboard/developers",
    Agents: "/dashboard/agents",
    "Claimed Profiles": "/dashboard/claimed-profiles",
    "Pending Requests": "/dashboard/pending-requests",
    Users: "/dashboard/users",
    "New Sales Requests": "/dashboard/sales-requests",
  };
  const iconMap: Record<string, ElementType> = useMemo(
    () => ({
      Properties: FiHome,
      Developers: FiUsers,
      Agents: FiUserCheck,
      "Claimed Profiles": FiUser,
      "Pending Requests": FiClock,
      Users: FiUsers,
      "New Sales Requests": FiTrendingUp,
    }),
    []
  );

  // Fetch admin overview data
  const { data, isLoading, isError, refetch } = useAdminOverview();
  const listing = useMemo(() => toCards(data), [data]);

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

  const weeklyActivity = useMemo(() => {
    const labels = data?.weeklyActivity?.labels ?? [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];
    const series =
      data?.weeklyActivity?.total ?? data?.weeklyActivity?.listings ?? [];
    return { labels, data: series.length ? series : [0, 0, 0, 0, 0, 0, 0] };
  }, [data]);

  const recentActivity = useMemo(() => {
    const items = data?.recentActivity ?? [];
    return items.map((i) => ({
      label: i.title,
      meta: i.actor ? `by ${i.actor}` : "",
      time: new Date(i.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      category: i.category,
    }));
  }, [data]);
  // Tabs for recent activity
  const TABS = ["All", "Listings", "Users", "Sales", "Profiles"] as const;
  type Tab = (typeof TABS)[number];
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [raPage, setRaPage] = useState(1);

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

  const filteredRecent = useMemo(() => {
    if (activeTab === "All") return recentActivity;
    return recentActivity.filter((item) => {
      const cat =
        (item as { category?: string; label: string }).category ??
        getCategory(item.label);
      return cat === activeTab;
    });
  }, [recentActivity, activeTab, getCategory]);

  // Reset pagination when tab changes
  useEffect(() => {
    setRaPage(1);
  }, [activeTab]);

  const pageSize = 5;
  const raTotalPages = Math.max(1, Math.ceil(filteredRecent.length / pageSize));
  const raItems = useMemo(() => {
    const start = (raPage - 1) * pageSize;
    return filteredRecent.slice(start, start + pageSize);
  }, [filteredRecent, raPage]);
  return (
    <div className="space-y-6">
      <Head>
        <title>Overview — Inda Admin</title>
      </Head>
      {/* Header */}
      <div>
        <h1 className="font-bold text-4xl max-xl:text-3xl max-sm:text-2xl">
          Overview
        </h1>
        <p className="text-[#4EA8A1] mt-1">Today is {today}</p>
      </div>

      {/* Responsive cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listing.map((list) => {
          const Icon = iconMap[list.name] || FiTrendingUp;
          const positive = (list.crease || "").trim().startsWith("+");
          const hasData = (list.amount ?? 0) > 0;
          return (
            <div
              key={list.name}
              className="rounded-xl h-full flex flex-col border border-black/5 bg-[#4ea8a129] hover:shadow-md transition-shadow"
            >
              <div className="p-5  rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#4EA8A1] text-white/95">
                    <Icon size={18} />
                  </span>
                  <p className="font-semibold">{list.name}</p>
                </div>
                <h2 className="font-bold text-3xl pt-4">
                  {hasData ? list.amount.toLocaleString() : "—"}
                </h2>
                {hasData && list.crease && (
                  <p
                    className={`mt-2 text-sm ${
                      positive ? "text-emerald-600" : "text-black/60"
                    }`}
                  >
                    {list.crease}
                  </p>
                )}
                {!hasData && (
                  <p className="mt-2 text-sm text-black/60">No data yet</p>
                )}
              </div>
              <div className="px-5 pb-5 mt-auto">
                <Link
                  href={routeMap[list.name] || "/dashboard/overview"}
                  className="block text-center bg-[#4EA8A1] text-white rounded-lg w-full p-2.5 text-sm font-medium hover:opacity-95"
                >
                  Manage {list.name}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions (moved between charts) */}
        <div className="rounded-xl border border-black/5 bg-[#4ea8a129] p-5 shadow-sm">
          <h2 className="font-semibold">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/dashboard/listings"
              className="w-full inline-flex items-center justify-between rounded-lg border border-[#4EA8A1]/30 px-3 py-2 hover:bg-[#4EA8A1]/5"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#101820]">
                <FiPlus className="text-[#4EA8A1]" /> Add Listing
              </span>
              <span className="text-xs text-[#4EA8A1]">Go</span>
            </Link>
            <Link
              href="/dashboard/pending-requests"
              className="w-full inline-flex items-center justify-between rounded-lg border border-[#4EA8A1]/30 px-3 py-2 hover:bg-[#4EA8A1]/5"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#101820]">
                <FiClock className="text-[#4EA8A1]" /> Review Pending Requests
              </span>
              <span className="text-xs text-[#4EA8A1]">Go</span>
            </Link>
            <Link
              href="/dashboard/sales-requests"
              className="w-full inline-flex items-center justify-between rounded-lg border border-[#4EA8A1]/30 px-3 py-2 hover:bg-[#4EA8A1]/5"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#101820]">
                <FiDownload className="text-[#4EA8A1]" /> Export Sales CSV
              </span>
              <span className="text-xs text-[#4EA8A1]">Go</span>
            </Link>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl border border-black/5 bg-[#4ea8a129] p-5 shadow-sm">
          <h2 className="font-semibold">Category Breakdown</h2>
          {sumAll === 0 ? (
            <div className="mt-6 h-24 flex items-center justify-center text-black/50">
              <div className="flex flex-col items-center gap-2">
                <FiInbox className="text-[#4EA8A1]" />
                <p className="text-sm">No category data yet</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {[
                {
                  label: "Properties",
                  value: totals.properties,
                  color: "#4EA8A1",
                },
                { label: "Users", value: totals.users, color: "#0EA5E9" },
                { label: "Agents", value: totals.agents, color: "#6366F1" },
                { label: "Pending", value: totals.pending, color: "#F59E0B" },
              ].map((item) => {
                const pct = Math.round(
                  ((item.value || 0) / (sumAll || 1)) * 100
                );
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/70">{item.label}</span>
                      <span className="font-medium">
                        {(item.value || 0).toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-black/10">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
        {/* Recent activity feed (full width) */}
        <div className="rounded-xl border border-black/5 bg-[#4ea8a129] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Activity</h2>
            <Link href="#" className="text-xs text-[#4EA8A1] hover:opacity-80">
              View all
            </Link>
          </div>
          {/* Filters */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={
                    `px-2 py-1 rounded-full transition-colors ` +
                    (active
                      ? "bg-[#4EA8A1] text-white"
                      : "bg-black/10 text-black/70 hover:bg-black/15")
                  }
                >
                  {tab}
                </button>
              );
            })}
          </div>
          {filteredRecent.length === 0 ? (
            <div className="mt-6 h-24 flex items-center justify-center text-black/50">
              <div className="flex flex-col items-center gap-2">
                <FiInbox className="text-[#4EA8A1]" />
                <p className="text-sm">
                  {activeTab === "All"
                    ? "No recent activity"
                    : `No activity for ${activeTab} yet`}
                </p>
              </div>
            </div>
          ) : (
            <>
              <ul className="mt-3 divide-y divide-black/5">
                {raItems.map((item, idx) => {
                  const label = item.label;
                  const category =
                    (item as { category?: string }).category ??
                    getCategory(label);
                  const tag =
                    category === "Listings"
                      ? {
                          text: "Listings",
                          color: "bg-[#4EA8A1]/15 text-[#4EA8A1]",
                        }
                      : category === "Users"
                      ? {
                          text: "Users",
                          color: "bg-[#0EA5E9]/15 text-[#0EA5E9]",
                        }
                      : category === "Sales"
                      ? {
                          text: "Sales",
                          color: "bg-emerald-500/15 text-emerald-600",
                        }
                      : category === "Profiles"
                      ? {
                          text: "Profiles",
                          color: "bg-violet-500/15 text-violet-600",
                        }
                      : { text: "General", color: "bg-black/10 text-black/60" };
                  const initials = label
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <li
                      key={idx}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-white/70 flex items-center justify-center text-xs font-bold text-[#4EA8A1]">
                          {initials}
                        </span>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {item.label}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${tag.color}`}
                            >
                              {tag.text}
                            </span>
                          </p>
                          <p className="text-xs text-black/60">{item.meta}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs text-black/50">
                          {item.time}
                        </span>
                        <button className="mt-1 text-[10px] text-[#4EA8A1] hover:opacity-80">
                          Details
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex items-center justify-between text-xs text-black/70">
                <button
                  className="px-2 py-1 rounded bg-black/5 disabled:opacity-50"
                  disabled={raPage <= 1}
                  onClick={() => setRaPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <div>
                  Page {raPage} of {raTotalPages}
                </div>
                <button
                  className="px-2 py-1 rounded bg-black/5 disabled:opacity-50"
                  disabled={raPage >= raTotalPages}
                  onClick={() =>
                    setRaPage((p) => Math.min(raTotalPages, p + 1))
                  }
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
