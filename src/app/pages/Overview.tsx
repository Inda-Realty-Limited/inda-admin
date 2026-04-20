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

const revenueData = [
  { month: 'Jan', revenue: 1200000 },
  { month: 'Feb', revenue: 1500000 },
  { month: 'Mar', revenue: 1800000 },
  { month: 'Apr', revenue: 2100000 },
  { month: 'May', revenue: 2400000 },
  { month: 'Jun', revenue: 2900000 },
  { month: 'Jul', revenue: 3200000 },
  { month: 'Aug', revenue: 3600000 },
];

const topAgents = [
  { rank: 1, name: 'Oluwaseun Adeyemi', tier: 'elite' as const, deals: 24, revenue: '₦48.2M', avatar: 'OA' },
  { rank: 2, name: 'Chidinma Okonkwo', tier: 'growth' as const, deals: 19, revenue: '₦38.5M', avatar: 'CO' },
  { rank: 3, name: 'Ibrahim Mohammed', tier: 'elite' as const, deals: 17, revenue: '₦36.8M', avatar: 'IM' },
  { rank: 4, name: 'Blessing Nwosu', tier: 'growth' as const, deals: 15, revenue: '₦32.4M', avatar: 'BN' },
  { rank: 5, name: 'Tunde Bakare', tier: 'partner' as const, deals: 14, revenue: '₦31.2M', avatar: 'TB' },
];

const recentActivity = [
  { buyer: 'Adewale Johnson', property: '4BR Villa, Lekki Phase 1', value: '₦85M', time: '2 hours ago' },
  { buyer: 'Grace Eze', property: '3BR Apartment, Victoria Island', value: '₦45M', time: '5 hours ago' },
  { buyer: 'Michael Obi', property: '5BR Duplex, Ikoyi', value: '₦120M', time: '8 hours ago' },
  { buyer: 'Fatima Abubakar', property: '2BR Flat, Ikeja', value: '₦28M', time: '1 day ago' },
  { buyer: 'Daniel Okoro', property: '4BR Terrace, Ajah', value: '₦52M', time: '1 day ago' },
  { buyer: 'Sarah Adeleke', property: '3BR Condo, Banana Island', value: '₦95M', time: '2 days ago' },
];

export function Overview() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-[1280px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#0D1117]">Overview</h1>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-6">
        <MetricCard label="Total Active Agents" value={234} delta={{ value: '+12%', isPositive: true }} />
        <MetricCard label="Leads This Week" value={156} delta={{ value: '+8%', isPositive: true }} />
        <MetricCard label="Deals Closed — 30 Days" value={48} delta={{ value: '+15%', isPositive: true }} />
        <MetricCard label="Revenue — 30 Days" value="₦280M" delta={{ value: '+22%', isPositive: true }} />
      </div>

      <div className="grid grid-cols-5 gap-5 mb-6">
        <div className="col-span-3 bg-white border border-[#E5E7EB] rounded-[10px] p-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-5">
            Revenue Over Time
          </div>
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
        </div>

        <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-[10px] p-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-5">
            Marketing Spend
          </div>
          <div className="space-y-5">
            <div>
              <div className="text-[13px] font-medium text-[#6B7280] mb-1">Total spend this month</div>
              <div className="text-[32px] font-semibold text-[#0D1117]">₦12.4M</div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-[#6B7280] mb-1">Total leads generated</div>
              <div className="text-[32px] font-semibold text-[#0D1117]">486</div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-[#6B7280] mb-1">Avg cost per lead</div>
              <div className="text-[32px] font-semibold text-[#0D1117]">₦25,514</div>
            </div>
            <div className="pt-4 border-t border-[#E5E7EB]">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-3">
                Top Agent by ROI
              </div>
              <button
                onClick={() => navigate('/agents/1')}
                className="flex items-center gap-3 w-full hover:bg-[#F9FAFB] p-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                  <span className="text-white text-sm font-medium">OA</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#0D1117]">Oluwaseun Adeyemi</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-[#10B981]" />
                    <span className="text-sm text-[#10B981] font-medium">348% ROI</span>
                  </div>
                </div>
              </button>
            </div>
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
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB] h-12 text-left">
                  <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3 rounded-tl-lg">Rank</th>
                  <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3">Agent</th>
                  <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3">Tier</th>
                  <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3 text-right">Deals</th>
                  <th className="text-[13px] font-medium text-[#6B7280] px-4 py-3 rounded-tr-lg text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topAgents.map((agent, index) => (
                  <tr
                    key={agent.rank}
                    className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] transition-colors h-14 cursor-pointer"
                    onClick={() => navigate(`/agents/${index + 1}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-medium text-[#0D1117]">#{agent.rank}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{agent.avatar}</span>
                        </div>
                        <span className="text-sm text-[#0D1117]">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TierChip tier={agent.tier} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] font-medium text-[#0D1117] tabular-nums">{agent.deals}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] font-medium text-[#0D1117] tabular-nums">{agent.revenue}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-5">
            Recent Deal Activity
          </div>
          <button
            onClick={() => navigate('/marketing?tab=requests')}
            className="w-full bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-lg p-3 mb-5 flex items-start gap-2 hover:bg-[#FEF3C7] transition-colors"
          >
            <AlertCircle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[#92400E] text-left">
              <span className="font-medium">8 pending approvals</span> and{' '}
              <span className="font-medium">3 inactive agents</span> require attention
            </div>
          </button>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-[#4EA8A1]" />
                  {index < recentActivity.length - 1 && (
                    <div className="w-px flex-1 bg-[#E5E7EB] mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="text-sm font-medium text-[#0D1117]">{activity.buyer}</div>
                  <div className="text-sm text-[#6B7280] mt-0.5">{activity.property}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[13px] font-medium text-[#4EA8A1]">{activity.value}</span>
                    <span className="text-xs text-[#9CA3AF]">•</span>
                    <span className="text-xs text-[#9CA3AF]">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
