import { Route } from 'react-router-dom';
import { dashboardRoutes } from './dashboard.routes';
import { clientRoutes } from './client.routes';
import { driverRoutes } from './driver.routes';
import { ProtectedRoute, RouteRbacGuard } from './route.guards';

export const privateRoutes = (
  <Route element={<ProtectedRoute />}>
    <Route element={<RouteRbacGuard />}>
      {dashboardRoutes}
      {clientRoutes}
      {driverRoutes}
    </Route>
  </Route>
);
