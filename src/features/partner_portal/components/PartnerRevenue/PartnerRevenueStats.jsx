/**
 * Navix Partner Portal — PartnerRevenueStats (PROMPT 070 §6)
 * --------------------------------------------------------------------------
 * 5 KPI Revenus : Brut, Commissions, Net, En attente, Disponible.
 * Sélecteur de période intégré (§7).
 */
import { useMemo } from 'react';
import { MetricCard } from '@/components/core';
import { formatNumber } from '@/utils/format';
import { FCFA_LABEL } from '../../constants/partner.constants';

const PartnerRevenueStats = ({ stats, period, onPeriodChange }) => {
  const periodOptions = useMemo(() => [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'last7', label: '7 derniers jours' },
    { value: 'month', label: 'Ce mois' },
    { value: 'lastMonth', label: 'Mois précédent' },
    { value: 'last3', label: '3 derniers mois' },
    { value: 'last6', label: '6 derniers mois' },
    { value: 'year', label: 'Année' },
    { value: 'custom', label: 'Personnalisée' },
  ], []);

  if (!stats) return null;

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h6 className="mb-0 fw-semibold text-secondary">
          <i className="bi bi-calendar3 me-1" aria-hidden="true" />
          Indicateurs financiers
        </h6>
        <div className="navix-client-finance__period-tabs" role="group" aria-label="Période des revenus">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`navix-client-finance__period-tab ${period === opt.value ? 'navix-client-finance__period-tab--active' : ''}`}
              onClick={() => onPeriodChange(opt.value)}
              aria-pressed={period === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="row g-3">
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Revenu brut"
            value={`${formatNumber(stats.grossTotal)} ${FCFA_LABEL}`}
            icon="bi-arrow-down-circle"
            variant="primary"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Commissions"
            value={`${formatNumber(stats.commissionTotal)} ${FCFA_LABEL}`}
            icon="bi-percent"
            variant="warning"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Revenu net"
            value={`${formatNumber(stats.netTotal)} ${FCFA_LABEL}`}
            icon="bi-cash-stack"
            variant="success"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="En attente"
            value={`${formatNumber(stats.pendingAmount)} ${FCFA_LABEL}`}
            icon="bi-hourglass-split"
            variant="info"
          />
        </div>
        <div className="col-6 col-lg-4 col-xl">
          <MetricCard
            label="Disponible"
            value={`${formatNumber(stats.availableAmount)} ${FCFA_LABEL}`}
            icon="bi-wallet2"
            variant="success"
          />
        </div>
      </div>
    </div>
  );
};

export default PartnerRevenueStats;
