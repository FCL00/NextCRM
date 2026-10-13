import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileDrawer } from './MobileDrawer';
import { ToastContainer } from '../common/ToastContainer';
import { AuthModal } from '../auth/AuthModal';
import { ContactFormModal } from '../contacts/ContactFormModal';
import { CompanyFormModal } from '../companies/CompanyFormModal';
import { DealFormModal } from '../deals/DealFormModal';
import { ActivityFormModal } from '../activities/ActivityFormModal';

export const CrmLayout: React.FC = () => {
  const { user, quickAddType, closeQuickAdd } = useCrm();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
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

        {/* Viewport Content via Outlet */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
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

      {/* Auth Modal & Toast Container */}
      <AuthModal />
      <ToastContainer />
    </div>
  );
};
