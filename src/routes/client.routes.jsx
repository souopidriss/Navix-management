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
const ClientRequestsPage = lazy(() => import('@/features/client/pages/ClientRequestsPage'));
const ClientTripsPage = lazy(() => import('@/features/client/pages/ClientTripsPage'));
const ClientDocumentsPage = lazy(() => import('@/features/client/pages/ClientDocumentsPage'));
const ClientInvoicesPage = lazy(() => import('@/features/client/pages/ClientInvoicesPage'));
const ClientNotificationsPage = lazy(() => import('@/features/client/pages/ClientNotificationsPage'));
const ClientProfilePage = lazy(() => import('@/features/client/pages/ClientProfilePage'));

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
  </Route>
);
