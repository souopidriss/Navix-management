import { Link, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const AuthLayout = () => (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary py-4">
    <Helmet titleTemplate="%s — Navix Management" defaultTitle="Navix Management" />

    <div className="w-100 px-3" style={{ maxWidth: '28rem' }}>
      <div className="text-center mb-4">
        <Link to="/" className="navbar-brand fw-bold d-inline-flex align-items-center gap-2 mb-2">
          <i className="bi bi-geo-alt-fill text-primary fs-3" aria-hidden="true" />
          Navix
        </Link>
        <p className="text-secondary mb-0">Gestion de flotte de véhicules</p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <Outlet />
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
