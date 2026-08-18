/**
 * Navix Auth — RegisterPartnerPage
 * --------------------------------------------------------------------------
 * Page d'inscription pour les partenaires (station).
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { AuthCard } from '../components';
import RegisterForm from '../components/RegisterForm';
import { registerPartnerSchema, registerPartnerDefaults } from '../schemas';

const RegisterPartnerPage = () => (
  <>
    <Helmet>
      <title>Inscription Partenaire</title>
    </Helmet>
    <AuthCard
      title="Inscription Partenaire – Station"
      subtitle="Créez votre compte partenaire pour gérer vos services."
    >
      <RegisterForm
        roleType="partner"
        schema={registerPartnerSchema}
        defaults={registerPartnerDefaults}
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

export default RegisterPartnerPage;
