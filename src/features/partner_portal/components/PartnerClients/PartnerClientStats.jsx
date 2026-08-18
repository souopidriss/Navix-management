/**
 * Navix Partner Portal — PartnerClientStats (PROMPT 065)
 * --------------------------------------------------------------------------
 * 4 cartes KPI des clients partenaire : Total / Actifs / Inactifs (inclut les
 * archivés) / Revenus des missions terminées (FCFA). Valeurs dynamiques
 * (agrégats de la liste réelle recomputés depuis le module Missions) —
 * l'état initial correspond aux valeurs imposées 37 clients / 31 actifs /
 * 6 inactifs / 18 750 000 FCFA.
 */
import { formatNumber } from '@/utils/format';
import { MetricCard } from '@/components/core';
import { FCFA_LABEL } from '../../constants/partner.constants';

const PartnerClientStats = ({ counts = {}, loading = false }) => {
  const total = counts.total || 0;
  const percent = (value) => (total ? Math.round((value / total) * 100) : 0);

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Clients"
          value={total}
          icon="bi-people"
          variant="primary"
          loading={loading}
          variation="portefeuille total"
          trend="neutral"
          trendLabel="clients référencés"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Actifs"
          value={counts.active ?? 0}
          icon="bi-check-circle"
          variant="success"
          loading={loading}
          variation={`${percent(counts.active ?? 0)} % des clients`}
          trend="up"
          trendLabel="clients actifs"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Inactifs"
          value={counts.inactive ?? 0}
          icon="bi-pause-circle"
          variant="secondary"
          loading={loading}
          variation={`${percent(counts.inactive ?? 0)} % des clients`}
          trend="neutral"
          trendLabel="inactifs & archivés"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Revenus (missions)"
          value={`${formatNumber(counts.revenue ?? 0)} ${FCFA_LABEL}`}
          icon="bi-cash-stack"
          variant="warning"
          loading={loading}
          variation="missions terminées"
          trend="up"
          trendLabel="prestations facturées"
        />
      </div>
    </div>
  );
};

export default PartnerClientStats;
