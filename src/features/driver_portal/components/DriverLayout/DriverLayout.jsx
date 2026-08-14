/**
 * Navix Driver — DriverLayout
 * --------------------------------------------------------------------------
 * Layout maître de l'Espace Chauffeur.
 * Identique en structure au layout admin, mais injecte DriverSidebar et DriverNavbar.
 */
import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import DriverNavbar from './DriverNavbar';
import './DriverLayout.css';

const DriverLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Fermer la sidebar mobile lors du changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="navix-driver-layout">
      {/* Sidebar mobile backdrop */}
      <div
        className={`navix-driver-backdrop d-lg-none ${sidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
        role="presentation"
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar Chauffeur */}
      <aside className={`navix-driver-sidebar navix-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <DriverSidebar onNavigate={closeSidebar} />
      </aside>

      {/* Main Content Area */}
      <div className="navix-driver-content">
        <DriverNavbar onMenuClick={toggleSidebar} />
        
        <main className="navix-driver-main" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
