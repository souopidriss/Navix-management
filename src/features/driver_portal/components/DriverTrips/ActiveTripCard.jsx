/**
 * Navix Driver Portal — ActiveTripCard
 * --------------------------------------------------------------------------
 * Carte « Trajet en cours » : itinéraire, progression, chronologie du
 * workflow et actions opérationnelles (pause / reprise, incident, terminer).
 */
import { Button, Card } from '@/components/ui';
import { StatusBadge } from '@/components/core';
import { formatDate, formatNumber } from '@/utils/format';
import { getDriverTripStatus } from '../../constants/driver.constants';
import TripWorkflowTimeline from './TripWorkflowTimeline';
import './DriverTrips.css';

const ActiveTripCard = ({
  trip,
  canPause = false,
  canResume = false,
  canComplete = false,
  canReport = false,
  busy = false,
  onPause,
  onResume,
  onIncident,
  onComplete,
}) => {
  const status = getDriverTripStatus(trip.status);
  const progress = trip.plannedDistance
    ? Math.min(100, Math.round(((trip.actualDistance || 0) / trip.plannedDistance) * 100))
    : 0;

  return (
    <Card
      className="h-100"
      title={
        <div className="d-flex align-items-center justify-content-between w-100 gap-2">
          <span className="d-flex align-items-center gap-2">
            <i className="bi bi-play-circle-fill text-primary" aria-hidden="true" />
            <span>Trajet en cours</span>
          </span>
          <StatusBadge variant={status.variant} label={status.label} icon={status.icon} />
        </div>
      }
    >
      <div className="navix-workflow-route mb-1">
        <div className="text-center">
          <div className="navix-workflow-route__city">{trip.departure}</div>
          <small className="text-muted">{trip.departureTime || '—'}</small>
        </div>
        <div className="navix-workflow-route__line">
          <span className="navix-workflow-route__distance">
            {formatNumber(trip.plannedDistance)} km
          </span>
        </div>
        <div className="text-center">
          <div className="navix-workflow-route__city">{trip.arrival}</div>
          <small className="text-muted">{trip.departureDate ? formatDate(trip.departureDate) : ''}</small>
        </div>
      </div>

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1 small">
          <span className="fw-semibold text-muted">Progression</span>
          <span className="fw-semibold">
            {formatNumber(trip.actualDistance || 0)} / {formatNumber(trip.plannedDistance)} km
          </span>
        </div>
        <div className="progress navix-workflow-progress" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <TripWorkflowTimeline trip={trip} />

      <div className="d-flex flex-wrap gap-2 mt-3">
        {canResume && (
          <Button variant="primary" icon="bi-play-fill" onClick={() => onResume && onResume(trip)} disabled={busy} loading={busy}>
            Reprendre
          </Button>
        )}
        {canPause && (
          <Button
            variant="warning"
            outline
            icon="bi-pause-fill"
            onClick={() => onPause && onPause(trip)}
            disabled={busy}
            loading={busy}
          >
            Pause
          </Button>
        )}
        {canReport && (
          <Button
            variant="danger"
            outline
            icon="bi-shield-exclamation"
            onClick={() => onIncident && onIncident(trip)}
            disabled={busy}
          >
            Signaler un incident
          </Button>
        )}
        {canComplete && (
          <Button
            variant="success"
            icon="bi-check2-circle"
            onClick={() => onComplete && onComplete(trip)}
            disabled={busy}
          >
            Terminer le trajet
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ActiveTripCard;
