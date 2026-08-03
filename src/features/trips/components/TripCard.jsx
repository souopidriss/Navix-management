/**
 * Navix Trips — TripCard
 * --------------------------------------------------------------------------
 * Carte d'un trajet (affichage tablette/mobile) : numéro, statut, itinéraire,
 * chauffeur, véhicule, entreprise, type, départ et actions.
 *
 * Props :
 *   trip        : trajet à afficher
 *   companyName : nom de l'entreprise
 *   driverName  : nom complet du chauffeur
 *   vehicleLabel: libellé du véhicule (immatriculation ou marque/modèle)
 *   onView      : (id: string) => void
 *   onEdit      : (id: string) => void
 *   onFinish    : (trip: object) => void
 *   onDelete    : (trip: object) => void
 */
import { Badge, Button } from '@/components/ui';
import TripStatusBadge from './TripStatusBadge';
import { getTripType, formatTripDate } from '../constants';
import './TripCard.css';

const TripCard = ({
  trip,
  companyName = '—',
  driverName = '—',
  vehicleLabel = '—',
  onView,
  onEdit,
  onFinish,
  onDelete,
}) => {
  const type = getTripType(trip.tripType);

  return (
    <article className="card h-100 navix-trip-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="min-w-0">
            <h2 className="navix-trip-card__name">
              <button type="button" className="navix-trip-card__link" onClick={() => onView(trip.id)}>
                {trip.tripNumber}
              </button>
            </h2>
            <p className="navix-trip-card__driver mb-0">{driverName}</p>
          </div>
          <TripStatusBadge status={trip.status} />
        </div>

        <div className="navix-trip-card__route">
          <span className="navix-trip-card__route-line">
            <i className="bi bi-geo-alt" aria-hidden="true" />
            {trip.departureLocation}
          </span>
          <i className="bi bi-arrow-right navix-trip-card__route-arrow" aria-hidden="true" />
          <span className="navix-trip-card__route-line">
            <i className="bi bi-geo-alt-fill" aria-hidden="true" />
            {trip.arrivalLocation}
          </span>
        </div>

        <div className="navix-trip-card__tags">
          <Badge variant={type.variant} soft>
            {type.label}
          </Badge>
        </div>

        <dl className="navix-trip-card__meta">
          <div>
            <dt>
              <i className="bi bi-truck" aria-hidden="true" /> Véhicule
            </dt>
            <dd>{vehicleLabel}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-buildings" aria-hidden="true" /> Entreprise
            </dt>
            <dd>{companyName}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-calendar-plus" aria-hidden="true" /> Départ
            </dt>
            <dd>{formatTripDate(trip.departureDate)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-calendar-check" aria-hidden="true" /> Arrivée
            </dt>
            <dd>{formatTripDate(trip.arrivalDate)}</dd>
          </div>
        </dl>
      </div>

      <div className="card-footer d-flex justify-content-end gap-1">
        <Button variant="ghost" size="sm" icon="bi-eye" onClick={() => onView(trip.id)} title="Voir le détail" aria-label={`Voir le détail de ${trip.tripNumber}`} />
        <Button variant="ghost" size="sm" icon="bi-pencil" onClick={() => onEdit(trip.id)} title="Modifier" aria-label={`Modifier ${trip.tripNumber}`} />
        {onFinish && trip.status !== 'completed' && trip.status !== 'cancelled' && (
          <Button variant="ghost" size="sm" icon="bi-flag" onClick={() => onFinish(trip)} title="Clôturer le trajet" aria-label={`Clôturer ${trip.tripNumber}`} />
        )}
        <Button variant="ghost" size="sm" icon="bi-trash3" onClick={() => onDelete(trip)} title="Supprimer" aria-label={`Supprimer ${trip.tripNumber}`} />
      </div>
    </article>
  );
};

export default TripCard;
