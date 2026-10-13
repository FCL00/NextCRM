/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CrmProvider } from './context/CrmContext';
import { CrmLayout } from './components/layout/CrmLayout';
import { LandingPage } from './components/landing/LandingPage';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { ContactsView } from './components/contacts/ContactsView';
import { CompaniesView } from './components/companies/CompaniesView';
import { DealsView } from './components/deals/DealsView';
import { ActivitiesView } from './components/activities/ActivitiesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';

const LandingRoute: React.FC = () => (
  <>
    <LandingPage />
    <AuthModal />
    <ToastContainer />
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <CrmProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingRoute />} />

          {/* Authenticated CRM Layout & Nested Routes */}
          <Route element={<CrmLayout />}>
            <Route path="/dashboard" element={<OverviewDashboard />} />
            <Route path="/contacts" element={<ContactsView />} />
            <Route path="/companies" element={<CompaniesView />} />
            <Route path="/deals" element={<DealsView />} />
            <Route path="/activities" element={<ActivitiesView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
          </Route>

          {/* Legacy / Alias Redirects */}
          <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CrmProvider>
    </BrowserRouter>
  );
}
