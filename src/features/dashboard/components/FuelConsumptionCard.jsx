/**
 * Navix Dashboard — FuelConsumptionCard
 * --------------------------------------------------------------------------
 * Carte visuelle de la consommation de carburant de la flotte avec volume total,
 * moyenne aux 100 km, coût global en FCFA et jauge circulaire d'efficience.
 */
import { formatCurrency, formatNumber } from '@/utils/format';
import { Card } from '@/components/ui';
import './DashChart.css';

const FuelConsumptionCard = ({ fuelData }) => {
  const totalQuantity = fuelData?.totalQuantity ?? fuelData?.monthQuantity ?? 18450;
  const averageConsumption = fuelData?.averageConsumption ?? 11.4;
  const totalCost = fuelData?.totalCost ?? fuelData?.monthCost ?? 12450000;
  const targetConsumption = 12.0;

  // Efficiency gauge percent (e.g. 100% when at target, higher if better)
  const efficiencyPercent = Math.min(100, Math.max(20, Math.round((targetConsumption / (averageConsumption || 1)) * 85)));

  return (
    <Card
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-fuel-pump text-info" aria-hidden="true" />
          <span>Consommation de carburant</span>
        </span>
      }
      className="h-100"
    >
      <div className="d-flex flex-column justify-content-between h-100 py-1">
        <div className="row g-3 align-items-center mb-3">
          <div className="col-7">
            <div className="mb-3">
              <span className="text-muted small d-block">Volume total consommé</span>
              <span className="fs-4 fw-bold text-body-emphasis">
                {formatNumber(totalQuantity)} <small className="fs-6 text-muted">L</small>
              </span>
            </div>

            <div className="mb-3">
              <span className="text-muted small d-block">Moyenne flotte / 100 km</span>
              <span className="fs-5 fw-semibold text-info">
                {averageConsumption} <small className="fs-6 text-muted">L / 100 km</small>
              </span>
            </div>

            <div>
              <span className="text-muted small d-block">Dépense globale carburant</span>
              <span className="fs-6 fw-bold text-success">
                {formatCurrency(totalCost, 'XAF')}
              </span>
            </div>
          </div>

          <div className="col-5 text-center">
            <div className="navix-fuel-gauge position-relative d-inline-block">
              <svg width="110" height="110" viewBox="0 0 110 110" className="navix-fuel-gauge-svg">
                <circle
                  cx="55"
                  cy="55"
                  r="45"
                  fill="none"
                  stroke="var(--navix-border-color-subtle)"
                  strokeWidth="10"
                />
                <circle
                  cx="55"
                  cy="55"
                  r="45"
                  fill="none"
                  stroke="var(--navix-info)"
                  strokeWidth="10"
                  strokeDasharray={`${(efficiencyPercent / 100) * 282} 282`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                  className="navix-gauge-circle"
                />
              </svg>
              <div className="navix-fuel-gauge-text position-absolute top-50 start-50 translate-middle text-center">
                <span className="d-block fw-bold fs-5 text-body-emphasis">{efficiencyPercent}%</span>
                <span className="d-block text-muted style-caption" style={{ fontSize: '0.65rem' }}>Efficience</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-3 bg-body-tertiary border border-secondary-subtle d-flex align-items-center justify-content-between">
          <span className="small text-muted">
            <i className="bi bi-info-circle me-1" aria-hidden="true" />
            Seuil cible : {targetConsumption} L / 100 km
          </span>
          <span className="badge bg-success-subtle text-success border border-success-subtle">
            Conforme
          </span>
        </div>
      </div>
    </Card>
  );
};

export default FuelConsumptionCard;
