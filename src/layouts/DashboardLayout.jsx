import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Topbar, DashboardFooter } from '@/components/common';

const DashboardLayout = () => {
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 992px)').matches);

  const toggleSidebar = () => setOpen((current) => !current);

  return (
    <div className={`navix-dashboard d-flex ${open ? '' : 'navix-dashboard--collapsed'}`}>
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      <div className="navix-dashboard__content d-flex flex-column flex-grow-1 min-vw-0">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="flex-grow-1 p-3 p-md-4 bg-body-secondary bg-opacity-25">
          <Outlet />
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default DashboardLayout;
