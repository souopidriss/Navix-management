/**
 * Navix Management — Routes de l'Espace Partenaire
 * --------------------------------------------------------------------------
 * Arborescence complète des routes privées sous `/partner/*` utilisant
 * `PartnerLayout`. Toutes les routes sont gardées par ROUTE_META
 * (rôle `partner` + permission dédiée) côté RBAC.
 */
import { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import PartnerLayout from '@/features/partner_portal/components/PartnerLayout/PartnerLayout';
import { LoadingState } from '@/components/core';
import { ROUTES } from './route.constants';

const PartnerDashboardPage = lazy(() => import('@/features/partner_portal/pages/PartnerDashboardPage'));
const PartnerVehiclesPage = lazy(() => import('@/features/partner_portal/pages/PartnerVehiclesPage'));
const PartnerMissionsPage = lazy(() => import('@/features/partner_portal/pages/PartnerMissionsPage'));
const PartnerMissionsDetailPage = lazy(() => import('@/features/partner_portal/pages/PartnerMissionsDetailPage'));
const PartnerMissionCreatePage = lazy(() => import('@/features/partner_portal/pages/PartnerMissionCreatePage'));
const PartnerRequestsPage = lazy(() => import('@/features/partner_portal/pages/PartnerRequestsPage'));
const PartnerRequestDetailPage = lazy(() => import('@/features/partner_portal/pages/PartnerRequestDetailPage'));
const PartnerContractsPage = lazy(() => import('@/features/partner_portal/pages/PartnerContractsPage'));
const PartnerContractDetailPage = lazy(() => import('@/features/partner_portal/pages/PartnerContractDetailPage'));
const PartnerClientsPage = lazy(() => import('@/features/partner_portal/pages/PartnerClientsPage'));
const PartnerClientDetailPage = lazy(() => import('@/features/partner_portal/pages/PartnerClientDetailPage'));
const PartnerClientCreatePage = lazy(() => import('@/features/partner_portal/pages/PartnerClientCreatePage'));
const PartnerFinancePage = lazy(() => import('@/features/partner_portal/pages/PartnerFinancePage'));
const PartnerFundsPage = lazy(() => import('@/features/partner_portal/pages/PartnerFundsPage'));
const PartnerFinanceTransactionsPage = lazy(() => import('@/features/partner_portal/pages/PartnerFinanceTransactionsPage'));
const PartnerTransactionDetailPage = lazy(() => import('@/features/partner_portal/pages/PartnerTransactionDetailPage'));
const PartnerRevenuePage = lazy(() => import('@/features/partner_portal/pages/PartnerRevenuePage'));
const PartnerRevenueDetailPage = lazy(() => import('@/features/partner_portal/pages/PartnerRevenueDetailPage'));
const PartnerInvoicesPage = lazy(() => import('@/features/partner_portal/pages/PartnerInvoicesPage'));
const PartnerInvoiceDetailPage = lazy(() => import('@/features/partner_portal/pages/PartnerInvoiceDetailPage'));
const PartnerDocumentsPage = lazy(() => import('@/features/partner_portal/pages/PartnerDocumentsPage'));
const PartnerDocumentDetailPage = lazy(() => import('@/features/partner_portal/pages/PartnerDocumentDetailPage'));
const PartnerNotificationsPage = lazy(() => import('@/features/partner_portal/pages/PartnerNotificationsPage'));
const PartnerAlertsPage = lazy(() => import('@/features/partner_portal/pages/PartnerAlertsPage'));
const PartnerCalendarPage = lazy(() => import('@/features/partner_portal/pages/PartnerCalendarPage'));
const PartnerAnalyticsPage = lazy(() => import('@/features/partner_portal/pages/PartnerAnalyticsPage'));
const PartnerSupportPage = lazy(() => import('@/features/partner_portal/pages/PartnerSupportPage'));
const PartnerSupportTicketDetailPage = lazy(() => import('@/features/partner_portal/pages/PartnerSupportTicketDetailPage'));
const PartnerProfilePage = lazy(() => import('@/features/partner_portal/pages/PartnerProfilePage'));
const PartnerSettingsPage = lazy(() => import('@/features/partner_portal/pages/PartnerSettingsPage'));

const fallbackLoading = <LoadingState label="Chargement de la page partenaire…" />;

export const partnerRoutes = (
  <Route path={ROUTES.PARTNER_ROOT} element={<PartnerLayout />}>
    <Route index element={<Navigate to={ROUTES.PARTNER_DASHBOARD} replace />} />
    <Route
      path={ROUTES.PARTNER_DASHBOARD}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerDashboardPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_VEHICLES}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerVehiclesPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_MISSIONS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerMissionsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_MISSIONS_NEW}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerMissionCreatePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_MISSIONS_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerMissionsDetailPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_REQUESTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerRequestsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_REQUESTS_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerRequestDetailPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_CONTRACTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerContractsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_CONTRACTS_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerContractDetailPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_CLIENTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerClientsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_CLIENTS_NEW}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerClientCreatePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_CLIENTS_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerClientDetailPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_FINANCE}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerFinancePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_FINANCE_FUNDS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerFundsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_FINANCE_TRANSACTIONS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerFinanceTransactionsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_FINANCE_TRANSACTION_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerTransactionDetailPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_FINANCE_REVENUE}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerRevenuePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_FINANCE_REVENUE_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerRevenueDetailPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_FINANCE_INVOICES}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerInvoicesPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_FINANCE_INVOICE_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerInvoiceDetailPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_DOCUMENTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerDocumentsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_DOCUMENTS_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerDocumentDetailPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_NOTIFICATIONS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerNotificationsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_ALERTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerAlertsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_CALENDAR}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerCalendarPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_ANALYTICS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerAnalyticsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_SUPPORT}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerSupportPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_SUPPORT_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerSupportTicketDetailPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_PROFILE}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerProfilePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PARTNER_SETTINGS}
      element={
        <Suspense fallback={fallbackLoading}>
          <PartnerSettingsPage />
        </Suspense>
      }
    />
  </Route>
);
