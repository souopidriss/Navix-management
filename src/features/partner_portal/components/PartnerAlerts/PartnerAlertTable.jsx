/**
 * Navix Partner Portal — PartnerAlertTable (PROMPT 075)
 * ─────────────────────────────────────────────────────
 * Tableau des alertes avec actions (acknowledge, resolve, dismiss).
 */
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/route.constants';
import { formatDateTime } from '@/utils/format';
import { ALERT_SORT_OPTIONS } from '../../schemas/partnerAlerts.schema';

const SEVERITY_LABELS = {
  critical: 'Urgent',
  warning: 'Attention',
  info: 'Info',
};

const STATUS_LABELS = {
  pending: 'En attente',
  acknowledged: 'Prise en compte',
  resolved: 'Traitée',
  dismissed: 'Ignorée',
};

const TYPE_LABELS = {
  maintenance_urgent: 'Maintenance urgente',
  maintenance_due: 'Entretien à prévoir',
  document_expiring: 'Document expirant',
  document_expired: 'Document expiré',
  contract_expiring: 'Contrat expirant',
  contract_expired: 'Contrat expiré',
  contract_pending: 'Contrat en attente',
  invoice_overdue: 'Facture en retard',
  invoice_expiring: 'Facture à échéance',
  mission_delayed: 'Mission en retard',
  mission_cancelled: 'Mission annulée',
  request_pending: 'Demande en attente',
  fuel_anomaly: 'Anomalie carburant',
};

const ENTITY_ROUTES = {
  vehicle: ROUTES.PARTNER_VEHICLES,
  document: ROUTES.PARTNER_DOCUMENTS,
  contract: ROUTES.PARTNER_CONTRACTS,
  invoice: ROUTES.PARTNER_FINANCE_INVOICES,
  mission: ROUTES.PARTNER_MISSIONS,
  request: ROUTES.PARTNER_REQUESTS,
};

const ENTITY_DETAIL_ROUTES = {
  document: ROUTES.PARTNER_DOCUMENTS,
  contract: ROUTES.PARTNER_CONTRACTS,
  invoice: ROUTES.PARTNER_FINANCE_INVOICES,
  mission: ROUTES.PARTNER_MISSIONS,
  request: ROUTES.PARTNER_REQUESTS,
};

