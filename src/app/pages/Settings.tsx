import { Shield, Bell, Users } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

export function Settings() {
  const [toggles, setToggles] = useState({
    newAgents: true,
    pendingDeals: true,
    highValue: true,
    budgetThreshold: false,
    inactiveAgents: true,
    weeklyDigest: false,
  });

  const handleSaveConfig = () => toast.success('Settings saved successfully');

  return (
    <>
      <Toaster position="bottom-right" />

      <div className="p-6 max-w-[1280px]">
        <div className="mb-6">
          <h1 className="text-[22px] font-semibold text-[#0D1117]">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Platform Config */}
          <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#4EA8A1]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#4EA8A1]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0D1117]">Platform Configuration</h2>
                <p className="text-sm text-[#6B7280]">Manage commission rates and tier thresholds</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#0D1117] mb-2">Default Commission Rate</label>
                <div className="flex items-center gap-3">
                  <input type="number" defaultValue={10} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20" />
                  <span className="text-sm text-[#6B7280]">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1117] mb-2">Elite Tier Threshold</label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#6B7280]">₦</span>
                  <input type="text" defaultValue="50,000,000" className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1117] mb-2">Partner Tier Threshold</label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#6B7280]">₦</span>
                  <input type="text" defaultValue="100,000,000" className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D1117] mb-2">Lead Distribution Model</label>
                <select className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20">
                  <option>Round Robin</option>
                  <option>Tier-Based Priority</option>
                  <option>Performance-Based</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#E5E7EB]">
              <button className="px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSaveConfig} className="px-4 py-2 bg-[#4EA8A1] text-white text-sm font-medium rounded-lg hover:bg-[#3d8983] transition-colors">Save Changes</button>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#4EA8A1]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#4EA8A1]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#0D1117]">Team Members</h2>
                  <p className="text-sm text-[#6B7280]">Manage admin users and permissions</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-[#4EA8A1] text-[#4EA8A1] text-sm font-medium rounded-lg hover:bg-[#4EA8A1]/5 transition-colors">Add Member</button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Admin User', email: 'admin@inda.ng', role: 'Super Admin', avatar: 'AD' },
                { name: 'Sarah Okonkwo', email: 'sarah@inda.ng', role: 'Admin', avatar: 'SO' },
                { name: 'Michael Eze', email: 'michael@inda.ng', role: 'Manager', avatar: 'ME' },
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{member.avatar}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#0D1117]">{member.name}</div>
                      <div className="text-sm text-[#6B7280]">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#6B7280]">{member.role}</span>
                    <button className="text-sm text-[#4EA8A1] hover:underline">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#4EA8A1]/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#4EA8A1]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0D1117]">Notifications</h2>
                <p className="text-sm text-[#6B7280]">Configure alert preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'newAgents', label: 'New agent registrations', description: 'Get notified when a new agent signs up' },
                { key: 'pendingDeals', label: 'Pending deal approvals', description: 'Alert when deals require admin approval' },
                { key: 'highValue', label: 'High-value property submissions', description: 'Notify for properties over ₦50M' },
                { key: 'budgetThreshold', label: 'Marketing budget thresholds', description: 'Alert when agents reach 80% of budget' },
                { key: 'inactiveAgents', label: 'Inactive agent warnings', description: 'Notify when agents are inactive for 7+ days' },
                { key: 'weeklyDigest', label: 'Weekly performance summary', description: 'Receive weekly analytics digest' },
              ].map((notification) => (
                <div key={notification.key} className="flex items-start justify-between py-3 border-b border-[#E5E7EB] last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#0D1117] mb-1">{notification.label}</div>
                    <div className="text-xs text-[#6B7280]">{notification.description}</div>
                  </div>
                  <label className="relative inline-block w-11 h-6 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={toggles[notification.key as keyof typeof toggles]}
                      onChange={(e) => setToggles({ ...toggles, [notification.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4EA8A1]" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
