import { lazy } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { privateRoutes } from './private.routes';
import { ROUTES } from './route.constants';
import ServerErrorPage from '@/pages/ServerErrorPage';

/**
 * Routes racines.
 * Les pages d'erreur sont également chargées à la demande (React.lazy).
 * Le `errorElement` racine absorbe toute erreur de route (rendu, chunk lazy,
 * loader) afin d'afficher une page d'erreur cohérente au lieu d'un écran
 * blanc — complémentaire du ErrorBoundary global dans App.jsx.
 */
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ServerErrorPage />}>
      {publicRoutes}
      {authRoutes}
      {privateRoutes}
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

export default router;
