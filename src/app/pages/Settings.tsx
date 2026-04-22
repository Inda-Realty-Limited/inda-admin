import { Shield, Bell, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  role: string;
  isActive: boolean;
}

interface PlatformConfig {
  defaultCommissionRate: number;
  eliteTierThreshold: number;
  partnerTierThreshold: number;
  leadDistributionModel: string;
  notifyNewAgents: boolean;
  notifyPendingDeals: boolean;
  notifyHighValueListings: boolean;
  notifyBudgetThreshold: boolean;
  notifyInactiveAgents: boolean;
  notifyWeeklyDigest: boolean;
}

const DISTRIBUTION_MODELS = [
  { value: 'ROUND_ROBIN', label: 'Round Robin' },
  { value: 'TIER_BASED', label: 'Tier-Based Priority' },
  { value: 'PERFORMANCE_BASED', label: 'Performance-Based' },
];

function formatThreshold(value: number): string {
  return value.toLocaleString('en-NG');
}

function parseThreshold(str: string): number {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

export function Settings() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const [config, setConfig] = useState<PlatformConfig>({
    defaultCommissionRate: 10,
    eliteTierThreshold: 50000000,
    partnerTierThreshold: 100000000,
    leadDistributionModel: 'ROUND_ROBIN',
    notifyNewAgents: true,
    notifyPendingDeals: true,
    notifyHighValueListings: true,
    notifyBudgetThreshold: false,
    notifyInactiveAgents: true,
    notifyWeeklyDigest: false,
  });
  const originalConfig = useRef<PlatformConfig>(config);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingToggle, setSavingToggle] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ data: PlatformConfig }>('/admin/config')
      .then((res) => {
        setConfig(res.data);
        originalConfig.current = res.data;
      })
      .catch(console.error)
      .finally(() => setLoadingConfig(false));
  }, []);

  useEffect(() => {
    Promise.all([
      api.get<{ data: AdminUser[] }>('/admin/users?role=SUPER_ADMIN&limit=20'),
      api.get<{ data: AdminUser[] }>('/admin/users?role=ADMIN&limit=20'),
    ])
      .then(([superRes, adminRes]) => setTeamMembers([...superRes.data, ...adminRes.data]))
      .catch(console.error)
      .finally(() => setLoadingTeam(false));
  }, []);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await api.patch<{ data: PlatformConfig }>('/admin/config', {
        defaultCommissionRate: config.defaultCommissionRate,
        eliteTierThreshold: config.eliteTierThreshold,
        partnerTierThreshold: config.partnerTierThreshold,
        leadDistributionModel: config.leadDistributionModel,
      });
      setConfig((prev) => ({ ...prev, ...res.data }));
      originalConfig.current = { ...originalConfig.current, ...res.data };
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleNotification = async (key: keyof PlatformConfig, value: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSavingToggle(key);
    try {
      await api.patch('/admin/config', { [key]: value });
    } catch {
      // Revert on failure
      setConfig((prev) => ({ ...prev, [key]: !value }));
      toast.error('Failed to update notification preference');
    } finally {
      setSavingToggle(null);
    }
  };

  const handleCancelConfig = () => {
    setConfig(originalConfig.current);
  };

  const getRoleLabel = (role: string) => {
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'Admin';
    return role;
  };

  return (
    <>
      <Toaster position="bottom-right" />

      <div className="p-6 w-full">
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

            {loadingConfig ? (
              <div className="text-sm text-[#6B7280] text-center py-4">Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#0D1117] mb-2">Default Commission Rate</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={config.defaultCommissionRate}
                        onChange={(e) => setConfig({ ...config, defaultCommissionRate: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
                      />
                      <span className="text-sm text-[#6B7280]">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D1117] mb-2">Elite Tier Threshold</label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#6B7280]">₦</span>
                      <input
                        type="text"
                        value={formatThreshold(config.eliteTierThreshold)}
                        onChange={(e) => setConfig({ ...config, eliteTierThreshold: parseThreshold(e.target.value) })}
                        className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D1117] mb-2">Partner Tier Threshold</label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#6B7280]">₦</span>
                      <input
                        type="text"
                        value={formatThreshold(config.partnerTierThreshold)}
                        onChange={(e) => setConfig({ ...config, partnerTierThreshold: parseThreshold(e.target.value) })}
                        className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0D1117] mb-2">Lead Distribution Model</label>
                    <select
                      value={config.leadDistributionModel}
                      onChange={(e) => setConfig({ ...config, leadDistributionModel: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8A1]/20"
                    >
                      {DISTRIBUTION_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#E5E7EB]">
                  <button onClick={handleCancelConfig} className="px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleSaveConfig} disabled={savingConfig} className="px-4 py-2 bg-[#4EA8A1] text-white text-sm font-medium rounded-lg hover:bg-[#3d8983] transition-colors disabled:opacity-60">
                    {savingConfig ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
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
              {loadingTeam ? (
                <div className="text-sm text-[#6B7280] text-center py-4">Loading...</div>
              ) : teamMembers.length === 0 ? (
                <div className="text-sm text-[#6B7280] text-center py-4">No admin users found</div>
              ) : (
                teamMembers.map((member) => {
                  const initials = `${member.firstName[0]}${member.lastName?.[0] ?? ''}`;
                  const isCurrentUser = member.id === user?.id;
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#4EA8A1] flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{initials}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#0D1117]">
                            {member.firstName} {member.lastName || ''}
                            {isCurrentUser && <span className="ml-2 text-xs text-[#6B7280]">(you)</span>}
                          </div>
                          <div className="text-sm text-[#6B7280]">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#6B7280]">{getRoleLabel(member.role)}</span>
                        {!isCurrentUser && (
                          <button className="text-sm text-[#4EA8A1] hover:underline">Edit</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
              {(
                [
                  { key: 'notifyNewAgents' as const, label: 'New agent registrations', description: 'Get notified when a new agent signs up' },
                  { key: 'notifyPendingDeals' as const, label: 'Pending deal approvals', description: 'Alert when a new deal is created' },
                  { key: 'notifyHighValueListings' as const, label: 'High-value property submissions', description: 'Notify for properties over ₦50M' },
                  { key: 'notifyBudgetThreshold' as const, label: 'Marketing budget thresholds', description: 'Alert when agents reach 80% of budget' },
                  { key: 'notifyInactiveAgents' as const, label: 'Inactive agent warnings', description: 'Notify when agents are inactive for 7+ days' },
                  { key: 'notifyWeeklyDigest' as const, label: 'Weekly performance summary', description: 'Receive weekly analytics digest' },
                ] as { key: keyof PlatformConfig; label: string; description: string }[]
              ).map((notification) => (
                <div key={notification.key} className="flex items-start justify-between py-3 border-b border-[#E5E7EB] last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#0D1117] mb-1">{notification.label}</div>
                    <div className="text-xs text-[#6B7280]">{notification.description}</div>
                  </div>
                  <label className="relative inline-block w-11 h-6 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(config[notification.key])}
                      disabled={savingToggle === notification.key || loadingConfig}
                      onChange={(e) => handleToggleNotification(notification.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4EA8A1] peer-disabled:opacity-50" />
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
