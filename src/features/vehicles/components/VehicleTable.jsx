/**
 * Navix Vehicles — VehicleTable
 * --------------------------------------------------------------------------
 * Tableau des véhicules (affichage desktop) : photo, immatriculation,
 * marque, modèle, groupe, entreprise, kilométrage, statut, expiration de
 * l'assurance et actions.
 *
 * Props :
 *   vehicles    : liste des véhicules à afficher (filtrée/triée/paginée)
 *   companyById : carte { id → { name } } des entreprises
 *   onView      : (id: string) => void
 *   onEdit      : (id: string) => void
 *   onDelete    : (vehicle: object) => void
 */
import { Button } from '@/components/ui';
import VehicleImage from './VehicleImage';
import VehicleStatusBadge from './VehicleStatusBadge';
import VehicleGroupBadge from './VehicleGroupBadge';
import { formatMileage, formatVehicleDate, getExpiryStatus } from '../constants';
import './VehicleTable.css';

const VehicleTable = ({ vehicles = [], companyById = {}, onView, onEdit, onDelete }) => (
  <div className="table-responsive">
    <table className="table table-hover align-middle mb-0 navix-vehicle-table">
      <thead>
        <tr>
          <th scope="col" className="navix-vehicle-table__photo">
            <span className="visually-hidden">Photo</span>
          </th>
          <th scope="col">Immatriculation</th>
          <th scope="col">Marque</th>
          <th scope="col">Modèle</th>
          <th scope="col">Groupe</th>
          <th scope="col">Entreprise</th>
          <th scope="col" className="text-end">Kilométrage</th>
          <th scope="col">Statut</th>
          <th scope="col">Expiration assurance</th>
          <th scope="col" className="text-end">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map((vehicle) => {
          const expiry = getExpiryStatus(vehicle.insuranceExpiry);
          const companyName = companyById[vehicle.companyId]?.name ?? '—';

          return (
            <tr key={vehicle.id}>
              <td className="navix-vehicle-table__photo">
                <VehicleImage src={vehicle.photo} name={`${vehicle.brand} ${vehicle.model}`} size="sm" />
              </td>
              <td>
                <button
                  type="button"
                  className="navix-vehicle-table__reg"
                  onClick={() => onView(vehicle.id)}
                  title={`Voir ${vehicle.registrationNumber}`}
                >
                  {vehicle.registrationNumber}
                </button>
              </td>
              <td>{vehicle.brand}</td>
              <td>{vehicle.model}</td>
              <td>
                <VehicleGroupBadge group={vehicle.group} />
              </td>
              <td className="navix-vehicle-table__company">{companyName}</td>
              <td className="text-end tabular-nums">{formatMileage(vehicle.mileage)}</td>
              <td>
                <VehicleStatusBadge status={vehicle.status} />
              </td>
              <td className="navix-vehicle-table__expiry">
                <span className={`navix-vehicle-table__expiry-date navix-vehicle-table__expiry-date--${expiry.variant}`}>
                  {formatVehicleDate(vehicle.insuranceExpiry)}
                </span>
                {expiry.variant !== 'success' && expiry.variant !== 'secondary' && (
                  <span className={`navix-vehicle-table__expiry-tag navix-vehicle-table__expiry-tag--${expiry.variant}`}>
                    {expiry.label}
                  </span>
                )}
              </td>
              <td>
                <div className="d-flex justify-content-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-eye"
                    onClick={() => onView(vehicle.id)}
                    title="Voir le détail"
                    aria-label={`Voir le détail de ${vehicle.registrationNumber}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-pencil"
                    onClick={() => onEdit(vehicle.id)}
                    title="Modifier"
                    aria-label={`Modifier ${vehicle.registrationNumber}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-trash3"
                    onClick={() => onDelete(vehicle)}
                    title="Supprimer"
                    aria-label={`Supprimer ${vehicle.registrationNumber}`}
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

export default VehicleTable;
