/**
 * Navix Management — Routes de l'Espace Client
 * --------------------------------------------------------------------------
 * Arborescence complète des routes privées sous `/client/*` utilisant `ClientLayout`.
 */
import { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import ClientLayout from '@/features/client/components/ClientLayout/ClientLayout';
import { LoadingState } from '@/components/core';
import { ROUTES } from './route.constants';

const ClientDashboardPage = lazy(() => import('@/features/client/pages/ClientDashboardPage'));
const ClientServicesPage = lazy(() => import('@/features/client/pages/ClientServicesPage'));
const ClientVehiclesPage = lazy(() => import('@/features/client/pages/ClientVehiclesPage'));
const ClientVehicleDetailsPage = lazy(() => import('@/features/client/pages/ClientVehicleDetailsPage'));
const ClientDriversPage = lazy(() => import('@/features/client/pages/ClientDriversPage'));
const ClientDriverDetailsPage = lazy(() => import('@/features/client/pages/ClientDriverDetailsPage'));
const ClientAssignmentsPage = lazy(() => import('@/features/client/pages/ClientAssignmentsPage'));
const ClientRequestsPage = lazy(() => import('@/features/client/pages/ClientRequestsPage'));
const ClientTripsPage = lazy(() => import('@/features/client/pages/ClientTripsPage'));
const ClientTripDetailsPage = lazy(() => import('@/features/client/pages/ClientTripDetailsPage'));
const ClientMaintenancePage = lazy(() => import('@/features/client/pages/ClientMaintenancePage'));
const ClientFuelPage = lazy(() => import('@/features/client/pages/ClientFuelPage'));
const ClientDocumentsPage = lazy(() => import('@/features/client/pages/ClientDocumentsPage'));
const ClientInvoicesPage = lazy(() => import('@/features/client/pages/ClientInvoicesPage'));
const ClientReportsPage = lazy(() => import('@/features/client/pages/ClientReportsPage'));
const ClientNotificationsPage = lazy(() => import('@/features/client/pages/ClientNotificationsPage'));
const ClientProfilePage = lazy(() => import('@/features/client/pages/ClientProfilePage'));
const ClientFinanceTransactionsPage = lazy(() => import('@/features/client/pages/ClientFinanceTransactionsPage'));
const ClientFinancePage = lazy(() => import('@/features/client/pages/ClientFinancePage'));
const ClientTransactionDetailsPage = lazy(() => import('@/features/client/pages/ClientTransactionDetailsPage'));

const fallbackLoading = <LoadingState label="Chargement de la page client…" />;

export const clientRoutes = (
  <Route path={ROUTES.CLIENT_ROOT} element={<ClientLayout />}>
    <Route index element={<Navigate to={ROUTES.CLIENT_DASHBOARD} replace />} />
    <Route
      path={ROUTES.CLIENT_DASHBOARD}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientDashboardPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_SERVICES}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientServicesPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_VEHICLES}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientVehiclesPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_VEHICLES_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientVehicleDetailsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_DRIVERS}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientDriversPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_DRIVERS_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientDriverDetailsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_ASSIGNMENTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientAssignmentsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_REQUESTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientRequestsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_TRIPS}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientTripsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_TRIPS_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientTripDetailsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_MAINTENANCE}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientMaintenancePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_FUEL}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientFuelPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_DOCUMENTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientDocumentsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_INVOICES}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientInvoicesPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_REPORTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientReportsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_NOTIFICATIONS}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientNotificationsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_PROFILE}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientProfilePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_FINANCE}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientFinancePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_FINANCE_FUNDS}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientFinancePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_FINANCE_TRANSACTIONS}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientFinanceTransactionsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.CLIENT_FINANCE_TRANSACTION_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <ClientTransactionDetailsPage />
        </Suspense>
      }
    />
  </Route>
);
