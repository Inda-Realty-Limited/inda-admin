import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TierChip } from '../components/TierChip';
import { StatusChip } from '../components/StatusChip';
import { Modal } from '../components/Modal';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const activityData = [
  { value: 12 }, { value: 19 }, { value: 15 }, { value: 25 },
  { value: 22 }, { value: 30 }, { value: 28 }, { value: 35 },
];

const agentData: Record<string, {
  name: string; avatar: string; tier: 'starter' | 'growth' | 'elite' | 'partner';
  status: 'active' | 'pending' | 'suspended'; joinDate: string; phone: string;
  email: string; conversionRate: string; dealsClosed: number; revenue: string;
  leads: number; commission: number;
}> = {
  '1': {
    name: 'Oluwaseun Adeyemi', avatar: 'OA', tier: 'elite', status: 'active',
    joinDate: 'Jan 15, 2025', phone: '+234 803 123 4567', email: 'oluwaseun.a@email.com',
    conversionRate: '42%', dealsClosed: 24, revenue: '₦48.2M', leads: 45, commission: 12,
  },
  '2': {
    name: 'Chidinma Okonkwo', avatar: 'CO', tier: 'growth', status: 'active',
    joinDate: 'Mar 2, 2025', phone: '+234 806 234 5678', email: 'chidinma.o@email.com',
    conversionRate: '38%', dealsClosed: 19, revenue: '₦38.5M', leads: 38, commission: 10,
  },
};

const listings = [
  { id: 1, property: '4BR Villa, Lekki', status: 'active' as const, leads: 24, dateAdded: '2026-03-15' },
  { id: 2, property: '3BR Apartment, VI', status: 'active' as const, leads: 18, dateAdded: '2026-03-20' },
  { id: 3, property: '5BR Duplex, Ikoyi', status: 'pending' as const, leads: 31, dateAdded: '2026-04-02' },
];

const leadsData = {
  broughtIn: [
    { id: 1, buyer: 'Michael Johnson', budget: '₦50M', location: 'Lekki', date: '2026-04-05' },
    { id: 2, buyer: 'Sarah Williams', budget: '₦35M', location: 'VI', date: '2026-04-03' },
  ],
  assigned: [
    { id: 3, buyer: 'David Chen', budget: '₦80M', location: 'Ikoyi', date: '2026-04-08' },
    { id: 4, buyer: 'Grace Adebayo', budget: '₦45M', location: 'Lekki', date: '2026-04-07' },
  ],
};

const deals = [
  { id: 1, buyer: 'Emeka Obi', property: '3BR Condo, Ikoyi', value: '₦95M', stage: 'Negotiation', daysOpen: 8 },
  { id: 2, buyer: 'Jennifer Okeke', property: '4BR Villa, Lekki', value: '₦78M', stage: 'Inspection', daysOpen: 12 },
];

const marketingServices = [
  { id: 1, service: 'Photography', package: 'Premium', status: 'completed' as const, cost: '₦85,000' },
  { id: 2, service: 'Digital Ads', package: 'Leads Campaign', status: 'in-progress' as const, cost: '₦250,000' },
];

