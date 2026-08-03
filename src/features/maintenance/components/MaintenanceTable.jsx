/**
 * Navix Maintenance — MaintenanceTable
 * --------------------------------------------------------------------------
 * Tableau des entretiens (affichage desktop) construit sur le DataTable
 * générique de la bibliothèque core : colonnes déclaratives, tri par
 * en-tête, alertes métier et colonne d'actions. La modification est
 * désactivée pour les entretiens clôturés (terminé / annulé).
 *
 * Props :
 *   maintenanceRecords : liste des entretiens à afficher (filtrée/triée/paginée)
 *   vehicleById        : carte { id → { registrationNumber, brand, model, category, mileage } }
 *   sort               : { by, direction } — tri contrôlé
 *   onSortChange       : (by, direction) => void
 *   onView             : (id: string) => void
 *   onEdit             : (id: string) => void
 *   onDelete           : (maintenance: object) => void
 */
import { Button } from '@/components/ui';
import { DataTable } from '@/components/core';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';
import MaintenancePriorityBadge from './MaintenancePriorityBadge';
import MaintenanceTypeBadge from './MaintenanceTypeBadge';
import MaintenanceAlertBadge from './MaintenanceAlertBadge';
import {
  formatMaintenanceDate,
  formatMaintenanceMoney,
  formatMaintenanceMileage,
  isMaintenanceFinished,
} from '../constants';
import './MaintenanceTable.css';

const MaintenanceTable = ({
  maintenanceRecords = [],
  vehicleById = {},
  sort,
  onSortChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: 'scheduledDate',
      label: 'Date',
      sortable: true,
      width: '9rem',
      render: (maintenance) => (
        <>
          <button
            type="button"
            className="navix-maint-table__link"
            onClick={() => onView(maintenance.id)}
            title={`Voir ${maintenance.maintenanceNumber}`}
          >
            {maintenance.maintenanceNumber}
          </button>
          <span className="navix-maint-table__date-sub">{formatMaintenanceDate(maintenance.scheduledDate)}</span>
        </>
      ),
    },
    {
      key: 'vehicleId',
      label: 'Véhicule',
      sortable: true,
      sortValue: (maintenance) => vehicleById[maintenance.vehicleId]?.registrationNumber ?? '',
      render: (maintenance) => {
        const vehicle = vehicleById[maintenance.vehicleId] ?? {};
        const label = vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();
        return (
          <span className="navix-maint-table__vehicle">
            {label || '—'}
            {vehicle.brand && vehicle.model && (
              <span className="navix-maint-table__vehicle-sub">
                {vehicle.brand} {vehicle.model}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: 'maintenanceType',
      label: 'Type',
      render: (maintenance) => <MaintenanceTypeBadge type={maintenance.maintenanceType} />,
    },
    {
      key: 'mileage',
      label: 'Km',
      align: 'end',
      sortable: true,
      render: (maintenance) => (
        <span className="navix-maint-table__num">{formatMaintenanceMileage(maintenance.mileage)}</span>
      ),
    },
    {
      key: 'actualCost',
      label: 'Coût',
      align: 'end',
      sortable: true,
      render: (maintenance) => (
        <span className="navix-maint-table__amount">
          {formatMaintenanceMoney(maintenance.actualCost || maintenance.estimatedCost, maintenance.currency)}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priorité',
      sortable: true,
      render: (maintenance) => <MaintenancePriorityBadge priority={maintenance.priority} />,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (maintenance) => <MaintenanceStatusBadge status={maintenance.status} />,
    },
    {
      key: 'alerts',
      label: 'Alertes',
      render: (maintenance) => (
        <MaintenanceAlertBadge maintenance={maintenance} vehicle={vehicleById[maintenance.vehicleId]} />
      ),
    },
  ];

  return (
    <DataTable
      className="navix-maint-table"
      columns={columns}
      rows={maintenanceRecords}
      sort={sort}
      onSortChange={onSortChange}
      actions={[
        {
          key: 'view',
          label: (maintenance) => `Voir le détail de ${maintenance.maintenanceNumber}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (maintenance) => onView(maintenance.id),
        },
        {
          key: 'edit',
          label: (maintenance) => `Modifier ${maintenance.maintenanceNumber}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          disabled: (maintenance) => isMaintenanceFinished(maintenance),
          onClick: (maintenance) => onEdit(maintenance.id),
        },
        {
          key: 'delete',
          label: (maintenance) => `Supprimer ${maintenance.maintenanceNumber}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          onClick: (maintenance) => onDelete(maintenance),
        },
      ]}
    />
  );
};

export default MaintenanceTable;
