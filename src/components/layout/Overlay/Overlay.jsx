import './Overlay.css';

const Overlay = ({ open = false, onClose, label = 'Fermer le panneau' }) => (
  <div
    className={`navix-overlay ${open ? 'navix-overlay--visible' : ''}`}
    onClick={onClose}
    aria-hidden={!open}
    role="presentation"
  >
    <span className="visually-hidden">{label}</span>
  </div>
);

export default Overlay;
