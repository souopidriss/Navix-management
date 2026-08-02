import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { APP_NAME } from '@/config';

const SidebarLogo = ({ collapsed = false, onNavigate }) => (
  <div className="navix-sidebar__brand">
    <Link
      to={ROUTES.DASHBOARD}
      className="navix-sidebar__brand-link"
      onClick={onNavigate}
      aria-label={APP_NAME}
      title={collapsed ? APP_NAME : undefined}
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
