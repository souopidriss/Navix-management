import Sidebar from '../Sidebar';
import './MobileSidebar.css';

const MobileSidebar = ({ open = false, onClose }) => (
  <div
    className={`navix-mobile-sidebar ${open ? 'navix-mobile-sidebar--open' : ''}`.trim()}
    role="dialog"
    aria-modal="true"
    aria-label="Menu de navigation"
  >
    <button
      type="button"
      className="navix-mobile-sidebar__close"
      onClick={onClose}
      aria-label="Fermer le menu"
    >
      <i className="bi bi-x-lg" aria-hidden="true" />
    </button>
    <Sidebar collapsed={false} onNavigate={onClose} />
  </div>
);

export default MobileSidebar;
