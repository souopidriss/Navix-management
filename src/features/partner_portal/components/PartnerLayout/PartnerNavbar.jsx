/**
 * Navix Partner Portal — PartnerNavbar
 * --------------------------------------------------------------------------
 * Topbar dédiée à l'Espace Partenaire avec recherche globale, badge
 * 🇨🇲 Cameroun, identité entreprise + rôle, thème, notifications et profil.
 */
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { ROLE_DEFINITIONS } from '@/features/rbac/constants';
import { useAuthStore } from '@/features/auth';
import ThemeSwitcher from '@/components/layout/Navbar/ThemeSwitcher';
import NotificationDropdown from '@/components/layout/Navbar/NotificationDropdown';
import UserDropdown from '@/components/layout/Navbar/UserDropdown';
import { usePartnerContext } from '../../hooks/usePartnerContext';
import { PARTNER_LABEL } from '../../constants/partner.constants';

const PartnerNavbar = ({ onMenuClick }) => {
  const currentRole = useAuthStore((state) => state.currentRole);
  const { companyName } = usePartnerContext();

  const roleLabel =
    ROLE_DEFINITIONS.find((definition) => definition.key === currentRole)?.label ?? 'Partenaire';

  return (
    <header className="navix-topbar">
      <button
        type="button"
        className="navix-topbar__toggle"
        onClick={onMenuClick}
        aria-label="Basculer la navigation partenaire"
      >
        <i className="bi bi-list" aria-hidden="true" />
      </button>

      <Link to={ROUTES.PARTNER_DASHBOARD} className="navix-topbar__brand d-lg-none">
        <span className="navix-topbar__brand-mark">
          <i className="bi bi-diagram-3" aria-hidden="true" />
        </span>
        <span className="navix-topbar__brand-name">Navix Partenaire</span>
      </Link>

      <form className="navix-topbar__search d-none d-xl-flex" role="search" onSubmit={(e) => e.preventDefault()}>
        <i className="bi bi-search" aria-hidden="true" />
        <input
          type="search"
          className="navix-topbar__search-input"
          placeholder="Rechercher une mission, un véhicule, une transaction…"
          aria-label="Recherche espace partenaire"
        />
        <kbd className="navix-topbar__search-kbd">Ctrl K</kbd>
      </form>

      <div className="navix-topbar__actions ms-auto d-flex align-items-center gap-2">
        {/* Identité Entreprise Partenaire + Rôle */}
        <div
          className="d-none d-xl-flex flex-column align-items-end lh-1 me-1"
          title="Entreprise partenaire et rôle de la session"
        >
          <span className="small fw-semibold text-body-emphasis text-truncate" style={{ maxWidth: '220px' }}>
            <i className="bi bi-buildings me-1 text-primary" aria-hidden="true" />
            {companyName || 'Votre Entreprise Partenaire'}
          </span>
          <small className="text-muted">
            {roleLabel} · {PARTNER_LABEL}
          </small>
        </div>

        {/* Badge Cameroun */}
        <div className="navix-country-badge d-none d-sm-flex align-items-center" title="Espace Cameroun">
          <span className="me-1" role="img" aria-label="Cameroun">🇨🇲</span>
          <span className="fw-semibold">Cameroun</span>
        </div>

        {/* Badge Partenaire Premium */}
        <span className="badge d-none d-md-inline-block bg-primary-subtle text-primary">
          <i className="bi bi-stars me-1" aria-hidden="true" />
          Partenaire Premium
        </span>

        <ThemeSwitcher />
        <NotificationDropdown />
        <UserDropdown />
      </div>
    </header>
  );
};

export default PartnerNavbar;
