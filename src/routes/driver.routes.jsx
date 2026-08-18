/**
 * Navix Management — Driver Routes
 * --------------------------------------------------------------------------
 * Routes de l'Espace Chauffeur Premium sous `/driver/*`.
 * Protégées par ProtectedRoute (authentification) puis RouteRbacGuard
 * (méta RBAC de la route, voir ROUTE_META).
 */
import { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ROUTES } from './route.constants';
import DriverLayout from '@/features/driver_portal/components/DriverLayout/DriverLayout';
import { LoadingState } from '@/components/core';

const DriverDashboardPage = lazy(() => import('@/features/driver_portal/pages/DriverDashboardPage'));
const DriverTripsPage = lazy(() => import('@/features/driver_portal/pages/DriverTripsPage'));
const DriverTripDetailsPage = lazy(() => import('@/features/driver_portal/pages/DriverTripDetailsPage'));
const DriverVehiclePage = lazy(() => import('@/features/driver_portal/pages/DriverVehiclePage'));
const DriverFuelPage = lazy(() => import('@/features/driver_portal/pages/DriverFuelPage'));
const DriverMaintenancePage = lazy(() => import('@/features/driver_portal/pages/DriverMaintenancePage'));
const DriverIncidentsPage = lazy(() => import('@/features/driver_portal/pages/DriverIncidentsPage'));
const DriverDocumentsPage = lazy(() => import('@/features/driver_portal/pages/DriverDocumentsPage'));
const DriverNotificationsPage = lazy(() => import('@/features/driver_portal/pages/DriverNotificationsPage'));
const DriverProfilePage = lazy(() => import('@/features/driver_portal/pages/DriverProfilePage'));

const fallbackLoading = <LoadingState label="Chargement de l'espace chauffeur…" />;

export const driverRoutes = (
  <Route path={ROUTES.DRIVER_ROOT} element={<DriverLayout />}>
    <Route index element={<Navigate to={ROUTES.DRIVER_DASHBOARD} replace />} />
    <Route
      path={ROUTES.DRIVER_DASHBOARD}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverDashboardPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.DRIVER_TRIPS}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverTripsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.DRIVER_TRIPS_DETAIL}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverTripDetailsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.DRIVER_VEHICLE}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverVehiclePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.DRIVER_FUEL}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverFuelPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.DRIVER_MAINTENANCE}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverMaintenancePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.DRIVER_INCIDENTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverIncidentsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.DRIVER_DOCUMENTS}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverDocumentsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.DRIVER_NOTIFICATIONS}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverNotificationsPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.DRIVER_PROFILE}
      element={
        <Suspense fallback={fallbackLoading}>
          <DriverProfilePage />
        </Suspense>
      }
    />
  </Route>
);
