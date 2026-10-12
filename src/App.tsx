/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { LandingPage } from './components/landing/LandingPage';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { ContactsView } from './components/contacts/ContactsView';
import { CompaniesView } from './components/companies/CompaniesView';
import { DealsView } from './components/deals/DealsView';
import { ActivitiesView } from './components/activities/ActivitiesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ContactFormModal } from './components/contacts/ContactFormModal';
import { CompanyFormModal } from './components/companies/CompanyFormModal';
import { DealFormModal } from './components/deals/DealFormModal';
import { ActivityFormModal } from './components/activities/ActivityFormModal';
// import { SupabaseConnectModal } from './components/common/SupabaseConnectModal';

const AppContent: React.FC = () => {
  const { user, activeView, quickAddType, closeQuickAdd, isConnectModalOpen, closeConnectModal } = useCrm();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // If user is not logged in or active view is explicitly 'landing', display public landing page
  if (!user || activeView === 'landing') {
    return (
      <>
        <LandingPage />
        <AuthModal />
        {/* <SupabaseConnectModal isOpen={isConnectModalOpen} onClose={closeConnectModal} /> */}
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] text-[#242424] overflow-hidden selection:bg-orange-200 selection:text-orange-950 font-sans">
      {/* Collapsible Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNav onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {activeView === 'overview' && <OverviewDashboard />}
          {activeView === 'contacts' && <ContactsView />}
          {activeView === 'companies' && <CompaniesView />}
          {activeView === 'deals' && <DealsView />}
          {activeView === 'activities' && <ActivitiesView />}
          {activeView === 'analytics' && <AnalyticsView />}
        </main>
      </div>

      {/* Global Quick Add Modals */}
      <ContactFormModal
        isOpen={quickAddType === 'contact'}
        onClose={closeQuickAdd}
      />
      <CompanyFormModal
        isOpen={quickAddType === 'company'}
        onClose={closeQuickAdd}
      />
      <DealFormModal
        isOpen={quickAddType === 'deal'}
        onClose={closeQuickAdd}
      />
      <ActivityFormModal
        isOpen={quickAddType === 'activity'}
        onClose={closeQuickAdd}
      />

      {/* Supabase, Auth Modal & Toast Container */}
      {/* <SupabaseConnectModal
        isOpen={isConnectModalOpen}
        onClose={closeConnectModal}
      /> */}
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <AppContent />
    </CrmProvider>
  );
}
