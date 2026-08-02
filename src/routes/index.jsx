import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { privateRoutes } from './private.routes';
import { ROUTES } from './route.constants';
import NotFoundPage from '@/pages/NotFoundPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

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
