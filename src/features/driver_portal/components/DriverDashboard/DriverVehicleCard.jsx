/**
 * Navix Driver Dashboard — DriverVehicleCard
 * --------------------------------------------------------------------------
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';

const DriverVehicleCard = ({ vehicle }) => {
  if (!vehicle) return null;

  return (
    <Card className="h-100 navix-driver-vehicle-card">
      <div className="navix-driver-vehicle-bg" />
      
      <div className="d-flex align-items-start gap-3 mb-4 position-relative">
        <div className="navix-driver-vehicle-icon">
          <i className="bi bi-truck" aria-hidden="true" />
        </div>
        <div>
          <h5 className="fw-bold mb-1">{vehicle.brand} {vehicle.model}</h5>
          <StatusBadge variant="success" label="Actif" icon="bi-check-circle-fill" />
        </div>
      </div>

      <div className="row g-3 mb-4 position-relative">
        <div className="col-6">
          <div className="text-muted small text-uppercase fw-semibold mb-1">Immatriculation</div>
          <div className="fw-bold font-monospace">{vehicle.registrationNumber}</div>
        </div>
        <div className="col-6">
          <div className="text-muted small text-uppercase fw-semibold mb-1">Kilométrage</div>
          <div className="fw-bold">{vehicle.mileage.toLocaleString('fr-FR')} km</div>
        </div>
        <div className="col-6">
          <div className="text-muted small text-uppercase fw-semibold mb-1">Dernier entretien</div>
          <div className="fw-medium text-body">{vehicle.lastMaintenance}</div>
        </div>
        <div className="col-6">
          <div className="text-muted small text-uppercase fw-semibold mb-1">Prochain entretien</div>
          <div className="fw-medium text-warning d-flex align-items-center gap-1">
            <i className="bi bi-exclamation-triangle" />
            {vehicle.nextMaintenance}
          </div>
        </div>
      </div>

      <div className="mt-auto position-relative">
        <Link to={ROUTES.DRIVER_VEHICLE} className="btn btn-outline-primary w-100">
          Voir mon véhicule
          <i className="bi bi-arrow-right ms-2" />
        </Link>
      </div>
    </Card>
  );
};

export default DriverVehicleCard;
