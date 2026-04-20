import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Megaphone, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/properties', label: 'Properties', icon: Building2 },
  { path: '/agents', label: 'Agents', icon: Users },
  { path: '/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    console.log('User logged out');
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#0D1117] flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4EA8A1] flex items-center justify-center">
              <span className="font-semibold text-white text-sm">I</span>
            </div>
            <span className="text-white font-semibold text-base tracking-tight">INDA</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-[14px] transition-colors relative ${
                  isActive
                    ? 'text-[#4EA8A1] bg-[rgba(255,255,255,0.08)]'
                    : 'text-white/70 hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#4EA8A1] rounded-r" />
                )}
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 pb-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-4">
            <div className="w-9 h-9 rounded-full bg-[#4EA8A1] flex items-center justify-center">
              <span className="text-white text-sm font-medium">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Admin User</div>
              <div className="text-white/50 text-xs">Administrator</div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-white/50 hover:text-white/70 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Log Out"
        footer={
          <>
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-5 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#dc2626] transition-colors"
            >
              Log Out
            </button>
          </>
        }
      >
        <p className="text-sm text-[#6B7280]">Are you sure you want to log out?</p>
      </Modal>
    </>
  );
}
