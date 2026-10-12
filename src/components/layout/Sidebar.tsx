import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { AppView } from '../../types/crm';
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  CheckSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { activeView, setActiveView, user, signOut } = useCrm();
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);

  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'deals', label: 'Deals', icon: Kanban },
    { id: 'activities', label: 'Activities', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-stone-200 transition-all duration-300 relative select-none ${
        collapsed ? 'w-[72px]' : 'w-[250px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-stone-100">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
            N
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-bold tracking-tight text-stone-900 text-base">Next CRM</span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative ${
                isActive
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-orange-600' : 'text-stone-400 group-hover:text-stone-600'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Active pill indicator */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-orange-600 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-stone-100">
        {/* User Card */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200/70 ${
            collapsed ? 'flex-col gap-2' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-stone-800 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {getInitials(user?.name)}
            </div>
            {!collapsed && (
              <div className="min-w-0 truncate">
                <div className="text-xs font-bold text-stone-900 truncate">{user?.name || 'User'}</div>
                <div className="text-[11px] text-stone-500 truncate">{user?.email}</div>
              </div>
            )}
          </div>

          <button
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
