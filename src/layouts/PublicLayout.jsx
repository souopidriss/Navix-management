import { Link, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PublicLayout = () => (
  <div className="d-flex flex-column min-vh-100">
    <Helmet titleTemplate="%s — Navix Management" defaultTitle="Navix Management" />

    <nav className="navbar navbar-expand-lg border-bottom bg-body">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-geo-alt-fill text-primary fs-4" aria-hidden="true" />
          Navix
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navixPublicNav"
          aria-controls="navixPublicNav"
          aria-expanded="false"
          aria-label="Ouvrir le menu"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navixPublicNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link className="nav-link" to="/">Accueil</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/fonctionnalites">Fonctionnalités</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-outline-primary px-3" to="/auth/login">Connexion</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-primary px-3" to="/auth/register">Démarrer</Link>
            </li>
          </ul>
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
        <span className="text-secondary small">© {new Date().getFullYear()} Navix Management. Tous droits réservés.</span>
        <ul className="list-inline mb-0">
          <li className="list-inline-item">
            <Link className="text-secondary" to="/">Confidentialité</Link>
          </li>
          <li className="list-inline-item">
            <Link className="text-secondary" to="/">Conditions</Link>
          </li>
        </ul>
      </div>
    </footer>
  </div>
);

export default PublicLayout;
