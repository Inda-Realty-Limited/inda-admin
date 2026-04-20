import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StatusChip } from '../components/StatusChip';
import { Search, Filter, AlertCircle, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { api } from '../../lib/api';

const SERVICE_COLORS: Record<string, string> = {
  PHOTOGRAPHY: '#4EA8A1',
  VIDEOGRAPHY: '#10B981',
  TOUR_3D: '#F59E0B',
};

function bookingStatusToChip(status: string): 'pending' | 'in-progress' | 'completed' | 'rejected' {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'IN_PROGRESS') return 'in-progress';
  if (status === 'REJECTED' || status === 'CANCELLED') return 'rejected';
  return 'pending';
}

function campaignStatusToChip(status: string): 'active' | 'pending' | 'completed' | 'rejected' {
  if (status === 'ACTIVE') return 'active';
  if (status === 'COMPLETED') return 'completed';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
}

interface Booking {
  id: string;
  serviceType: string;
  packageId: string;
  propertyAddress: string;
  status: string;
  createdAt: string;
  agent: { id: string; firstName: string; lastName: string | null; subscriptionPlan: string };
}

interface Campaign {
  id: string;
  objective: string;
  budget: number;
  durationDays: number;
  status: string;
  createdAt: string;
  agent: { id: string; firstName: string; lastName: string | null; subscriptionPlan: string };
}

interface SpendStats {
  totalSpendThisMonth: number;
  totalLeadsThisMonth: number;
  avgCostPerLead: number;
  bestRoiAgent: { id: string; firstName: string; lastName: string | null; dealsCount: number } | null;
  spendByAgent: { agentName: string; spend: number }[];
  spendByService: { serviceType: string; count: number }[];
}

