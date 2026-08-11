/**
 * Navix Companies — CompanyFilter
 * --------------------------------------------------------------------------
 * Barre de filtres (Pays, Statut, Plan, Ville) construite sur le FilterBar
 * générique de la bibliothèque core. Le tri se fait désormais par en-tête du
 * tableau (DataTable).
 *
 * Props :
 *   filters         : { country, status, plan, city }
 *   cities          : liste des villes disponibles (dérivée des données)
 *   onChange        : (key: string, value: string) => void
 *   onReset         : () => void
 *   hasActiveFilters: booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  COUNTRIES,
  COMPANY_STATUSES,
  COMPANY_STATUS_VALUES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLAN_VALUES,
} from '../constants';
import './CompanyFilter.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const CompanyFilter = ({ filters, cities = [], onChange, onReset, hasActiveFilters }) => (
  <Card className="navix-company-filters">
    <FilterBar
      fields={[
        {
          key: 'country',
          type: 'select',
          label: 'Pays',
          options: COUNTRIES.map((country) => ({ value: country, label: country })),
          allLabel: 'Tous les pays',
        },
        {
          key: 'status',
          type: 'select',
          label: 'Statut',
          options: toOptions(COMPANY_STATUS_VALUES, COMPANY_STATUSES),
          allLabel: 'Tous les statuts',
        },
        {
          key: 'plan',
          type: 'select',
          label: 'Plan d’abonnement',
          options: toOptions(SUBSCRIPTION_PLAN_VALUES, SUBSCRIPTION_PLANS),
          allLabel: 'Tous les plans',
        },
        {
          key: 'city',
          type: 'select',
          label: 'Ville',
          options: cities.map((city) => ({ value: city, label: city })),
          allLabel: 'Toutes les villes',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />
  </Card>
);

export default CompanyFilter;
