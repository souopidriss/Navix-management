/**
 * Navix Dashboard — FinancialOverview
 * --------------------------------------------------------------------------
 * Synthèse financière du mois : total par poste (carburant, entretiens,
 * autres), coût moyen par véhicule et coût au kilomètre.
 */
import { Card } from '@/components/ui';
import { formatDashboardMoney } from '../constants';

const formatPerKm = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} FCFA/km` : '—';
import './FinancialOverview.css';

const FinancialOverview = ({ financial = {} }) => {
  const { monthTotal = 0, byType = [], averageCostPerVehicle = 0, costPerKm = 0 } = financial;

  return (
    <Card title={<span><i className="bi bi-cash-stack me-2" aria-hidden="true" />Finances du mois</span>}>
      {byType.length === 0 ? (
        <p className="text-secondary mb-0">Aucune donnée.</p>
      ) : (
        <>
          <div className="navix-dash-finance">
            {byType.map(({ key, label, icon, variant, amount }) => (
              <div key={key} className="navix-dash-finance__row">
                <span className={`navix-dash-finance__icon navix-dash-finance__icon--${variant}`}>
                  <i className={`bi ${icon}`} aria-hidden="true" />
                </span>
                <span className="navix-dash-finance__label">{label}</span>
                <span className="navix-dash-finance__amount">{formatDashboardMoney(amount)}</span>
              </div>
            ))}
          </div>

          <div className="navix-dash-finance__total">
            <span>Coût total</span>
            <strong>{formatDashboardMoney(monthTotal)}</strong>
          </div>

          <div className="navix-dash-finance__metrics">
            <span className="navix-dash-finance__metric">
              <i className="bi bi-truck" aria-hidden="true" />
              {formatDashboardMoney(averageCostPerVehicle)} <small>par véhicule</small>
            </span>
            <span className="navix-dash-finance__metric">
              <i className="bi bi-signpost" aria-hidden="true" />
              {formatPerKm(costPerKm)} <small>par km</small>
            </span>
          </div>
        </>
      )}
    </Card>
  );
};

export default FinancialOverview;
