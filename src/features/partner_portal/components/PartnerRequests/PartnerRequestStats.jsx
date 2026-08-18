/**
 * Navix Partner Portal — PartnerRequestStats
 * --------------------------------------------------------------------------
 * 4 KPI Demandes : Total demandes, En cours, Acceptées, Converties.
 */
import { MetricCard } from '@/components/core';
import { formatNumber } from '@/utils/format';

const PartnerRequestStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-lg-3">
        <MetricCard
          label="Total demandes"
          value={formatNumber(stats.total)}
          icon="bi-inbox"
          variant="primary"
        />
      </div>
      <div className="col-6 col-lg-3">
        <MetricCard
          label="En cours"
          value={formatNumber(stats.active)}
          icon="bi-hourglass-split"
          variant="warning"
        />
      </div>
      <div className="col-6 col-lg-3">
        <MetricCard
          label="Acceptées"
          value={formatNumber(stats.accepted)}
          icon="bi-check-circle"
          variant="success"
        />
      </div>
      <div className="col-6 col-lg-3">
        <MetricCard
          label="Converties"
          value={formatNumber(stats.converted)}
          icon="bi-arrow-right-circle"
          variant="dark"
        />
      </div>
    </div>
  );
};

export default PartnerRequestStats;
