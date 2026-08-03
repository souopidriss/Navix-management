/**
 * Navix Trips — TripTable
 * --------------------------------------------------------------------------
 * Tableau des trajets (affichage desktop) : numéro, itinéraire, chauffeur,
 * véhicule, entreprise, type, départ, statut et actions (voir, modifier,
 * clôturer, supprimer).
 *
 * Props :
 *   trips       : liste des trajets à afficher (filtrée/triée/paginée)
 *   companyById : carte { id → { name } } des entreprises
 *   driverById  : carte { id → { fullName } } des chauffeurs
 *   vehicleById : carte { id → { registrationNumber, brand, model } } des véhicules
 *   onView      : (id: string) => void
 *   onEdit      : (id: string) => void
 *   onFinish    : (trip: object) => void
 *   onDelete    : (trip: object) => void
 */
import { Badge, Button } from '@/components/ui';
import TripStatusBadge from './TripStatusBadge';
import { getTripType, formatTripDate } from '../constants';
import './TripTable.css';

const TripTable = ({
  trips = [],
  companyById = {},
  driverById = {},
  vehicleById = {},
  onView,
  onEdit,
  onFinish,
  onDelete,
}) => (
  <div className="table-responsive">
    <table className="table table-hover align-middle mb-0 navix-trip-table">
      <thead>
        <tr>
          <th scope="col">N°</th>
          <th scope="col">Itinéraire</th>
          <th scope="col">Chauffeur</th>
          <th scope="col">Véhicule</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Type</th>
          <th scope="col">Départ</th>
          <th scope="col">Statut</th>
          <th scope="col" className="text-end">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {trips.map((trip) => {
          const type = getTripType(trip.tripType);
          const vehicle = vehicleById[trip.vehicleId] ?? {};
          const vehicleLabel = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();

          return (
            <tr key={trip.id}>
              <td className="navix-trip-table__number">
                <button
                  type="button"
                  className="navix-trip-table__link"
                  onClick={() => onView(trip.id)}
                  title={`Voir ${trip.tripNumber}`}
                >
                  {trip.tripNumber}
                </button>
              </td>
              <td className="navix-trip-table__route">
                <span className="navix-trip-table__route-line">
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  {trip.departureLocation}
                </span>
                <span className="navix-trip-table__route-arrow" aria-hidden="true">
                  <i className="bi bi-arrow-right" />
                </span>
                <span className="navix-trip-table__route-line">
                  <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                  {trip.arrivalLocation}
                </span>
              </td>
              <td className="navix-trip-table__driver">
                {driverById[trip.driverId]?.fullName ?? '—'}
              </td>
              <td className="navix-trip-table__vehicle">
                {vehicleLabel || '—'}
                {vehicle.brand && vehicle.model && (
                  <span className="navix-trip-table__vehicle-sub">
                    {vehicle.brand} {vehicle.model}
                  </span>
                )}
              </td>
              <td className="navix-trip-table__company">
                {companyById[trip.companyId]?.name ?? '—'}
              </td>
              <td>
                <Badge variant={type.variant} soft>
                  {type.label}
                </Badge>
              </td>
              <td className="navix-trip-table__date">{formatTripDate(trip.departureDate)}</td>
              <td>
                <TripStatusBadge status={trip.status} />
              </td>
              <td>
                <div className="d-flex justify-content-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-eye"
                    onClick={() => onView(trip.id)}
                    title="Voir le détail"
                    aria-label={`Voir le détail de ${trip.tripNumber}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-pencil"
                    onClick={() => onEdit(trip.id)}
                    title="Modifier"
                    aria-label={`Modifier ${trip.tripNumber}`}
                  />
                  {onFinish && trip.status !== 'completed' && trip.status !== 'cancelled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="bi-flag"
                      onClick={() => onFinish(trip)}
                      title="Clôturer le trajet"
                      aria-label={`Clôturer ${trip.tripNumber}`}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-trash3"
                    onClick={() => onDelete(trip)}
                    title="Supprimer"
                    aria-label={`Supprimer ${trip.tripNumber}`}
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

export default TripTable;
