import { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { TierChip } from '../components/TierChip';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

const PLAN_TO_TIER: Record<string, 'starter' | 'growth' | 'elite' | 'partner'> = {
  STARTER: 'starter',
  GROWTH: 'growth',
  ELITE: 'elite',
  PARTNER: 'partner',
};

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

function formatRevenue(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
}

interface DashboardData {
  totalAgents: number;
  activeAgents: number;
  leadsThisWeek: number;
  dealsClosedThisMonth: number;
  revenueThisMonth: number;
  marketingSpendThisMonth: number;
  pendingListings: number;
  pendingReports: number;
  topAgents: {
    id: string;
    firstName: string;
    lastName: string | null;
    subscriptionPlan: string;
    dealsCount: number;
    listingsCount: number;
    isActive: boolean;
  }[];
  recentActivity: {
    id: string;
    name: string | null;
    propertyTitle: string | null;
    propertyLocation: string | null;
    createdAt: string;
    budgetMin: number | null;
    budgetMax: number | null;
  }[];
}

interface RevenuePoint {
  period: string;
  revenue: number;
}

export function Overview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: DashboardData }>('/admin/dashboard'),
      api.get<{ data: RevenuePoint[] }>('/admin/revenue/stats?period=monthly'),
    ])
      .then(([dashRes, revRes]) => {
        setStats(dashRes.data);
        const chart = revRes.data.map((p) => ({
          month: MONTH_LABELS[p.period.split('-')[1]] || p.period,
          revenue: p.revenue,
        }));
        setRevenueData(chart);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = (stats?.pendingListings || 0) + (stats?.pendingReports || 0);

  return (
    <div className="p-6 max-w-[1280px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#0D1117]">Overview</h1>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-6">
        <MetricCard
          label="Total Active Agents"
          value={loading ? '—' : stats?.activeAgents ?? 0}
          delta={{ value: '', isPositive: true }}
        />
        <MetricCard
          label="Leads This Week"
          value={loading ? '—' : stats?.leadsThisWeek ?? 0}
          delta={{ value: '', isPositive: true }}
        />
        <MetricCard
          label="Deals Closed — 30 Days"
          value={loading ? '—' : stats?.dealsClosedThisMonth ?? 0}
          delta={{ value: '', isPositive: true }}
        />
        <MetricCard
          label="Revenue — 30 Days"
          value={loading ? '—' : formatRevenue(stats?.revenueThisMonth ?? 0)}
          delta={{ value: '', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-5 gap-5 mb-6">
        <div className="col-span-3 bg-white border border-[#E5E7EB] rounded-[10px] p-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-5">
            Revenue Over Time
          </div>
          {revenueData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-[#6B7280]">
              {loading ? 'Loading...' : 'No revenue data yet'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4EA8A1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4EA8A1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1117',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`₦${(value / 1000000).toFixed(1)}M`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4EA8A1"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-[10px] p-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-5">
            Marketing Spend
          </div>
          <div className="space-y-5">
            <div>
              <div className="text-[13px] font-medium text-[#6B7280] mb-1">Total spend this month</div>
              <div className="text-[32px] font-semibold text-[#0D1117]">
                {loading ? '—' : formatRevenue(stats?.marketingSpendThisMonth ?? 0)}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-[#6B7280] mb-1">Total leads generated</div>
              <div className="text-[32px] font-semibold text-[#0D1117]">
                {loading ? '—' : stats?.leadsThisWeek ?? 0}
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-[#6B7280] mb-1">Total agents</div>
              <div className="text-[32px] font-semibold text-[#0D1117]">
                {loading ? '—' : stats?.totalAgents ?? 0}
              </div>
            </div>
            {stats?.topAgents?.[0] && (
              <div className="pt-4 border-t border-[#E5E7EB]">
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-3">
                  Top Agent by Deals
                </div>
                <button
                  onClick={() => navigate(`/agents/${stats.topAgents[0].id}`)}
                  className="flex items-center gap-3 w-full hover:bg-[#F9FAFB] p-2 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {stats.topAgents[0].firstName[0]}{stats.topAgents[0].lastName?.[0] ?? ''}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-[#0D1117]">
                      {stats.topAgents[0].firstName} {stats.topAgents[0].lastName}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-[#10B981]" />
                      <span className="text-sm text-[#10B981] font-medium">
                        {stats.topAgents[0].dealsCount} deals
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">
              Top Performing Agents
            </div>
            <button
              onClick={() => navigate('/agents')}
              className="text-sm text-[#4EA8A1] hover:underline"
            >
              View all agents →
            </button>
          </div>
          {loading ? (
            <div className="text-sm text-[#6B7280] py-4 text-center">Loading...</div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] h-12 text-left">
                    <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3 rounded-tl-lg">Rank</th>
                    <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3">Agent</th>
                    <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3">Tier</th>
                    <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3 text-right">Deals</th>
                    <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3 rounded-tr-lg text-right">Listings</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.topAgents || []).map((agent, index) => (
                    <tr
                      key={agent.id}
                      className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] transition-colors h-14 cursor-pointer"
                      onClick={() => navigate(`/agents/${agent.id}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-medium text-[#0D1117]">#{index + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {agent.firstName[0]}{agent.lastName?.[0] ?? ''}
                            </span>
                          </div>
                          <span className="text-sm text-[#0D1117]">
                            {agent.firstName} {agent.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <TierChip tier={PLAN_TO_TIER[agent.subscriptionPlan] || 'starter'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] font-medium text-[#0D1117] tabular-nums">{agent.dealsCount}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] font-medium text-[#0D1117] tabular-nums">{agent.listingsCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-5">
            Recent Lead Activity
          </div>
          {pendingCount > 0 && (
            <button
              onClick={() => navigate('/marketing?tab=requests')}
              className="w-full bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-lg p-3 mb-5 flex items-start gap-2 hover:bg-[#FEF3C7] transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[#92400E] text-left">
                <span className="font-medium">{stats?.pendingListings} pending listings</span> require attention
              </div>
            </button>
          )}
          {loading ? (
            <div className="text-sm text-[#6B7280] py-4 text-center">Loading...</div>
          ) : (
            <div className="space-y-4">
              {(stats?.recentActivity || []).map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-[#4EA8A1]" />
                    {index < (stats?.recentActivity.length || 0) - 1 && (
                      <div className="w-px flex-1 bg-[#E5E7EB] mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="text-sm font-medium text-[#0D1117]">{activity.name || 'Anonymous'}</div>
                    <div className="text-sm text-[#6B7280] mt-0.5">
                      {activity.propertyTitle || activity.propertyLocation || 'Property inquiry'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {(activity.budgetMin || activity.budgetMax) && (
                        <span className="text-[13px] font-medium text-[#4EA8A1]">
                          {activity.budgetMin ? formatRevenue(activity.budgetMin) : ''}
                          {activity.budgetMin && activity.budgetMax ? ' – ' : ''}
                          {activity.budgetMax ? formatRevenue(activity.budgetMax) : ''}
                        </span>
                      )}
                      <span className="text-xs text-[#9CA3AF]">•</span>
                      <span className="text-xs text-[#9CA3AF]">{timeAgo(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!stats?.recentActivity?.length && (
                <p className="text-sm text-[#6B7280] text-center py-4">No recent activity</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
