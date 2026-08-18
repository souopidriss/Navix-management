import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { appConfig } from '@/config';
import LoginSpaceMenu from '../LoginSpaceMenu';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Accueil', to: ROUTES.HOME, icon: 'bi-house' },
  { label: 'Fonctionnalités', to: ROUTES.PUBLIC_FEATURES, icon: 'bi-grid-1x2' },
  { label: 'Tarifs', to: ROUTES.PUBLIC_PRICING, icon: 'bi-tag' },
  { label: 'À propos', to: ROUTES.PUBLIC_ABOUT, icon: 'bi-info-circle' },
  { label: 'Ressources', to: ROUTES.PUBLIC_RESOURCES, icon: 'bi-book' },
  { label: 'Contact', to: ROUTES.PUBLIC_CONTACT, icon: 'bi-envelope' },
];

const Navbar = ({ activePage }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMobile();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen, closeMobile]);

  return (
    <nav className="nv-navbar" role="navigation" aria-label="Navigation principale">
      <div className="nv-container">
        <div className="nv-navbar__inner">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="nv-navbar__brand" aria-label={`${appConfig.name} — Retour à l'accueil`}>
            <span className="nv-navbar__brand-mark" aria-hidden="true">
              <i className="bi bi-geo-alt-fill" />
            </span>
            <span className="nv-navbar__brand-text">
              <span className="nv-navbar__brand-name">NAVIX</span>
              <span className="nv-navbar__brand-tagline">MANAGEMENT</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="nv-navbar__nav">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`nv-navbar__link ${activePage === link.to ? 'nv-navbar__link--active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="nv-navbar__actions">
            <LoginSpaceMenu className="nv-navbar__login" />
            <Link to={`${ROUTES.PUBLIC_CONTACT}?type=demo`} className="nv-btn-orange nv-navbar__cta">
              Demander une démo
            </Link>
            <button
              type="button"
              className="nv-navbar__hamburger"
              onClick={openMobile}
              aria-label="Ouvrir le menu"
              aria-haspopup="dialog"
            >
              <i className="bi bi-list" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`nv-navbar__mobile-menu ${mobileOpen ? 'nv-navbar__mobile-menu--open' : ''}`}
        role="dialog"
        aria-label="Menu mobile"
        aria-modal="true"
      >
        <div className="nv-navbar__mobile-header">
          <Link to={ROUTES.HOME} className="nv-navbar__brand" onClick={closeMobile}>
            <span className="nv-navbar__brand-mark" aria-hidden="true">
              <i className="bi bi-geo-alt-fill" />
            </span>
            <span className="nv-navbar__brand-text">
              <span className="nv-navbar__brand-name">NAVIX</span>
              <span className="nv-navbar__brand-tagline">MANAGEMENT</span>
            </span>
          </Link>
          <button
            type="button"
            className="nv-navbar__mobile-close"
            onClick={closeMobile}
            aria-label="Fermer le menu"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>

        <ul className="nv-navbar__mobile-nav">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="nv-navbar__mobile-link"
                onClick={closeMobile}
              >
                <i className={`bi ${link.icon}`} aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nv-navbar__mobile-actions">
          <LoginSpaceMenu className="w-100" />
          <Link to={`${ROUTES.PUBLIC_CONTACT}?type=demo`} className="nv-btn-orange w-100" onClick={closeMobile}>
            Demander une démo
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
