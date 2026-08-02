import { Route } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/LoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import { GuestRoute } from './route.guards';
import { ROUTES } from './route.constants';

export const authRoutes = (
  <Route element={<GuestRoute />}>
    <Route element={<AuthLayout />}>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
    </Route>
  </Route>
);
