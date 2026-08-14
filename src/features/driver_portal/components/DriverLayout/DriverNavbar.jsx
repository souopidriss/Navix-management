/**
 * Navix Driver — DriverNavbar
 * --------------------------------------------------------------------------
 * Topbar dédiée à l'Espace Chauffeur.
 */
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import ThemeSwitcher from '@/components/layout/Navbar/ThemeSwitcher';
import NotificationDropdown from '@/components/layout/Navbar/NotificationDropdown';
import UserDropdown from '@/components/layout/Navbar/UserDropdown';

const DriverNavbar = ({ onMenuClick }) => {
  return (
    <header className="navix-topbar">
      <button
        type="button"
        className="navix-topbar__toggle"
        onClick={onMenuClick}
        aria-label="Basculer la navigation chauffeur"
      >
        <i className="bi bi-list" aria-hidden="true" />
      </button>

      <Link to={ROUTES.DRIVER_DASHBOARD} className="navix-topbar__brand d-lg-none">
        <span className="navix-topbar__brand-mark">
          <i className="bi bi-steering" aria-hidden="true" />
        </span>
        <span className="navix-topbar__brand-name">Navix Chauffeur</span>
      </Link>

      <form className="navix-topbar__search d-none d-xl-flex" role="search" onSubmit={(e) => e.preventDefault()}>
        <i className="bi bi-search" aria-hidden="true" />
        <input
          type="search"
          className="navix-topbar__search-input"
          placeholder="Rechercher un trajet, un véhicule, un document…"
          aria-label="Recherche espace chauffeur"
        />
        <kbd className="navix-topbar__search-kbd">Ctrl K</kbd>
      </form>

      <div className="navix-topbar__actions ms-auto d-flex align-items-center gap-2">
        {/* Badge Cameroun */}
        <div className="navix-country-badge d-none d-sm-flex align-items-center" title="Espace Cameroun">
          <span className="me-1" role="img" aria-label="Cameroun">🇨🇲</span>
          <span className="fw-semibold">Cameroun</span>
        </div>

        {/* Badge Role */}
        <span className="badge bg-primary-subtle text-primary d-none d-md-inline-block">
          Conducteur
        </span>

        <ThemeSwitcher />
        <NotificationDropdown />
        <UserDropdown />
      </div>
    </header>
  );
};

export default DriverNavbar;
