/**
 * Navix Partner Portal — PartnerPerformanceStats
 * --------------------------------------------------------------------------
 * 6 KPI principaux de l'analytics Partenaire :
 * CA, Revenu Net, Missions, Taux d'acceptation, Clients actifs, Véhicules actifs.
 */
import { formatNumber } from '@/utils/format';
import VariationBadge from '@/features/reports/components/VariationBadge';

const KPI_DEFS = [
  { key: 'gross', label: 'Chiffre d\'affaires', icon: 'bi-cash-stack', variant: 'primary', format: 'currency' },
  { key: 'net', label: 'Revenu net', icon: 'bi-wallet2', variant: 'success', format: 'currency' },
  { key: 'missions', label: 'Missions', icon: 'bi-signpost-split', variant: 'info', format: 'number' },
  { key: 'acceptance', label: 'Taux d\'acceptation', icon: 'bi-check-circle', variant: 'warning', format: 'percent' },
  { key: 'clients', label: 'Clients actifs', icon: 'bi-people', variant: 'primary', format: 'number' },
  { key: 'vehicles', label: 'Véhicules actifs', icon: 'bi-truck', variant: 'info', format: 'number' },
];

const formatValue = (value, format) => {
  if (value === null || value === undefined) return '—';
  switch (format) {
    case 'currency':
      return `${formatNumber(value)} FCFA`;
    case 'percent':
      return `${value} %`;
    default:
      return formatNumber(value);
  }
};

const getVariation = (key, kpis) => {
  if (!kpis) return null;
  switch (key) {
    case 'gross': return kpis.grossVariation;
    case 'net': return kpis.netVariation;
    case 'missions': return kpis.missionsVariation;
    default: return null;
  }
};

const PartnerPerformanceStats = ({ kpis, loading = false }) => {
  if (loading) {
    return (
      <div className="row g-3 mb-4">
        {KPI_DEFS.map((kpi) => (
          <div key={kpi.key} className="col-xl-2 col-lg-4 col-sm-6">
            <div className="navix-analytics-kpi-card placeholder-glow">
              <div className="placeholder rounded" style={{ height: 80 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="row g-3 mb-4">
        <div className="col-12">
          <p className="text-secondary text-center py-3">Aucune donnée disponible pour cette période.</p>
        </div>
      </div>
    );
  }

  const values = {
    gross: kpis.grossTotal,
    net: kpis.netTotal,
    missions: kpis.totalMissions,
    acceptance: kpis.acceptanceRate,
    clients: kpis.activeClients,
    vehicles: kpis.activeVehicles,
  };

  return (
    <div className="row g-3 mb-4">
      {KPI_DEFS.map((kpi) => {
        const variation = getVariation(kpi.key, kpis);
        return (
          <div key={kpi.key} className="col-xl-2 col-lg-4 col-sm-6">
            <div className="navix-analytics-kpi-card">
              <div className={`navix-analytics-kpi-icon navix-analytics-kpi-icon--${kpi.variant}`}>
                <i className={`bi ${kpi.icon}`} aria-hidden="true" />
              </div>
              <div className="navix-analytics-kpi-content">
                <span className="navix-analytics-kpi-label">{kpi.label}</span>
                <span className="navix-analytics-kpi-value">
                  {formatValue(values[kpi.key], kpi.format)}
                </span>
                {variation !== null && variation !== 0 && (
                  <VariationBadge value={variation} label="vs période précédente" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PartnerPerformanceStats;
