import { Link, useLocation } from 'react-router-dom';
import { ROUTE_LABELS } from '../navigation';
import './Breadcrumb.css';

const buildCrumbs = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);

  return segments
    .map((segment, index) => {
      const to = `/${segments.slice(0, index + 1).join('/')}`;
      const label = ROUTE_LABELS[to];
      if (!label) return null;

      const last = index === segments.length - 1;
      return { label, to: last ? null : to };
    })
    .filter(Boolean);
};

const Breadcrumb = ({ items, className }) => {
  const { pathname } = useLocation();
  const crumbs = items && items.length > 0 ? items : buildCrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav className={`navix-breadcrumb ${className || ''}`.trim()} aria-label="Fil d'Ariane">
      <ol className="breadcrumb mb-0">
        {crumbs.map((crumb, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${crumb.to ? '' : 'active'}`}
            aria-current={crumb.to ? undefined : 'page'}
          >
            {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
