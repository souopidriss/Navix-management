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
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const RegisterClientPage = lazy(() => import('@/features/auth/pages/RegisterClientPage'));
const RegisterDriverPage = lazy(() => import('@/features/auth/pages/RegisterDriverPage'));
const RegisterPartnerPage = lazy(() => import('@/features/auth/pages/RegisterPartnerPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));

export const authRoutes = (
  <Route element={<GuestRoute />}>
    <Route element={<AuthLayout />}>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.REGISTER_CLIENT} element={<RegisterClientPage />} />
      <Route path={ROUTES.REGISTER_DRIVER} element={<RegisterDriverPage />} />
      <Route path={ROUTES.REGISTER_PARTNER} element={<RegisterPartnerPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
    </Route>
  </Route>
);
