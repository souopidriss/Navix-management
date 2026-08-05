/**
 * Navix Agencies — AgencyFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Société, Type, Statut, Pays, Ville, Région) + tri
 * (critère et sens) construite sur le FilterBar générique de la
 * bibliothèque core. Les options de tri sont les SORT_OPTIONS métier.
 *
 * Props :
 *   filters          : { companyId, type, status, country, city, region }
 *   companies        : liste des sociétés (options du filtre Société)
 *   countries        : liste des pays disponibles (dérivée des données)
 *   sort             : { by, direction }
 *   onChange         : (key: string, value: string) => void
 *   onSortChange     : (by: string, direction: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  AGENCY_TYPES,
  AGENCY_TYPE_VALUES,
  AGENCY_STATUSES,
  AGENCY_STATUS_VALUES,
  SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './AgencyFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const AgencyFilters = ({
  filters,
  companies = [],
  countries = [],
  sort,
  onChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}) => (
  <Card className="mb-3">
    <FilterBar
      fields={[
        {
          key: 'companyId',
          type: 'select',
          label: 'Société',
          options: companies.map((company) => ({ value: company.id, label: company.name })),
          allLabel: 'Toutes les sociétés',
        },
        {
          key: 'type',
          type: 'select',
          label: 'Type',
          options: toOptions(AGENCY_TYPE_VALUES, AGENCY_TYPES),
          allLabel: 'Tous les types',
        },
        {
          key: 'status',
          type: 'select',
          label: 'Statut',
          options: toOptions(AGENCY_STATUS_VALUES, AGENCY_STATUSES),
          allLabel: 'Tous les statuts',
        },
        {
          key: 'country',
          type: 'select',
          label: 'Pays',
          options: countries.map((country) => ({ value: country, label: country })),
          allLabel: 'Tous les pays',
        },
        {
          key: 'city',
          type: 'text',
          label: 'Ville',
          placeholder: 'Ville…',
        },
        {
          key: 'region',
          type: 'text',
          label: 'Région',
          placeholder: 'Région…',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />

    <div className="navix-agency-filter__sort">
      <FilterBar
        fields={[
          {
            key: 'by',
            type: 'select',
            label: 'Trier par',
            options: SORT_OPTIONS,
            allLabel: 'Tri : Nom',
          },
          {
            key: 'direction',
            type: 'select',
            label: 'Sens du tri',
            options: SORT_DIRECTIONS,
            allLabel: 'Ordre : Croissant',
          },
        ]}
        values={sort}
        onChange={(key, value) => onSortChange(key === 'by' ? value : sort.by, key === 'direction' ? value : sort.direction)}
        hasActiveFilters={false}
      />
    </div>
  </Card>
);

export default AgencyFilters;
