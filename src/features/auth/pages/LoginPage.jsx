/**
 * Navix Auth — LoginPage
 * --------------------------------------------------------------------------
 * Page de connexion (rendue dans AuthLayout, jamais dans DashboardLayout).
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { AuthCard, LoginForm } from '../components';

const LoginPage = () => (
  <>
    <Helmet>
      <title>Connexion</title>
    </Helmet>
    <AuthCard title="Connexion" subtitle="Accédez à votre espace de gestion de flotte.">
      <LoginForm />
      <p className="text-center text-secondary small mt-3 mb-0">
        Pas encore de compte&nbsp;?{' '}
        <Link to={ROUTES.REGISTER} className="text-decoration-none">
          Créer un compte
        </Link>
      </p>
    </AuthCard>
  </>
);

export default LoginPage;
