import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';

const MaintenancePage = () => (
  <section className="d-flex align-items-center justify-content-center min-vh-100 bg-body py-5">
    <Helmet>
      <title>Maintenance</title>
    </Helmet>
    <div className="text-center px-3">
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 text-warning"
        style={{ width: '5rem', height: '5rem', backgroundColor: 'rgba(var(--navix-warning-rgb), 0.12)' }}
        aria-hidden="true"
      >
        <i className="bi bi-tools fs-1" />
      </span>
      <h1 className="h3 mb-2">Maintenance en cours</h1>
      <p className="text-secondary mb-4">
        Le service est momentanément indisponible pour maintenance. Réessayez dans quelques instants.
      </p>
      <Link to={ROUTES.HOME} className="btn btn-outline-secondary">
        <i className="bi bi-house me-2" aria-hidden="true" />
        Retour à l'accueil
      </Link>
    </div>
  </section>
);

export default MaintenancePage;
