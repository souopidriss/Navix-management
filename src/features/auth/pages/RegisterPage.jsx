/**
 * Navix Auth — RegisterPage
 * --------------------------------------------------------------------------
 * Page de sélection de rôle pour l'inscription.
 * Trois options : Client, Chauffeur, Partenaire – Station.
 */
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { AuthCard } from '../components';
import RoleSelection from '../components/RoleSelection';

const RegisterPage = () => (
  <>
    <Helmet>
      <title>Créer un compte</title>
    </Helmet>
    <AuthCard
      title="Créer un compte"
      subtitle="Choisissez votre type de compte pour commencer."
    >
      <RoleSelection />
      <p className="text-center text-secondary small mt-3 mb-0">
        Vous avez déjà un compte&nbsp;?{' '}
        <Link to={ROUTES.LOGIN} className="text-decoration-none">
          Se connecter
        </Link>
      </p>
    </AuthCard>
  </>
);

export default RegisterPage;
