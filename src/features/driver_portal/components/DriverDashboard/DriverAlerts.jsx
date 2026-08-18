/**
 * Navix Driver Portal — DriverAlerts
 * --------------------------------------------------------------------------
 * Centre « Alertes & rappels » de l'Espace Chauffeur : entretiens à venir,
 * documents qui expirent, trajet en cours / à venir et incidents à traiter.
 * Chaque alerte est cliquable et pointe vers la page Espace Chauffeur
 * correspondante (jamais vers les routes admin).
 *
 * Props :
 *   alerts : [{ id, level: 'urgent'|'attention'|'info', title, description, link }]
 */
import { Card } from '@/components/ui';
import { Link } from 'react-router-dom';
import { getDriverAlertLevel } from '../../constants/driver.constants';
import './DriverAlerts.css';

const LEVELS = {
  urgent: { label: 'URGENT', variant: 'danger', icon: 'bi-exclamation-octagon' },
  attention: { label: 'ATTENTION', variant: 'warning', icon: 'bi-exclamation-triangle' },
  info: { label: 'INFO', variant: 'info', icon: 'bi-info-circle' },
};

const DriverAlerts = ({ alerts = [] }) => {
  const sorted = [...alerts].sort((a, b) => {
    const rank = (level) => (level === 'urgent' ? 0 : level === 'attention' ? 1 : 2);
    return rank(a.level) - rank(b.level);
  });

  const counts = { urgent: 0, attention: 0, info: 0 };
  alerts.forEach((alert) => {
    if (counts[alert.level] !== undefined) counts[alert.level] += 1;
  });

  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-bell text-warning" aria-hidden="true" />
          <span>Alertes &amp; rappels</span>
        </span>
      }
      footer={
        sorted.length > 0 ? (
          <span className="navix-driver-alerts__summary">
            {counts.urgent > 0 && (
              <span className="text-danger">
                <i className="bi bi-exclamation-octagon me-1" aria-hidden="true" />
                {counts.urgent} urgent{counts.urgent > 1 ? 's' : ''}
              </span>
            )}
            {counts.attention > 0 && (
              <span className="text-warning">
                <i className="bi bi-exclamation-triangle me-1" aria-hidden="true" />
                {counts.attention} à traiter
              </span>
            )}
            {counts.info > 0 && (
              <span className="text-info">
                <i className="bi bi-info-circle me-1" aria-hidden="true" />
                {counts.info} information{counts.info > 1 ? 's' : ''}
              </span>
            )}
          </span>
        ) : null
      }
    >
      {sorted.length === 0 ? (
        <p className="text-secondary mb-0">
          <i className="bi bi-check2-circle me-1 text-success" aria-hidden="true" />
          Aucune alerte. Tout est sous contrôle !
        </p>
      ) : (
        <ul className="navix-driver-alerts">
          {sorted.map((alert) => {
            const level = getDriverAlertLevel(alert.level);
            const meta = LEVELS[alert.level] || LEVELS.info;
            const content = (
              <>
                <span className={`navix-driver-alerts__level navix-driver-alerts__level--${meta.variant}`}>
                  <i className={`bi ${meta.icon}`} aria-hidden="true" />
                </span>
                <span className="navix-driver-alerts__body">
                  <span className="navix-driver-alerts__head">
                    <span className={`navix-driver-alerts__badge text-${meta.variant}`}>{level.label}</span>
                  </span>
                  <span className="navix-driver-alerts__title">{alert.title}</span>
                  <span className="navix-driver-alerts__description">{alert.description}</span>
                </span>
                <i className="bi bi-chevron-right navix-driver-alerts__arrow" aria-hidden="true" />
              </>
            );
            return (
              <li key={alert.id}>
                {alert.link ? (
                  <Link to={alert.link} className="navix-driver-alerts__link">
                    {content}
                  </Link>
                ) : (
                  <div className="navix-driver-alerts__link navix-driver-alerts__link--static">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default DriverAlerts;
