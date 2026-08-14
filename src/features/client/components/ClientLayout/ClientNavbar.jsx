/**
 * Navix Client — ClientNavbar
 * --------------------------------------------------------------------------
 * Topbar dédiée à l'Espace Client avec recherche globale, badge 🇨🇲 Cameroun,
 * switcher de mode Client (Entreprise / Particulier), notifications et profil.
 */
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import ThemeSwitcher from '@/components/layout/Navbar/ThemeSwitcher';
import NotificationDropdown from '@/components/layout/Navbar/NotificationDropdown';
import UserDropdown from '@/components/layout/Navbar/UserDropdown';
import ClientTypeSwitcher from './ClientTypeSwitcher';
import { useClientStore } from '../../store/client.store';

const ClientNavbar = ({ onMenuClick }) => {
  const clientType = useClientStore((state) => state.clientType);

  return (
    <header className="navix-topbar">
      <button
        type="button"
        className="navix-topbar__toggle"
        onClick={onMenuClick}
        aria-label="Basculer la navigation client"
      >
        <i className="bi bi-list" aria-hidden="true" />
      </button>

      <Link to={ROUTES.CLIENT_DASHBOARD} className="navix-topbar__brand d-lg-none">
        <span className="navix-topbar__brand-mark">
          <i className="bi bi-person-workspace" aria-hidden="true" />
        </span>
        <span className="navix-topbar__brand-name">Navix Client</span>
      </Link>

      <form className="navix-topbar__search d-none d-xl-flex" role="search" onSubmit={(e) => e.preventDefault()}>
        <i className="bi bi-search" aria-hidden="true" />
        <input
          type="search"
          className="navix-topbar__search-input"
          placeholder="Rechercher un service, véhicule, trajet, facture…"
          aria-label="Recherche espace client"
        />
        <kbd className="navix-topbar__search-kbd">Ctrl K</kbd>
      </form>

      <div className="navix-topbar__actions ms-auto d-flex align-items-center gap-2">
        {/* Switcher Entreprise / Particulier */}
        <ClientTypeSwitcher className="me-1" />

        {/* Badge Cameroun */}
        <div className="navix-country-badge d-none d-sm-flex align-items-center" title="Espace Cameroun">
          <span className="me-1" role="img" aria-label="Cameroun">🇨🇲</span>
          <span className="fw-semibold">Cameroun</span>
        </div>

        {/* Dynamic Client Type Badge */}
        <span className={`badge d-none d-md-inline-block ${clientType === 'enterprise' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`}>
          {clientType === 'enterprise' ? 'Compte Entreprise' : 'Compte Particulier'}
        </span>

        <ThemeSwitcher />
        <NotificationDropdown />
        <UserDropdown />
      </div>
    </header>
  );
};

export default ClientNavbar;
