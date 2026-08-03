/**
 * Navix Trips — TripVehicleCard
 * --------------------------------------------------------------------------
 * Carte du véhicule utilisé par un trajet (page de détail) : marque,
 * modèle, immatriculation, groupe, catégorie, carburant, transmission et
 * kilométrage de départ du trajet.
 *
 * Props :
 *   vehicle         : véhicule à afficher
 *   departureMileage: kilométrage de départ du trajet (optionnel)
 *   onView          : (id: string) => void — navigation vers le véhicule
 */
import { Badge, Button } from '@/components/ui';
import { getVehicleGroup, getFuelType, getTransmission } from '@/features/vehicles';
import { formatTripMileage } from '../constants';
import './TripVehicleCard.css';

const TripVehicleCard = ({ vehicle, departureMileage, onView }) => {
  const group = vehicle ? getVehicleGroup(vehicle.group) : null;
  const fuel = vehicle ? getFuelType(vehicle.fuelType) : null;
  const transmission = vehicle ? getTransmission(vehicle.transmission) : null;

  return (
    <article className="card h-100 navix-trip-vehicle-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="min-w-0">
            <h3 className="navix-trip-vehicle-card__title">
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Véhicule'}
            </h3>
            <p className="navix-trip-vehicle-card__plate mb-0">{vehicle?.registrationNumber ?? '—'}</p>
          </div>
          <span className="navix-trip-vehicle-card__icon" aria-hidden="true">
            <i className={`bi ${group?.icon ?? 'bi-truck'}`} />
          </span>
        </div>

        {vehicle && (
          <div className="navix-trip-vehicle-card__badges">
            <Badge variant={group?.variant ?? 'secondary'} soft>
              Groupe {vehicle.group}
            </Badge>
            <Badge variant="light">{vehicle.category}</Badge>
          </div>
        )}

        <dl className="navix-trip-vehicle-card__meta">
          <div>
            <dt>Carburant</dt>
            <dd>{fuel?.label ?? '—'}</dd>
          </div>
          <div>
            <dt>Transmission</dt>
            <dd>{transmission?.label ?? '—'}</dd>
          </div>
          <div>
            <dt>Année</dt>
            <dd>{vehicle?.year ?? '—'}</dd>
          </div>
          <div>
            <dt>Km départ</dt>
            <dd>{formatTripMileage(departureMileage)}</dd>
          </div>
        </dl>
      </div>

      {onView && vehicle && (
        <div className="card-footer">
          <Button variant="ghost" size="sm" icon="bi-box-arrow-up-right" onClick={() => onView(vehicle.id)}>
            Voir le véhicule
          </Button>
        </div>
      )}
    </article>
  );
};

export default TripVehicleCard;
