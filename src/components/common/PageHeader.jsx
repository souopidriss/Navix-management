const PageHeader = ({ title, subtitle, actions }) => (
  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
    <div>
      <h1 className="h3 mb-1">{title}</h1>
      {subtitle && <p className="text-secondary mb-0">{subtitle}</p>}
    </div>
    {actions && <div className="d-flex align-items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
