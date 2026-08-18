/**
 * Navix Partner Portal — PartnerSidebar
 * --------------------------------------------------------------------------
 * Navigation de la barre latérale dédiée à l'Espace Partenaire.
 * Réutilise les primitives partagées SidebarItem / SidebarSection.
 */
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import SidebarItem from '@/components/layout/Sidebar/SidebarItem';
import SidebarSection from '@/components/layout/Sidebar/SidebarSection';
import { PARTNER_SIDEBAR_SECTIONS } from '../../constants/partner.navigation';
import { usePartnerContext } from '../../hooks/usePartnerContext';

const PartnerSidebar = ({ collapsed = false, onNavigate }) => {
  const { companyName } = usePartnerContext();

  return (
    <div className="navix-sidebar__inner">
      {/* Brand Header Partenaire */}
      <div className="navix-sidebar__logo-wrap border-bottom border-secondary-subtle py-3 px-3">
        <Link to={ROUTES.PARTNER_DASHBOARD} className="d-flex align-items-center text-decoration-none text-body gap-2">
          <span className="navix-topbar__brand-mark flex-shrink-0">
            <i className="bi bi-diagram-3" aria-hidden="true" />
          </span>
          {!collapsed && (
            <div className="d-flex flex-column lh-1">
              <span className="fw-bold fs-6">Navix Partenaire</span>
              <small className="text-muted style-caption" style={{ fontSize: '0.7rem' }}>
                Espace Partenaire Premium
              </small>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="navix-sidebar__nav flex-grow-1" aria-label="Navigation partenaire">
        {PARTNER_SIDEBAR_SECTIONS.map((section) => (
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
              {companyName || 'Espace Partenaire'}
            </span>
          )}
          <span className="badge bg-secondary-subtle text-body-secondary">🇨🇲 CM</span>
        </div>
      </div>
    </div>
  );
};

export default PartnerSidebar;
