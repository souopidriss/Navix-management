/**
 * Navix Dashboard — DashboardAlerts
 * --------------------------------------------------------------------------
 * Alertes consolidées du tableau de bord, triées par gravité. Chaque alerte
 * est cliquable et pointe vers l'entité concernée.
 */
import { Card } from '@/components/ui';
import { Link } from 'react-router-dom';
import {
  maintenanceDetailPath,
  vehicleDetailPath,
  fuelDetailPath,
  documentDetailPath,
} from '@/routes/route.constants';
import { getAlertType, getAlertSeverity, formatDashboardDate } from '../constants';
import './DashboardAlerts.css';

const entityToPath = (entityType, entityId) => {
  switch (entityType) {
    case 'maintenance':
      return maintenanceDetailPath(entityId);
    case 'vehicle':
      return vehicleDetailPath(entityId);
    case 'fuel':
      return fuelDetailPath(entityId);
    case 'document':
      return documentDetailPath(entityId);
    default:
      return null;
  }
};

const DashboardAlerts = ({ alerts = { items: [], critical: 0, warning: 0, info: 0 } }) => {
  const { items = [] } = alerts;

  return (
    <Card
      title={<span><i className="bi bi-bell me-2" aria-hidden="true" />Alertes</span>}
      footer={
        items.length > 0 ? (
          <span className="navix-dash-alerts__summary">
            {alerts.critical > 0 && (
              <span className="text-danger">
                <i className="bi bi-exclamation-octagon me-1" aria-hidden="true" />
                {alerts.critical} critique{alerts.critical > 1 ? 's' : ''}
              </span>
            )}
            {alerts.warning > 0 && (
              <span className="text-warning">
                <i className="bi bi-exclamation-triangle me-1" aria-hidden="true" />
                {alerts.warning} avertissement{alerts.warning > 1 ? 's' : ''}
              </span>
            )}
            {alerts.info > 0 && (
              <span className="text-info">
                <i className="bi bi-info-circle me-1" aria-hidden="true" />
                {alerts.info} information{alerts.info > 1 ? 's' : ''}
              </span>
            )}
          </span>
        ) : null
      }
    >
      {items.length === 0 ? (
        <p className="text-secondary mb-0">
          <i className="bi bi-check2-circle me-1 text-success" aria-hidden="true" />
          Aucune alerte pour la période.
        </p>
      ) : (
        <ul className="navix-dash-alerts">
          {items.map((alert) => {
            const type = getAlertType(alert.type);
            const severity = getAlertSeverity(alert.severity);
            const to = entityToPath(alert.entityType, alert.entityId);

            const content = (
              <>
                <span className={`navix-dash-alerts__severity navix-dash-alerts__severity--${severity.variant}`}>
                  <i className={`bi ${severity.icon}`} aria-hidden="true" />
                </span>
                <span className="navix-dash-alerts__body">
                  <span className="navix-dash-alerts__head">
                    <span className="navix-dash-alerts__type">{type.label}</span>
                    <time className="navix-dash-alerts__date">{formatDashboardDate(alert.createdAt)}</time>
                  </span>
                  <span className="navix-dash-alerts__title">{alert.title}</span>
                  <span className="navix-dash-alerts__description">{alert.description}</span>
                </span>
                <i className="bi bi-chevron-right navix-dash-alerts__arrow" aria-hidden="true" />
              </>
            );

            return (
              <li key={alert.id}>
                {to ? (
                  <Link to={to} className="navix-dash-alerts__link">
                    {content}
                  </Link>
                ) : (
                  <div className="navix-dash-alerts__link navix-dash-alerts__link--static">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default DashboardAlerts;
