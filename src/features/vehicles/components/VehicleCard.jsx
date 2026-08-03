/**
 * Navix Vehicles — VehicleCard
 * --------------------------------------------------------------------------
 * Carte d'un véhicule (affichage tablette/mobile) : photo, immatriculation,
 * marque/modèle, groupe, statut, entreprise, kilométrage et expiration de
 * l'assurance.
 *
 * Props :
 *   vehicle     : véhicule à afficher
 *   companyName : nom de l'entreprise propriétaire
 *   onView      : (id: string) => void
 *   onEdit      : (id: string) => void
 *   onDelete    : (vehicle: object) => void
 */
import { Badge, Button } from '@/components/ui';
import VehicleImage from './VehicleImage';
import VehicleStatusBadge from './VehicleStatusBadge';
import VehicleGroupBadge from './VehicleGroupBadge';
import { formatMileage, formatVehicleDate, getExpiryStatus } from '../constants';
import './VehicleCard.css';

const VehicleCard = ({ vehicle, companyName = '—', onView, onEdit, onDelete }) => {
  const expiry = getExpiryStatus(vehicle.insuranceExpiry);

  return (
    <article className="card h-100 navix-vehicle-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <VehicleImage src={vehicle.photo} name={`${vehicle.brand} ${vehicle.model}`} size="lg" />
            <div className="min-w-0">
              <h2 className="navix-vehicle-card__reg">
                <button type="button" className="navix-vehicle-card__link" onClick={() => onView(vehicle.id)}>
                  {vehicle.registrationNumber}
                </button>
              </h2>
              <p className="navix-vehicle-card__model mb-0">
                {vehicle.brand} {vehicle.model}
              </p>
            </div>
          </div>
          <VehicleStatusBadge status={vehicle.status} />
        </div>

        <div className="navix-vehicle-card__tags">
          <VehicleGroupBadge group={vehicle.group} />
          {vehicle.year && <Badge variant="secondary" soft>{vehicle.year}</Badge>}
        </div>

        <dl className="navix-vehicle-card__meta">
          <div>
            <dt>
              <i className="bi bi-buildings" aria-hidden="true" /> Entreprise
            </dt>
            <dd>{companyName}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-speedometer2" aria-hidden="true" /> Kilométrage
            </dt>
            <dd>{formatMileage(vehicle.mileage)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-shield-check" aria-hidden="true" /> Assurance
            </dt>
            <dd>{formatVehicleDate(vehicle.insuranceExpiry)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-fuel-pump" aria-hidden="true" /> Carburant
            </dt>
            <dd>{vehicle.fuelType}</dd>
          </div>
        </dl>

        {expiry.variant !== 'success' && expiry.variant !== 'secondary' && (
          <p className={`navix-vehicle-card__expiry navix-vehicle-card__expiry--${expiry.variant}`}>
            <i className="bi bi-exclamation-triangle" aria-hidden="true" /> {expiry.label}
          </p>
        )}
      </div>

      <div className="card-footer d-flex justify-content-end gap-1">
        <Button variant="ghost" size="sm" icon="bi-eye" onClick={() => onView(vehicle.id)} title="Voir le détail" aria-label={`Voir le détail de ${vehicle.registrationNumber}`} />
        <Button variant="ghost" size="sm" icon="bi-pencil" onClick={() => onEdit(vehicle.id)} title="Modifier" aria-label={`Modifier ${vehicle.registrationNumber}`} />
        <Button variant="ghost" size="sm" icon="bi-trash3" onClick={() => onDelete(vehicle)} title="Supprimer" aria-label={`Supprimer ${vehicle.registrationNumber}`} />
      </div>
    </article>
  );
};

export default VehicleCard;
