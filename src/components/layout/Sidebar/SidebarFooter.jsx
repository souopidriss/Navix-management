const SidebarFooter = ({ collapsed = false }) => (
  <div className="navix-sidebar__footer">
    {collapsed ? (
      <span className="navix-sidebar__footer-dot" title="v0.1.0 — Développement" />
    ) : (
      <span className="navix-sidebar__footer-text">
        <i className="bi bi-shield-check" aria-hidden="true" />
        v0.1.0 — Développement
      </span>
    )}
  </div>
);

export default SidebarFooter;
