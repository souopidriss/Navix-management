import { SIDEBAR_SECTIONS } from '../navigation';
import SidebarLogo from './SidebarLogo';
import SidebarItem from './SidebarItem';
import SidebarSection from './SidebarSection';
import SidebarFooter from './SidebarFooter';
import './Sidebar.css';

const Sidebar = ({ collapsed = false, onNavigate }) => (
  <div className="navix-sidebar__inner">
    <SidebarLogo collapsed={collapsed} onNavigate={onNavigate} />
    <nav className="navix-sidebar__nav" aria-label="Navigation principale">
      {SIDEBAR_SECTIONS.map((section) => (
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

export default Sidebar;
