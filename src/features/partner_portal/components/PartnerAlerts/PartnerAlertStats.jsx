/**
 * Navix Partner Portal — PartnerAlertStats (PROMPT 075)
 * ──────────────────────────────────────────────────────
 * Cartes KPI pour les statistiques des alertes.
 */
import { formatNumber } from '@/utils/format';

const PartnerAlertStats = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      key: 'total',
      icon: 'bi-bell',
      value: formatNumber(stats.total),
      label: 'Total alertes',
      variant: 'total',
    },
    {
      key: 'critical',
      icon: 'bi-exclamation-triangle',
      value: formatNumber(stats.critical),
      label: 'Urgentes',
      variant: 'critical',
    },
    {
      key: 'warning',
      icon: 'bi-exclamation-circle',
      value: formatNumber(stats.warning),
      label: 'Attention',
      variant: 'warning',
    },
    {
      key: 'info',
      icon: 'bi-info-circle',
      value: formatNumber(stats.info),
      label: 'Informations',
      variant: 'info',
    },
    {
      key: 'action',
      icon: 'bi-lightning',
      value: formatNumber(stats.actionRequired),
      label: 'Action requise',
      variant: 'action',
    },
  ];

  return (
    <div className="partner-alerts-kpi-grid">
      {cards.map((card) => (
        <div key={card.key} className="partner-alerts-kpi-card">
          <div className={`partner-alerts-kpi-icon ${card.variant}`}>
            <i className={`bi ${card.icon}`} />
          </div>
          <div className="partner-alerts-kpi-content">
            <span className="partner-alerts-kpi-value">{card.value}</span>
            <span className="partner-alerts-kpi-label">{card.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartnerAlertStats;
