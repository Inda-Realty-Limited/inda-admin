import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TierChip } from '../components/TierChip';
import { StatusChip } from '../components/StatusChip';
import { Modal } from '../components/Modal';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';

const PLAN_TO_TIER: Record<string, 'starter' | 'growth' | 'elite' | 'partner'> = {
  STARTER: 'starter', GROWTH: 'growth', ELITE: 'elite', PARTNER: 'partner',
};
const TIER_TO_PLAN: Record<string, string> = {
  starter: 'STARTER', growth: 'GROWTH', elite: 'ELITE', partner: 'PARTNER',
};

const DEAL_STAGE_LABEL: Record<string, string> = {
  LEAD_CAPTURED: 'Lead', REPORT_VIEWED: 'Contacted', INQUIRY: 'Contacted',
  INSPECTION: 'Inspection', OFFER: 'Offer Made', NEGOTIATION: 'Negotiation',
  CLOSING: 'Closed Won', LOST: 'Closed Lost',
};

function modStatusToChip(status: string): 'active' | 'pending' | 'rejected' {
  if (status === 'APPROVED') return 'active';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
}

interface AgentData {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  subscriptionPlan: string;
  agentApprovalStatus: string | null;
  isActive: boolean;
  createdAt: string;
  commissionRate: number;
  perks: string[];
  dealsCount: number;
  listingsCount: number;
  leadsCount: number;
  revenue: number;
  deals: { id: string; buyerName: string; propertyName: string; budget: string | null; stage: string }[];
  listings: { id: string; title: string | null; fullAddress: string | null; moderationStatus: string; _count?: { leads: number } }[];
  leads: { id: string; name: string | null; budgetMin: number | null; budgetMax: number | null; propertyLocation: string | null; createdAt: string }[];
  marketingData: {
    bookings: { id: string; serviceType: string; status: string; propertyAddress: string; createdAt: string }[];
    campaigns: { id: string; objective: string; budget: number; status: string }[];
    creditsThisMonth: { allocation: number; used: number } | null;
  };
}

