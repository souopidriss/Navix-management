import Breadcrumb from '../Breadcrumb';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, actions, breadcrumbs, icon, className }) => (
  <header className={`navix-page-header ${className || ''}`.trim()}>
    {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="navix-page-header__breadcrumb" />}
    <div className="navix-page-header__row">
      <div className="navix-page-header__heading">
        {icon && (
          <span className="navix-page-header__icon" aria-hidden="true">
            <i className={`bi ${icon}`} />
          </span>
        )}
        <div>
          <h1 className="navix-page-header__title">{title}</h1>
          {subtitle && <p className="navix-page-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="navix-page-header__actions">{actions}</div>}
    </div>
  </header>
);

export default PageHeader;
