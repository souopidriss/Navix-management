/**
 * Navix Client — ClientNavbar
 * --------------------------------------------------------------------------
 * Topbar dédiée à l'Espace Client avec recherche globale, badge 🇨🇲 Cameroun,
 * switcher de mode Client (Entreprise / Particulier), notifications et profil.
 */
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { ROLE_DEFINITIONS } from '@/features/rbac/constants';
import { useAuthStore } from '@/features/auth';
import ThemeSwitcher from '@/components/layout/Navbar/ThemeSwitcher';
import NotificationDropdown from '@/components/layout/Navbar/NotificationDropdown';
import UserDropdown from '@/components/layout/Navbar/UserDropdown';
import ClientTypeSwitcher from './ClientTypeSwitcher';
import { useClientStore } from '../../store/client.store';
import { useClientContext } from '../../hooks/useClientContext';
import { CLIENT_TYPE_LABELS } from '../../constants/client.constants';

const ClientNavbar = ({ onMenuClick }) => {
  const clientType = useClientStore((state) => state.clientType);
  const currentRole = useAuthStore((state) => state.currentRole);
  const { companyName } = useClientContext();

  const roleLabel =
    ROLE_DEFINITIONS.find((definition) => definition.key === currentRole)?.label ??
    'Client';

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
        {/* Identité Entreprise + Rôle */}
        <div
          className="d-none d-xl-flex flex-column align-items-end lh-1 me-1"
          title="Entreprise et rôle de la session"
        >
          <span className="small fw-semibold text-body-emphasis text-truncate" style={{ maxWidth: '220px' }}>
            <i className="bi bi-buildings me-1 text-primary" aria-hidden="true" />
            {companyName || 'Votre Entreprise'}
          </span>
          <small className="text-muted">
            {roleLabel} · {CLIENT_TYPE_LABELS[clientType] ?? 'Client'}
          </small>
        </div>

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
