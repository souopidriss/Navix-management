import { Outlet, useLocation } from 'react-router-dom';
import { TopBar, Navbar, PublicFooter } from '@/components/public';
import '@/styles/public/vitrine.tokens.css';
import '@/styles/public/vitrine.css';

const PUBLIC_EMAIL = 'contact@navix.app';

const PublicLayout = () => {
  const { pathname } = useLocation();

  return (
    <div className="d-flex flex-column min-vh-100" data-page="public">
      <TopBar email={PUBLIC_EMAIL} />
      <Navbar activePage={pathname} />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
