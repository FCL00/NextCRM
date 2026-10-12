import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { LegalModal } from './LegalModal';
import {
  Users,
  Building2,
  Kanban,
  CheckSquare,
  BarChart3,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  PhoneCall,
  Calendar,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { openAuthModal, loginAsDemoUser } = useCrm();
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#242424] flex flex-col selection:bg-orange-200 selection:text-orange-950">
      {/* Top Bar Contract (Clean 3-Zone: Brand — Nav Links — Primary Action) */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap">
              NextCRM
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('pipeline')}
              className="hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              Pipeline
            </button>
            <button
              onClick={loginAsDemoUser}
              className="hover:text-orange-600 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Live Demo</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Sign In */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openAuthModal('signin')}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15] mb-6"
            style={{ textWrap: 'balance' }}
          >
            Your customers. Your pipeline. Your next win.
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Manage contacts, track deals, and understand your sales performance in one simple
            workspace built for growing businesses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full sm:w-auto px-7 py-3 text-base font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Start Selling Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors shadow-xs"
            >
              Explore Features
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-stone-500">
            <span>No credit card required</span>
            <span aria-hidden="true">·</span>
            <span>Instant setup</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={loginAsDemoUser}
              className="text-orange-600 hover:underline font-medium"
            >
              Try instant interactive demo
            </button>
          </div>
        </div>

        {/* Polished Product Preview (Realistic CRM Dashboard Mockup) */}
        <div className="relative rounded-2xl border border-stone-200 bg-white shadow-xl overflow-hidden">
          {/* Top Mock Window Bar */}
          <div className="bg-stone-100 border-b border-stone-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs font-mono text-stone-500">app.nextcrm.io/overview</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 bg-white px-2.5 py-1 rounded-md border border-stone-200">
                Workspace: Apex Operations
              </span>
            </div>
          </div>

          {/* CRM Dashboard Preview Content */}
          <div className="p-6 md:p-8 bg-[#FAF9F6]">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-stone-500">Open Pipeline</span>
                  <DollarSign className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">$239,500</div>
                <div className="text-[11px] text-stone-400 mt-1">6 active opportunities</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-stone-500">Revenue Won</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">$186,500</div>
                <div className="text-[11px] text-stone-400 mt-1">3 closed contracts</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-stone-500">Total Contacts</span>
                  <Users className="w-4 h-4 text-stone-600" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">10</div>
                <div className="text-[11px] text-stone-400 mt-1">8 active prospects</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-stone-500">Total Companies</span>
                  <Building2 className="w-4 h-4 text-stone-600" />
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900">5</div>
                <div className="text-[11px] text-stone-400 mt-1">5 core industries</div>
              </div>
            </div>

            {/* Split View: Kanban Pipeline Snapshot & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pipeline Kanban Glimpse */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                    <Kanban className="w-4 h-4 text-orange-500" />
                    <span>Live Deal Pipeline</span>
                  </h4>
                  <span className="text-xs text-stone-500">Drag & drop enabled</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Lead Column */}
                  <div className="bg-[#FAF9F6] p-3 rounded-lg border border-stone-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                      <span>Lead</span>
                      <span className="font-mono tabular-nums text-stone-500">$62.5k</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-md border border-stone-200 shadow-2xs space-y-1">
                      <div className="text-xs font-semibold text-stone-900 truncate">Store Modernization</div>
                      <div className="text-[11px] text-stone-500">Vanguard Retail Co.</div>
                      <div className="text-xs font-mono font-bold text-orange-600">$24,500</div>
                    </div>
                  </div>

                  {/* Proposal Column */}
                  <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-orange-800 mb-2">
                      <span>Proposal</span>
                      <span className="font-mono tabular-nums text-orange-700">$139k</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-md border border-orange-200 shadow-2xs space-y-1">
                      <div className="text-xs font-semibold text-stone-900 truncate">Cloud Observability</div>
                      <div className="text-[11px] text-stone-500">Apex Logic Inc.</div>
                      <div className="text-xs font-mono font-bold text-orange-600">$85,000</div>
                    </div>
                  </div>

                  {/* Won Column */}
                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-2">
                      <span>Won</span>
                      <span className="font-mono tabular-nums text-emerald-700">$186.5k</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-md border border-emerald-200 shadow-2xs space-y-1">
                      <div className="text-xs font-semibold text-stone-900 truncate">Clinical Care Systems</div>
                      <div className="text-[11px] text-stone-500">Nordic Health Systems</div>
                      <div className="text-xs font-mono font-bold text-emerald-600">$120,000</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Snapshot */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 mb-4 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-orange-500" />
                    <span>Recent Activity</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-stone-800">Architecture Review Meeting</div>
                        <div className="text-stone-400 text-[11px]">With Elena Rostova · Tomorrow 2:00 PM</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="p-1.5 rounded-md bg-rose-50 text-rose-700 shrink-0 mt-0.5">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-stone-800">Send Revised Agreement</div>
                        <div className="text-rose-600 font-medium text-[11px]">Overdue (Vanguard Retail)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 mt-4">
                  <button
                    onClick={loginAsDemoUser}
                    className="w-full py-2 text-xs font-semibold text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open Live Demo Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-4">
              Everything your sales team needs to execute
            </h2>
            <p className="text-base text-stone-600 leading-relaxed">
              No bloated enterprise configuration. Just fast, intuitive CRM tooling crafted to help
              you turn conversations into predictable revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Contact Management */}
            <div className="p-6 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:border-orange-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Contact Management</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Keep customer information organized and accessible. Track phone numbers, emails, job
                titles, and communication statuses in a clean tabular view.
              </p>
            </div>

            {/* 2. Company Management */}
            <div className="p-6 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:border-orange-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Company Management</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Track organizations, industries, and customer relationships. Automatically calculate
                contact counts and open pipeline values per account.
              </p>
            </div>

            {/* 3. Sales Pipeline */}
            <div className="p-6 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:border-orange-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Sales Pipeline</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Visualize deals and move them through your sales process with interactive drag-and-drop
                across six stages from Lead to Won.
              </p>
            </div>

            {/* 4. Activity Tracking */}
            <div className="p-6 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:border-orange-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Activity Tracking</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Record calls, emails, meetings, tasks, and notes. Instantly spot overdue follow-ups
                with color-coded alerts and chronological sorting.
              </p>
            </div>

            {/* 5. Analytics Dashboard */}
            <div className="p-6 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:border-orange-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Understand pipeline health, revenue, and sales performance with live stage bar charts,
                outcome distributions, and conversion rates.
              </p>
            </div>

            {/* 6. Demo Workspace */}
            <div className="p-6 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:border-orange-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Demo Workspace</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Explore the CRM immediately using realistic sample data. Preloaded with 5 companies,
                10 contacts, 10 deals, and 8 activities ready to test.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sales Pipeline Showcase Section */}
      <section id="pipeline" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-4">
            A pipeline structured for deal velocity
          </h2>
          <p className="text-base text-stone-600 leading-relaxed">
            Move prospects cleanly from first inquiry to contract execution with automated stage
            totals and instant revenue updates.
          </p>
        </div>

        {/* Visual Horizontal Sales Funnel */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Stage 1: Lead */}
            <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Stage 1
                </div>
                <div className="text-base font-bold text-stone-900">Lead</div>
                <div className="text-xs text-stone-500 mt-1">First contact & inquiry</div>
              </div>
              <div className="mt-6 pt-3 border-t border-orange-100/60">
                <div className="text-lg font-mono font-bold text-stone-900 tabular-nums">$62,500</div>
                <div className="text-xs text-stone-500">2 deals active</div>
              </div>
            </div>

            {/* Stage 2: Qualified */}
            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1">
                  Stage 2
                </div>
                <div className="text-base font-bold text-stone-900">Qualified</div>
                <div className="text-xs text-stone-500 mt-1">Budget & need verified</div>
              </div>
              <div className="mt-6 pt-3 border-t border-orange-200/60">
                <div className="text-lg font-mono font-bold text-stone-900 tabular-nums">$42,000</div>
                <div className="text-xs text-stone-500">1 deal active</div>
              </div>
            </div>

            {/* Stage 3: Proposal */}
            <div className="p-4 rounded-xl bg-orange-100/60 border border-orange-300 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-orange-800 uppercase tracking-wider mb-1">
                  Stage 3
                </div>
                <div className="text-base font-bold text-stone-900">Proposal</div>
                <div className="text-xs text-stone-500 mt-1">Formal quote sent</div>
              </div>
              <div className="mt-6 pt-3 border-t border-orange-300/60">
                <div className="text-lg font-mono font-bold text-stone-900 tabular-nums">$139,000</div>
                <div className="text-xs text-stone-500">2 deals active</div>
              </div>
            </div>

            {/* Stage 4: Negotiation */}
            <div className="p-4 rounded-xl bg-orange-200/70 border border-orange-400 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-orange-900 uppercase tracking-wider mb-1">
                  Stage 4
                </div>
                <div className="text-base font-bold text-stone-900">Negotiation</div>
                <div className="text-xs text-stone-600 mt-1">Terms & legal redline</div>
              </div>
              <div className="mt-6 pt-3 border-t border-orange-400/60">
                <div className="text-lg font-mono font-bold text-stone-900 tabular-nums">$72,000</div>
                <div className="text-xs text-stone-600">1 deal active</div>
              </div>
            </div>

            {/* Stage 5: Won */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Stage 5
                </div>
                <div className="text-base font-bold text-emerald-900">Won</div>
                <div className="text-xs text-emerald-700 mt-1">Contract signed & billed</div>
              </div>
              <div className="mt-6 pt-3 border-t border-emerald-200">
                <div className="text-lg font-mono font-bold text-emerald-700 tabular-nums">$186,500</div>
                <div className="text-xs text-emerald-600">3 deals closed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Turn more opportunities into customers.
          </h2>
          <p className="text-base sm:text-lg text-stone-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Bring your contacts, deals, and daily sales activities together in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-stone-900 bg-orange-500 hover:bg-orange-400 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={loginAsDemoUser}
              className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors border border-stone-700"
            >
              Explore Sample Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 px-6 py-12 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                N
              </div>
              <span className="font-bold text-stone-900 text-sm">NextCRM</span>
            </div>
            <span className="hidden sm:inline text-stone-300">|</span>
            <p className="text-xs text-stone-500 text-center sm:text-left">
              The straightforward CRM platform for modern sales teams and businesses.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-600 font-medium">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-stone-900 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => openAuthModal('signin')}
              className="hover:text-stone-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-stone-900 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setLegalModalType('terms')}
              className="hover:text-stone-900 transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
    </div>
  );
};
