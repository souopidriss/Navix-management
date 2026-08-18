/**
 * Navix Partner Portal — PartnerSupportStats (PROMPT 077)
 * ────────────────────────────────────────────────────────
 * KPI du module Support : 5 cartes (total, ouverts, en cours, résolus, à répondre).
 */
import { memo } from 'react';

const STAT_CONFIG = [
  { key: 'total', label: 'Total tickets', icon: 'bi-ticket-detailed', variant: 'primary' },
  { key: 'open', label: 'Ouverts', icon: 'bi-folder2-open', variant: 'warning' },
  { key: 'inProgress', label: 'En cours', icon: 'bi-arrow-repeat', variant: 'info' },
  { key: 'resolved', label: 'Résolus', icon: 'bi-check-circle', variant: 'success' },
  { key: 'awaitingResponse', label: 'À répondre', icon: 'bi-person-exclamation', variant: 'danger' },
];

const PartnerSupportStats = ({ stats }) => (
  <div className="ps-stats">
    {STAT_CONFIG.map(({ key, label, icon, variant }) => (
      <div key={key} className="ps-stat-card">
        <div className={`ps-stat-card__icon ps-stat-card__icon--${variant}`}>
          <i className={`bi ${icon}`} />
        </div>
        <div className="ps-stat-card__content">
          <div className="ps-stat-card__value">{stats?.[key] ?? 0}</div>
          <div className="ps-stat-card__label">{label}</div>
        </div>
      </div>
    ))}
  </div>
);

export default memo(PartnerSupportStats);
