import { Link } from 'react-router-dom';

const SidebarLogo = ({ collapsed = false, onNavigate }) => (
  <div className="navix-sidebar__brand">
    <Link
      to="/dashboard"
      className="navix-sidebar__brand-link"
      onClick={onNavigate}
      aria-label="Navix Management"
      title={collapsed ? 'Navix Management' : undefined}
    >
      <span className="navix-sidebar__brand-mark">
        <i className="bi bi-geo-alt-fill" aria-hidden="true" />
      </span>
      {!collapsed && (
        <span className="navix-sidebar__brand-text">
          <span className="navix-sidebar__brand-name">Navix</span>
          <span className="navix-sidebar__brand-tag">Management</span>
        </span>
      )}
    </Link>
  </div>
);

export default SidebarLogo;
