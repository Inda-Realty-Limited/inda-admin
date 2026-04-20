import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StatusChip } from '../components/StatusChip';
import { Search, Filter, AlertCircle, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const requests = [
  { id: 1, agent: 'Oluwaseun A.', avatar: 'OA', service: 'Photography', package: 'Premium', property: '4BR Villa, Lekki', status: 'pending' as const, cost: '₦85,000', date: '2026-04-09' },
  { id: 2, agent: 'Chidinma O.', avatar: 'CO', service: 'Digital Ads', package: 'Leads Campaign', property: '3BR Apartment, VI', status: 'in-progress' as const, cost: '₦250,000', date: '2026-04-08' },
  { id: 3, agent: 'Ibrahim M.', avatar: 'IM', service: '3D Tours', package: 'Premium Interactive', property: '5BR Duplex, Ikoyi', status: 'completed' as const, cost: '₦180,000', date: '2026-04-08' },
  { id: 4, agent: 'Blessing N.', avatar: 'BN', service: 'Videography', package: 'Cinematic', property: '2BR Flat, Ikeja', status: 'pending' as const, cost: '₦120,000', date: '2026-04-07' },
  { id: 5, agent: 'Tunde B.', avatar: 'TB', service: 'Photography', package: 'Standard', property: '4BR Terrace, Ajah', status: 'completed' as const, cost: '₦55,000', date: '2026-04-06' },
];

const campaigns = [
  { id: 1, agent: 'Oluwaseun A.', avatar: 'OA', name: 'Luxury Lekki Homes', budget: '₦500,000', spent: 380000, leads: 42, cpl: '₦9,048', status: 'active' as const },
  { id: 2, agent: 'Chidinma O.', avatar: 'CO', name: 'Victoria Island Condos', budget: '₦350,000', spent: 280000, leads: 31, cpl: '₦9,032', status: 'active' as const },
  { id: 3, agent: 'Ibrahim M.', avatar: 'IM', name: 'Ikoyi Premium Properties', budget: '₦600,000', spent: 600000, leads: 58, cpl: '₦10,345', status: 'completed' as const },
  { id: 4, agent: 'Blessing N.', avatar: 'BN', name: 'Affordable Ikeja Homes', budget: '₦200,000', spent: 120000, leads: 18, cpl: '₦6,667', status: 'active' as const },
];

const spendByAgent = [
  { name: 'Oluwaseun A.', spend: 1850000 },
  { name: 'Ibrahim M.', spend: 1620000 },
  { name: 'Chidinma O.', spend: 1480000 },
  { name: 'Tunde B.', spend: 1320000 },
  { name: 'Blessing N.', spend: 980000 },
];

const spendByService = [
  { name: 'Digital Ads', value: 4200000, color: '#4EA8A1' },
  { name: 'Photography', value: 1800000, color: '#10B981' },
  { name: '3D Tours', value: 1200000, color: '#F59E0B' },
  { name: 'Videography', value: 1050000, color: '#6B7280' },
];

export function Marketing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'requests';

  const setActiveTab = (tab: string) => navigate(`/marketing?tab=${tab}`);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-6 max-w-[1280px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-semibold text-[#0D1117]">Marketing</h1>
      </div>

      <div className="flex items-center gap-8 border-b border-[#E5E7EB] mb-6">
        {[
          { key: 'requests', label: 'Requests' },
          { key: 'campaigns', label: 'Campaigns' },
          { key: 'spend', label: 'Spend Overview' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium relative ${
              activeTab === tab.key ? 'text-[#4EA8A1]' : 'text-[#6B7280] hover:text-[#0D1117]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4EA8A1]" />}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <div>
          {pendingCount > 0 && (
            <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg p-3 mb-5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[#B45309]">
                <span className="font-medium">{pendingCount} requests</span> awaiting approval
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
              />
            </div>
            <button className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg flex items-center gap-2 hover:bg-[#F9FAFB] transition-colors">
              <Filter className="w-4 h-4 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">Filter</span>
            </button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Agent</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Service Type</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Package</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Property</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Cost</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests
                  .filter((r) => r.agent.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((request) => (
                    <tr key={request.id} className="border-t border-[#E5E7EB] hover:bg-[#F3F9F8] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                            <span className="text-white text-xs font-medium">{request.avatar}</span>
                          </div>
                          <span className="text-sm text-[#0D1117]">{request.agent}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm text-[#0D1117]">{request.service}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{request.package}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{request.property}</span></td>
                      <td className="px-6 py-4">
                        <StatusChip status={request.status}>
                          {request.status === 'in-progress' ? 'In Progress' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </StatusChip>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117] tabular-nums">{request.cost}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{request.date}</span></td>
                      <td className="px-6 py-4">
                        {request.status === 'pending' ? (
                          <button className="text-sm text-[#4EA8A1] hover:underline">Approve</button>
                        ) : (
                          <button className="text-sm text-[#4EA8A1] hover:underline">View</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
              />
            </div>
            <button className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg flex items-center gap-2 hover:bg-[#F9FAFB] transition-colors">
              <Filter className="w-4 h-4 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">Filter</span>
            </button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Agent</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Campaign Name</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Budget</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Spend Used</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Leads</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Cost per Lead</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const budgetNum = parseInt(campaign.budget.replace(/[₦,]/g, ''));
                  const percentage = Math.min((campaign.spent / budgetNum) * 100, 100);
                  return (
                    <tr key={campaign.id} className="border-t border-[#E5E7EB] hover:bg-[#F3F9F8] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                            <span className="text-white text-xs font-medium">{campaign.avatar}</span>
                          </div>
                          <span className="text-sm text-[#0D1117]">{campaign.agent}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117]">{campaign.name}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-[#6B7280] tabular-nums">{campaign.budget}</span></td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#6B7280] tabular-nums">₦{campaign.spent.toLocaleString()}</span>
                            <span className="text-xs text-[#9CA3AF]">{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-24 bg-[#E5E7EB] rounded-full h-1.5">
                            <div className="bg-[#4EA8A1] h-1.5 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117] tabular-nums">{campaign.leads}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-[#6B7280] tabular-nums">{campaign.cpl}</span></td>
                      <td className="px-6 py-4">
                        <StatusChip status={campaign.status}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </StatusChip>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-sm text-[#4EA8A1] hover:underline">View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'spend' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-5">
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">Total Spend This Month</div>
              <div className="text-[32px] font-semibold text-[#0D1117] leading-none">₦12.4M</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">Total Leads from Paid</div>
              <div className="text-[32px] font-semibold text-[#0D1117] leading-none">486</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">Avg Cost per Lead</div>
              <div className="text-[32px] font-semibold text-[#0D1117] leading-none">₦25,514</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">Best ROI Agent</div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                  <span className="text-white text-sm font-medium">OA</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#0D1117]">Oluwaseun A.</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-[#10B981]" />
                    <span className="text-sm text-[#10B981] font-medium">348%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-[10px] p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-5">Spend by Agent</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={spendByAgent} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis
                    type="number" axisLine={false} tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                  />
                  <YAxis
                    type="category" dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }} width={100}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D1117', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#fff' }}
                    formatter={(value: number) => [`₦${(value / 1000000).toFixed(2)}M`, 'Spend']}
                  />
                  <Bar dataKey="spend" fill="#4EA8A1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-5">Spend by Service Type</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={spendByService} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {spendByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D1117', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#fff' }}
                    formatter={(value: number) => [`₦${(value / 1000000).toFixed(1)}M`, 'Spend']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-6">
                {spendByService.map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: service.color }} />
                      <span className="text-sm text-[#6B7280]">{service.name}</span>
                    </div>
                    <span className="text-sm font-medium text-[#0D1117] tabular-nums">
                      ₦{(service.value / 1000000).toFixed(1)}M
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
