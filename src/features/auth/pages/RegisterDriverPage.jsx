/**
 * Navix Auth — RegisterDriverPage
 * --------------------------------------------------------------------------
 * Page d'inscription pour les chauffeurs.
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { AuthCard } from '../components';
import RegisterForm from '../components/RegisterForm';
import { registerDriverSchema, registerDriverDefaults } from '../schemas';

const RegisterDriverPage = () => (
  <>
    <Helmet>
      <title>Inscription Chauffeur</title>
    </Helmet>
    <AuthCard
      title="Inscription Chauffeur"
      subtitle="Créez votre compte chauffeur pour accéder à vos missions."
    >
      <RegisterForm
        roleType="driver"
        schema={registerDriverSchema}
        defaults={registerDriverDefaults}
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

export default RegisterDriverPage;
