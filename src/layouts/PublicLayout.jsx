import { Link, Outlet } from 'react-router-dom';
import { APP_NAME } from '@/config';
import { ROUTES } from '@/routes/route.constants';

const PublicLayout = () => (
  <div className="d-flex flex-column min-vh-100">
    <nav className="navbar navbar-expand-lg border-bottom bg-body">
      <div className="container">
        <Link to={ROUTES.HOME} className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-geo-alt-fill text-primary fs-4" aria-hidden="true" />
          Navix
        </Link>
        <div className="ms-auto">
          <Link to={ROUTES.LOGIN} className="btn btn-outline-primary px-3">
            Connexion
          </Link>
        </div>
      </div>
    </nav>

    <main className="flex-grow-1 py-4">
      <div className="container">
        <Outlet />
      </div>
    </main>

    <footer className="border-top bg-body py-4">
      <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span className="text-secondary small">
          © {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
        </span>
        <ul className="list-inline mb-0">
          <li className="list-inline-item">
            <Link className="text-secondary" to={ROUTES.HOME}>
              Confidentialité
            </Link>
          </li>
          <li className="list-inline-item">
            <Link className="text-secondary" to={ROUTES.HOME}>
              Conditions
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  </div>
);

export default PublicLayout;
