/**
 * Navix Partner Portal — PartnerAlertsCard
 * --------------------------------------------------------------------------
 * Alertes importantes de la flotte partenaire, par gravité (URGENT /
 * ATTENTION / INFO). « Voir toutes les alertes » pointe vers l'espace
 * notifications partenaire (variante des liens clients).
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';
import { formatDashboardDate } from '@/features/dashboard/constants';
import '../PartnerDashboard/PartnerDashboard.css';

const SEVERITY_META = {
  critical: { label: 'URGENT', variant: 'danger', icon: 'bi-exclamation-octagon' },
  warning: { label: 'ATTENTION', variant: 'warning', icon: 'bi-exclamation-triangle' },
  info: { label: 'INFO', variant: 'info', icon: 'bi-info-circle' },
};

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

const PartnerAlertsCard = ({ alerts = { critical: 0, warning: 0, info: 0, items: [] } }) => {
  const items = [...(alerts.items || [])].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3),
  );

  return (
    <Card
      className="h-100"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-bell text-danger" aria-hidden="true" />
          <span>Alertes de la flotte</span>
          {alerts.critical > 0 && (
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle ms-1">
              {alerts.critical} urgent{alerts.critical > 1 ? 's' : ''}
            </span>
          )}
        </span>
      }
      footer={
        items.length > 0 ? (
          <Link to={ROUTES.PARTNER_NOTIFICATIONS} className="btn btn-sm btn-outline-secondary w-100">
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
            const categoryLabel = alert.category || 'Général';
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

export default PartnerAlertsCard;
