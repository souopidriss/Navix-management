/**
 * Navix Partners — PartnerFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Type, Statut, Pays) construite sur le
 * FilterBar générique de la bibliothèque core. Le tri se fait par en-tête
 * du tableau (DataTable).
 *
 * Props :
 *   filters          : { companyId, type, status, country }
 *   companies        : liste des entreprises (options du filtre Entreprise)
 *   onChange         : (key: string, value: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import { COUNTRIES } from '@/features/companies';
import {
  PARTNER_TYPES,
  PARTNER_TYPE_VALUES,
  PARTNER_STATUSES,
  PARTNER_STATUS_VALUES,
} from '../constants';
import './PartnerFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const PartnerFilters = ({
  filters,
  companies = [],
  onChange,
  onReset,
  hasActiveFilters,
}) => (
  <Card className="navix-partner-filters">
    <FilterBar
      fields={[
        {
          key: 'companyId',
          type: 'select',
          label: 'Entreprise',
          options: companies.map((company) => ({ value: company.id, label: company.name })),
          allLabel: 'Toutes les entreprises',
        },
        {
          key: 'type',
          type: 'select',
          label: 'Type',
          options: toOptions(PARTNER_TYPE_VALUES, PARTNER_TYPES),
          allLabel: 'Tous les types',
        },
        {
          key: 'status',
          type: 'select',
          label: 'Statut',
          options: toOptions(PARTNER_STATUS_VALUES, PARTNER_STATUSES),
          allLabel: 'Tous les statuts',
        },
        {
          key: 'country',
          type: 'select',
          label: 'Pays',
          options: COUNTRIES.map((country) => ({ value: country, label: country })),
          allLabel: 'Tous les pays',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />
  </Card>
);

export default PartnerFilters;
