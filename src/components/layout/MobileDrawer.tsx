import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { AppView } from '../../types/crm';
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  CheckSquare,
  BarChart3,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { activeView, setActiveView, user, signOut, loadDemoData } = useCrm();

  if (!isOpen) return null;

  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'deals', label: 'Deals', icon: Kanban },
    { id: 'activities', label: 'Activities', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleSelect = (id: AppView) => {
    setActiveView(id);
    onClose();
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-extrabold text-base">
              N
            </div>
            <span className="font-bold text-stone-900 text-base">Next CRM</span>
          </div>
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
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-stone-400'}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 space-y-3">
          {/*  TODO: remove this feature */}
          {/* <button
            onClick={() => {
              loadDemoData(true);
              onClose();
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-orange-700 bg-orange-50 rounded-lg flex items-center justify-center gap-2 border border-orange-200/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Reset Demo Data</span>
          </button> */}

          <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-bold text-stone-900 truncate">{user?.name}</div>
              <div className="text-[11px] text-stone-500 truncate">{user?.email}</div>
            </div>
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
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
