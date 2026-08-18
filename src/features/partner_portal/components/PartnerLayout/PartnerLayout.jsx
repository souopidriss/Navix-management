/**
 * Navix Partner Portal — PartnerLayout
 * --------------------------------------------------------------------------
 * Layout principal de l'Espace Partenaire. Gère la grille responsive avec
 * Sidebar Partenaire, Topbar Partenaire et l'Outlet pour les sous-pages.
 * Réplique le pattern du ClientLayout (feature-owned) : même useMediaQuery,
 * mêmes états `collapsed` / `mobileOpen`, mêmes primitives partagées
 * MobileSidebar + Overlay et même CSS de grille (DashboardLayout.css).
 */
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import PartnerSidebar from './PartnerSidebar';
import PartnerNavbar from './PartnerNavbar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import Overlay from '@/components/layout/Overlay';
import { useMediaQuery } from '@/hooks';
import '@/layouts/DashboardLayout/DashboardLayout.css';
import './PartnerLayout.css';

const DESKTOP_QUERY = '(min-width: 992px)';

const PartnerLayout = () => {
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
    <div className="navix-dashboard navix-partner-layout d-flex">
      <div className={`navix-sidebar ${collapsed ? 'navix-sidebar--collapsed' : ''}`.trim()}>
        <PartnerSidebar collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="navix-dashboard__content d-flex flex-column flex-grow-1">
        <PartnerNavbar onMenuClick={handleMenuClick} />
        <main className="navix-dashboard__main flex-grow-1 p-3 p-md-4">
          <Outlet />
        </main>
      </div>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Overlay open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
};

export default PartnerLayout;
