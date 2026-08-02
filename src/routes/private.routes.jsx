import { Route } from 'react-router-dom';
import { dashboardRoutes } from './dashboard.routes';
import { ProtectedRoute } from './route.guards';

export const privateRoutes = (
  <Route element={<ProtectedRoute />}>
    {dashboardRoutes}
  </Route>
);
