const NotificationDropdown = () => (
  <div className="dropdown">
    <button
      type="button"
      className="navix-topbar__icon-btn"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      aria-label="Notifications"
    >
      <i className="bi bi-bell" aria-hidden="true" />
    </button>

    <div className="dropdown-menu dropdown-menu-end navix-topbar__notif">
      <div className="navix-topbar__notif-header">
        <span className="navix-topbar__notif-title">Notifications</span>
        <span className="navix-topbar__notif-count">0</span>
      </div>
      <div className="navix-topbar__notif-body">
        <i className="bi bi-bell-slash navix-topbar__notif-empty-icon" aria-hidden="true" />
        <p className="navix-topbar__notif-empty-text">Aucune notification pour le moment.</p>
      </div>
    </div>
  </div>
);

export default NotificationDropdown;
