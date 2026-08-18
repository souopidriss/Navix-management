/**
 * Navix Partner Portal — PartnerVehiclePerformanceCard
 * --------------------------------------------------------------------------
 * Performance des véhicules de la flotte partenaire sur le mois courant :
 * missions, kilométrage, revenu généré (FCFA) et taux d'utilisation.
 * Lien « Gérer la flotte » → /partner/vehicles.
 */
import { Card } from '@/components/ui';
import { Link } from 'react-router-dom';
import { formatNumber } from '@/utils/format';
import { ROUTES } from '@/routes/route.constants';

const utilizationVariant = (rate) => {
  if (rate >= 65) return 'bg-success';
  if (rate >= 45) return 'bg-warning';
  return 'bg-danger';
};

const PartnerVehiclePerformanceCard = ({ vehicles = [], loading = false }) => (
  <Card
    className="h-100"
    flush
    title={
      <div className="d-flex align-items-center justify-content-between w-100">
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-graph-up text-info" aria-hidden="true" />
          <span>Performance des véhicules</span>
          {vehicles.length > 0 && (
            <span className="badge bg-info-subtle text-info ms-1">{vehicles.length}</span>
          )}
        </span>
        <Link to={ROUTES.PARTNER_VEHICLES} className="btn btn-sm btn-outline-info">
          Gérer la flotte
          <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
        </Link>
      </div>
    }
  >
    {loading ? (
      <div className="p-3 placeholder-glow">
        <div className="placeholder col-12 rounded" style={{ height: 140 }} />
      </div>
    ) : vehicles.length === 0 ? (
      <p className="text-secondary mb-0 py-4 text-center">Aucune donnée de performance pour le moment.</p>
    ) : (
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" aria-label="Performance des véhicules">
          <thead>
            <tr>
              <th>Véhicule</th>
              <th>Chauffeur</th>
              <th className="text-end">Missions</th>
              <th className="text-end">Km</th>
              <th className="text-end">Revenu</th>
              <th className="text-end">Utilisation</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>
                  <span className="fw-semibold text-nowrap">{vehicle.registration}</span>
                  <span className="text-muted small d-block">
                    {vehicle.brand} {vehicle.model}
                  </span>
                </td>
                <td className="text-nowrap">{vehicle.driver || <span className="text-secondary">—</span>}</td>
                <td className="text-end tabular-nums">{vehicle.missionsMonth}</td>
                <td className="text-end tabular-nums">{formatNumber(vehicle.kmMonth)} km</td>
                <td className="text-end tabular-nums text-body-emphasis">
                  {formatNumber(vehicle.revenueMonth)} FCFA
                </td>
                <td className="text-end" style={{ minWidth: 110 }}>
                  <span className="d-inline-flex align-items-center gap-2">
                    <span className="progress flex-grow-1" style={{ height: 6, width: 60 }}>
                      <span
                        className={`progress-bar ${utilizationVariant(Number(vehicle.utilizationRate))}`}
                        style={{ width: `${Math.min(100, Math.max(0, Number(vehicle.utilizationRate) || 0))}%` }}
                      />
                    </span>
                    <span className="small text-muted tabular-nums">{vehicle.utilizationRate} %</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

export default PartnerVehiclePerformanceCard;
