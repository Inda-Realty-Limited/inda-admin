import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StatusChip } from '../components/StatusChip';
import { TierChip } from '../components/TierChip';
import { Modal } from '../components/Modal';
import { SlideInPanel } from '../components/SlideInPanel';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '../../lib/api';

const PLAN_TO_TIER: Record<string, 'starter' | 'growth' | 'elite' | 'partner'> = {
  STARTER: 'starter', GROWTH: 'growth', ELITE: 'elite', PARTNER: 'partner',
};

const DEAL_STAGE_LABEL: Record<string, string> = {
  LEAD_CAPTURED: 'Lead', REPORT_VIEWED: 'Contacted', INQUIRY: 'Contacted',
  INSPECTION: 'Inspection', OFFER: 'Offer Made', NEGOTIATION: 'Negotiation',
  CLOSING: 'Closed Won', LOST: 'Closed Lost',
};

const KANBAN_COLUMNS = ['Lead', 'Contacted', 'Inspection', 'Offer Made', 'Negotiation', 'Closed Won', 'Closed Lost'];

function modStatusToChip(status: string): 'active' | 'pending' | 'rejected' {
  if (status === 'APPROVED') return 'active';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
}

function formatPrice(n: number | null | undefined): string {
  if (!n) return '—';
  return `₦${n.toLocaleString()}`;
}

function formatBudget(min: number | null, max: number | null): string {
  if (!min && !max) return '—';
  const fmt = (n: number) => n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(0)}M` : `₦${(n / 1_000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max!);
}

interface Listing {
  id: string;
  title: string | null;
  fullAddress: string | null;
  priceNGN: number | null;
  moderationStatus: string;
  user: { id: string; firstName: string; lastName: string | null };
  _count: { leads: number };
}

interface Lead {
  id: string;
  name: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  propertyLocation: string | null;
  priority: string;
  status: string;
  createdAt: string;
  assignedToId: string | null;
  listing: { id: string; title: string | null; userId: string } | null;
}

interface Deal {
  id: string;
  buyerName: string;
  propertyName: string;
  budget: string | null;
  stage: string;
  agent: { id: string; firstName: string; lastName: string | null };
}

interface AgentOption {
  id: string;
  firstName: string;
  lastName: string | null;
  subscriptionPlan: string;
}