export function Marketing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'requests';
  const setActiveTab = (tab: string) => navigate(`/marketing?tab=${tab}`);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [spendStats, setSpendStats] = useState<SpendStats | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingSpend, setLoadingSpend] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await api.get<{ data: Booking[] }>('/admin/marketing/requests?limit=50');
      setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingBookings(false); }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const res = await api.get<{ data: Campaign[] }>('/admin/marketing/campaigns?limit=50');
      setCampaigns(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingCampaigns(false); }
  }, []);

  const fetchSpend = useCallback(async () => {
    setLoadingSpend(true);
    try {
      const res = await api.get<{ data: SpendStats }>('/admin/marketing/spend');
      setSpendStats(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingSpend(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') fetchBookings();
    else if (activeTab === 'campaigns') fetchCampaigns();
    else if (activeTab === 'spend') fetchSpend();
  }, [activeTab, fetchBookings, fetchCampaigns, fetchSpend]);

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  const filteredBookings = bookings.filter((b) =>
    `${b.agent.firstName} ${b.agent.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const spendByServiceData = (spendStats?.spendByService || []).map((s, i) => ({
    name: s.serviceType.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase()),
    value: s.count,
    color: Object.values(SERVICE_COLORS)[i % 3] || '#6B7280',
  }));

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
                <span className="font-medium">{pendingCount} request{pendingCount > 1 ? 's' : ''}</span> awaiting approval
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
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Property</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingBookings ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#6B7280]">Loading...</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#6B7280]">No requests found</td></tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const agentName = `${booking.agent.firstName} ${booking.agent.lastName || ''}`.trim();
                    const initials = `${booking.agent.firstName[0]}${booking.agent.lastName?.[0] ?? ''}`;
                    const chipStatus = bookingStatusToChip(booking.status);
                    return (
                      <tr key={booking.id} className="border-t border-[#E5E7EB] hover:bg-[#F3F9F8] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                              <span className="text-white text-xs font-medium">{initials}</span>
                            </div>
                            <span className="text-sm text-[#0D1117]">{agentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#0D1117]">
                            {booking.serviceType.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{booking.propertyAddress}</span></td>
                        <td className="px-6 py-4">
                          <StatusChip status={chipStatus}>
                            {chipStatus === 'in-progress' ? 'In Progress' : chipStatus.charAt(0).toUpperCase() + chipStatus.slice(1)}
                          </StatusChip>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{new Date(booking.createdAt).toLocaleDateString()}</span></td>
                        <td className="px-6 py-4">
                          {booking.status === 'PENDING' ? (
                            <button className="text-sm text-[#4EA8A1] hover:underline">Approve</button>
                          ) : (
                            <button className="text-sm text-[#4EA8A1] hover:underline">View</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
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
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Objective</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Budget</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Duration</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingCampaigns ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#6B7280]">Loading...</td></tr>
                ) : campaigns.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#6B7280]">No campaigns found</td></tr>
                ) : (
                  campaigns.map((campaign) => {
                    const agentName = `${campaign.agent.firstName} ${campaign.agent.lastName || ''}`.trim();
                    const initials = `${campaign.agent.firstName[0]}${campaign.agent.lastName?.[0] ?? ''}`;
                    const chipStatus = campaignStatusToChip(campaign.status);
                    return (
                      <tr key={campaign.id} className="border-t border-[#E5E7EB] hover:bg-[#F3F9F8] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                              <span className="text-white text-xs font-medium">{initials}</span>
                            </div>
                            <span className="text-sm text-[#0D1117]">{agentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117]">{campaign.objective}</span></td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6B7280] tabular-nums">₦{Number(campaign.budget).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6B7280]">{campaign.durationDays} days</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusChip status={chipStatus}>
                            {chipStatus.charAt(0).toUpperCase() + chipStatus.slice(1)}
                          </StatusChip>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-[#4EA8A1] hover:underline">View</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'spend' && (
        <div className="space-y-6">
          {loadingSpend ? (
            <div className="text-sm text-[#6B7280] py-8 text-center">Loading spend data...</div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-5">
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                  <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">Total Spend This Month</div>
                  <div className="text-[32px] font-semibold text-[#0D1117] leading-none">
                    {spendStats
                      ? `₦${(spendStats.totalSpendThisMonth / 1_000_000).toFixed(1)}M`
                      : '₦0'}
                  </div>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                  <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">Total Leads This Month</div>
                  <div className="text-[32px] font-semibold text-[#0D1117] leading-none">
                    {spendStats?.totalLeadsThisMonth ?? 0}
                  </div>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                  <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">Avg Cost per Lead</div>
                  <div className="text-[32px] font-semibold text-[#0D1117] leading-none">
                    {spendStats?.avgCostPerLead
                      ? `₦${spendStats.avgCostPerLead.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : '₦0'}
                  </div>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                  <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">Best ROI Agent</div>
                  {spendStats?.bestRoiAgent ? (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {spendStats.bestRoiAgent.firstName[0]}{spendStats.bestRoiAgent.lastName?.[0] ?? ''}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#0D1117]">
                          {spendStats.bestRoiAgent.firstName} {spendStats.bestRoiAgent.lastName || ''}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <TrendingUp className="w-3 h-3 text-[#10B981]" />
                          <span className="text-sm text-[#10B981] font-medium">
                            {spendStats.bestRoiAgent.dealsCount} deals
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#6B7280] mt-2">No data</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                  <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-5">Spend by Agent</div>
                  {(spendStats?.spendByAgent?.length ?? 0) === 0 ? (
                    <div className="h-[320px] flex items-center justify-center text-sm text-[#6B7280]">No spend data this month</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={spendStats!.spendByAgent.map((a) => ({ name: a.agentName, spend: a.spend }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                        <XAxis
                          type="number" axisLine={false} tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickFormatter={(value) => `₦${(value / 1_000_000).toFixed(1)}M`}
                        />
                        <YAxis
                          type="category" dataKey="name" axisLine={false} tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }} width={120}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0D1117', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#fff' }}
                          formatter={(value: number) => [`₦${(value / 1_000_000).toFixed(2)}M`, 'Spend']}
                        />
                        <Bar dataKey="spend" fill="#4EA8A1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                  <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-5">Bookings by Service Type</div>
                  {spendByServiceData.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center text-sm text-[#6B7280]">No data this month</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={spendByServiceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                            {spendByServiceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0D1117', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#fff' }}
                            formatter={(value: number) => [value, 'Bookings']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-6">
                        {spendByServiceData.map((service) => (
                          <div key={service.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: service.color }} />
                              <span className="text-sm text-[#6B7280]">{service.name}</span>
                            </div>
                            <span className="text-sm font-medium text-[#0D1117] tabular-nums">{service.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
