import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/auth.store';
import { useTheme } from '@/hooks';

const Topbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { mode, toggleMode } = useTheme();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/auth/login');
  };

  return (
    <header className="navix-topbar border-bottom bg-body d-flex align-items-center px-3 gap-2">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={onToggleSidebar}
        aria-label="Basculer le menu latéral"
      >
        <i className="bi bi-list fs-5" aria-hidden="true" />
      </button>

      <div className="ms-auto d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={toggleMode}
          aria-label="Changer de thème"
        >
          <i className={`bi ${mode === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
        </button>

        <div className="dropdown">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle me-1" aria-hidden="true" />
            {user?.name || 'Utilisateur'}
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button type="button" className="dropdown-item" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
