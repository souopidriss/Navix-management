/**
 * Navix Partners — PartnerTable
 * --------------------------------------------------------------------------
 * Tableau des partenaires (affichage desktop) construit sur le DataTable
 * générique de la bibliothèque core : colonnes déclaratives, tri par
 * en-tête et colonne d'actions.
 *
 * Props :
 *   partnerRecords : liste des partenaires à afficher (filtrée/triée/paginée)
 *   companyById    : carte { id → { name } }
 *   sort           : { by, direction } — tri contrôlé
 *   onSortChange   : (by, direction) => void
 *   onView         : (id: string) => void
 *   onEdit         : (id: string) => void
 *   onDelete       : (partner: object) => void
 *   canEdit        : booléen — autorise l'action Modifier
 *   canDelete      : booléen — autorise l'action Supprimer
 */
import { DataTable } from '@/components/core';
import PartnerStatusBadge from './PartnerStatusBadge';
import PartnerTypeBadge from './PartnerTypeBadge';
import './PartnerTable.css';

const PartnerTable = ({
  partnerRecords = [],
  companyById = {},
  sort,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const columns = [
    {
      key: 'code',
      label: 'Partenaire',
      sortable: true,
      width: '12rem',
      render: (partner) => (
        <>
          <button
            type="button"
            className="navix-partner-table__link"
            onClick={() => onView(partner.id)}
            title={`Voir ${partner.name}`}
          >
            {partner.name}
          </button>
          <span className="navix-partner-table__code-sub">{partner.code}</span>
        </>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      sortValue: (partner) => partner.type,
      render: (partner) => <PartnerTypeBadge type={partner.type} />,
    },
    {
      key: 'companyId',
      label: 'Entreprise',
      sortable: true,
      sortValue: (partner) => companyById[partner.companyId]?.name ?? '',
      render: (partner) => companyById[partner.companyId]?.name || '—',
    },
    {
      key: 'contactName',
      label: 'Contact',
      render: (partner) => (
        <>
          <span className="navix-partner-table__contact">
            {partner.contactName || '—'}
          </span>
          {partner.email && (
            <span className="navix-partner-table__email-sub">{partner.email}</span>
          )}
        </>
      ),
    },
    {
      key: 'city',
      label: 'Ville',
      sortable: true,
      render: (partner) => (
        <>
          <span className="navix-partner-table__city">{partner.city || '—'}</span>
          {partner.country && (
            <span className="navix-partner-table__country-sub">{partner.country}</span>
          )}
        </>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      sortValue: (partner) => partner.status,
      render: (partner) => <PartnerStatusBadge status={partner.status} />,
    },
  ];

  return (
    <DataTable
      className="navix-partner-table"
      columns={columns}
      rows={partnerRecords}
      sort={sort}
      onSortChange={onSortChange}
      actions={[
        {
          key: 'view',
          label: (partner) => `Voir le détail de ${partner.name}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (partner) => onView(partner.id),
        },
        {
          key: 'edit',
          label: (partner) => `Modifier ${partner.name}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          show: () => canEdit,
          onClick: (partner) => onEdit(partner.id),
        },
        {
          key: 'delete',
          label: (partner) => `Supprimer ${partner.name}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          show: () => canDelete,
          onClick: (partner) => onDelete(partner),
        },
      ]}
    />
  );
};

export default PartnerTable;
