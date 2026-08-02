const SidebarSection = ({ title, children }) => (
  <div className="navix-sidebar__section">
    <p className="navix-sidebar__section-label">{title}</p>
    <ul className="navix-sidebar__list">{children}</ul>
  </div>
);

export default SidebarSection;
