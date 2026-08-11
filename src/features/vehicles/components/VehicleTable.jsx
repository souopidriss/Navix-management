/**
 * Navix Vehicles — VehicleTable
 * --------------------------------------------------------------------------
 * Tableau des véhicules (affichage desktop) construit sur le DataTable
 * générique de la bibliothèque core : photo, immatriculation, marque, modèle,
 * groupe, entreprise, kilométrage, statut, expiration de l'assurance et
 * actions. Tri par en-tête (Marque, Kilométrage) géré par le store.
 *
 * Props :
 *   vehicles    : liste des véhicules à afficher (filtrée/triée/paginée)
 *   companyById : carte { id → { name } } des entreprises
 *   sort        : { by, direction } — tri contrôlé
 *   onSortChange : (by, direction) => void
 *   onView      : (id: string) => void
 *   onEdit      : (id: string) => void
 *   onDelete    : (vehicle: object) => void
 */
import { DataTable } from '@/components/core';
import VehicleImage from './VehicleImage';
import VehicleStatusBadge from './VehicleStatusBadge';
import VehicleGroupBadge from './VehicleGroupBadge';
import { formatMileage, formatVehicleDate, getExpiryStatus } from '../constants';
import './VehicleTable.css';

const VehicleTable = ({ vehicles = [], companyById = {}, sort, onSortChange, onView, onEdit, onDelete }) => {
  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      srOnly: true,
      width: '3.25rem',
      className: 'navix-vehicle-table__photo',
      render: (vehicle) => (
        <VehicleImage src={vehicle.photo} name={`${vehicle.brand} ${vehicle.model}`} size="sm" />
      ),
    },
    {
      key: 'registrationNumber',
      label: 'Immatriculation',
      render: (vehicle) => (
        <button
          type="button"
          className="navix-vehicle-table__reg"
          onClick={() => onView(vehicle.id)}
          title={`Voir ${vehicle.registrationNumber}`}
        >
          {vehicle.registrationNumber}
        </button>
      ),
    },
    {
      key: 'brand',
      label: 'Marque',
      sortable: true,
      render: (vehicle) => vehicle.brand,
    },
    {
      key: 'model',
      label: 'Modèle',
      render: (vehicle) => vehicle.model,
    },
    {
      key: 'group',
      label: 'Groupe',
      render: (vehicle) => <VehicleGroupBadge group={vehicle.group} />,
    },
    {
      key: 'company',
      label: 'Entreprise',
      className: 'navix-vehicle-table__company',
      render: (vehicle) => companyById[vehicle.companyId]?.name ?? '—',
    },
    {
      key: 'mileage',
      label: 'Kilométrage',
      align: 'end',
      sortable: true,
      render: (vehicle) => <span className="tabular-nums">{formatMileage(vehicle.mileage)}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (vehicle) => <VehicleStatusBadge status={vehicle.status} />,
    },
    {
      key: 'insuranceExpiry',
      label: 'Expiration assurance',
      className: 'navix-vehicle-table__expiry',
      render: (vehicle) => {
        const expiry = getExpiryStatus(vehicle.insuranceExpiry);
        return (
          <>
            <span
              className={`navix-vehicle-table__expiry-date navix-vehicle-table__expiry-date--${expiry.variant}`}
            >
              {formatVehicleDate(vehicle.insuranceExpiry)}
            </span>
            {expiry.variant !== 'success' && expiry.variant !== 'secondary' && (
              <span className={`navix-vehicle-table__expiry-tag navix-vehicle-table__expiry-tag--${expiry.variant}`}>
                {expiry.label}
              </span>
            )}
          </>
        );
      },
    },
  ];

  return (
    <DataTable
      className="navix-vehicle-table"
      columns={columns}
      rows={vehicles}
      sort={sort}
      onSortChange={onSortChange}
      ariaLabel="Liste des véhicules"
      actions={[
        {
          key: 'view',
          label: (vehicle) => `Voir le détail de ${vehicle.registrationNumber}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (vehicle) => onView(vehicle.id),
        },
        {
          key: 'edit',
          label: (vehicle) => `Modifier ${vehicle.registrationNumber}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          onClick: (vehicle) => onEdit(vehicle.id),
        },
        {
          key: 'delete',
          label: (vehicle) => `Supprimer ${vehicle.registrationNumber}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          onClick: (vehicle) => onDelete(vehicle),
        },
      ]}
    />
  );
};

export default VehicleTable;
