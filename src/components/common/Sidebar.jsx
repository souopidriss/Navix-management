import { Link, NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Tableau de bord', icon: 'bi-speedometer2', end: true },
  { to: '/dashboard/vehicles', label: 'Véhicules', icon: 'bi-truck' },
  { to: '/dashboard/drivers', label: 'Conducteurs', icon: 'bi-person-badge' },
  { to: '/dashboard/trips', label: 'Trajets', icon: 'bi-signpost-split' },
  { to: '/dashboard/maintenance', label: 'Maintenance', icon: 'bi-wrench-adjustable' },
  { to: '/dashboard/reports', label: 'Rapports', icon: 'bi-clipboard-data' },
  { to: '/dashboard/settings', label: 'Paramètres', icon: 'bi-gear' },
];

const Sidebar = ({ open, onNavigate }) => (
  <aside className={`navix-sidebar bg-body-tertiary border-end ${open ? 'navix-sidebar--open' : ''}`}>
    <div className="navix-topbar border-bottom d-flex align-items-center px-3">
      <Link to="/" className="fw-bold d-flex align-items-center gap-2 text-decoration-none">
        <i className="bi bi-geo-alt-fill text-primary fs-4" aria-hidden="true" />
        <span>Navix</span>
      </Link>
    </div>

    <nav className="flex-grow-1 p-3">
      <p className="small text-uppercase fw-semibold text-secondary px-2 mb-2">Menu</p>
      <ul className="nav flex-column gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `nav-link rounded d-flex align-items-center gap-2 ${isActive ? 'bg-primary text-white' : 'text-body'}`
              }
            >
              <i className={`bi ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>

    <div className="border-top p-3 small text-secondary">v0.1.0 — Développement</div>
  </aside>
);

export default Sidebar;
