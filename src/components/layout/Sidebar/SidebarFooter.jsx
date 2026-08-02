import { appConfig } from '@/config';

const SidebarFooter = ({ collapsed = false }) => {
  const versionLabel = `v${appConfig.version} — Développement`;

  return (
    <div className="navix-sidebar__footer">
      {collapsed ? (
        <span className="navix-sidebar__footer-dot" title={versionLabel} />
      ) : (
        <span className="navix-sidebar__footer-text">
          <i className="bi bi-shield-check" aria-hidden="true" />
          {versionLabel}
        </span>
      )}
    </div>
  );
};

export default SidebarFooter;
