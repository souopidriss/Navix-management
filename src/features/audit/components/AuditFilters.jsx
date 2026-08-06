/**
 * Navix Audit — AuditFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Période, Entreprise, Agence, Utilisateur, Action,
 * Famille, Ressource, Statut, Sévérité, Du / Au) + tri (critère et sens)
 * construite sur le FilterBar générique de Core UI. Les champs date ne sont
 * visibles que lorsque la période « Personnalisé » est choisie.
 *
 * Props :
 *   filters          : objet des filtres courants
 *   companies        : liste des sociétés
 *   agencies         : liste des agences
 *   sort             : { by, direction }
 *   onChange         : (key: string, value: any) => void
 *   onSortChange     : (by: string, direction: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  AUDIT_ACTIONS,
  AUDIT_ACTION_VALUES,
  AUDIT_ACTION_TYPES,
  AUDIT_ACTION_TYPE_VALUES,
  AUDIT_RESOURCES,
  AUDIT_RESOURCE_VALUES,
  AUDIT_STATUSES,
  AUDIT_STATUS_VALUES,
  AUDIT_SEVERITIES,
  AUDIT_SEVERITY_VALUES,
  AUDIT_PERIODS,
  AUDIT_PERIOD_VALUES,
  AUDIT_USER_OPTIONS,
  AUDIT_SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './AuditFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const AuditFilters = ({
  filters,
  companies = [],
  agencies = [],
  sort,
  onChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}) => {
  const isCustomPeriod = filters.period === 'custom';

  const filterFields = [
    {
      key: 'period',
      type: 'select',
      label: 'Période',
      options: toOptions(AUDIT_PERIOD_VALUES, AUDIT_PERIODS),
      allLabel: 'Toutes les périodes',
    },
    {
      key: 'companyId',
      type: 'select',
      label: 'Entreprise',
      options: companies.map((company) => ({ value: company.id, label: company.name })),
      allLabel: 'Toutes les entreprises',
    },
    {
      key: 'agencyId',
      type: 'select',
      label: 'Agence',
      options: agencies.map((agency) => ({ value: agency.id, label: agency.name })),
      allLabel: 'Toutes les agences',
    },
    {
      key: 'userId',
      type: 'select',
      label: 'Utilisateur',
      options: AUDIT_USER_OPTIONS,
      allLabel: 'Tous les utilisateurs',
    },
    {
      key: 'action',
      type: 'select',
      label: 'Action',
      options: toOptions(AUDIT_ACTION_VALUES, AUDIT_ACTIONS),
      allLabel: 'Toutes les actions',
    },
    {
      key: 'actionType',
      type: 'select',
      label: 'Famille d’actions',
      options: toOptions(AUDIT_ACTION_TYPE_VALUES, AUDIT_ACTION_TYPES),
      allLabel: 'Toutes les familles',
    },
    {
      key: 'resourceType',
      type: 'select',
      label: 'Ressource',
      options: toOptions(AUDIT_RESOURCE_VALUES, AUDIT_RESOURCES),
      allLabel: 'Toutes les ressources',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Statut',
      options: toOptions(AUDIT_STATUS_VALUES, AUDIT_STATUSES),
      allLabel: 'Tous les statuts',
    },
    {
      key: 'severity',
      type: 'select',
      label: 'Sévérité',
      options: toOptions(AUDIT_SEVERITY_VALUES, AUDIT_SEVERITIES),
      allLabel: 'Toutes les sévérités',
    },
    ...(isCustomPeriod
      ? [
          { key: 'dateFrom', type: 'date', label: 'À partir du' },
          { key: 'dateTo', type: 'date', label: "Jusqu'au" },
        ]
      : []),
  ];

  return (
    <Card className="navix-audit-filters mb-3">
      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={onChange}
        onReset={onReset}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="navix-audit-filters__sort">
        <FilterBar
          fields={[
            {
              key: 'by',
              type: 'select',
              label: 'Trier par',
              options: AUDIT_SORT_OPTIONS,
              allLabel: 'Tri : Date',
            },
            {
              key: 'direction',
              type: 'select',
              label: 'Sens du tri',
              options: SORT_DIRECTIONS,
              allLabel: 'Ordre : Décroissant',
            },
          ]}
          values={sort}
          onChange={(key, value) =>
            onSortChange(key === 'by' ? value : sort.by, key === 'direction' ? value : sort.direction)
          }
          hasActiveFilters={false}
        />
      </div>
    </Card>
  );
};

export default AuditFilters;
