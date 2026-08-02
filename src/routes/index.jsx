import { lazy } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { privateRoutes } from './private.routes';
import { ROUTES } from './route.constants';

/**
 * Routes racines.
 * Les pages d'erreur sont également chargées à la demande (React.lazy).
 */
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {publicRoutes}
      {authRoutes}
      {privateRoutes}
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </>,
  ),
);

export default router;
