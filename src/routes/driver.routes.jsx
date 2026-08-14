/**
 * Navix Management — Driver Routes
 * --------------------------------------------------------------------------
 * Routes spécifiques à l'Espace Chauffeur Premium.
 * Sont protégées globalement par RouteRbacGuard.
 */
import { Route, Navigate } from 'react-router-dom';
import { ROUTES } from './route.constants';
import { PERMISSIONS } from '@/features/rbac';
import { ProtectedRoute } from './route.guards';

// Layout
import DriverLayout from '@/features/driver_portal/components/DriverLayout/DriverLayout';

// Pages
import DriverDashboardPage from '@/features/driver_portal/pages/DriverDashboardPage';
import PlaceholderPage from '@/features/driver_portal/pages/PlaceholderPage';

export const driverRoutes = (
  <Route
    path={ROUTES.DRIVER_ROOT}
    element={
      <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD_READ}>
        <DriverLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to={ROUTES.DRIVER_DASHBOARD} replace />} />
    <Route path={ROUTES.DRIVER_DASHBOARD} element={<DriverDashboardPage />} />
    <Route path={ROUTES.DRIVER_TRIPS} element={<PlaceholderPage title="Mes Trajets" />} />
    <Route path={ROUTES.DRIVER_VEHICLE} element={<PlaceholderPage title="Mon Véhicule" />} />
    <Route path={ROUTES.DRIVER_FUEL} element={<PlaceholderPage title="Mon Carburant" />} />
    <Route path={ROUTES.DRIVER_MAINTENANCE} element={<PlaceholderPage title="Mes Entretiens" />} />
    <Route path={ROUTES.DRIVER_DOCUMENTS} element={<PlaceholderPage title="Mes Documents" />} />
    <Route path={ROUTES.DRIVER_PROFILE} element={<PlaceholderPage title="Mon Profil" />} />
  </Route>
);
