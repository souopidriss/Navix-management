/**
 * Navix Auth — LoginPage
 * --------------------------------------------------------------------------
 * Page de connexion (rendue dans AuthLayout, jamais dans DashboardLayout).
 */
import { Helmet } from 'react-helmet-async';
import { AuthCard, LoginForm } from '../components';

const LoginPage = () => (
  <>
    <Helmet>
      <title>Connexion</title>
    </Helmet>
    <AuthCard title="Connexion" subtitle="Accédez à votre espace de gestion de flotte.">
      <LoginForm />
    </AuthCard>
  </>
);

export default LoginPage;
