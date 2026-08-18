import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import './LoginSpaceMenu.css';

const SPACES = [
  {
    label: '\u{1F451} Super Admin',
    description: "Accédez à l'espace d'administration de la plateforme Navix.",
    icon: 'bi-shield-lock',
    to: ROUTES.LOGIN,
  },
  {
    label: '\u{1F3E2} Client',
    description: 'Entreprises ou particuliers, gérez votre flotte en toute simplicité.',
    icon: 'bi-building',
    to: ROUTES.LOGIN,
  },
  {
    label: '\u{1F464} Chauffeur',
    description: 'Consultez vos missions, trajets et informations personnelles.',
    icon: 'bi-person-badge',
    to: ROUTES.LOGIN,
  },
  {
    label: '\u26FD Partenaire – Station',
    description: 'Gérez vos stations, transactions et livraisons de carburant.',
    icon: 'bi-fuel-pump',
    to: ROUTES.LOGIN,
  },
];

const LoginSpaceMenu = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  const classes = ['nv-login-menu', className].filter(Boolean).join(' ');

  return (
    <div className={classes} ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`nv-login-menu__trigger ${isOpen ? 'nv-login-menu__trigger--open' : ''}`}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="nv-login-menu-panel"
      >
        <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
        <span>Connexion</span>
        <i className="bi bi-chevron-down nv-login-menu__trigger-icon" aria-hidden="true" />
      </button>

      <div
        id="nv-login-menu-panel"
        className={`nv-login-menu__panel ${isOpen ? 'nv-login-menu__panel--open' : ''}`}
        role="menu"
        aria-label="Choisir un espace"
      >
        {SPACES.map((space) => (
          <Link
            key={space.label}
            to={space.to}
            className="nv-login-menu__item"
            role="menuitem"
            onClick={close}
          >
            <span className="nv-login-menu__item-icon">
              <i className={`bi ${space.icon}`} aria-hidden="true" />
            </span>
            <span className="nv-login-menu__item-content">
              <span className="nv-login-menu__item-label">{space.label}</span>
              <span className="nv-login-menu__item-desc">{space.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LoginSpaceMenu;
