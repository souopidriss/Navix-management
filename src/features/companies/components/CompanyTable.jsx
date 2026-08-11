/**
 * Navix Companies — CompanyTable
 * --------------------------------------------------------------------------
 * Tableau des entreprises (affichage desktop) construit sur le DataTable
 * générique de la bibliothèque core : logo, nom, code, pays, ville,
 * abonnement, statut, véhicules, chauffeurs et actions. Tri par en-tête
 * (Nom, Véhicules, Chauffeurs) géré par le store.
 *
 * Props :
 *   companies    : liste des entreprises à afficher (filtrée/triée/paginée)
 *   sort         : { by, direction } — tri contrôlé
 *   onSortChange : (by, direction) => void
 *   onView       : (id: string) => void
 *   onEdit       : (id: string) => void
 *   onDelete     : (company: object) => void
 */
import { Badge } from '@/components/ui';
import { DataTable } from '@/components/core';
import CompanyLogo from './CompanyLogo';
import CompanyStatusBadge from './CompanyStatusBadge';
import { getSubscriptionPlan } from '../constants';
import './CompanyTable.css';

const CompanyTable = ({ companies = [], sort, onSortChange, onView, onEdit, onDelete }) => {
  const columns = [
    {
      key: 'logo',
      label: 'Logo',
      srOnly: true,
      width: '3.25rem',
      className: 'navix-company-table__logo',
      render: (company) => <CompanyLogo src={company.logo} name={company.name} size="sm" />,
    },
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (company) => (
        <button
          type="button"
          className="navix-company-table__name"
          onClick={() => onView(company.id)}
          title={`Voir ${company.name}`}
        >
          {company.name}
        </button>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      render: (company) => <code className="text-secondary">{company.code}</code>,
    },
    {
      key: 'country',
      label: 'Pays',
      render: (company) => company.country,
    },
    {
      key: 'city',
      label: 'Ville',
      render: (company) => company.city,
    },
    {
      key: 'subscriptionPlan',
      label: 'Abonnement',
      render: (company) => {
        const plan = getSubscriptionPlan(company.subscriptionPlan);
        return (
          <Badge variant={plan.variant} soft>
            {plan.label}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (company) => <CompanyStatusBadge status={company.status} />,
    },
    {
      key: 'vehicleCount',
      label: 'Véhicules',
      align: 'end',
      sortable: true,
      render: (company) => <span className="tabular-nums">{company.vehicleCount}</span>,
    },
    {
      key: 'driverCount',
      label: 'Chauffeurs',
      align: 'end',
      sortable: true,
      render: (company) => <span className="tabular-nums">{company.driverCount}</span>,
    },
  ];

  return (
    <DataTable
      className="navix-company-table"
      columns={columns}
      rows={companies}
      sort={sort}
      onSortChange={onSortChange}
      ariaLabel="Liste des entreprises"
      actions={[
        {
          key: 'view',
          label: (company) => `Voir le détail de ${company.name}`,
          title: 'Voir le détail',
          icon: 'bi-eye',
          onClick: (company) => onView(company.id),
        },
        {
          key: 'edit',
          label: (company) => `Modifier ${company.name}`,
          title: 'Modifier',
          icon: 'bi-pencil',
          onClick: (company) => onEdit(company.id),
        },
        {
          key: 'delete',
          label: (company) => `Supprimer ${company.name}`,
          title: 'Supprimer',
          icon: 'bi-trash3',
          onClick: (company) => onDelete(company),
        },
      ]}
    />
  );
};

export default CompanyTable;
