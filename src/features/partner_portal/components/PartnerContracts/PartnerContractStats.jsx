/**
 * Navix Partner Portal — PartnerContractStats (PROMPT 073)
 * --------------------------------------------------------------------------
 * 5 KPI Contrats : Total, Actifs, Expirant, Valeur totale, Missions liées.
 */
import { MetricCard } from '@/components/core';
import { formatNumber } from '@/utils/format';
import { FCFA_LABEL } from '../../constants/partner.constants';

const PartnerContractStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="row g-3 mb-4 partner-contract-kpi">
      <div className="col-6 col-lg">
        <MetricCard
          label="Total contrats"
          value={formatNumber(stats.total)}
          icon="bi-file-earmark-text"
          variant="primary"
        />
      </div>
      <div className="col-6 col-lg">
        <MetricCard
          label="Actifs"
          value={formatNumber(stats.active)}
          icon="bi-check-circle-fill"
          variant="success"
        />
      </div>
      <div className="col-6 col-lg">
        <MetricCard
          label="Expiration proche"
          value={formatNumber(stats.expiring)}
          icon="bi-exclamation-triangle-fill"
          variant="warning"
        />
      </div>
      <div className="col-6 col-lg">
        <MetricCard
          label="Valeur totale"
          value={`${formatNumber(stats.activeValue)} ${FCFA_LABEL}`}
          icon="bi-cash-stack"
          variant="info"
        />
      </div>
      <div className="col-6 col-lg">
        <MetricCard
          label="Missions liées"
          value={formatNumber(stats.totalMissions)}
          icon="bi-signpost-split"
          variant="dark"
        />
      </div>
    </div>
  );
};

export default PartnerContractStats;
