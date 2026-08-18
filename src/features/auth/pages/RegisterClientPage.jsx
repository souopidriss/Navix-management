/**
 * Navix Auth — RegisterClientPage
 * --------------------------------------------------------------------------
 * Page d'inscription pour les clients (entreprise / individuel).
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { AuthCard } from '../components';
import RegisterForm from '../components/RegisterForm';
import { registerClientSchema, registerClientDefaults } from '../schemas';

const RegisterClientPage = () => (
  <>
    <Helmet>
      <title>Inscription Client</title>
    </Helmet>
    <AuthCard
      title="Inscription Client"
      subtitle="Créez votre compte pour gérer votre flotte."
    >
      <RegisterForm
        roleType="client"
        schema={registerClientSchema}
        defaults={registerClientDefaults}
      />
      <p className="text-center text-secondary small mt-3 mb-0">
        Déjà un compte&nbsp;?{' '}
        <Link to={ROUTES.LOGIN} className="text-decoration-none">
          Se connecter
        </Link>
        {' · '}
        <Link to={ROUTES.REGISTER} className="text-decoration-none">
          Changer de rôle
        </Link>
      </p>
    </AuthCard>
  </>
);

export default RegisterClientPage;
