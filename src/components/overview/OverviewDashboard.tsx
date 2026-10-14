import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, formatDate } from '../../services/storage';
import { Badge } from '../common/Badge';
import { DealStage, ContactStatus } from '../../types/crm';
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  Kanban,
  CheckSquare,
  Plus,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    openPipelineValue,
    revenueWon,
    totalContactsCount,
    totalCompaniesCount,
    dealsByStage,
    contactsByStatus,
    deals,
    activities,
    getCompany,
    getContact,
    openQuickAdd,
    loadDemoData,
    hasData,
    toggleActivityCompleted,
    setSelectedDealId,
    setActiveView,
  } = useCrm();

  const [hoveredStage, setHoveredStage] = useState<DealStage | null>(null);

  // Recent deals (sorted by updatedAt)
  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Recent activities (sorted by createdAt)
  const recentActivities = [...activities].slice(0, 5);

  // Pipeline stages configuration
  const stages: DealStage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const maxStageValue = Math.max(...stages.map(s => dealsByStage[s]?.value || 0), 1000);

  // Contacts donut calculation
  const totalContacts = Math.max(totalContactsCount, 1);
  const leadPercent = Math.round((contactsByStatus.Lead / totalContacts) * 100);
  const activePercent = Math.round((contactsByStatus.Active / totalContacts) * 100);
  const inactivePercent = Math.round((contactsByStatus.Inactive / totalContacts) * 100);

  // SVG Donut calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const leadStroke = (leadPercent / 100) * circumference;
  const activeStroke = (activePercent / 100) * circumference;
  const inactiveStroke = (inactivePercent / 100) * circumference;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-3.5 h-3.5" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5" />;
      case 'Meeting':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'Task':
        return <CheckSquare className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-8xl mx-auto space-y-6">
      {/* Welcome / Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Sales Overview</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Real-time pipeline metrics and deal velocity across your accounts.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <button
            onClick={() => openQuickAdd('deal')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deal</span>
          </button>
          <button
            onClick={() => openQuickAdd('contact')}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
          <button
            onClick={() => openQuickAdd('company')}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Company</span>
          </button>
          <button
            onClick={() => openQuickAdd('activity')}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Demo Data Callout if empty */}
      {!hasData && (
        <div className="p-6 bg-orange-50/70 border border-orange-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Your workspace is currently clean</h4>
              <p className="text-xs text-stone-600">
                Populate realistic companies, contacts, and deals to test the pipeline and analytics right away.
              </p>
            </div>
          </div>
          <button
            onClick={() => loadDemoData(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shrink-0 shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Workspace</span>
          </button>
        </div>
      )}

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Open Pipeline Value */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Open Pipeline</span>
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">
              {formatCurrency(openPipelineValue)}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Lead, Qualified, Proposal & Negotiation</p>
          </div>
        </div>

        {/* 2. Revenue Won */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Revenue Won</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {formatCurrency(revenueWon)}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Sum of successfully closed deals</p>
          </div>
        </div>

        {/* 3. Total Contacts */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Contacts</span>
            <div className="p-1.5 bg-stone-100 text-stone-600 rounded-md">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">
              {totalContactsCount}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              {contactsByStatus.Active} active · {contactsByStatus.Lead} leads
            </p>
          </div>
        </div>

        {/* 4. Total Companies */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Companies</span>
            <div className="p-1.5 bg-stone-100 text-stone-600 rounded-md">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">
              {totalCompaniesCount}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Accounts managed in workspace</p>
          </div>
        </div>
      </div>

      {/* Main Visualizations: Pipeline by Stage & Contacts by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline by Stage Chart */}
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-stone-900">Pipeline by Stage</h3>
              <p className="text-xs text-stone-500">Deal value and count progression</p>
            </div>
            <button
              onClick={() => setActiveView('deals')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
            >
              <span>View Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {stages.map(stage => {
              const data = dealsByStage[stage] || { count: 0, value: 0 };
              const percent = Math.min(Math.round((data.value / maxStageValue) * 100), 100);
              const isWon = stage === 'Won';
              const isLost = stage === 'Lost';

              return (
                <div
                  key={stage}
                  onMouseEnter={() => setHoveredStage(stage)}
                  onMouseLeave={() => setHoveredStage(null)}
                  className="space-y-1.5 group cursor-default"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge stage={stage} variant="stage">
                        {stage}
                      </Badge>
                      <span className="text-stone-500 font-mono text-[11px]">
                        ({data.count} {data.count === 1 ? 'deal' : 'deals'})
                      </span>
                    </div>
                    <div className="font-mono font-bold text-stone-800 tabular-nums">
                      {formatCurrency(data.value)}
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isWon
                          ? 'bg-emerald-500'
                          : isLost
                          ? 'bg-stone-400'
                          : 'bg-orange-500 group-hover:bg-orange-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contacts by Status Chart */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Contacts by Status</h3>
                <p className="text-xs text-stone-500">Distribution of contact states</p>
              </div>
              <button
                onClick={() => setActiveView('contacts')}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>All Contacts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SVG Donut */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-stone-100"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Lead Stroke (Orange) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#F97316"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${leadStroke} ${circumference}`}
                    strokeDashoffset="0"
                  />
                  {/* Active Stroke (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#10B981"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${activeStroke} ${circumference}`}
                    strokeDashoffset={-leadStroke}
                  />
                  {/* Inactive Stroke (Stone) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#A8A29E"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${inactiveStroke} ${circumference}`}
                    strokeDashoffset={-(leadStroke + activeStroke)}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                    {totalContactsCount}
                  </span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider">Total</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend and Percentages */}
          <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-stone-700 font-medium">Active</span>
              </div>
              <div className="font-mono text-stone-600 tabular-nums">
                {contactsByStatus.Active} ({activePercent}%)
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-stone-700 font-medium">Lead</span>
              </div>
              <div className="font-mono text-stone-600 tabular-nums">
                {contactsByStatus.Lead} ({leadPercent}%)
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                <span className="text-stone-700 font-medium">Inactive</span>
              </div>
              <div className="font-mono text-stone-600 tabular-nums">
                {contactsByStatus.Inactive} ({inactivePercent}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split Section: Recent Deals Table & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deals Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Recent Deals</h3>
              <p className="text-xs text-stone-500">Recently active sales opportunities</p>
            </div>
            <button
              onClick={() => setActiveView('deals')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentDeals.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No deals recorded yet. Click "Add Deal" to track your first opportunity.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4 font-semibold">Deal Name</th>
                    <th className="py-2.5 px-4 font-semibold">Company</th>
                    <th className="py-2.5 px-4 font-semibold">Stage</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Value</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentDeals.map(deal => {
                    const company = getCompany(deal.companyId);

                    return (
                      <tr
                        key={deal.id}
                        onClick={() => setSelectedDealId(deal.id)}
                        className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-semibold text-stone-900 group-hover:text-orange-600 transition-colors">
                          {deal.title}
                        </td>
                        <td className="py-3 px-4 text-stone-600">{company?.name || '—'}</td>
                        <td className="py-3 px-4">
                          <Badge stage={deal.stage} variant="stage">
                            {deal.stage}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-stone-900 tabular-nums">
                          {formatCurrency(deal.value)}
                        </td>
                        <td className="py-3 px-4 text-right text-stone-400 font-mono">
                          {formatDate(deal.updatedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity List */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Recent Activities</h3>
              <p className="text-xs text-stone-500">Calls, tasks, meetings and notes</p>
            </div>
            <button
              onClick={() => setActiveView('activities')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[380px]">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                No scheduled activities yet.
              </div>
            ) : (
              recentActivities.map(activity => {
                const contact = getContact(activity.contactId);
                const isOverdue =
                  !activity.completed &&
                  activity.dueDate &&
                  new Date(activity.dueDate).getTime() < Date.now();

                return (
                  <div
                    key={activity.id}
                    className={`p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                      activity.completed
                        ? 'bg-stone-50/60 border-stone-100 opacity-70'
                        : isOverdue
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-white border-stone-200 hover:border-orange-200'
                    }`}
                  >
                    {/* Checkbox toggle */}
                    <button
                      onClick={() => toggleActivityCompleted(activity.id)}
                      className="mt-0.5 text-stone-400 hover:text-orange-600 transition-colors shrink-0"
                      aria-label={activity.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {activity.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-stone-400">{getActivityIcon(activity.type)}</span>
                        <h4
                          className={`text-xs font-semibold truncate ${
                            activity.completed ? 'line-through text-stone-500' : 'text-stone-900'
                          }`}
                        >
                          {activity.title}
                        </h4>
                      </div>

                      {contact && (
                        <div className="text-[11px] text-stone-500 truncate">
                          {contact.firstName} {contact.lastName}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        {activity.dueDate && (
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue ? 'text-rose-600 font-semibold' : 'text-stone-400'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(activity.dueDate)}</span>
                            {isOverdue && <span>(Overdue)</span>}
                          </span>
                        )}
                        <Badge activityType={activity.type} variant="type">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-stone-50/70 border-t border-stone-100">
            <button
              onClick={() => openQuickAdd('activity')}
              className="w-full py-1.5 text-xs font-semibold text-stone-700 hover:text-orange-600 transition-colors text-center"
            >
              + Log New Interaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
