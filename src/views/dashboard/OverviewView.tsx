import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiHome, FiShoppingCart, FiTrendingUp, FiUsers } from "react-icons/fi";

const listing = [
  { name: "Properties", amount: 12345, crease: "+12 this week" },
  { name: "Developers", amount: 678, crease: "" },
  { name: "Agents", amount: 910, crease: "" },
  { name: "Claimed Profiles", amount: 1121, crease: "" },
  { name: "Pending Requests", amount: 131, crease: "" },
  { name: "Users", amount: 1289, crease: "+12 this week" },
  { name: "New Sales Requests", amount: 16, crease: "" },
];

export default function OverviewView() {
  const [today, setToday] = useState("");
  useEffect(() => {
    try {
      const formatter = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      setToday(formatter.format(new Date()));
    } catch {
      setToday(new Date().toDateString());
    }
  }, []);

  const totals = useMemo(() => {
    return {
      properties: listing[0].amount,
      developers: listing[1].amount,
      agents: listing[2].amount,
      claimed: listing[3].amount,
      pending: listing[4].amount,
      users: listing[5].amount,
      sales: listing[6].amount,
    };
  }, []);

  const sumAll = useMemo(
    () => Object.values(totals).reduce((a, b) => a + b, 0),
    [totals]
  );

  const kpis = useMemo(
    () => [
      {
        label: "Total Properties",
        value: totals.properties,
        change: +12,
        icon: FiHome,
        color: "#4EA8A1",
        trend: [12, 14, 18, 17, 19, 20, 22],
      },
      {
        label: "Active Users",
        value: totals.users,
        change: +5,
        icon: FiUsers,
        color: "#0EA5E9",
        trend: [3, 4, 5, 5, 6, 7, 6],
      },
      {
        label: "New Sales Requests",
        value: totals.sales,
        change: +2,
        icon: FiShoppingCart,
        color: "#22C55E",
        trend: [1, 2, 1, 3, 2, 3, 4],
      },
    ],
    [totals]
  );

  const weeklyActivity = useMemo(
    () => ({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [12, 18, 9, 14, 20, 16, 22],
    }),
    []
  );

  const routeMap: Record<string, string> = {
    Properties: "/dashboard/listings",
    Developers: "/dashboard/developers",
    Agents: "/dashboard/agents",
    "Claimed Profiles": "/dashboard/claimed-profiles",
    "Pending Requests": "/dashboard/pending-requests",
    Users: "/dashboard/users",
    "New Sales Requests": "/dashboard/sales-requests",
  };
  return (
    <div className="space-y-8">
      <Head>
        <title>Overview — Inda Admin</title>
      </Head>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-4xl max-xl:text-3xl max-sm:text-2xl">
            Overview
          </h1>
          <p className="text-[#4EA8A1] mt-1">Today is {today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/listings"
            className="px-3 py-2 rounded-md bg-[#4EA8A1] text-white text-sm hover:opacity-95"
          >
            View Listings
          </Link>
          <Link
            href="/dashboard/sales-requests"
            className="px-3 py-2 rounded-md border border-[#4EA8A1] text-[#4EA8A1] text-sm hover:bg-[#4EA8A1]/5"
          >
            Sales Requests
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-black/5 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${kpi.color}1a` }}
                  >
                    <Icon color={kpi.color} />
                  </span>
                  <div>
                    <p className="text-sm text-black/60">{kpi.label}</p>
                    <p className="text-2xl font-semibold">
                      {kpi.value.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  <FiTrendingUp /> +{kpi.change}%
                </span>
              </div>
              <div className="mt-3">
                <Sparkline data={kpi.trend} color={kpi.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly activity bar chart */}
        <div className="lg:col-span-2 rounded-xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Weekly Activity</h2>
            <span className="text-xs text-black/50">Last 7 days</span>
          </div>
          <div className="mt-4 flex items-end gap-3 h-40">
            {(() => {
              const max = Math.max(...weeklyActivity.data);
              return weeklyActivity.data.map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-6 rounded-t-md bg-[#4EA8A1]"
                    style={{ height: `${(v / max) * 100}%` }}
                  />
                  <span className="text-xs text-black/50">
                    {weeklyActivity.labels[i]}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Category Breakdown</h2>
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
              const pct = Math.round((item.value / sumAll) * 100);
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/70">{item.label}</span>
                    <span className="font-medium">
                      {item.value.toLocaleString()} ({isFinite(pct) ? pct : 0}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-black/10">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${isFinite(pct) ? pct : 0}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick manage links (existing) */}
      <div className="pt-2 flex flex-wrap">
        {listing.map((list) => {
          return (
            <div
              key={list.name}
              className="w-1/5 p-5 pl-0 max-xl:w-1/4 max-lg:w-1/3 max-md:w-1/2 max-sm:w-full"
            >
              <div className="p-5 bg-[#4ea8a129] rounded-xl h-38">
                <p className="font-semibold">{list.name}</p>
                <h2 className="font-bold text-2xl py-3">{list.amount}</h2>
                <p className="text-[#08872B]">{list.crease}</p>
              </div>
              <Link
                href={routeMap[list.name] || "/dashboard/overview"}
                className="block text-center bg-[#4EA8A1] text-[#f9f9f9] rounded-lg w-full mt-3 p-3 cursor-pointer hover:opacity-95"
              >
                Manage {list.name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sparkline({
  data,
  color = "#4EA8A1",
}: {
  data: number[];
  color?: string;
}) {
  const width = 120;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const norm =
    max === min
      ? data.map(() => height / 2)
      : data.map((d) => height - ((d - min) / (max - min)) * height);
  const points = norm
    .map((y, i) => `${(i / (data.length - 1)) * width},${y}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}
