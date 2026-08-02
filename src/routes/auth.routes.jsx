import { lazy } from 'react';
import { Route } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import { GuestRoute } from './route.guards';
import { ROUTES } from './route.constants';

/**
 * Routes d'authentification.
 * Toutes les pages sont chargées à la demande (React.lazy).
 */
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));

export const authRoutes = (
  <Route element={<GuestRoute />}>
    <Route element={<AuthLayout />}>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
    </Route>
  </Route>
);
