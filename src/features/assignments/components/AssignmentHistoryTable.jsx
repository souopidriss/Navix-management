/**
 * Navix Assignments — AssignmentHistoryTable
 * --------------------------------------------------------------------------
 * Tableau de l'historique des affectations (terminées / annulées) construit
 * sur le DataTable générique de la bibliothèque core : numéro, chauffeur,
 * véhicule, entreprise, début, fin réelle, durée et statut. Tri par en-tête
 * (Début, Fin, Durée) géré par la page.
 *
 * Props :
 *   items        : liste des affectations passées à afficher
 *   companyById  : carte { id → { name } } des entreprises
 *   driverById   : carte { id → { fullName } } des chauffeurs
 *   vehicleById  : carte { id → { registrationNumber, brand, model } } des véhicules
 *   sort         : { by, direction } — tri contrôlé
 *   onSortChange : (by, direction) => void
 *   onView       : (id: string) => void
 */
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/core';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import { formatAssignmentDate, formatAssignmentDuration } from '../constants';
import './AssignmentHistoryTable.css';

const AssignmentHistoryTable = ({
  items = [],
  companyById = {},
  driverById = {},
  vehicleById = {},
  sort,
  onSortChange,
  onView,
}) => {
  const columns = [
    {
      key: 'assignmentNumber',
      label: 'N°',
      className: 'navix-assignment-history-table__number',
      render: (item) => (
        <button
          type="button"
          className="navix-assignment-history-table__link"
          onClick={() => onView(item.id)}
          title={`Voir ${item.assignmentNumber}`}
        >
          {item.assignmentNumber}
        </button>
      ),
    },
    {
      key: 'driver',
      label: 'Chauffeur',
      className: 'navix-assignment-history-table__driver',
      render: (item) => driverById[item.driverId]?.fullName ?? '—',
    },
    {
      key: 'vehicle',
      label: 'Véhicule',
      className: 'navix-assignment-history-table__vehicle',
      render: (item) => {
        const vehicle = vehicleById[item.vehicleId] ?? {};
        const vehicleLabel =
          vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();
        return (
          <>
            {vehicleLabel || '—'}
            {vehicle.brand && vehicle.model && (
              <span className="navix-assignment-history-table__vehicle-sub">
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
      className: 'navix-assignment-history-table__company',
      render: (item) => companyById[item.companyId]?.name ?? '—',
    },
    {
      key: 'startDate',
      label: 'Début',
      sortable: true,
      className: 'navix-assignment-history-table__date',
      render: (item) => formatAssignmentDate(item.startDate),
    },
    {
      key: 'endDate',
      label: 'Fin',
      sortable: true,
      className: 'navix-assignment-history-table__date',
      render: (item) => formatAssignmentDate(item.endDate),
    },
    {
      key: 'duration',
      label: 'Durée',
      sortable: true,
      render: (item) => (
        <Badge variant="light">{formatAssignmentDuration(item.startDate, item.endDate)}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (item) => <AssignmentStatusBadge status={item.status} />,
    },
  ];

  return (
    <DataTable
      className="navix-assignment-history-table"
      columns={columns}
      rows={items}
      sort={sort}
      onSortChange={onSortChange}
      ariaLabel="Historique des affectations"
      actions={[
        {
          key: 'view',
          label: (item) => `Voir le détail de ${item.assignmentNumber}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (item) => onView(item.id),
        },
      ]}
    />
  );
};

export default AssignmentHistoryTable;
