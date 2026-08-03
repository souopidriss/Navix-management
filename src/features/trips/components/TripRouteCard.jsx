/**
 * Navix Trips — TripRouteCard
 * --------------------------------------------------------------------------
 * Carte de l'itinéraire d'un trajet (page de détail) : villes de départ et
 * d'arrivée, dates/heures associées, distance (prévue / réelle) et durée
 * (prévue / réelle).
 *
 * Props :
 *   trip : trajet à afficher
 */
import { Card } from '@/components/ui';
import { formatTripDateTime, formatTripDistance, formatTripDuration } from '../constants';
import './TripRouteCard.css';

const Metric = ({ label, planned, actual }) => (
  <div className="navix-trip-route-card__metric">
    <span className="navix-trip-route-card__metric-label">{label}</span>
    <span className="navix-trip-route-card__metric-value">
      {actual ? actual : planned}
    </span>
  </div>
);

const TripRouteCard = ({ trip }) => (
  <Card className="navix-trip-route-card">
    <div className="navix-trip-route-card__path">
      <div className="navix-trip-route-card__point">
        <span className="navix-trip-route-card__point-icon navix-trip-route-card__point-icon--departure" aria-hidden="true">
          <i className="bi bi-geo-alt" />
        </span>
        <div className="min-w-0">
          <p className="navix-trip-route-card__city mb-0">{trip.departureLocation}</p>
          <time className="navix-trip-route-card__time">
            {formatTripDateTime(trip.departureDate, trip.departureTime)}
          </time>
        </div>
      </div>

      <div className="navix-trip-route-card__connector" aria-hidden="true">
        <span />
        <i className="bi bi-arrow-right" />
        <span />
      </div>

      <div className="navix-trip-route-card__point">
        <span className="navix-trip-route-card__point-icon navix-trip-route-card__point-icon--arrival" aria-hidden="true">
          <i className="bi bi-geo-alt-fill" />
        </span>
        <div className="min-w-0">
          <p className="navix-trip-route-card__city mb-0">{trip.arrivalLocation}</p>
          <time className="navix-trip-route-card__time">
            {formatTripDateTime(trip.arrivalDate, trip.arrivalTime)}
          </time>
        </div>
      </div>
    </div>

    <div className="navix-trip-route-card__metrics">
      <Metric
        label="Distance"
        planned={formatTripDistance(trip.plannedDistance)}
        actual={formatTripDistance(trip.actualDistance)}
      />
      <Metric
        label="Durée"
        planned={formatTripDuration(trip.estimatedDuration)}
        actual={formatTripDuration(trip.actualDuration)}
      />
    </div>
  </Card>
);

export default TripRouteCard;
