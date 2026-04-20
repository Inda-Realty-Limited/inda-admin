import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StatusChip } from '../components/StatusChip';
import { Modal } from '../components/Modal';
import { SlideInPanel } from '../components/SlideInPanel';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const listingsData = [
  { id: 1, name: '4BR Villa', location: 'Lekki Phase 1', address: '15 Palm Grove Street', price: '₦85,000,000', status: 'active' as const, leads: 24, agents: 8, daysOnPlatform: 45 },
  { id: 2, name: '3BR Apartment', location: 'Victoria Island', address: '42 Adeola Odeku', price: '₦45,000,000', status: 'active' as const, leads: 18, agents: 12, daysOnPlatform: 32 },
  { id: 3, name: '5BR Duplex', location: 'Ikoyi', address: '8 Banana Island Road', price: '₦120,000,000', status: 'pending' as const, leads: 31, agents: 5, daysOnPlatform: 12 },
  { id: 4, name: '2BR Flat', location: 'Ikeja GRA', address: '23 Allen Avenue', price: '₦28,000,000', status: 'active' as const, leads: 15, agents: 9, daysOnPlatform: 28 },
  { id: 5, name: '4BR Terrace', location: 'Ajah', address: '67 Lekki-Epe Expressway', price: '₦52,000,000', status: 'active' as const, leads: 22, agents: 7, daysOnPlatform: 56 },
];

interface Lead {
  id: number; buyer: string; budget: string; location: string;
  score: 'high' | 'medium' | 'low'; agent: string; agentId: number | null;
  date: string; assigned: boolean;
}

const leadsData: Lead[] = [
  { id: 1, buyer: 'Adewale Johnson', budget: '₦80-100M', location: 'Lekki, VI', score: 'high', agent: 'Oluwaseun A.', agentId: 1, date: '2026-04-08', assigned: true },
  { id: 2, buyer: 'Grace Eze', budget: '₦40-50M', location: 'Victoria Island', score: 'medium', agent: 'Chidinma O.', agentId: 2, date: '2026-04-08', assigned: true },
  { id: 3, buyer: 'Michael Obi', budget: '₦100-150M', location: 'Ikoyi', score: 'high', agent: 'Ibrahim M.', agentId: 3, date: '2026-04-07', assigned: true },
  { id: 4, buyer: 'Fatima Abubakar', budget: '₦25-35M', location: 'Ikeja', score: 'low', agent: 'Unassigned', agentId: null, date: '2026-04-07', assigned: false },
  { id: 5, buyer: 'Daniel Okoro', budget: '₦50-60M', location: 'Ajah, Lekki', score: 'medium', agent: 'Blessing N.', agentId: 4, date: '2026-04-06', assigned: true },
];

interface Deal {
  id: number; buyer: string; property: string; value: string;
  agent: string; agentAvatar: string; daysInStage: number; stage: string;
}

const dealsData: Deal[] = [
  { id: 1, buyer: 'Ahmed Ibrahim', property: '3BR Flat, Ikeja', value: '₦32M', agent: 'Chidinma O.', agentAvatar: 'CO', daysInStage: 2, stage: 'Lead' },
  { id: 2, buyer: 'Jennifer Okeke', property: '4BR Villa, Lekki', value: '₦78M', agent: 'Oluwaseun A.', agentAvatar: 'OA', daysInStage: 1, stage: 'Lead' },
  { id: 3, buyer: 'Kunle Adebayo', property: '2BR Condo, VI', value: '₦45M', agent: 'Ibrahim M.', agentAvatar: 'IM', daysInStage: 5, stage: 'Contacted' },
  { id: 4, buyer: 'Ngozi Eze', property: '5BR Duplex, Ikoyi', value: '₦125M', agent: 'Tunde B.', agentAvatar: 'TB', daysInStage: 3, stage: 'Contacted' },
  { id: 5, buyer: 'Yusuf Hassan', property: '3BR Apartment, Ajah', value: '₦38M', agent: 'Blessing N.', agentAvatar: 'BN', daysInStage: 7, stage: 'Inspection' },
  { id: 6, buyer: 'Chiamaka Nwankwo', property: '4BR Terrace, Lekki', value: '₦62M', agent: 'Chidinma O.', agentAvatar: 'CO', daysInStage: 4, stage: 'Offer Made' },
  { id: 7, buyer: 'David Ola', property: '2BR Flat, Yaba', value: '₦28M', agent: 'Ibrahim M.', agentAvatar: 'IM', daysInStage: 6, stage: 'Offer Made' },
  { id: 8, buyer: 'Blessing Okafor', property: '5BR Villa, VI', value: '₦145M', agent: 'Oluwaseun A.', agentAvatar: 'OA', daysInStage: 8, stage: 'Negotiation' },
  { id: 9, buyer: 'Emeka Obi', property: '3BR Condo, Ikoyi', value: '₦95M', agent: 'Tunde B.', agentAvatar: 'TB', daysInStage: 2, stage: 'Closed Won' },
  { id: 10, buyer: 'Aisha Mohammed', property: '4BR Duplex, Lekki', value: '₦88M', agent: 'Blessing N.', agentAvatar: 'BN', daysInStage: 1, stage: 'Closed Lost' },
];