const PartnerAlertTable = ({
  alerts,
  total,
  totalPages,
  filters,
  onFilterChange,
  onAcknowledge,
  onResolve,
  onDismiss,
  isLoading,
}) => {
  const navigate = useNavigate();

  const handleSort = (field) => {
    const newDir = filters.sortBy === field && filters.sortDirection === 'desc' ? 'asc' : 'desc';
    onFilterChange({ sortBy: field, sortDirection: newDir });
  };

  const handlePageChange = (newPage) => {
    onFilterChange({ page: newPage });
  };

  const handleEntityClick = (alert) => {
    if (!alert.entityType || !alert.entityId) return;
    const detailPath = ENTITY_DETAIL_ROUTES[alert.entityType];
    if (detailPath) {
      navigate(`${detailPath}/${alert.entityId}`);
    } else {
      const basePath = ENTITY_ROUTES[alert.entityType];
      if (basePath) navigate(basePath);
    }
  };

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return 'bi-chevron-expand';
    return filters.sortDirection === 'asc' ? 'bi-chevron-up' : 'bi-chevron-down';
  };

  if (isLoading) {
    return (
      <div className="partner-alerts-section">
        <div className="partner-alerts-empty">
          <i className="bi bi-hourglass-split" />
          <p className="partner-alerts-empty-text">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="partner-alerts-section">
        <div className="partner-alerts-empty">
          <i className="bi bi-check-circle" />
          <p className="partner-alerts-empty-title">Aucune alerte</p>
          <p className="partner-alerts-empty-text">
            Aucune alerte ne correspond à vos critères de recherche.
          </p>
        </div>
      </div>
    );
  }

  const startIdx = (filters.page - 1) * filters.pageSize + 1;
  const endIdx = Math.min(filters.page * filters.pageSize, total);

  return (
    <div className="partner-alerts-section">
      <div className="partner-alerts-section-title">
        <i className="bi bi-list-ul" />
        Alertes ({total})
      </div>

      <div className="partner-alerts-table-wrapper">
        <table className="partner-alerts-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('severity')}>
                Sévérité <i className={`bi ${getSortIcon('severity')}`} />
              </th>
              <th onClick={() => handleSort('title')}>
                Titre <i className={`bi ${getSortIcon('title')}`} />
              </th>
              <th>Type</th>
              <th>Entité</th>
              <th onClick={() => handleSort('createdAt')}>
                Créée le <i className={`bi ${getSortIcon('createdAt')}`} />
              </th>
              <th onClick={() => handleSort('expiresAt')}>
                Échéance <i className={`bi ${getSortIcon('expiresAt')}`} />
              </th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td>
                  <span className={`partner-alert-severity-badge ${alert.severity}`}>
                    <span className={`partner-alert-severity-dot ${alert.severity}`} />
                    {SEVERITY_LABELS[alert.severity] || alert.severity}
                  </span>
                </td>
                <td>
                  <strong>{alert.title}</strong>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #6b7280)', marginTop: 2 }}>
                    {alert.message?.length > 80
                      ? `${alert.message.substring(0, 80)}...`
                      : alert.message}
                  </div>
                </td>
                <td>
                  <span className="partner-alert-type-badge">
                    {TYPE_LABELS[alert.type] || alert.type}
                  </span>
                </td>
                <td>
                  {alert.entityLabel && (
                    <span
                      className="partner-alert-entity-link"
                      onClick={() => handleEntityClick(alert)}
                      role="button"
                      tabIndex={0}
                    >
                      {alert.entityLabel.length > 25
                        ? `${alert.entityLabel.substring(0, 25)}...`
                        : alert.entityLabel}
                    </span>
                  )}
                </td>
                <td>{formatDateTime(alert.createdAt, 'DD/MM/YYYY')}</td>
                <td>
                  {alert.expiresAt
                    ? formatDateTime(alert.expiresAt, 'DD/MM/YYYY')
                    : '—'}
                </td>
                <td>
                  <span className={`partner-alert-status-badge ${alert.status}`}>
                    {STATUS_LABELS[alert.status] || alert.status}
                  </span>
                </td>
                <td>
                  <div className="partner-alerts-actions">
                    {alert.status === 'pending' && (
                      <>
                        <button
                          className="partner-alerts-action-btn"
                          onClick={() => onAcknowledge(alert.id)}
                          title="Prendre en compte"
                        >
                          <i className="bi bi-eye" />
                        </button>
                        <button
                          className="partner-alerts-action-btn resolve"
                          onClick={() => onResolve(alert.id)}
                          title="Marquer comme traitée"
                        >
                          <i className="bi bi-check-lg" />
                        </button>
                        <button
                          className="partner-alerts-action-btn dismiss"
                          onClick={() => onDismiss(alert.id)}
                          title="Ignorer"
                        >
                          <i className="bi bi-x-lg" />
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button
                        className="partner-alerts-action-btn resolve"
                        onClick={() => onResolve(alert.id)}
                        title="Marquer comme traitée"
                      >
                        <i className="bi bi-check-lg" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="partner-alerts-pagination">
          <div className="partner-alerts-pagination-info">
            Affichage de {startIdx} à {endIdx} sur {total} alertes
          </div>
          <div className="partner-alerts-pagination-btns">
            <button
              className="partner-alerts-pagination-btn"
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              <i className="bi bi-chevron-left" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const startPage = Math.max(1, Math.min(filters.page - 2, totalPages - 4));
              const pageNum = startPage + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  className={`partner-alerts-pagination-btn ${filters.page === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="partner-alerts-pagination-btn"
              disabled={filters.page >= totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerAlertTable;