export function Properties() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'listings';

  const [listings, setListings] = useState<Listing[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingDeals, setLoadingDeals] = useState(false);

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isExclusive, setIsExclusive] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentSearch, setAgentSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAddListingModal, setShowAddListingModal] = useState(false);

  const setActiveTab = (tab: string) => navigate(`/properties?tab=${tab}`);

  const fetchListings = useCallback(async (search?: string) => {
    setLoadingListings(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}&limit=50` : '?limit=50';
      const res = await api.get<{ data: Listing[] }>(`/admin/listings${q}`);
      setListings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingListings(false); }
  }, []);

  const fetchLeads = useCallback(async (search?: string) => {
    setLoadingLeads(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}&limit=50` : '?limit=50';
      const res = await api.get<{ data: Lead[] }>(`/admin/leads${q}`);
      setLeads(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingLeads(false); }
  }, []);

  const fetchDeals = useCallback(async () => {
    setLoadingDeals(true);
    try {
      const res = await api.get<{ data: Deal[] }>('/admin/deals?limit=100');
      setDeals(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingDeals(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'listings') fetchListings();
    else if (activeTab === 'leads') fetchLeads();
    else if (activeTab === 'deals') fetchDeals();
  }, [activeTab, fetchListings, fetchLeads, fetchDeals]);

  useEffect(() => {
    if (activeTab !== 'listings') return;
    const t = setTimeout(() => fetchListings(searchQuery || undefined), 400);
    return () => clearTimeout(t);
  }, [searchQuery, activeTab, fetchListings]);

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setPendingStatus(listing.moderationStatus);
  };

  const handleApproveListing = async () => {
    if (!selectedListing) return;
    try {
      await api.post(`/admin/listings/${selectedListing.id}/moderate`, { status: 'APPROVED' });
      setPendingStatus('APPROVED');
      setListings(listings.map((l) => l.id === selectedListing.id ? { ...l, moderationStatus: 'APPROVED' } : l));
      toast.success('Listing approved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve listing');
    }
  };

  const handleRejectListing = async () => {
    if (!selectedListing) return;
    try {
      await api.post(`/admin/listings/${selectedListing.id}/moderate`, { status: 'REJECTED', reason: rejectReason });
      setPendingStatus('REJECTED');
      setListings(listings.map((l) => l.id === selectedListing.id ? { ...l, moderationStatus: 'REJECTED' } : l));
      setShowRejectModal(false);
      setRejectReason('');
      toast.success('Listing rejected');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject listing');
    }
  };

  const handleAssignToTier = (tier: string) => toast.success(`Listing assigned to ${tier} agents`);

  const openAssignModal = async (leadId: string) => {
    setSelectedLeadId(leadId);
    setSelectedAgentId(null);
    setAgentSearch('');
    setTierFilter('All');
    setShowAssignModal(true);
    if (agentOptions.length === 0) {
      try {
        const res = await api.get<{ data: AgentOption[] }>('/admin/agents?limit=100');
        setAgentOptions(res.data);
      } catch (err) { console.error(err); }
    }
  };

  const handleAssignLead = async () => {
    if (!selectedLeadId || !selectedAgentId) return;
    try {
      await api.post(`/admin/leads/${selectedLeadId}/assign`, { agentId: selectedAgentId });
      const agentName = agentOptions.find((a) => a.id === selectedAgentId);
      setLeads(leads.map((l) =>
        l.id === selectedLeadId
          ? { ...l, assignedToId: selectedAgentId }
          : l
      ));
      setShowAssignModal(false);
      toast.success(`Lead assigned to ${agentName ? `${agentName.firstName} ${agentName.lastName || ''}` : 'agent'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign lead');
    }
  };

  const handleApproveStage = async (deal: Deal) => {
    try {
      const res = await api.patch<{ data: { stage: string } }>(`/admin/deals/${deal.id}/stage`);
      const newStage = res.data.stage;
      const newLabel = DEAL_STAGE_LABEL[newStage] || newStage;
      setDeals(deals.map((d) => d.id === deal.id ? { ...d, stage: newStage } : d));
      setSelectedDeal(null);
      toast.success(`Deal moved to ${newLabel}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to advance deal stage');
    }
  };

  const groupedDeals = deals.reduce<Record<string, Deal[]>>((acc, deal) => {
    const label = DEAL_STAGE_LABEL[deal.stage] || deal.stage;
    if (!acc[label]) acc[label] = [];
    acc[label].push(deal);
    return acc;
  }, {});

  const displayStatus = pendingStatus === 'APPROVED' ? 'active' : pendingStatus === 'REJECTED' ? 'rejected' : 'pending';

  return (
    <>
      <Toaster position="bottom-right" />

      <div className="p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[22px] font-semibold text-[#0D1117]">Properties</h1>
          <button
            onClick={() => setShowAddListingModal(true)}
            className="bg-[#4EA8A1] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#3d8983] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Listing</span>
          </button>
        </div>

        <div className="flex items-center gap-8 border-b border-[#E5E7EB] mb-6">
          {['listings', 'leads', 'deals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize relative ${
                activeTab === tab ? 'text-[#0D1117]' : 'text-[#6B7280] hover:text-[#0D1117]'
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4EA8A1]" />}
            </button>
          ))}
        </div>

        {activeTab === 'listings' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search properties..."
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
                  <tr className="bg-[#F9FAFB] h-12">
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Property</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Location</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Price</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Status</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Leads</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Agent</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingListings ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-[#6B7280]">Loading...</td></tr>
                  ) : listings.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-[#6B7280]">No listings found</td></tr>
                  ) : (
                    listings.map((listing) => (
                      <tr key={listing.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] transition-colors h-14">
                        <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117]">{listing.title || 'Untitled'}</span></td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{listing.fullAddress || '—'}</span></td>
                        <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117] tabular-nums">{formatPrice(listing.priceNGN)}</span></td>
                        <td className="px-6 py-4">
                          <StatusChip status={modStatusToChip(listing.moderationStatus)}>
                            {listing.moderationStatus.charAt(0) + listing.moderationStatus.slice(1).toLowerCase()}
                          </StatusChip>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280] tabular-nums">{listing._count?.leads ?? 0}</span></td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6B7280]">{listing.user.firstName} {listing.user.lastName || ''}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleListingClick(listing)} className="text-sm text-[#4EA8A1] hover:underline">View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search leads..." className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20" />
              </div>
              <button className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg flex items-center gap-2 hover:bg-[#F9FAFB] transition-colors">
                <Filter className="w-4 h-4 text-[#6B7280]" /><span className="text-sm text-[#6B7280]">Filter</span>
              </button>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] h-12">
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Buyer Name</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Budget</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Location Interest</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Priority</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Property</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Date</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLeads ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-[#6B7280]">Loading...</td></tr>
                  ) : leads.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-[#6B7280]">No leads found</td></tr>
                  ) : (
                    leads.map((lead) => {
                      const score = (lead.priority || 'medium').toLowerCase() as 'high' | 'medium' | 'low';
                      return (
                        <tr key={lead.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] transition-colors h-14">
                          <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117]">{lead.name || 'Anonymous'}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-[#6B7280] tabular-nums">{formatBudget(lead.budgetMin, lead.budgetMax)}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{lead.propertyLocation || '—'}</span></td>
                          <td className="px-6 py-4">
                            <StatusChip status={score}>{score.charAt(0).toUpperCase() + score.slice(1)}</StatusChip>
                          </td>
                          <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{lead.listing?.title || '—'}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{new Date(lead.createdAt).toLocaleDateString()}</span></td>
                          <td className="px-6 py-4">
                            <button onClick={() => openAssignModal(lead.id)} className="text-sm text-[#4EA8A1] hover:underline">
                              Assign
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

        {activeTab === 'deals' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              {['Filter by agent', 'Filter by tier', 'Sort by value'].map((label) => (
                <button key={label} className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg flex items-center gap-2 hover:bg-[#F9FAFB] transition-colors">
                  <span className="text-sm text-[#6B7280]">{label}</span>
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                </button>
              ))}
            </div>
            {loadingDeals ? (
              <div className="text-sm text-[#6B7280] py-8 text-center">Loading deals...</div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {KANBAN_COLUMNS.map((stage) => {
                    const stageDeals = groupedDeals[stage] || [];
                    return (
                      <div key={stage} className="flex-shrink-0 w-[280px]">
                        <div className="bg-[#F9FAFB] rounded-lg px-4 py-3 mb-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-[#0D1117]">{stage}</span>
                          <span className="text-xs font-medium text-[#6B7280] bg-white rounded-full px-2 py-0.5">{stageDeals.length}</span>
                        </div>
                        <div className="space-y-3">
                          {stageDeals.map((deal) => {
                            const agentInitials = `${deal.agent.firstName[0]}${deal.agent.lastName?.[0] ?? ''}`;
                            return (
                              <button
                                key={deal.id}
                                onClick={() => setSelectedDeal(deal)}
                                className={`w-full bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-left ${
                                  stage === 'Closed Won' ? 'border-l-4 border-l-[#10B981]' :
                                  stage === 'Closed Lost' ? 'border-l-4 border-l-[#EF4444] opacity-70' :
                                  'border-[#E5E7EB]'
                                }`}
                              >
                                <div className="font-medium text-sm text-[#0D1117] mb-1">{deal.buyerName}</div>
                                <div className="text-xs text-[#4EA8A1] mb-3">{deal.propertyName}</div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold text-[#0D1117] bg-[#0D1117]/5 px-2 py-1 rounded">{deal.budget || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
                                  <div className="w-6 h-6 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                                    <span className="text-white text-[10px] font-medium">{agentInitials}</span>
                                  </div>
                                  <span className="text-xs text-[#6B7280]">{deal.agent.firstName} {deal.agent.lastName || ''}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Listing Detail Panel */}
      <SlideInPanel isOpen={selectedListing !== null} onClose={() => setSelectedListing(null)} title="Listing Details">
        {selectedListing && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#0D1117] mb-1">{selectedListing.title || 'Untitled'}</h2>
              <p className="text-sm text-[#6B7280]">{selectedListing.fullAddress || '—'}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusChip status={displayStatus}>{displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}</StatusChip>
              <span className="text-2xl font-semibold text-[#0D1117]">{formatPrice(selectedListing.priceNGN)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-[#F9FAFB] rounded-lg">
                <div className="text-2xl font-semibold text-[#0D1117]">{selectedListing._count?.leads ?? 0}</div>
                <div className="text-xs text-[#6B7280] mt-1">Leads</div>
              </div>
              <div className="text-center p-4 bg-[#F9FAFB] rounded-lg">
                <div className="text-sm font-medium text-[#0D1117]">{selectedListing.user.firstName} {selectedListing.user.lastName || ''}</div>
                <div className="text-xs text-[#6B7280] mt-1">Agent</div>
              </div>
            </div>
            <label className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg cursor-pointer">
              <span className="text-sm font-medium text-[#0D1117]">Tag as Exclusive</span>
              <input
                type="checkbox"
                checked={isExclusive}
                onChange={(e) => {
                  setIsExclusive(e.target.checked);
                  toast.success(e.target.checked ? 'Listing tagged as exclusive' : 'Exclusive tag removed');
                }}
                className="w-4 h-4"
              />
            </label>
            <div>
              <h3 className="text-sm font-semibold text-[#0D1117] mb-3">Assign to Agents</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Starter only', 'Growth+', 'Elite+', 'All agents'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleAssignToTier(tier)}
                    className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:border-[#4EA8A1] hover:text-[#4EA8A1] transition-colors"
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleApproveListing} className="flex-1 px-4 py-2.5 bg-[#4EA8A1] text-white text-sm font-medium rounded-lg hover:bg-[#3d8983] transition-colors">Approve</button>
              <button onClick={() => setShowRejectModal(true)} className="flex-1 px-4 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#dc2626] transition-colors">Reject</button>
            </div>
          </div>
        )}
      </SlideInPanel>

      {/* Deal Detail Panel */}
      <SlideInPanel isOpen={selectedDeal !== null} onClose={() => setSelectedDeal(null)} title="Deal Details">
        {selectedDeal && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#0D1117] mb-1">{selectedDeal.buyerName}</h2>
              <p className="text-sm text-[#4EA8A1]">{selectedDeal.propertyName}</p>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Budget</div>
              <div className="text-2xl font-semibold text-[#0D1117]">{selectedDeal.budget || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-2">Assigned Agent</div>
              <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {selectedDeal.agent.firstName[0]}{selectedDeal.agent.lastName?.[0] ?? ''}
                  </span>
                </div>
                <span className="text-sm font-medium text-[#0D1117]">
                  {selectedDeal.agent.firstName} {selectedDeal.agent.lastName || ''}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-3">Current Stage</div>
              <div className="inline-flex items-center px-3 py-1.5 bg-[#4EA8A1]/10 text-[#4EA8A1] rounded-full text-sm font-medium">
                {DEAL_STAGE_LABEL[selectedDeal.stage] || selectedDeal.stage}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleApproveStage(selectedDeal)} className="flex-1 px-4 py-2.5 bg-[#4EA8A1] text-white text-sm font-medium rounded-lg hover:bg-[#3d8983] transition-colors">Advance Stage</button>
              <button onClick={() => toast.info('Deal flagged as suspicious')} className="px-4 py-2.5 border border-[#F59E0B] text-[#F59E0B] text-sm font-medium rounded-lg hover:bg-[#F59E0B]/5 transition-colors">Flag</button>
            </div>
          </div>
        )}
      </SlideInPanel>

      {/* Reject Listing Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Listing"
        footer={
          <>
            <button onClick={() => setShowRejectModal(false)} className="px-5 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors">Cancel</button>
            <button onClick={handleRejectListing} className="px-5 py-2 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#dc2626] transition-colors">Reject</button>
          </>
        }
      >
        <p className="text-sm text-[#6B7280] mb-4">Are you sure you want to reject this listing?</p>
        <textarea
          placeholder="Optional reason..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
          rows={3}
        />
      </Modal>

      {/* Assign Lead Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => { setShowAssignModal(false); setSelectedLeadId(null); }}
        title="Assign Lead to Agent"
        footer={
          <>
            <button onClick={() => { setShowAssignModal(false); setSelectedLeadId(null); }} className="px-5 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors">Cancel</button>
            <button onClick={handleAssignLead} disabled={!selectedAgentId} className="px-5 py-2 bg-[#4EA8A1] text-white text-sm font-medium rounded-lg hover:bg-[#3d8983] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Assign</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agents..."
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', 'Starter', 'Growth', 'Elite', 'Partner'].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tierFilter === tier ? 'bg-[#4EA8A1] text-white' : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-[#E5E7EB]'}`}
              >
                {tier}
              </button>
            ))}
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {agentOptions
              .filter((a) => {
                const name = `${a.firstName} ${a.lastName || ''}`.toLowerCase();
                const matchesSearch = name.includes(agentSearch.toLowerCase());
                const tier = PLAN_TO_TIER[a.subscriptionPlan] || 'starter';
                const matchesTier = tierFilter === 'All' || tier === tierFilter.toLowerCase();
                return matchesSearch && matchesTier;
              })
              .map((agent) => (
                <label key={agent.id} className="flex items-center gap-3 p-3 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer">
                  <input type="radio" name="agent" checked={selectedAgentId === agent.id} onChange={() => setSelectedAgentId(agent.id)} className="w-4 h-4 text-[#4EA8A1]" />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-[#4EA8A1] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">{agent.firstName[0]}{agent.lastName?.[0] ?? ''}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#0D1117]">{agent.firstName} {agent.lastName || ''}</div>
                      <TierChip tier={PLAN_TO_TIER[agent.subscriptionPlan] || 'starter'} />
                    </div>
                  </div>
                </label>
              ))
            }
            {agentOptions.length === 0 && (
              <div className="text-sm text-[#6B7280] text-center py-4">Loading agents...</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add Listing Modal */}
      <Modal isOpen={showAddListingModal} onClose={() => setShowAddListingModal(false)} title="Add Listing">
        <div className="text-center py-8">
          <p className="text-sm text-[#6B7280]">Same as user end flow</p>
        </div>
      </Modal>

    </>
  );
}
