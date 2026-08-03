/**
 * Navix Fuel — FuelTable
 * --------------------------------------------------------------------------
 * Tableau des pleins (affichage desktop) construit sur le DataTable générique
 * de la bibliothèque core : colonnes déclaratives, tri par en-tête, état
 * chargement (skeleton) et colonne d'actions. Les libellés et badges restent
 * propres au module.
 *
 * Props :
 *   fuelRecords  : liste des pleins à afficher (filtrée/triée/paginée)
 *   driverById   : carte { id → { fullName } } des chauffeurs
 *   vehicleById  : carte { id → { registrationNumber, brand, model, category } }
 *   sort         : { by, direction } — tri contrôlé
 *   onSortChange : (by, direction) => void
 *   onView       : (id: string) => void
 *   onEdit       : (id: string) => void
 *   onDelete     : (fuel: object) => void
 */
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/core';
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
  sort,
  onSortChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      width: '9rem',
      render: (fuel) => (
        <>
          <button
            type="button"
            className="navix-fuel-table__link"
            onClick={() => onView(fuel.id)}
            title={`Voir ${fuel.fuelNumber}`}
          >
            {fuel.fuelNumber}
          </button>
          <span className="navix-fuel-table__date-sub">{formatFuelDate(fuel.createdAt)}</span>
        </>
      ),
    },
    {
      key: 'vehicleId',
      label: 'Véhicule',
      sortable: true,
      sortValue: (fuel) => vehicleById[fuel.vehicleId]?.registrationNumber ?? '',
      render: (fuel) => {
        const vehicle = vehicleById[fuel.vehicleId] ?? {};
        const label = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();
        return (
          <span className="navix-fuel-table__vehicle">
            {label || '—'}
            {vehicle.brand && vehicle.model && (
              <span className="navix-fuel-table__vehicle-sub">
                {vehicle.brand} {vehicle.model}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: 'driverId',
      label: 'Chauffeur',
      render: (fuel) => <span className="navix-fuel-table__driver">{driverById[fuel.driverId]?.fullName ?? '—'}</span>,
    },
    {
      key: 'stationName',
      label: 'Station',
      render: (fuel) => (
        <span className="navix-fuel-table__station">
          <FuelStationBadge stationName={fuel.stationName} stationCity={fuel.stationCity} />
        </span>
      ),
    },
    {
      key: 'fuelType',
      label: 'Type',
      render: (fuel) => {
        const type = getFuelType(fuel.fuelType);
        return (
          <Badge variant={type.variant} soft>
            <i className={`bi ${type.icon} me-1`} aria-hidden="true" />
            {type.label}
          </Badge>
        );
      },
    },
    {
      key: 'quantity',
      label: 'Quantité',
      align: 'end',
      sortable: true,
      render: (fuel) => <span className="navix-fuel-table__num">{formatFuelQuantity(fuel.quantity)}</span>,
    },
    {
      key: 'unitPrice',
      label: 'Prix/L',
      align: 'end',
      render: (fuel) => (
        <span className="navix-fuel-table__num">{formatFuelUnitPrice(fuel.unitPrice, fuel.currency)}</span>
      ),
    },
    {
      key: 'totalCost',
      label: 'Montant',
      align: 'end',
      sortable: true,
      render: (fuel) => (
        <span className="navix-fuel-table__amount">{formatFuelMoney(fuel.totalCost, fuel.currency)}</span>
      ),
    },
    {
      key: 'consumptionAverage',
      label: 'Conso moyenne',
      align: 'end',
      sortable: true,
      render: (fuel) => {
        const abnormal = isAbnormalFuelConsumption(fuel.consumptionAverage, vehicleById[fuel.vehicleId]?.category);
        return (
          <span className="navix-fuel-table__num">
            {formatFuelConsumption(fuel.consumptionAverage)}
            {abnormal && (
              <i
                className="bi bi-exclamation-triangle-fill navix-fuel-table__anomaly"
                title="Consommation anormale"
                aria-label="Consommation anormale"
              />
            )}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (fuel) => <FuelStatusBadge status={fuel.status} />,
    },
  ];

  return (
    <DataTable
      className="navix-fuel-table"
      columns={columns}
      rows={fuelRecords}
      sort={sort}
      onSortChange={onSortChange}
      actions={[
        {
          key: 'view',
          label: (fuel) => `Voir le détail de ${fuel.fuelNumber}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (fuel) => onView(fuel.id),
        },
        {
          key: 'edit',
          label: (fuel) => `Modifier ${fuel.fuelNumber}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          onClick: (fuel) => onEdit(fuel.id),
        },
        {
          key: 'delete',
          label: (fuel) => `Supprimer ${fuel.fuelNumber}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          onClick: (fuel) => onDelete(fuel),
        },
      ]}
    />
  );
};

export default FuelTable;
