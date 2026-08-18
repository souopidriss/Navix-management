/**
 * Navix Client Dashboard — ClientAlertsCard
 * --------------------------------------------------------------------------
 * Alertes importantes du client, par gravité (URGENT / ATTENTION / INFO)
 * et par catégorie métier (Maintenance, Documents, Assurance, Visite
 * technique, Carburant, Trajets). Les alertes urgentes sont prioritaires.
 * « Voir toutes les alertes » pointe vers l'espace notifications client.
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';
import { formatDashboardDate } from '@/features/dashboard/constants';
import './ClientDashboard.css';

const SEVERITY_META = {
  critical: { label: 'URGENT', variant: 'danger', icon: 'bi-exclamation-octagon' },
  warning: { label: 'ATTENTION', variant: 'warning', icon: 'bi-exclamation-triangle' },
  info: { label: 'INFO', variant: 'info', icon: 'bi-info-circle' },
};

const CATEGORY_LABELS = {
  maintenance: 'Maintenance',
  documents: 'Documents',
  assurance: 'Assurance',
  inspection: 'Visite technique',
  fuel: 'Carburant',
  trips: 'Trajets',
};

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

const ClientAlertsCard = ({ alerts = { critical: 0, warning: 0, info: 0, items: [] } }) => {
  const items = [...(alerts.items || [])].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3),
  );

  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-bell text-danger" aria-hidden="true" />
          <span>Alertes importantes</span>
          {alerts.critical > 0 && (
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle ms-1">
              {alerts.critical} urgent{alerts.critical > 1 ? 's' : ''}
            </span>
          )}
        </span>
      }
      footer={
        items.length > 0 ? (
          <Link to={ROUTES.CLIENT_NOTIFICATIONS} className="btn btn-sm btn-outline-secondary w-100">
            Voir toutes les alertes
            <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
          </Link>
        ) : null
      }
    >
      {items.length === 0 ? (
        <p className="text-secondary mb-0 py-3 text-center">
          <i className="bi bi-check2-circle me-1 text-success" aria-hidden="true" />
          Aucune alerte pour le moment.
        </p>
      ) : (
        <ul className="navix-client-alerts list-unstyled mb-0">
          {items.map((alert) => {
            const severity = SEVERITY_META[alert.severity] || SEVERITY_META.info;
            const categoryLabel = CATEGORY_LABELS[alert.category] || alert.category || 'Général';
            return (
              <li key={alert.id} className={`navix-client-alert navix-client-alert--${alert.severity}`}>
                <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                  <span className={`badge bg-${severity.variant}-subtle text-${severity.variant} border border-${severity.variant}-subtle`}>
                    <i className={`bi ${severity.icon} me-1`} aria-hidden="true" />
                    {severity.label}
                  </span>
                  <span className="small text-muted">{categoryLabel}</span>
                </div>
                <p className="navix-client-alert__title mb-1">{alert.title}</p>
                <p className="navix-client-alert__description mb-0">{alert.description}</p>
                <time className="navix-client-alert__date">{formatDashboardDate(alert.createdAt)}</time>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default ClientAlertsCard;
