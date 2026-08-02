import { SIDEBAR_SECTIONS } from '../navigation';
import { filterSidebarSections, useRbacStore } from '@/features/rbac';
import SidebarLogo from './SidebarLogo';
import SidebarItem from './SidebarItem';
import SidebarSection from './SidebarSection';
import SidebarFooter from './SidebarFooter';
import './Sidebar.css';

const Sidebar = ({ collapsed = false, onNavigate }) => {
  const role = useRbacStore((state) => state.currentRole);
  const permissions = useRbacStore((state) => state.permissions);

  const sections = filterSidebarSections(SIDEBAR_SECTIONS, { role, permissions });

  return (
    <div className="navix-sidebar__inner">
      <SidebarLogo collapsed={collapsed} onNavigate={onNavigate} />
      <nav className="navix-sidebar__nav" aria-label="Navigation principale">
        {sections.map((section) => (
          <SidebarSection key={section.label} title={section.label}>
            {section.items.map((item) => (
              <SidebarItem key={item.to} {...item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </SidebarSection>
        ))}
      </nav>
      <SidebarFooter collapsed={collapsed} />
    </div>
  );
};

export default Sidebar;
