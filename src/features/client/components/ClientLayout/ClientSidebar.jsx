/**
 * Navix Client — ClientSidebar
 * --------------------------------------------------------------------------
 * Navigation de la barre latérale dédiée à l'Espace Client (Entreprise / Particulier).
 */
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import SidebarItem from '@/components/layout/Sidebar/SidebarItem';
import SidebarSection from '@/components/layout/Sidebar/SidebarSection';
import { CLIENT_SIDEBAR_SECTIONS, filterClientSidebarSections } from '../../constants/client.navigation';
import { useClientStore } from '../../store/client.store';

const ClientSidebar = ({ collapsed = false, onNavigate }) => {
  const clientType = useClientStore((state) => state.clientType);
  const currentClient = useClientStore((state) => state.currentClient);

  const sections = filterClientSidebarSections(CLIENT_SIDEBAR_SECTIONS, clientType);

  return (
    <div className="navix-sidebar__inner">
      {/* Brand Header Client */}
      <div className="navix-sidebar__logo-wrap border-bottom border-secondary-subtle py-3 px-3">
        <Link to={ROUTES.CLIENT_DASHBOARD} className="d-flex align-items-center text-decoration-none text-body gap-2">
          <span className="navix-topbar__brand-mark flex-shrink-0">
            <i className="bi bi-person-workspace" aria-hidden="true" />
          </span>
          {!collapsed && (
            <div className="d-flex flex-column lh-1">
              <span className="fw-bold fs-6">Navix Client</span>
              <small className="text-muted style-caption" style={{ fontSize: '0.7rem' }}>
                {clientType === 'enterprise' ? 'Espace Entreprise' : 'Espace Particulier'}
              </small>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="navix-sidebar__nav flex-grow-1" aria-label="Navigation client">
        {sections.map((section) => (
          <SidebarSection key={section.label} title={section.label}>
            {section.items.map((item) => (
              <SidebarItem key={item.to} {...item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </SidebarSection>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-top border-secondary-subtle mt-auto">
        <div className="d-flex align-items-center justify-content-between">
          {!collapsed && (
            <span className="small text-truncate text-muted">
              {currentClient?.companyName || currentClient?.displayName || 'Espace Client'}
            </span>
          )}
          <span className="badge bg-secondary-subtle text-body-secondary">🇨🇲 CM</span>
        </div>
      </div>
    </div>
  );
};

export default ClientSidebar;
