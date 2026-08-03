/**
 * Navix Fuel — FuelCard
 * --------------------------------------------------------------------------
 * Carte d'un plein (affichage tablette/mobile) : numéro, statut, station,
 * véhicule, chauffeur, entreprise, type, quantité, montant, consommation et
 * actions.
 *
 * Props :
 *   fuel         : plein à afficher
 *   companyName  : nom de l'entreprise
 *   driverName   : nom complet du chauffeur
 *   vehicleLabel : libellé du véhicule (immatriculation ou marque/modèle)
 *   onView       : (id: string) => void
 *   onEdit       : (id: string) => void
 *   onDelete     : (fuel: object) => void
 */
import { Badge, Button } from '@/components/ui';
import FuelStatusBadge from './FuelStatusBadge';
import FuelStationBadge from './FuelStationBadge';
import {
  getFuelType,
  formatFuelDate,
  formatFuelMoney,
  formatFuelQuantity,
  formatFuelConsumption,
} from '../constants';
import './FuelCard.css';

const FuelCard = ({
  fuel,
  companyName = '—',
  driverName = '—',
  vehicleLabel = '—',
  onView,
  onEdit,
  onDelete,
}) => {
  const type = getFuelType(fuel.fuelType);

  return (
    <article className="card h-100 navix-fuel-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="min-w-0">
            <h2 className="navix-fuel-card__name">
              <button type="button" className="navix-fuel-card__link" onClick={() => onView(fuel.id)}>
                {fuel.fuelNumber}
              </button>
            </h2>
            <p className="navix-fuel-card__vehicle mb-0">
              {vehicleLabel} · {driverName}
            </p>
          </div>
          <FuelStatusBadge status={fuel.status} />
        </div>

        <div className="navix-fuel-card__station">
          <FuelStationBadge stationName={fuel.stationName} stationCity={fuel.stationCity} />
        </div>

        <div className="navix-fuel-card__tags">
          <Badge variant={type.variant} soft>
            <i className={`bi ${type.icon} me-1`} aria-hidden="true" />
            {type.label}
          </Badge>
        </div>

        <dl className="navix-fuel-card__meta">
          <div>
            <dt>
              <i className="bi bi-calendar3" aria-hidden="true" /> Date
            </dt>
            <dd>{formatFuelDate(fuel.createdAt)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-droplet" aria-hidden="true" /> Quantité
            </dt>
            <dd>{formatFuelQuantity(fuel.quantity)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-cash-coin" aria-hidden="true" /> Montant
            </dt>
            <dd>{formatFuelMoney(fuel.totalCost, fuel.currency)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-speedometer2" aria-hidden="true" /> Conso
            </dt>
            <dd>{formatFuelConsumption(fuel.consumptionAverage)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-buildings" aria-hidden="true" /> Entreprise
            </dt>
            <dd>{companyName}</dd>
          </div>
        </dl>
      </div>

      <div className="card-footer d-flex justify-content-end gap-1">
        <Button variant="ghost" size="sm" icon="bi-eye" onClick={() => onView(fuel.id)} title="Voir le détail" aria-label={`Voir le détail de ${fuel.fuelNumber}`} />
        <Button variant="ghost" size="sm" icon="bi-pencil" onClick={() => onEdit(fuel.id)} title="Modifier" aria-label={`Modifier ${fuel.fuelNumber}`} />
        <Button variant="ghost" size="sm" icon="bi-trash3" onClick={() => onDelete(fuel)} title="Supprimer" aria-label={`Supprimer ${fuel.fuelNumber}`} />
      </div>
    </article>
  );
};

export default FuelCard;
