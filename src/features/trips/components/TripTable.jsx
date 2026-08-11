/**
 * Navix Trips — TripTable
 * --------------------------------------------------------------------------
 * Tableau des trajets (affichage desktop) construit sur le DataTable générique
 * de la bibliothèque core : numéro, itinéraire, chauffeur, véhicule,
 * entreprise, type, départ, statut et actions (voir, modifier, clôturer,
 * supprimer). Tri par en-tête (Départ) géré par le store ou la page.
 *
 * Props :
 *   trips        : liste des trajets à afficher (filtrée/triée/paginée)
 *   companyById  : carte { id → { name } } des entreprises
 *   driverById   : carte { id → { fullName } } des chauffeurs
 *   vehicleById  : carte { id → { registrationNumber, brand, model } } des véhicules
 *   sort         : { by, direction } — tri contrôlé
 *   onSortChange : (by, direction) => void
 *   onView       : (id: string) => void
 *   onEdit       : (id: string) => void
 *   onFinish     : (trip: object) => void — optionnel (cache l'action)
 *   onDelete     : (trip: object) => void — optionnel (cache l'action)
 */
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/core';
import TripStatusBadge from './TripStatusBadge';
import { getTripType, formatTripDate } from '../constants';
import './TripTable.css';

const TripTable = ({
  trips = [],
  companyById = {},
  driverById = {},
  vehicleById = {},
  sort,
  onSortChange,
  onView,
  onEdit,
  onFinish,
  onDelete,
}) => {
  const columns = [
    {
      key: 'tripNumber',
      label: 'N°',
      className: 'navix-trip-table__number',
      render: (trip) => (
        <button
          type="button"
          className="navix-trip-table__link"
          onClick={() => onView(trip.id)}
          title={`Voir ${trip.tripNumber}`}
        >
          {trip.tripNumber}
        </button>
      ),
    },
    {
      key: 'route',
      label: 'Itinéraire',
      className: 'navix-trip-table__route',
      render: (trip) => (
        <>
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
        </>
      ),
    },
    {
      key: 'driver',
      label: 'Chauffeur',
      className: 'navix-trip-table__driver',
      render: (trip) => driverById[trip.driverId]?.fullName ?? '—',
    },
    {
      key: 'vehicle',
      label: 'Véhicule',
      className: 'navix-trip-table__vehicle',
      render: (trip) => {
        const vehicle = vehicleById[trip.vehicleId] ?? {};
        const vehicleLabel =
          vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();
        return (
          <>
            {vehicleLabel || '—'}
            {vehicle.brand && vehicle.model && (
              <span className="navix-trip-table__vehicle-sub">
                {vehicle.brand} {vehicle.model}
              </span>
            )}
          </>
        );
      },
    },
    {
      key: 'company',
      label: 'Entreprise',
      className: 'navix-trip-table__company',
      render: (trip) => companyById[trip.companyId]?.name ?? '—',
    },
    {
      key: 'tripType',
      label: 'Type',
      render: (trip) => {
        const type = getTripType(trip.tripType);
        return (
          <Badge variant={type.variant} soft>
            {type.label}
          </Badge>
        );
      },
    },
    {
      key: 'departureDate',
      label: 'Départ',
      sortable: true,
      className: 'navix-trip-table__date',
      render: (trip) => formatTripDate(trip.departureDate),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (trip) => <TripStatusBadge status={trip.status} />,
    },
  ];

  return (
    <DataTable
      className="navix-trip-table"
      columns={columns}
      rows={trips}
      sort={sort}
      onSortChange={onSortChange}
      ariaLabel="Liste des trajets"
      actions={[
        {
          key: 'view',
          label: (trip) => `Voir le détail de ${trip.tripNumber}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (trip) => onView(trip.id),
        },
        {
          key: 'edit',
          label: (trip) => `Modifier ${trip.tripNumber}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          show: () => Boolean(onEdit),
          onClick: (trip) => onEdit(trip.id),
        },
        {
          key: 'finish',
          label: (trip) => `Clôturer ${trip.tripNumber}`,
          title: 'Clôturer le trajet',
          icon: 'bi-flag',
          show: (trip) => Boolean(onFinish) && trip.status !== 'completed' && trip.status !== 'cancelled',
          onClick: (trip) => onFinish(trip),
        },
        {
          key: 'delete',
          label: (trip) => `Supprimer ${trip.tripNumber}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          show: () => Boolean(onDelete),
          onClick: (trip) => onDelete(trip),
        },
      ]}
    />
  );
};

export default TripTable;
