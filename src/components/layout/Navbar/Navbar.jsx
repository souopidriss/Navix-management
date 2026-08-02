import { Link } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';
import CompanySwitcher from './CompanySwitcher';
import NotificationDropdown from './NotificationDropdown';
import ThemeSwitcher from './ThemeSwitcher';
import UserDropdown from './UserDropdown';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => (
  <header className="navix-topbar">
    <button
      type="button"
      className="navix-topbar__toggle"
      onClick={onMenuClick}
      aria-label="Basculer la navigation"
    >
      <i className="bi bi-list" aria-hidden="true" />
    </button>

    <Link to="/dashboard" className="navix-topbar__brand d-lg-none">
      <span className="navix-topbar__brand-mark">
        <i className="bi bi-geo-alt-fill" aria-hidden="true" />
      </span>
      <span className="navix-topbar__brand-name">Navix</span>
    </Link>

    <form className="navix-topbar__search d-none d-xl-flex" role="search" onSubmit={(event) => event.preventDefault()}>
      <i className="bi bi-search" aria-hidden="true" />
      <input
        type="search"
        className="navix-topbar__search-input"
        placeholder="Rechercher…"
        aria-label="Recherche globale"
      />
      <kbd className="navix-topbar__search-kbd">Ctrl K</kbd>
    </form>

    <div className="navix-topbar__breadcrumb d-none d-lg-flex">
      <Breadcrumb />
    </div>

    <div className="navix-topbar__actions">
      <CompanySwitcher className="d-none d-md-flex" />
      <ThemeSwitcher />
      <NotificationDropdown />
      <UserDropdown />
    </div>
  </header>
);

export default Navbar;
