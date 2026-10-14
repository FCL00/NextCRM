import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  CheckSquare,
  BarChart3,
  X,
  LogOut,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useCrm();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/companies', label: 'Companies', icon: Building2 },
    { path: '/deals', label: 'Deals', icon: Kanban },
    { path: '/activities', label: 'Activities', icon: CheckSquare },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="h-16 px-4 flex items-center justify-between border-b border-stone-100">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-extrabold text-base">
              N
            </div>
            <span className="font-bold text-stone-900 text-base">NextCRM</span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-stone-400'}`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-bold text-stone-900 truncate">{user?.name}</div>
              <div className="text-[11px] text-stone-500 truncate">{user?.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
