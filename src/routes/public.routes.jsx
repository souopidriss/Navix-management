import { Navigate, Route } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import MaintenancePage from '@/pages/MaintenancePage';
import { ROUTES } from './route.constants';

export const publicRoutes = (
  <>
    <Route path={ROUTES.HOME} element={<PublicLayout />}>
      <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Route>
    <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />
  </>
);
