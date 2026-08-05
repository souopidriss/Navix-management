/**
 * Navix Agencies — AgencyTable
 * --------------------------------------------------------------------------
 * Tableau des agences / sites (affichage desktop) construit sur le DataTable
 * générique de la bibliothèque core : colonnes déclaratives, tri par
 * en-tête, badges métier et colonne d'actions.
 *
 * Props :
 *   agencies     : liste des agences à afficher (filtrée/triée/paginée)
 *   companyById  : carte { id → { name } } pour le libellé de la société
 *   sort         : { by, direction } — tri contrôlé
 *   onSortChange : (by, direction) => void
 *   onView       : (id: string) => void
 *   onEdit       : (id: string) => void
 *   onDelete     : (agency: object) => void
 */
import { DataTable } from '@/components/core';
import AgencyStatusBadge from './AgencyStatusBadge';
import AgencyTypeBadge from './AgencyTypeBadge';
import './AgencyTable.css';

const AgencyTable = ({
  agencies = [],
  companyById = {},
  sort,
  onSortChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: 'name',
      label: 'Agence',
      sortable: true,
      width: '14rem',
      render: (agency) => (
        <span className="navix-agency-table__name">
          <button
            type="button"
            className="navix-agency-table__link"
            onClick={() => onView(agency.id)}
            title={`Voir ${agency.name}`}
          >
            {agency.name}
          </button>
          <span className="navix-agency-table__sub">
            <code>{agency.code}</code>
            {companyById[agency.companyId]?.name
              ? ` · ${companyById[agency.companyId].name}`
              : ''}
          </span>
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (agency) => <AgencyTypeBadge type={agency.type} />,
    },
    {
      key: 'city',
      label: 'Localisation',
      sortable: true,
      render: (agency) => (
        <span className="navix-agency-table__location">
          <i className="bi bi-geo-alt me-1" aria-hidden="true" />
          {[agency.city, agency.country].filter(Boolean).join(', ') || '—'}
        </span>
      ),
    },
    {
      key: 'vehicleCount',
      label: 'Véhicules',
      align: 'end',
      sortable: true,
      render: (agency) => <span className="tabular-nums">{agency.vehicleCount}</span>,
    },
    {
      key: 'driverCount',
      label: 'Chauffeurs',
      align: 'end',
      sortable: true,
      render: (agency) => <span className="tabular-nums">{agency.driverCount}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (agency) => <AgencyStatusBadge status={agency.status} />,
    },
  ];

  return (
    <DataTable
      className="navix-agency-table"
      columns={columns}
      rows={agencies}
      sort={sort}
      onSortChange={onSortChange}
      actions={[
        {
          key: 'view',
          label: (agency) => `Voir le détail de ${agency.name}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (agency) => onView(agency.id),
        },
        {
          key: 'edit',
          label: (agency) => `Modifier ${agency.name}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          onClick: (agency) => onEdit(agency.id),
        },
        {
          key: 'delete',
          label: (agency) => `Supprimer ${agency.name}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          onClick: (agency) => onDelete(agency),
        },
      ]}
    />
  );
};

export default AgencyTable;
