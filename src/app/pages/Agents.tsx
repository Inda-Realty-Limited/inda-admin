import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TierChip } from '../components/TierChip';
import { StatusChip } from '../components/StatusChip';
import { Search, Filter } from 'lucide-react';
import { api } from '../../lib/api';

const PLAN_TO_TIER: Record<string, 'starter' | 'growth' | 'elite' | 'partner'> = {
  STARTER: 'starter',
  GROWTH: 'growth',
  ELITE: 'elite',
  PARTNER: 'partner',
};

function agentStatus(isActive: boolean, approvalStatus: string | null): 'active' | 'pending' | 'suspended' {
  if (approvalStatus === 'PENDING') return 'pending';
  if (!isActive) return 'suspended';
  return 'active';
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  subscriptionPlan: string;
  agentApprovalStatus: string | null;
  isActive: boolean;
  dealsCount: number;
  listingsCount: number;
  leadsCount: number;
  revenue: number;
}

const tiers = [
  {
    name: 'Starter',
    tier: 'starter' as const,
    plan: 'STARTER',
    benefits: [
      'Up to 10 leads per month',
      'Standard listings visibility',
      '8% commission rate',
      'Basic training access',
    ],
  },
  {
    name: 'Growth',
    tier: 'growth' as const,
    plan: 'GROWTH',
    benefits: [
      'Up to 30 leads per month',
      'Priority listings visibility',
      '10% commission rate',
      'Full training + scripts access',
      'Marketing budget: ₦500K/month',
    ],
  },
  {
    name: 'Elite',
    tier: 'elite' as const,
    plan: 'ELITE',
    benefits: [
      'Up to 50 leads per month',
      'Featured listings visibility',
      '12% commission rate',
      'Full training + 1-on-1 coaching',
      'Marketing budget: ₦1.5M/month',
      'Dedicated support',
    ],
  },
  {
    name: 'Partner',
    tier: 'partner' as const,
    plan: 'PARTNER',
    benefits: [
      'Unlimited leads',
      'Exclusive + featured visibility',
      '15% commission rate',
      'Priority coaching + strategy calls',
      'Marketing budget: ₦3M/month',
      'White-glove support',
      'Revenue share opportunities',
    ],
  },
];

const trainingVideos = [
  { id: 1, title: 'Effective Client Communication', category: 'Sales', duration: '12:34', completion: 78 },
  { id: 2, title: 'Property Valuation Fundamentals', category: 'Technical', duration: '18:22', completion: 65 },
  { id: 3, title: 'Negotiation Tactics for High-Value Deals', category: 'Sales', duration: '24:15', completion: 82 },
  { id: 4, title: 'Digital Marketing for Real Estate', category: 'Marketing', duration: '15:48', completion: 54 },
];

const playbooks = [
  { id: 1, title: 'First Contact Checklist', category: 'Process', pages: '8 pages', completion: 91 },
  { id: 2, title: 'Objection Handling Framework', category: 'Sales', pages: '12 pages', completion: 73 },
  { id: 3, title: 'Post-Deal Follow-up Guide', category: 'Retention', pages: '6 pages', completion: 88 },
];

const scripts = [
  { id: 1, title: 'Cold Lead Intro Script', category: 'Prospecting', words: '~150 words', completion: 85 },
  { id: 2, title: 'Property Showcase Script', category: 'Presentation', words: '~200 words', completion: 67 },
  { id: 3, title: 'Closing Call Template', category: 'Sales', words: '~180 words', completion: 79 },
];

