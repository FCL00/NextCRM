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
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { paths } from './constants/paths';

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
          <Route path={paths.home.getHref} element={<LandingRoute />} />

          {/* Dedicated Password Reset Route */}
          <Route path={paths.resetPassword.getHref} element={<ResetPasswordPage />} />

          {/* Authenticated CRM Layout & Nested Routes */}
          <Route element={<CrmLayout />}>
            <Route path={paths.dashboard.getHref} element={<OverviewDashboard />} />
            <Route path={paths.contact.getHref} element={<ContactsView />} />
            <Route path={paths.companies.getHref} element={<CompaniesView />} />
            <Route path={paths.deals.getHref} element={<DealsView />} />
            <Route path={paths.activities.getHref} element={<ActivitiesView />} />
            <Route path={paths.analytics.getHref} element={<AnalyticsView />} />
          </Route>

          {/* Legacy / Alias Redirects */}
          <Route path={paths.overview.getHref} element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CrmProvider>
    </BrowserRouter>
  );
}
