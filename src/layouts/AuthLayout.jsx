import { Outlet } from 'react-router-dom';
import AuthLogo from '@/features/auth/components/AuthLogo';

const AuthLayout = () => (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary py-4">
    <div className="w-100 px-3" style={{ maxWidth: '28rem' }}>
      <div className="text-center mb-4">
        <AuthLogo />
        <p className="text-secondary mb-0 mt-2">Gestion de flotte de véhicules</p>
      </div>

      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