export function AgentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTier, setSelectedTier] = useState<'starter' | 'growth' | 'elite' | 'partner'>('elite');
  const [commission, setCommission] = useState(12);
  const [marketingBudget, setMarketingBudget] = useState('1,500,000');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [perks, setPerks] = useState({ prioritySupport: true, exclusiveListings: true, coaching: true });

  const agent = agentData[id || '1'] || agentData['1'];

  const handleSave = () => toast.success('Agent updated successfully');

  const handleSuspend = () => {
    toast.success(`${agent.name} has been suspended`);
    setShowSuspendModal(false);
    navigate('/agents');
  };

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

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                  <span className="text-white text-2xl font-medium">{agent.avatar}</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-[22px] font-semibold text-[#0D1117] mb-2">{agent.name}</h1>
                  <div className="flex items-center gap-3 mb-3">
                    <TierChip tier={selectedTier} />
                    <StatusChip status={agent.status}>
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </StatusChip>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-[#6B7280]">Joined: </span><span className="text-[#0D1117]">{agent.joinDate}</span></div>
                    <div><span className="text-[#6B7280]">Phone: </span><span className="text-[#0D1117]">{agent.phone}</span></div>
                    <div><span className="text-[#6B7280]">Email: </span><span className="text-[#0D1117]">{agent.email}</span></div>
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
                    { label: 'Conversion Rate', value: agent.conversionRate },
                    { label: 'Deals Closed', value: agent.dealsClosed },
                    { label: 'Revenue', value: agent.revenue },
                    { label: 'Leads', value: agent.leads },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-white border border-[#E5E7EB] rounded-[10px] p-5">
                      <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-2">{metric.label}</div>
                      <div className="text-2xl font-semibold text-[#0D1117]">{metric.value}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-4">Activity Over Time</div>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={activityData}>
                      <Line type="monotone" dataKey="value" stroke="#4EA8A1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F9FAFB] h-12">
                      <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Property Name</th>
                      <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Status</th>
                      <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Leads Generated</th>
                      <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr key={listing.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] h-14">
                        <td className="px-6 py-4"><span className="text-sm text-[#0D1117]">{listing.property}</span></td>
                        <td className="px-6 py-4">
                          <StatusChip status={listing.status}>{listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}</StatusChip>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{listing.leads}</span></td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{listing.dateAdded}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-6">
                {[
                  { title: 'Leads Brought In', data: leadsData.broughtIn },
                  { title: 'Leads Assigned', data: leadsData.assigned },
                ].map((section) => (
                  <div key={section.title}>
                    <h3 className="text-base font-semibold text-[#0D1117] mb-3">{section.title}</h3>
                    <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#F9FAFB] h-12">
                            <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Buyer</th>
                            <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Budget</th>
                            <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Location</th>
                            <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.data.map((lead) => (
                            <tr key={lead.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] h-14">
                              <td className="px-6 py-4"><span className="text-sm text-[#0D1117]">{lead.buyer}</span></td>
                              <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{lead.budget}</span></td>
                              <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{lead.location}</span></td>
                              <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{lead.date}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'deals' && (
              <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F9FAFB] h-12">
                      <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Buyer</th>
                      <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Property</th>
                      <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Value</th>
                      <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Stage</th>
                      <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Days Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((deal) => (
                      <tr key={deal.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] h-14">
                        <td className="px-6 py-4"><span className="text-sm text-[#0D1117]">{deal.buyer}</span></td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{deal.property}</span></td>
                        <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117]">{deal.value}</span></td>
                        <td className="px-6 py-4"><StatusChip status="in-progress">{deal.stage}</StatusChip></td>
                        <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{deal.daysOpen}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'marketing' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-4">Marketing Budget</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#6B7280]">Allocated: ₦1,500,000</span>
                    <span className="text-sm text-[#6B7280]">Spent: ₦980,000 (65%)</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2.5">
                    <div className="bg-[#4EA8A1] h-2.5 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#0D1117] mb-3">Services Requested</h3>
                  <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#F9FAFB] h-12">
                          <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Service</th>
                          <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Package</th>
                          <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Status</th>
                          <th className="text-left text-[13px] font-medium text-[#6B7280] px-6 py-3">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketingServices.map((service) => (
                          <tr key={service.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FFFE] h-14">
                            <td className="px-6 py-4"><span className="text-sm text-[#0D1117]">{service.service}</span></td>
                            <td className="px-6 py-4"><span className="text-sm text-[#6B7280]">{service.package}</span></td>
                            <td className="px-6 py-4">
                              <StatusChip status={service.status}>
                                {service.status === 'in-progress' ? 'In Progress' : 'Completed'}
                              </StatusChip>
                            </td>
                            <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1117]">{service.cost}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-4">Campaign Performance Summary</div>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-[#6B7280] mb-1">Total Campaigns</div>
                      <div className="text-2xl font-semibold text-[#0D1117]">3</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B7280] mb-1">Leads Generated</div>
                      <div className="text-2xl font-semibold text-[#0D1117]">42</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B7280] mb-1">ROI</div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#10B981]" />
                        <span className="text-2xl font-semibold text-[#10B981]">348%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-[260px]">
            <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-5 sticky top-6 space-y-5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] mb-4">Agent Controls</div>

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
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspend Agent"
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
              Suspend
            </button>
          </>
        }
      >
        <p className="text-sm text-[#6B7280]">
          Suspend <span className="font-medium text-[#0D1117]">{agent.name}</span>? They will lose access immediately.
        </p>
      </Modal>
    </>
  );
}
