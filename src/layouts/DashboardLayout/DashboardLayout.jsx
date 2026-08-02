import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import Overlay from '@/components/layout/Overlay';
import { Navbar } from '@/components/layout/Navbar';
import { useMediaQuery, useTheme } from '@/hooks';
import './DashboardLayout.css';

const DESKTOP_QUERY = '(min-width: 992px)';

const DashboardLayout = () => {
  useTheme();

  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const handleMenuClick = () => {
    if (isDesktop) setCollapsed((current) => !current);
    else setMobileOpen(true);
  };

  return (
    <div className="navix-dashboard d-flex">
      <div className={`navix-sidebar ${collapsed ? 'navix-sidebar--collapsed' : ''}`.trim()}>
        <Sidebar collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="navix-dashboard__content d-flex flex-column flex-grow-1">
        <Navbar onMenuClick={handleMenuClick} />
        <main className="navix-dashboard__main flex-grow-1">
          <Outlet />
        </main>
      </div>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Overlay open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
