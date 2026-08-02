/**
 * Navix Auth — ForgotPasswordPage
 * --------------------------------------------------------------------------
 * Page « mot de passe oublié » (rendue dans AuthLayout).
 */
import { Helmet } from 'react-helmet-async';
import { AuthCard, ForgotPasswordForm } from '../components';

const ForgotPasswordPage = () => (
  <>
    <Helmet>
      <title>Mot de passe oublié</title>
    </Helmet>
    <AuthCard title="Mot de passe oublié" subtitle="Recevez un lien pour réinitialiser votre mot de passe.">
      <ForgotPasswordForm />
    </AuthCard>
  </>
);

export default ForgotPasswordPage;
