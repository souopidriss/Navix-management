/**
 * Navix Assignments — AssignmentTable
 * --------------------------------------------------------------------------
 * Tableau des affectations (affichage desktop) construit sur le DataTable
 * générique de la bibliothèque core : numéro, chauffeur, véhicule, entreprise,
 * type, début, fin prévue, statut et actions (voir, modifier, terminer,
 * supprimer). Tri par en-tête géré par le store.
 *
 * Props :
 *   assignments  : liste des affectations à afficher (filtrée/triée/paginée)
 *   companyById  : carte { id → { name } } des entreprises
 *   driverById   : carte { id → { fullName } } des chauffeurs
 *   vehicleById  : carte { id → { registrationNumber, brand, model } } des véhicules
 *   sort         : { by, direction } — tri contrôlé
 *   onSortChange : (by, direction) => void
 *   onView       : (id: string) => void
 *   onEdit       : (id: string) => void
 *   onFinish     : (assignment: object) => void — optionnel (cache l'action)
 *   onDelete     : (assignment: object) => void — optionnel (cache l'action)
 */
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/core';
import AssignmentStatusBadge from './AssignmentStatusBadge';
import { getAssignmentType, formatAssignmentDate } from '../constants';
import './AssignmentTable.css';

const AssignmentTable = ({
  assignments = [],
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
      key: 'assignmentNumber',
      label: 'N°',
      className: 'navix-assignment-table__number',
      render: (assignment) => (
        <button
          type="button"
          className="navix-assignment-table__link"
          onClick={() => onView(assignment.id)}
          title={`Voir ${assignment.assignmentNumber}`}
        >
          {assignment.assignmentNumber}
        </button>
      ),
    },
    {
      key: 'driver',
      label: 'Chauffeur',
      sortable: true,
      className: 'navix-assignment-table__driver',
      render: (assignment) => driverById[assignment.driverId]?.fullName ?? '—',
    },
    {
      key: 'vehicle',
      label: 'Véhicule',
      sortable: true,
      className: 'navix-assignment-table__vehicle',
      render: (assignment) => {
        const vehicle = vehicleById[assignment.vehicleId] ?? {};
        const vehicleLabel =
          vehicle.registrationNumber || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim();
        return (
          <>
            {vehicleLabel || '—'}
            {vehicle.brand && vehicle.model && (
              <span className="navix-assignment-table__vehicle-sub">
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
      sortable: true,
      className: 'navix-assignment-table__company',
      render: (assignment) => companyById[assignment.companyId]?.name ?? '—',
    },
    {
      key: 'assignmentType',
      label: 'Type',
      render: (assignment) => {
        const type = getAssignmentType(assignment.assignmentType);
        return (
          <Badge variant={type.variant} soft>
            {type.label}
          </Badge>
        );
      },
    },
    {
      key: 'startDate',
      label: 'Début',
      sortable: true,
      className: 'navix-assignment-table__date',
      render: (assignment) => formatAssignmentDate(assignment.startDate),
    },
    {
      key: 'endDate',
      label: 'Fin prévue',
      sortable: true,
      className: 'navix-assignment-table__date',
      render: (assignment) => formatAssignmentDate(assignment.expectedEndDate),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (assignment) => <AssignmentStatusBadge status={assignment.status} />,
    },
  ];

  return (
    <DataTable
      className="navix-assignment-table"
      columns={columns}
      rows={assignments}
      sort={sort}
      onSortChange={onSortChange}
      ariaLabel="Liste des affectations"
      actions={[
        {
          key: 'view',
          label: (assignment) => `Voir le détail de ${assignment.assignmentNumber}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (assignment) => onView(assignment.id),
        },
        {
          key: 'edit',
          label: (assignment) => `Modifier ${assignment.assignmentNumber}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          onClick: (assignment) => onEdit(assignment.id),
        },
        {
          key: 'finish',
          label: (assignment) => `Terminer ${assignment.assignmentNumber}`,
          title: 'Terminer l’affectation',
          icon: 'bi-check2-circle',
          show: (assignment) => Boolean(onFinish) && assignment.status === 'active',
          onClick: (assignment) => onFinish(assignment),
        },
        {
          key: 'delete',
          label: (assignment) => `Supprimer ${assignment.assignmentNumber}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          show: () => Boolean(onDelete),
          onClick: (assignment) => onDelete(assignment),
        },
      ]}
    />
  );
};

export default AssignmentTable;
