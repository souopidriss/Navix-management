import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import { ROUTES } from './route.constants';

/**
 * Routes publiques.
 * Toutes les pages sont chargées à la demande (React.lazy) :
 * le fallback global <LoadingPage /> (App.jsx, Suspense) s'affiche pendant le chargement.
 */
const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));

export const publicRoutes = (
  <>
    <Route path={ROUTES.HOME} element={<PublicLayout />}>
      <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Route>
    <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />
  </>
);
