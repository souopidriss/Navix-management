/**
 * Navix Fuel — FuelTable
 * --------------------------------------------------------------------------
 * Tableau des pleins (affichage desktop) : date, véhicule, chauffeur,
 * station, type, quantité, prix unitaire, montant, consommation moyenne
 * (avec alerte sur consommation anormale), statut et actions (voir,
 * modifier, supprimer).
 *
 * Props :
 *   fuelRecords : liste des pleins à afficher (filtrée/triée/paginée)
 *   driverById  : carte { id → { fullName } } des chauffeurs
 *   vehicleById : carte { id → { registrationNumber, brand, model, category } }
 *   onView      : (id: string) => void
 *   onEdit      : (id: string) => void
 *   onDelete    : (fuel: object) => void
 */
import { Badge, Button } from '@/components/ui';
import FuelStatusBadge from './FuelStatusBadge';
import FuelStationBadge from './FuelStationBadge';
import {
  getFuelType,
  isAbnormalFuelConsumption,
  formatFuelDate,
  formatFuelMoney,
  formatFuelQuantity,
  formatFuelUnitPrice,
  formatFuelConsumption,
} from '../constants';
import './FuelTable.css';

const FuelTable = ({
  fuelRecords = [],
  driverById = {},
  vehicleById = {},
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="table-responsive">
    <table className="table table-hover align-middle mb-0 navix-fuel-table">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Véhicule</th>
          <th scope="col">Chauffeur</th>
          <th scope="col">Station</th>
          <th scope="col">Type</th>
          <th scope="col" className="text-end">Quantité</th>
          <th scope="col" className="text-end">Prix/L</th>
          <th scope="col" className="text-end">Montant</th>
          <th scope="col" className="text-end">Conso moyenne</th>
          <th scope="col">Statut</th>
          <th scope="col" className="text-end">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {fuelRecords.map((fuel) => {
          const type = getFuelType(fuel.fuelType);
          const vehicle = vehicleById[fuel.vehicleId] ?? {};
          const vehicleLabel =
            vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();
          const abnormal = isAbnormalFuelConsumption(fuel.consumptionAverage, vehicle.category);

          return (
            <tr key={fuel.id}>
              <td className="navix-fuel-table__date">
                <button
                  type="button"
                  className="navix-fuel-table__link"
                  onClick={() => onView(fuel.id)}
                  title={`Voir ${fuel.fuelNumber}`}
                >
                  {fuel.fuelNumber}
                </button>
                <span className="navix-fuel-table__date-sub">{formatFuelDate(fuel.createdAt)}</span>
              </td>
              <td className="navix-fuel-table__vehicle">
                {vehicleLabel || '—'}
                {vehicle.brand && vehicle.model && (
                  <span className="navix-fuel-table__vehicle-sub">
                    {vehicle.brand} {vehicle.model}
                  </span>
                )}
              </td>
              <td className="navix-fuel-table__driver">
                {driverById[fuel.driverId]?.fullName ?? '—'}
              </td>
              <td className="navix-fuel-table__station">
                <FuelStationBadge stationName={fuel.stationName} stationCity={fuel.stationCity} />
              </td>
              <td>
                <Badge variant={type.variant} soft>
                  <i className={`bi ${type.icon} me-1`} aria-hidden="true" />
                  {type.label}
                </Badge>
              </td>
              <td className="text-end navix-fuel-table__num">{formatFuelQuantity(fuel.quantity)}</td>
              <td className="text-end navix-fuel-table__num">
                {formatFuelUnitPrice(fuel.unitPrice, fuel.currency)}
              </td>
              <td className="text-end navix-fuel-table__amount">
                {formatFuelMoney(fuel.totalCost, fuel.currency)}
              </td>
              <td className="text-end navix-fuel-table__num">
                {formatFuelConsumption(fuel.consumptionAverage)}
                {abnormal && (
                  <i
                    className="bi bi-exclamation-triangle-fill navix-fuel-table__anomaly"
                    title="Consommation anormale"
                    aria-label="Consommation anormale"
                  />
                )}
              </td>
              <td>
                <FuelStatusBadge status={fuel.status} />
              </td>
              <td>
                <div className="d-flex justify-content-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-eye"
                    onClick={() => onView(fuel.id)}
                    title="Voir le détail"
                    aria-label={`Voir le détail de ${fuel.fuelNumber}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-pencil"
                    onClick={() => onEdit(fuel.id)}
                    title="Modifier"
                    aria-label={`Modifier ${fuel.fuelNumber}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-trash3"
                    onClick={() => onDelete(fuel)}
                    title="Supprimer"
                    aria-label={`Supprimer ${fuel.fuelNumber}`}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default FuelTable;