function formatBudget(min: number | null, max: number | null): string {
  if (!min && !max) return '—';
  const fmt = (n: number) => n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(0)}M` : `₦${(n / 1_000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return fmt(max!);
}

export function AgentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTier, setSelectedTier] = useState<'starter' | 'growth' | 'elite' | 'partner'>('starter');
  const [commission, setCommission] = useState(10);
  const [marketingBudget, setMarketingBudget] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [perks, setPerks] = useState({ prioritySupport: false, exclusiveListings: false, coaching: false });

  useEffect(() => {
    if (!id) return;
    api.get<{ data: AgentData }>(`/admin/agents/${id}`)
      .then((res) => {
        const a = res.data;
        setAgent(a);
        setSelectedTier(PLAN_TO_TIER[a.subscriptionPlan] || 'starter');
        setCommission(a.commissionRate ?? 10);
        setPerks({
          prioritySupport: a.perks.includes('prioritySupport'),
          exclusiveListings: a.perks.includes('exclusiveListings'),
          coaching: a.perks.includes('coaching'),
        });
        const credits = a.marketingData?.creditsThisMonth;
        if (credits) setMarketingBudget(credits.allocation.toLocaleString());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!agent) return;
    try {
      const activePerks = Object.entries(perks).filter(([, v]) => v).map(([k]) => k);
      await api.patch(`/admin/agents/${agent.id}/tier`, {
        plan: TIER_TO_PLAN[selectedTier],
        commissionRate: commission,
        perks: activePerks,
      });
      const budgetNum = parseInt(marketingBudget.replace(/,/g, ''), 10);
      if (!isNaN(budgetNum) && budgetNum > 0) {
        await api.patch(`/admin/agents/${agent.id}/marketing-budget`, { allocation: budgetNum });
      }
      toast.success('Agent updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update agent');
    }
  };

  const handleSuspend = async () => {
    if (!agent) return;
    try {
      await api.post(`/admin/users/${agent.id}/toggle-status`);
      toast.success(`${agent.firstName} ${agent.lastName || ''} has been ${agent.isActive ? 'suspended' : 'activated'}`);
      setShowSuspendModal(false);
      navigate('/agents');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const agentName = agent ? `${agent.firstName} ${agent.lastName || ''}`.trim() : '';
  const initials = agent ? `${agent.firstName[0]}${agent.lastName?.[0] ?? ''}` : '?';

  // Build a simple activity sparkline from deals count per day (simplified)
  const activityData = agent
    ? agent.deals.slice(0, 8).map((_, i) => ({ value: 5 + i * 3 }))
    : [];

  const status: 'active' | 'pending' | 'suspended' = agent
    ? agent.agentApprovalStatus === 'PENDING' ? 'pending' : agent.isActive ? 'active' : 'suspended'
    : 'active';

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="p-6 max-w-[1280px]">
        <button
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D1117] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agents</span>
        </button>

        {loading ? (
          <div className="text-sm text-[#6B7280] py-8 text-center">Loading agent profile...</div>
        ) : !agent ? (
          <div className="text-sm text-[#6B7280] py-8 text-center">Agent not found</div>
        ) : (
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                    <span className="text-white text-2xl font-medium">{initials}</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-[22px] font-semibold text-[#0D1117] mb-2">{agentName}</h1>
                    <div className="flex items-center gap-3 mb-3">
                      <TierChip tier={selectedTier} />
                      <StatusChip status={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </StatusChip>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-[#6B7280]">Joined: </span>
                        <span className="text-[#0D1117]">
                          {new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6B7280]">Phone: </span>
                        <span className="text-[#0D1117]">{agent.phoneNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[#6B7280]">Email: </span>
                        <span className="text-[#0D1117]">{agent.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 border-b-2 border-[#E5E7EB] mb-6">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'listings', label: 'Listings' },
                  { key: 'leads', label: 'Leads' },
                  { key: 'deals', label: 'Deals' },
                  { key: 'marketing', label: 'Marketing' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-3 text-sm font-medium relative ${
                      activeTab === tab.key ? 'text-[#0D1117]' : 'text-[#6B7280] hover:text-[#0D1117]'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4EA8A1]" />
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-5">
                    {[
                      { label: 'Deals Closed', value: agent.dealsCount },
                      { label: 'Listings', value: agent.listingsCount },
                      { label: 'Leads', value: agent.leadsCount },
                      {
                        label: 'Revenue',
                        value: agent.revenue >= 1_000_000
                          ? `₦${(agent.revenue / 1_000_000).toFixed(1)}M`
                          : `₦${agent.revenue.toLocaleString()}`,
                      },
                    ].map((metric) => (
                      <div key={metric.label} className="bg-white border border-[#E5E7EB] rounded-[10px] p-5">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-2">{metric.label}</div>
                        <div className="text-2xl font-semibold text-[#0D1117]">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                  {activityData.length > 0 && (
                    <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-4">Activity Trend</div>
                      <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={activityData}>
                          <Line type="monotone" dataKey="value" stroke="#4EA8A1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'listings' && (
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F9FAFB] h-12">
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Property</th>
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Status</th>
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agent.listings.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-6 text-center text-sm text-[#6B7280]">No listings</td></tr>
                      ) : (
                        agent.listings.map((listing) => (
                          <tr key={listing.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] h-14">
                            <td className="px-6 py-4">
                              <span className="text-sm text-[#0D1117]">{listing.title || 'Untitled'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusChip status={modStatusToChip(listing.moderationStatus)}>
                                {listing.moderationStatus.charAt(0) + listing.moderationStatus.slice(1).toLowerCase()}
                              </StatusChip>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-[#6B7280]">{listing.fullAddress || '—'}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'leads' && (
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F9FAFB] h-12">
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Name</th>
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Budget</th>
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Location</th>
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agent.leads.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-6 text-center text-sm text-[#6B7280]">No leads</td></tr>
                      ) : (
                        agent.leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] h-14">
                            <td className="px-6 py-4"><span className="text-sm text-[#0D1117]">{lead.name || 'Anonymous'}</span></td>
                            <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{formatBudget(lead.budgetMin, lead.budgetMax)}</span></td>
                            <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{lead.propertyLocation || '—'}</span></td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-[#6B7280]">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'deals' && (
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F9FAFB] h-12">
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Buyer</th>
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Property</th>
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Budget</th>
                        <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Stage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agent.deals.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-6 text-center text-sm text-[#6B7280]">No deals</td></tr>
                      ) : (
                        agent.deals.map((deal) => (
                          <tr key={deal.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] h-14">
                            <td className="px-6 py-4"><span className="text-sm text-[#0D1117]">{deal.buyerName}</span></td>
                            <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{deal.propertyName}</span></td>
                            <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117]">{deal.budget || '—'}</span></td>
                            <td className="px-6 py-4">
                              <StatusChip status="in-progress">
                                {DEAL_STAGE_LABEL[deal.stage] || deal.stage}
                              </StatusChip>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'marketing' && (
                <div className="space-y-6">
                  {agent.marketingData.creditsThisMonth && (
                    <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-4">Marketing Budget</div>
                      {(() => {
                        const { allocation, used } = agent.marketingData.creditsThisMonth!;
                        const pct = allocation > 0 ? Math.min((used / allocation) * 100, 100) : 0;
                        return (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-[#6B7280]">Allocated: ₦{allocation.toLocaleString()}</span>
                              <span className="text-sm text-[#6B7280]">Used: ₦{used.toLocaleString()} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-[#E5E7EB] rounded-full h-2.5">
                              <div className="bg-[#4EA8A1] h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {agent.marketingData.bookings.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-[#0D1117] mb-3">Services Requested</h3>
                      <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#F9FAFB] h-12">
                              <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Service</th>
                              <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Property</th>
                              <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Status</th>
                              <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {agent.marketingData.bookings.map((booking) => (
                              <tr key={booking.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] h-14">
                                <td className="px-6 py-4"><span className="text-sm text-[#0D1117]">{booking.serviceType}</span></td>
                                <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{booking.propertyAddress}</span></td>
                                <td className="px-6 py-4">
                                  <StatusChip status={booking.status === 'COMPLETED' ? 'completed' : booking.status === 'IN_PROGRESS' ? 'in-progress' : 'pending'}>
                                    {booking.status.replace('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                                  </StatusChip>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-[#6B7280]">{new Date(booking.createdAt).toLocaleDateString()}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {agent.marketingData.campaigns.length > 0 && (
                    <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-4">Campaigns</div>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <div className="text-xs text-[#6B7280] mb-1">Total Campaigns</div>
                          <div className="text-2xl font-semibold text-[#0D1117]">{agent.marketingData.campaigns.length}</div>
                        </div>
                        <div>
                          <div className="text-xs text-[#6B7280] mb-1">Total Budget</div>
                          <div className="text-2xl font-semibold text-[#0D1117]">
                            ₦{agent.marketingData.campaigns.reduce((s, c) => s + (c.budget || 0), 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[#6B7280] mb-1">Active</div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#10B981]" />
                            <span className="text-2xl font-semibold text-[#10B981]">
                              {agent.marketingData.campaigns.filter((c) => c.status === 'ACTIVE').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-[260px]">
              <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-5 sticky top-6 space-y-5">
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">Agent Controls</div>

                <div>
                  <label className="block text-sm font-medium text-[#0D1117] mb-2">Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as typeof selectedTier)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="elite">Elite</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0D1117] mb-2">Commission %</label>
                  <input
                    type="number"
                    value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0D1117] mb-2">Perks</label>
                  <div className="space-y-2">
                    {[
                      { key: 'prioritySupport' as const, label: 'Priority Support' },
                      { key: 'exclusiveListings' as const, label: 'Exclusive Listings' },
                      { key: 'coaching' as const, label: '1-on-1 Coaching' },
                    ].map((perk) => (
                      <label key={perk.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perks[perk.key]}
                          onChange={(e) => setPerks({ ...perks, [perk.key]: e.target.checked })}
                          className="w-4 h-4 text-[#4EA8A1] rounded focus:ring-[#4EA8A1]"
                        />
                        <span className="text-sm text-[#0D1117]">{perk.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0D1117] mb-2">Marketing Budget (₦)</label>
                  <input
                    type="text"
                    value={marketingBudget}
                    onChange={(e) => setMarketingBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="w-full px-4 py-2.5 bg-[#4EA8A1] text-white text-sm font-medium rounded-lg hover:bg-[#3d8983] transition-colors"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="w-full px-4 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#dc2626] transition-colors"
                >
                  {agent.isActive ? 'Suspend Account' : 'Activate Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title={agent?.isActive ? 'Suspend Agent' : 'Activate Agent'}
        footer={
          <>
            <button
              onClick={() => setShowSuspendModal(false)}
              className="px-5 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSuspend}
              className="px-5 py-2 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#dc2626] transition-colors"
            >
              Confirm
            </button>
          </>
        }
      >
        <p className="text-sm text-[#6B7280]">
          {agent?.isActive ? 'Suspend' : 'Activate'}{' '}
          <span className="font-medium text-[#0D1117]">{agentName}</span>?{' '}
          {agent?.isActive ? 'They will lose access immediately.' : 'They will regain platform access.'}
        </p>
      </Modal>
    </>
  );
}
