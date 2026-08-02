import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';

const ResetPasswordPage = () => (
  <>
    <Helmet>
      <title>Réinitialiser le mot de passe</title>
    </Helmet>
    <h1 className="h4 mb-1">Réinitialiser le mot de passe</h1>
    <p className="text-secondary small mb-4">Définissez un nouveau mot de passe pour votre compte.</p>

    <div className="text-center py-4">
      <i className="bi bi-shield-lock display-4 text-secondary" aria-hidden="true" />
      <p className="text-secondary mt-3 mb-0">
        Le formulaire de réinitialisation sera intégré ici.
      </p>
    </div>

    <Link to={ROUTES.LOGIN} className="btn btn-outline-secondary w-100">
      Retour à la connexion
    </Link>
  </>
);

export default ResetPasswordPage;
