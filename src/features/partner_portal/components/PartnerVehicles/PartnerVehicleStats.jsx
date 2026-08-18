/**
 * Navix Partner Portal — PartnerVehicleStats (PROMPT 063)
 * --------------------------------------------------------------------------
 * 4 cartes KPI de la flotte partenaire : Total / Disponibles / En mission /
 * En maintenance. Valeurs dynamiques (agrégats de la flotte réelle) — l'état
 * initial correspond aux valeurs imposées 24 / 18 / 4 / 2. Chaque carte
 * porte icône, valeur, libellé, variation et mini-indicateur de tendance.
 */
import { MetricCard } from '@/components/core';

const PartnerVehicleStats = ({ counts = {}, availabilityRate = 0, loading = false }) => {
  const total = counts.total || 0;
  const percent = (value) => (total ? Math.round((value / total) * 100) : 0);

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Total véhicules"
          value={total}
          icon="bi-truck"
          variant="primary"
          loading={loading}
          variation="Flotte partenaire"
          trend="neutral"
          trendLabel="taille de la flotte"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="Disponibles"
          value={counts.available ?? 0}
          icon="bi-check-circle"
          variant="success"
          loading={loading}
          variation={`${percent(counts.available ?? 0)} % de la flotte`}
          trend="up"
          trendLabel="véhicules disponibles"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="En mission"
          value={counts.in_use ?? 0}
          icon="bi-play-circle"
          variant="info"
          loading={loading}
          variation={`${percent(counts.in_use ?? 0)} % de la flotte`}
          trend="neutral"
          trendLabel="véhicules en mission"
        />
      </div>
      <div className="col-6 col-xl-3">
        <MetricCard
          label="En maintenance"
          value={counts.maintenance ?? 0}
          icon="bi-wrench-adjustable"
          variant="warning"
          loading={loading}
          variation={`Taux de dispo ${availabilityRate} %`}
          trend={availabilityRate >= 60 ? 'up' : 'neutral'}
          trendLabel="taux de disponibilité"
        />
      </div>
    </div>
  );
};

export default PartnerVehicleStats;
