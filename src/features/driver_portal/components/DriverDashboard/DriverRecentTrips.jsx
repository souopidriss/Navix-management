/**
 * Navix Driver Dashboard — DriverRecentTrips
 * --------------------------------------------------------------------------
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';
import { StatusBadge } from '@/components/core';

const DriverRecentTrips = ({ trips = [] }) => {
  return (
    <Card
      flush
      title={
        <div className="d-flex align-items-center justify-content-between w-100">
          <span className="d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-primary" />
            <span>Mes trajets récents</span>
          </span>
          <Link to={ROUTES.DRIVER_TRIPS} className="btn btn-sm btn-outline-primary">
            Tout voir
            <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>
      }
    >
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 navix-driver-trips-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Itinéraire</th>
              <th>Distance</th>
              <th>Durée</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  Aucun trajet récent
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id}>
                  <td className="fw-medium">{trip.date}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-semibold">{trip.departure}</span>
                      <i className="bi bi-arrow-right text-muted small" />
                      <span className="fw-semibold">{trip.destination}</span>
                    </div>
                  </td>
                  <td>{trip.distance}</td>
                  <td className="text-muted">{trip.duration}</td>
                  <td>
                    <StatusBadge variant="success" label="Terminé" icon="bi-check-circle" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DriverRecentTrips;
