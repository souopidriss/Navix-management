/**
 * Navix Trips — TripTimeline
 * --------------------------------------------------------------------------
 * Frise chronologique d'un trajet (page de détail) : création, départ,
 * arrivée et clôture.
 *
 * Props :
 *   trip : trajet à afficher
 */
import { formatTripLongDate } from '../constants';
import './TripTimeline.css';

const getStep = (item) => {
  const steps = {
    created: { icon: 'bi-plus-circle', label: 'Trajet créé', variant: 'navix-trip-timeline__item--info' },
    started: { icon: 'bi-signpost-split', label: 'Départ du trajet', variant: 'navix-trip-timeline__item--primary' },
    arrived: { icon: 'bi-flag-fill', label: 'Arrivée à destination', variant: 'navix-trip-timeline__item--success' },
    completed: { icon: 'bi-check2-circle', label: 'Trajet clôturé', variant: 'navix-trip-timeline__item--dark' },
  };

  return steps[item.type] ?? { icon: 'bi-circle', label: item.type, variant: 'navix-trip-timeline__item--secondary' };
};

const TripTimeline = ({ trip }) => {
  const items = [];

  if (trip.createdAt) {
    items.push({ type: 'created', date: trip.createdAt });
  }
  if (trip.departureDate) {
    items.push({ type: 'started', date: trip.departureDate });
  }
  if (trip.arrivalDate) {
    items.push({ type: 'arrived', date: trip.arrivalDate });
  }
  if (trip.status === 'completed' && (trip.updatedAt || trip.arrivalDate)) {
    items.push({ type: 'completed', date: trip.updatedAt ?? trip.arrivalDate });
  }

  return (
    <ol className="navix-trip-timeline">
      {items.map((item) => {
        const step = getStep(item);
        return (
          <li key={item.type} className={`navix-trip-timeline__item ${step.variant}`}>
            <span className="navix-trip-timeline__marker" aria-hidden="true">
              <i className={`bi ${step.icon}`} />
            </span>
            <div className="navix-trip-timeline__body">
              <p className="navix-trip-timeline__label mb-0">{step.label}</p>
              <time className="navix-trip-timeline__date">{formatTripLongDate(item.date)}</time>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default TripTimeline;
