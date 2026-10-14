import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, formatDate } from '../../services/storage';
import { DealStage } from '../../types/crm';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  Target,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    deals,
    contacts,
    companies,
    openPipelineValue,
    revenueWon,
    lostDealValue,
    dealsByStage,
    contactsByStatus,
    getCompany,
  } = useCrm();

  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('All');

  // Filtered deals for analytics
  const filteredDeals = useMemo(() => {
    if (selectedCompanyFilter === 'All') return deals;
    return deals.filter(d => d.companyId === selectedCompanyFilter);
  }, [deals, selectedCompanyFilter]);

  // Stage calculations
  const stages: DealStage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const maxStageValue = Math.max(
    ...stages.map(s => {
      return filteredDeals
        .filter(d => d.stage === s)
        .reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    }),
    1000
  );

  // Won vs Lost vs Open calculations
  const totalDeals = filteredDeals.length;
  const wonDeals = filteredDeals.filter(d => d.stage === 'Won');
  const lostDeals = filteredDeals.filter(d => d.stage === 'Lost');
  const openDeals = filteredDeals.filter(d => !['Won', 'Lost'].includes(d.stage));

  const wonCount = wonDeals.length;
  const lostCount = lostDeals.length;
  const openCount = openDeals.length;

  const wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const lostVal = lostDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const openVal = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const wonPercent = totalDeals > 0 ? Math.round((wonCount / totalDeals) * 100) : 0;
  const lostPercent = totalDeals > 0 ? Math.round((lostCount / totalDeals) * 100) : 0;
  const openPercent = totalDeals > 0 ? Math.round((openCount / totalDeals) * 100) : 0;

  // Average Deal Values
  const avgWonValue = wonCount > 0 ? Math.round(wonValue / wonCount) : 0;
  const avgOpenValue = openCount > 0 ? Math.round(openVal / openCount) : 0;
  const winRate =
    wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;

  // Funnel Progression
  const funnelStages: DealStage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
  const funnelCounts = funnelStages.map(st => {
    return filteredDeals.filter(d => d.stage === st).length;
  });

  // Industry breakdown
  const industryMap = useMemo(() => {
    const map: Record<string, number> = {};
    contacts.forEach(c => {
      const comp = getCompany(c.companyId);
      const ind = comp?.industry || 'Unassigned';
      map[ind] = (map[ind] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [contacts, getCompany]);

  // Donut geometry for outcomes
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const wonStroke = (wonPercent / 100) * circumference;
  const openStroke = (openPercent / 100) * circumference;
  const lostStroke = (lostPercent / 100) * circumference;

  return (
    <div className="p-4 md:p-8 max-w-8xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Sales Analytics</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Real-time pipeline progression, win rates, and stage outcome telemetry.
          </p>
        </div>

        {/* Account Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={selectedCompanyFilter}
            onChange={e => setSelectedCompanyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-700 font-medium focus:outline-hidden"
          >
            <option value="All">All Companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Open Pipeline Value
          </span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            {formatCurrency(openVal)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {openCount} opportunities in progress
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Closed Revenue Won
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {formatCurrency(wonValue)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {wonCount} deals successfully signed
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Average Won Contract
          </span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            {formatCurrency(avgWonValue)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Avg open deal: {formatCurrency(avgOpenValue)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider block">
            Win Rate (Closed)
          </span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            {winRate}%
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {wonCount} won vs {lostCount} lost
          </span>
        </div>
      </div>

      {/* Section 1: Sales Pipeline Bar Chart & Deal Outcomes Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Value by Stage Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-stone-900">Pipeline Value by Stage</h3>
              <p className="text-xs text-stone-500">Live currency totals across active stages</p>
            </div>
            <BarChart3 className="w-5 h-5 text-orange-500" />
          </div>

          <div className="space-y-4">
            {stages.map(stage => {
              const stageDeals = filteredDeals.filter(d => d.stage === stage);
              const val = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
              const pct = Math.min(Math.round((val / maxStageValue) * 100), 100);
              const isWon = stage === 'Won';
              const isLost = stage === 'Lost';

              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">
                      {stage} <span className="text-stone-400 font-mono">({stageDeals.length})</span>
                    </span>
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      {formatCurrency(val)}
                    </span>
                  </div>

                  <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWon
                          ? 'bg-emerald-500'
                          : isLost
                          ? 'bg-stone-400'
                          : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deal Outcomes Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Deal Outcomes</h3>
                <p className="text-xs text-stone-500">Ratio of won, open, and lost deals</p>
              </div>
              <PieChart className="w-5 h-5 text-stone-400" />
            </div>

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
                  {/* Won (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#10B981"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${wonStroke} ${circumference}`}
                    strokeDashoffset="0"
                  />
                  {/* Open (Orange) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#F97316"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${openStroke} ${circumference}`}
                    strokeDashoffset={-wonStroke}
                  />
                  {/* Lost (Stone) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#A8A29E"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${lostStroke} ${circumference}`}
                    strokeDashoffset={-(wonStroke + openStroke)}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                    {totalDeals}
                  </span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider">Deals</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-stone-700 font-medium">Won</span>
              </div>
              <span className="font-mono text-stone-800 tabular-nums">
                {wonCount} ({wonPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-stone-700 font-medium">Open Pipeline</span>
              </div>
              <span className="font-mono text-stone-800 tabular-nums">
                {openCount} ({openPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                <span className="text-stone-700 font-medium">Lost</span>
              </div>
              <span className="font-mono text-stone-800 tabular-nums">
                {lostCount} ({lostPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Sales Funnel Progression */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">Sales Funnel Progression</h3>
            <p className="text-xs text-stone-500">
              Active volume distribution from first outreach to closed contracts
            </p>
          </div>
          <Target className="w-5 h-5 text-orange-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {funnelStages.map((stage, idx) => {
            const count = funnelCounts[idx];
            const stageDeals = filteredDeals.filter(d => d.stage === stage);
            const val = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

            return (
              <div
                key={stage}
                className="p-4 rounded-xl bg-orange-50/40 border border-orange-100 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Step {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900">{stage}</h4>
                </div>

                <div className="mt-4 pt-3 border-t border-orange-100">
                  <div className="text-lg font-mono font-bold text-stone-900 tabular-nums">
                    {formatCurrency(val)}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5 font-mono">
                    {count} {count === 1 ? 'deal' : 'deals'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Contact Distribution by Industry */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">Contact Industry Distribution</h3>
            <p className="text-xs text-stone-500">Breakdown of contacts across target verticals</p>
          </div>
          <Users className="w-5 h-5 text-stone-400" />
        </div>

        {industryMap.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-400">
            No contacts or company industries registered.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {industryMap.map(([industry, count]) => {
              const pct = Math.round((count / (contacts.length || 1)) * 100);

              return (
                <div
                  key={industry}
                  className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-stone-900">{industry}</div>
                    <div className="text-[11px] text-stone-400">{pct}% of contacts</div>
                  </div>
                  <div className="font-mono font-bold text-stone-800 text-sm tabular-nums">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