export function Agents() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'all-agents';

  const setActiveTab = (tab: string) => navigate(`/agents?tab=${tab}`);

  const fetchAgents = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}&limit=100` : '?limit=100';
      const res = await api.get<{ data: Agent[] }>(`/admin/agents${query}`);
      setAgents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAgents(searchQuery || undefined), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchAgents]);

  const tierCounts = tiers.reduce<Record<string, number>>((acc, t) => {
    acc[t.plan] = agents.filter((a) => a.subscriptionPlan === t.plan).length;
    return acc;
  }, {});

  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-[#0D1117]">Agents</h1>
      </div>

      <div className="flex items-center gap-8 border-b border-[#E5E7EB] mb-6">
        {[
          { key: 'all-agents', label: 'All Agents' },
          { key: 'tiers', label: 'Tiers' },
          { key: 'training', label: 'Training' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium relative ${
              activeTab === tab.key ? 'text-[#4EA8A1]' : 'text-[#6B7280] hover:text-[#0D1117]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4EA8A1]" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'all-agents' && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search agents..."
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
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Tier</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Leads</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Deals Closed</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Listings</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-[#6B7280] px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-[#6B7280]">Loading...</td>
                  </tr>
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-[#6B7280]">No agents found</td>
                  </tr>
                ) : (
                  agents.map((agent) => {
                    const status = agentStatus(agent.isActive, agent.agentApprovalStatus);
                    const initials = `${agent.firstName[0]}${agent.lastName?.[0] ?? ''}`;
                    return (
                      <tr key={agent.id} className="border-t border-[#E5E7EB] hover:bg-[#F3F9F8] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                              <span className="text-white text-xs font-medium">{initials}</span>
                            </div>
                            <span className="text-sm font-medium text-[#0D1117]">
                              {agent.firstName} {agent.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <TierChip tier={PLAN_TO_TIER[agent.subscriptionPlan] || 'starter'} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6B7280] tabular-nums">{agent.leadsCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6B7280] tabular-nums">{agent.dealsCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6B7280] tabular-nums">{agent.listingsCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusChip status={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </StatusChip>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/agents/${agent.id}`)}
                            className="text-sm text-[#4EA8A1] hover:underline"
                          >
                            View Profile
                          </button>
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

      {activeTab === 'tiers' && (
        <div className="grid grid-cols-4 gap-5">
          {tiers.map((tier) => (
            <div key={tier.tier} className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
              <div className="flex items-center justify-between mb-4">
                <TierChip tier={tier.tier} />
                <span className="text-sm text-[#6B7280]">{tierCounts[tier.plan] ?? 0} agents</span>
              </div>
              <h3 className="text-lg font-semibold text-[#0D1117] mb-4">{tier.name}</h3>
              <ul className="space-y-2.5 mb-6">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <div className="w-1 h-1 rounded-full bg-[#4EA8A1] mt-1.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-sm font-medium text-[#4EA8A1] border border-[#4EA8A1] rounded-lg hover:bg-[#4EA8A1]/5 transition-colors">
                  Edit Benefits
                </button>
                <button
                  onClick={() => setActiveTab('all-agents')}
                  className="w-full px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors"
                >
                  View Agents →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Training Videos</div>
              <button className="text-sm text-[#4EA8A1] hover:underline">Add Video</button>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {trainingVideos.map((video) => (
                <div key={video.id} className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-[#F9FAFB] h-32 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#4EA8A1]/10 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-[#4EA8A1] border-b-[6px] border-b-transparent ml-1" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-[#4EA8A1] font-medium mb-1">{video.category}</div>
                    <h4 className="text-sm font-medium text-[#0D1117] mb-2 line-clamp-2">{video.title}</h4>
                    <div className="flex items-center justify-between text-xs text-[#6B7280] mb-3">
                      <span>{video.duration}</span>
                      <span>{video.completion}% complete</span>
                    </div>
                    <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 mb-3">
                      <div className="bg-[#4EA8A1] h-1.5 rounded-full" style={{ width: `${video.completion}%` }} />
                    </div>
                    <button className="w-full px-3 py-2 text-xs font-medium text-[#4EA8A1] border border-[#4EA8A1] rounded-lg hover:bg-[#4EA8A1]/5 transition-colors">
                      Assign to Agents
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Playbooks</div>
              <button className="text-sm text-[#4EA8A1] hover:underline">Add Playbook</button>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {playbooks.map((playbook) => (
                <div key={playbook.id} className="bg-white border border-[#E5E7EB] rounded-[10px] p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs text-[#4EA8A1] font-medium mb-1">{playbook.category}</div>
                  <h4 className="text-sm font-medium text-[#0D1117] mb-2 line-clamp-2">{playbook.title}</h4>
                  <div className="flex items-center justify-between text-xs text-[#6B7280] mb-3">
                    <span>{playbook.pages}</span>
                    <span>{playbook.completion}% complete</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 mb-3">
                    <div className="bg-[#4EA8A1] h-1.5 rounded-full" style={{ width: `${playbook.completion}%` }} />
                  </div>
                  <button className="w-full px-3 py-2 text-xs font-medium text-[#4EA8A1] border border-[#4EA8A1] rounded-lg hover:bg-[#4EA8A1]/5 transition-colors">
                    Assign to Agents
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Scripts</div>
              <button className="text-sm text-[#4EA8A1] hover:underline">Add Script</button>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {scripts.map((script) => (
                <div key={script.id} className="bg-white border border-[#E5E7EB] rounded-[10px] p-4 hover:shadow-md transition-shadow">
                  <div className="text-xs text-[#4EA8A1] font-medium mb-1">{script.category}</div>
                  <h4 className="text-sm font-medium text-[#0D1117] mb-2 line-clamp-2">{script.title}</h4>
                  <div className="flex items-center justify-between text-xs text-[#6B7280] mb-3">
                    <span>{script.words}</span>
                    <span>{script.completion}% complete</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 mb-3">
                    <div className="bg-[#4EA8A1] h-1.5 rounded-full" style={{ width: `${script.completion}%` }} />
                  </div>
                  <button className="w-full px-3 py-2 text-xs font-medium text-[#4EA8A1] border border-[#4EA8A1] rounded-lg hover:bg-[#4EA8A1]/5 transition-colors">
                    Assign to Agents
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
