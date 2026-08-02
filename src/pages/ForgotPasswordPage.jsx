import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';

const ForgotPasswordPage = () => (
  <>
    <Helmet>
      <title>Mot de passe oublié</title>
    </Helmet>
    <h1 className="h4 mb-1">Mot de passe oublié</h1>
    <p className="text-secondary small mb-4">Recevez un lien pour réinitialiser votre mot de passe.</p>

    <div className="text-center py-4">
      <i className="bi bi-key display-4 text-secondary" aria-hidden="true" />
      <p className="text-secondary mt-3 mb-0">
        Le formulaire d'envoi du lien sera intégré ici.
      </p>
    </div>

    <Link to={ROUTES.LOGIN} className="btn btn-outline-secondary w-100">
      Retour à la connexion
    </Link>
  </>
);

export default ForgotPasswordPage;
