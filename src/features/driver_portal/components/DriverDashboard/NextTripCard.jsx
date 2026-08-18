/**
 * Navix Driver Dashboard — NextTripCard
 * --------------------------------------------------------------------------
 */
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { ROUTES } from '@/routes/route.constants';

const NextTripCard = ({ trip, onStartTrip }) => {
  if (!trip) {
    return (
      <Card title="Prochain trajet" className="h-100">
        <div className="text-center text-muted py-4">
          <i className="bi bi-calendar2-x fs-1 mb-2 d-block text-secondary opacity-50" />
          <p className="mb-0">Aucun trajet planifié pour le moment.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-signpost-2 text-primary" />
          <span>Prochain trajet</span>
        </div>
      }
      className="h-100"
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="text-center">
          <div className="fw-bold fs-5">{trip.departure}</div>
        </div>
        <div className="flex-grow-1 px-3 position-relative d-flex align-items-center justify-content-center">
          <div className="w-100" style={{ height: 2, background: 'var(--navix-border-color)' }} />
          <div className="position-absolute px-2 text-muted small fw-medium" style={{ background: 'var(--navix-card)' }}>
            {trip.distance}
          </div>
          <i className="bi bi-caret-right-fill text-primary position-absolute end-0 me-2" style={{ transform: 'translateX(50%)' }} />
        </div>
        <div className="text-center">
          <div className="fw-bold fs-5">{trip.destination}</div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6">
          <div className="d-flex align-items-center gap-2 text-muted mb-1">
            <i className="bi bi-calendar-event" />
            <span className="small text-uppercase fw-semibold">Date</span>
          </div>
          <div className="fw-bold">{trip.date}</div>
        </div>
        <div className="col-6">
          <div className="d-flex align-items-center gap-2 text-muted mb-1">
            <i className="bi bi-clock" />
            <span className="small text-uppercase fw-semibold">Heure</span>
          </div>
          <div className="fw-bold">{trip.time}</div>
        </div>
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between px-3 py-2 bg-warning-subtle text-warning-emphasis rounded">
            <span className="fw-medium"><i className="bi bi-hourglass-split me-2" /> Statut</span>
            <span className="badge bg-warning text-dark">Planifié</span>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-auto">
        <Link to={`${ROUTES.DRIVER_TRIPS}/${trip.id}`} className="btn btn-outline-secondary w-50">
          Détails
        </Link>
        <button
          type="button"
          className="btn btn-primary w-50"
          onClick={() => onStartTrip && onStartTrip(trip.id)}
        >
          <i className="bi bi-play-circle me-2" />
          Démarrer
        </button>
      </div>
    </Card>
  );
};

export default NextTripCard;
