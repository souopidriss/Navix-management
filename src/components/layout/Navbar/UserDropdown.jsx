import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/features/auth/store/auth.store';
import { ROUTES } from '@/routes/route.constants';
import { Avatar } from '@/components/ui';

const UserDropdown = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="dropdown">
      <button
        type="button"
        className="navix-topbar__user"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Menu du compte"
      >
        <Avatar name={user?.name} size="sm" />
        <span className="navix-topbar__user-meta d-none d-md-flex">
          <span className="navix-topbar__user-name">{user?.name || 'Utilisateur'}</span>
          <span className="navix-topbar__user-role">{user?.role || 'Administrateur'}</span>
        </span>
        <i className="bi bi-chevron-down navix-topbar__user-caret d-none d-md-inline" aria-hidden="true" />
      </button>

      <div className="dropdown-menu dropdown-menu-end navix-topbar__menu">
        <div className="navix-topbar__menu-header">
          <Avatar name={user?.name} size="sm" />
          <div className="navix-topbar__menu-meta">
            <div className="navix-topbar__menu-name">{user?.name || 'Utilisateur'}</div>
            <div className="navix-topbar__menu-email">{user?.email || 'utilisateur@navix.app'}</div>
          </div>
        </div>
        <hr className="dropdown-divider" />
        <button
          type="button"
          className="dropdown-item"
          onClick={() => navigate(ROUTES.SETTINGS)}
        >
          <i className="bi bi-gear me-2" aria-hidden="true" />
          Paramètres
        </button>
        <button
          type="button"
          className="dropdown-item"
          onClick={() => navigate(ROUTES.PROFILE)}
        >
          <i className="bi bi-person me-2" aria-hidden="true" />
          Profil
        </button>
        <hr className="dropdown-divider" />
        <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
