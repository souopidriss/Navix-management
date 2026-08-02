import { NavLink } from 'react-router-dom';
import { Tooltip } from '@/components/ui';

const SidebarItem = ({ to, label, icon, end = false, collapsed = false, badge, disabled = false, onNavigate }) => {
  const content = disabled ? (
    <span className="navix-sidebar__item navix-sidebar__item--disabled" aria-disabled="true">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <span className="navix-sidebar__label">{label}</span>
      {badge && <span className="navix-sidebar__badge">{badge}</span>}
    </span>
  ) : (
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
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </li>
  );
};

export default SidebarItem;
