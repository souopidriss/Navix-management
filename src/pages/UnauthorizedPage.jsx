import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/routes/route.constants';

const UnauthorizedPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="d-flex align-items-center justify-content-center min-vh-100 bg-body py-5">
      <Helmet>
        <title>Accès refusé</title>
      </Helmet>
      <div className="text-center px-3">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 text-danger"
          style={{ width: '5rem', height: '5rem', backgroundColor: 'rgba(var(--navix-danger-rgb), 0.12)' }}
          aria-hidden="true"
        >
          <i className="bi bi-shield-lock fs-1" />
        </span>
        <p className="display-4 fw-bold mb-0">403</p>
        <h1 className="h5 mt-2 mb-2">Accès refusé</h1>
        <p className="text-secondary mb-4">
          {isAuthenticated
            ? "Vous n'avez pas les permissions nécessaires pour accéder à cette page."
            : 'Vous devez être connecté pour accéder à cette page.'}
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to={ROUTES.DASHBOARD} className="btn btn-primary">
                <i className="bi bi-speedometer2 me-2" aria-hidden="true" />
                Retour au Dashboard
              </Link>
              <Link to={ROUTES.HOME} className="btn btn-outline-secondary">
                <i className="bi bi-house me-2" aria-hidden="true" />
                Retour à l'accueil
              </Link>
            </>
          ) : (
            <Link to={ROUTES.LOGIN} className="btn btn-primary">
              <i className="bi bi-box-arrow-in-right me-2" aria-hidden="true" />
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default UnauthorizedPage;
