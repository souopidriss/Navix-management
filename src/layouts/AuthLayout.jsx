import { Outlet } from 'react-router-dom';
import AuthLogo from '@/features/auth/components/AuthLogo';
import './AuthLayout.css';

const AuthLayout = () => (
  <div className="navix-auth-layout">
    <div className="navix-auth-layout__container">
      <div className="navix-auth-layout__header">
        <AuthLogo className="navix-auth-layout__logo" />
        <p className="navix-auth-layout__tagline">Gestion de flotte de v&eacute;hicules</p>
      </div>
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
