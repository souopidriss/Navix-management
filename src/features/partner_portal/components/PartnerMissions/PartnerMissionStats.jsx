/**
 * Navix Partner Portal — PartnerMissionStats (PROMPT 064)
 * --------------------------------------------------------------------------
 * 4 cartes KPI des missions partenaire : Total / En cours / Terminées /
 * Revenus des missions terminées (FCFA). Valeurs dynamiques (agrégats de la
 * liste réelle) — l'état initial correspond aux valeurs imposées
 * 24 missions / 5 en cours / 17 terminées / 18 750 000 FCFA.
 */
import { formatNumber } from '@/utils/format';
import { MetricCard } from '@/components/core';
import { FCFA_LABEL } from '../../constants/partner.constants';

const PartnerMissionStats = ({ counts = {}, loading = false }) => {
  const total = counts.total || 0;
  const percent = (value) => (total ? Math.round((value / total) * 100) : 0);

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Missions"
          value={total}
          icon="bi-signpost-split"
          variant="primary"
          loading={loading}
          variation="du mois d’août"
          trend="neutral"
          trendLabel="volume de missions"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="En cours"
          value={counts.in_progress ?? 0}
          icon="bi-play-circle"
          variant="info"
          loading={loading}
          variation={`${percent(counts.in_progress ?? 0)} % des missions`}
          trend="up"
          trendLabel="missions en cours"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Terminées"
          value={counts.completed ?? 0}
          icon="bi-check2-circle"
          variant="success"
          loading={loading}
          variation={`${percent(counts.completed ?? 0)} % des missions`}
          trend="neutral"
          trendLabel="missions achevées"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Revenus (terminées)"
          value={`${formatNumber(counts.revenue ?? 0)} ${FCFA_LABEL}`}
          icon="bi-cash-stack"
          variant="warning"
          loading={loading}
          variation="cumul du mois"
          trend="up"
          trendLabel="prestations facturées"
        />
      </div>
    </div>
  );
};

export default PartnerMissionStats;
