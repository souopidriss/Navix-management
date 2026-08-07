/**
 * Navix Notifications — NotificationDropdown
 * --------------------------------------------------------------------------
 * Centre de notifications du Header global : cloche avec badge de non-lues,
 * panneau déroulant rendu par NotificationCenter (dernières notifications,
 * marquer tout lu, bascule temps réel simulé, lien vers la page Notifications).
 * Consommé par le Navbar existant (`src/components/layout/Navbar/NotificationDropdown.jsx`).
 *
 * Accessibilité : bouton (aria-expanded / aria-haspopup / aria-controls),
 * navigation clavier (Échap pour fermer, restitution du focus), fermeture au
 * clic extérieur, `aria-live` sur le badge. Utilisable sur mobile (panneau
 * contraint en largeur par le Header).
 */
import { useEffect, useRef, useState } from 'react';
import { useNotificationsStore } from '../store';
import NotificationCenter from './NotificationCenter';
import UnreadNotificationCount from './UnreadNotificationCount';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    if (open) fetchUnreadCount();
  }, [open, fetchUnreadCount]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleOpen = () => setOpen((current) => !current);

  const handleOpenKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className="dropdown navix-notif-dropdown" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="navix-topbar__icon-btn"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="navix-notif-dropdown-panel"
        onClick={handleOpen}
        onKeyDown={handleOpenKeyDown}
      >
        <i className="bi bi-bell" aria-hidden="true" />
        <UnreadNotificationCount count={unreadCount} />
      </button>

      {open && (
        <div
          id="navix-notif-dropdown-panel"
          className="dropdown-menu dropdown-menu-end show navix-topbar__notif navix-notif-dropdown__panel"
          role="menu"
          aria-label="Notifications récentes"
        >
          <NotificationCenter limit={5} />
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
