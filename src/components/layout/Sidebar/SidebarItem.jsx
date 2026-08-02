import { NavLink } from 'react-router-dom';
import { Tooltip } from '@/components/ui';

const SidebarItem = ({ to, label, icon, end = false, collapsed = false, badge, onNavigate }) => {
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        `navix-sidebar__item ${isActive ? 'navix-sidebar__item--active' : ''}`.trim()
      }
    >
      <i className={`bi ${icon}`} aria-hidden="true" />
      <span className="navix-sidebar__label">{label}</span>
      {badge && <span className="navix-sidebar__badge">{badge}</span>}
    </NavLink>
  );

  return (
    <li className="navix-sidebar__item-wrap">
      {collapsed ? (
        <Tooltip content={label} placement="right">
          {link}
        </Tooltip>
      ) : (
        link
      )}
    </li>
  );
};

export default SidebarItem;
