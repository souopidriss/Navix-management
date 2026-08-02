/**
 * Navix Auth — ResetPasswordPage
 * --------------------------------------------------------------------------
 * Page de réinitialisation du mot de passe (rendue dans AuthLayout).
 * Le token provient de l'URL (`?token=…`) ; sans token, le service simulé
 * retourne une erreur (lien invalide ou expiré).
 */
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthCard, ResetPasswordForm } from '../components';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <>
      <Helmet>
        <title>Réinitialiser le mot de passe</title>
      </Helmet>
      <AuthCard
        title="Réinitialiser le mot de passe"
        subtitle="Définissez un nouveau mot de passe pour votre compte."
      >
        <ResetPasswordForm token={token} />
      </AuthCard>
    </>
  );
};

export default ResetPasswordPage;