const agents = [
  { id: 1, name: 'Oluwaseun Adeyemi', tier: 'Elite' },
  { id: 2, name: 'Chidinma Okonkwo', tier: 'Growth' },
  { id: 3, name: 'Ibrahim Mohammed', tier: 'Elite' },
  { id: 4, name: 'Blessing Nwosu', tier: 'Growth' },
  { id: 5, name: 'Tunde Bakare', tier: 'Partner' },
];

export function Properties() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'listings';

  const [selectedListing, setSelectedListing] = useState<typeof listingsData[0] | null>(null);
  const [isExclusive, setIsExclusive] = useState(false);
  const [listingStatus, setListingStatus] = useState<'active' | 'pending' | 'approved' | 'rejected'>('active');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [tierFilter, setTierFilter] = useState('All');
  const [leads, setLeads] = useState<Lead[]>(leadsData);

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deals, setDeals] = useState(dealsData);

  const [showAddListingModal, setShowAddListingModal] = useState(false);

  const setActiveTab = (tab: string) => navigate(`/properties?tab=${tab}`);

  const handleListingClick = (listing: typeof listingsData[0]) => {
    setSelectedListing(listing);
    setListingStatus(listing.status as 'active' | 'pending');
  };

  const handleApproveListing = () => {
    setListingStatus('approved');
    toast.success('Listing approved');
  };

  const handleRejectListing = () => {
    setListingStatus('rejected');
    setShowRejectModal(false);
    toast.success('Listing rejected');
  };

  const handleAssignToTier = (tier: string) => toast.success(`Listing assigned to ${tier} agents`);

  const handleAssignLead = () => {
    if (selectedLead !== null && selectedAgent !== null) {
      setLeads(leads.map((lead) =>
        lead.id === selectedLead
          ? { ...lead, agent: agents.find((a) => a.id === selectedAgent)?.name || 'Assigned', assigned: true, agentId: selectedAgent }
          : lead
      ));
      setShowAssignModal(false);
      toast.success('Lead assigned successfully');
    }
  };

  const handleApproveStage = (deal: Deal) => {
    const stages = ['Lead', 'Contacted', 'Inspection', 'Offer Made', 'Negotiation', 'Closed Won'];
    const currentIndex = stages.indexOf(deal.stage);
    if (currentIndex < stages.length - 1) {
      setDeals(deals.map((d) => d.id === deal.id ? { ...d, stage: stages[currentIndex + 1], daysInStage: 0 } : d));
      setSelectedDeal(null);
      toast.success(`Deal moved to ${stages[currentIndex + 1]}`);
    }
  };

  const groupedDeals = deals.reduce((acc, deal) => {
    if (!acc[deal.stage]) acc[deal.stage] = [];
    acc[deal.stage].push(deal);
    return acc;
  }, {} as Record<string, Deal[]>);

  const filteredAgents = tierFilter === 'All' ? agents : agents.filter((a) => a.tier === tierFilter);

  return (
    <>
      <Toaster position="bottom-right" />

      <div className="p-6 max-w-[1280px]">
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
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Property Name</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Location</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Price</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Status</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Leads</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Agents</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listingsData
                    .filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((listing) => (
                      <tr key={listing.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] transition-colors h-14">
                        <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117]">{listing.name}</span></td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{listing.location}</span></td>
                        <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117] tabular-nums">{listing.price}</span></td>
                        <td className="px-6 py-4">
                          <StatusChip status={listing.status}>{listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}</StatusChip>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280] tabular-nums">{listing.leads}</span></td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280] tabular-nums">{listing.agents}</span></td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleListingClick(listing)} className="text-sm text-[#4EA8A1] hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
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
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Lead Score</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Assigned Agent</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Date</th>
                    <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] transition-colors h-14">
                      <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117]">{lead.buyer}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-[#6B7280] tabular-nums">{lead.budget}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{lead.location}</span></td>
                      <td className="px-6 py-4">
                        <StatusChip status={lead.score}>{lead.score.charAt(0).toUpperCase() + lead.score.slice(1)}</StatusChip>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{lead.agent}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{lead.date}</span></td>
                      <td className="px-6 py-4">
                        <button onClick={() => { setSelectedLead(lead.id); setShowAssignModal(true); }} className="text-sm text-[#4EA8A1] hover:underline">
                          {lead.assigned ? 'Reassign' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  ))}
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
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {['Lead', 'Contacted', 'Inspection', 'Offer Made', 'Negotiation', 'Closed Won', 'Closed Lost'].map((stage) => {
                  const stageDeals = groupedDeals[stage] || [];
                  return (
                    <div key={stage} className="flex-shrink-0 w-[280px]">
                      <div className="bg-[#F9FAFB] rounded-lg px-4 py-3 mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-[#0D1117]">{stage}</span>
                        <span className="text-xs font-medium text-[#6B7280] bg-white rounded-full px-2 py-0.5">{stageDeals.length}</span>
                      </div>
                      <div className="space-y-3">
                        {stageDeals.map((deal) => (
                          <button
                            key={deal.id}
                            onClick={() => setSelectedDeal(deal)}
                            className={`w-full bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-left ${
                              stage === 'Closed Won' ? 'border-l-4 border-l-[#10B981]' :
                              stage === 'Closed Lost' ? 'border-l-4 border-l-[#EF4444] opacity-70' :
                              'border-[#E5E7EB]'
                            }`}
                          >
                            <div className="font-medium text-sm text-[#0D1117] mb-1">{deal.buyer}</div>
                            <div className="text-xs text-[#4EA8A1] mb-3">{deal.property}</div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-[#0D1117] bg-[#0D1117]/5 px-2 py-1 rounded">{deal.value}</span>
                              <span className="text-xs text-[#9CA3AF]">{deal.daysInStage}d</span>
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
                              <div className="w-6 h-6 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                                <span className="text-white text-[10px] font-medium">{deal.agentAvatar}</span>
                              </div>
                              <span className="text-xs text-[#6B7280]">{deal.agent}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Listing Detail Panel */}
      <SlideInPanel isOpen={selectedListing !== null} onClose={() => setSelectedListing(null)} title="Listing Details">
        {selectedListing && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#0D1117] mb-1">{selectedListing.name}</h2>
              <p className="text-sm text-[#6B7280]">{selectedListing.address}, {selectedListing.location}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusChip status={listingStatus}>{listingStatus.charAt(0).toUpperCase() + listingStatus.slice(1)}</StatusChip>
              <span className="text-2xl font-semibold text-[#0D1117]">{selectedListing.price}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Leads', value: selectedListing.leads },
                { label: 'Agents', value: selectedListing.agents },
                { label: 'Days', value: selectedListing.daysOnPlatform },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="text-2xl font-semibold text-[#0D1117]">{stat.value}</div>
                  <div className="text-xs text-[#6B7280] mt-1">{stat.label}</div>
                </div>
              ))}
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
              <h2 className="text-lg font-semibold text-[#0D1117] mb-1">{selectedDeal.buyer}</h2>
              <p className="text-sm text-[#4EA8A1]">{selectedDeal.property}</p>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Deal Value</div>
              <div className="text-2xl font-semibold text-[#0D1117]">{selectedDeal.value}</div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-2">Assigned Agent</div>
              <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{selectedDeal.agentAvatar}</span>
                </div>
                <span className="text-sm font-medium text-[#0D1117]">{selectedDeal.agent}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-3">Current Stage</div>
              <div className="inline-flex items-center px-3 py-1.5 bg-[#4EA8A1]/10 text-[#4EA8A1] rounded-full text-sm font-medium">
                {selectedDeal.stage}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleApproveStage(selectedDeal)} className="flex-1 px-4 py-2.5 bg-[#4EA8A1] text-white text-sm font-medium rounded-lg hover:bg-[#3d8983] transition-colors">Approve Stage</button>
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
        <textarea placeholder="Optional reason..." className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20" rows={3} />
      </Modal>

      {/* Assign Lead Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Lead to Agent"
        footer={
          <>
            <button onClick={() => setShowAssignModal(false)} className="px-5 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors">Cancel</button>
            <button onClick={handleAssignLead} disabled={!selectedAgent} className="px-5 py-2 bg-[#4EA8A1] text-white text-sm font-medium rounded-lg hover:bg-[#3d8983] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Assign</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search agents..." className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20" />
          </div>
          <div className="flex gap-2">
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
            {filteredAgents.map((agent) => (
              <label key={agent.id} className="flex items-center gap-3 p-3 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer">
                <input type="radio" name="agent" checked={selectedAgent === agent.id} onChange={() => setSelectedAgent(agent.id)} className="w-4 h-4 text-[#4EA8A1]" />
                <div>
                  <div className="text-sm font-medium text-[#0D1117]">{agent.name}</div>
                  <div className="text-xs text-[#6B7280]">{agent.tier}</div>
                </div>
              </label>
            ))}
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
