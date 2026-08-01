import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <section className="d-flex align-items-center justify-content-center min-vh-100 py-5">
    <Helmet>
      <title>Page introuvable</title>
    </Helmet>
    <div className="text-center px-3">
      <p className="display-1 fw-bold mb-0">404</p>
      <p className="text-secondary mb-4">La page demandée est introuvable ou a été déplacée.</p>
      <Link to="/" className="btn btn-primary">
        Retour à l'accueil
      </Link>
    </div>
  </section>
);

export default NotFoundPage;
