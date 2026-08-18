/**
 * Navix Partner Portal — PartnerInvoiceStats (PROMPT 071 §5)
 * --------------------------------------------------------------------------
 * 4 KPI Facturation : Total facturé, Payé, En attente, En retard.
 */
import { MetricCard } from '@/components/core';
import { formatNumber } from '@/utils/format';
import { FCFA_LABEL } from '../../constants/partner.constants';

const PartnerInvoiceStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-lg-3">
        <MetricCard
          label="Total facturé"
          value={`${formatNumber(stats.totalBilled)} ${FCFA_LABEL}`}
          icon="bi-receipt"
          variant="primary"
        />
      </div>
      <div className="col-6 col-lg-3">
        <MetricCard
          label="Payé"
          value={`${formatNumber(stats.totalPaid)} ${FCFA_LABEL}`}
          icon="bi-check-circle"
          variant="success"
        />
      </div>
      <div className="col-6 col-lg-3">
        <MetricCard
          label="En attente"
          value={`${formatNumber(stats.totalPending)} ${FCFA_LABEL}`}
          icon="bi-hourglass-split"
          variant="warning"
        />
      </div>
      <div className="col-6 col-lg-3">
        <MetricCard
          label="En retard"
          value={`${formatNumber(stats.totalOverdue)} ${FCFA_LABEL}`}
          icon="bi-exclamation-triangle"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default PartnerInvoiceStats;
