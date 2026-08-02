import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';

const LoginPage = () => (
  <>
    <Helmet>
      <title>Connexion</title>
    </Helmet>
    <h1 className="h4 mb-1">Connexion</h1>
    <p className="text-secondary small mb-4">Accédez à votre espace de gestion de flotte.</p>

    <div className="text-center py-4">
      <i className="bi bi-box-arrow-in-right display-4 text-secondary" aria-hidden="true" />
      <p className="text-secondary mt-3 mb-0">
        Le formulaire d'authentification sera intégré ici.
      </p>
    </div>

    <div className="d-flex flex-column gap-2">
      <Link to={ROUTES.DASHBOARD} className="btn btn-primary w-100">
        Accéder au Dashboard
      </Link>
      <Link to={ROUTES.FORGOT_PASSWORD} className="text-center small text-decoration-none">
        Mot de passe oublié&nbsp;?
      </Link>
    </div>
  </>
);

export default LoginPage;
