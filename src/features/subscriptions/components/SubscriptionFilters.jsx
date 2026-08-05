/**
 * Navix Subscriptions — SubscriptionFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Statut, Plan, Facturation) + tri (critère et
 * sens) construite sur le FilterBar générique de la bibliothèque core. Les
 * options de tri sont les SORT_OPTIONS métier.
 *
 * Props :
 *   filters          : { companyId, status, planId, billingInterval }
 *   companies        : liste des sociétés (options du filtre Entreprise)
 *   plans            : liste des plans (options du filtre Plan)
 *   sort             : { by, direction }
 *   onChange         : (key: string, value: string) => void
 *   onSortChange     : (by: string, direction: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_STATUS_VALUES,
  BILLING_INTERVALS,
  BILLING_INTERVAL_VALUES,
  SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './SubscriptionFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const SubscriptionFilters = ({
  filters,
  companies = [],
  plans = [],
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
          label: 'Entreprise',
          options: companies.map((company) => ({ value: company.id, label: company.name })),
          allLabel: 'Toutes les entreprises',
        },
        {
          key: 'status',
          type: 'select',
          label: 'Statut',
          options: toOptions(SUBSCRIPTION_STATUS_VALUES, SUBSCRIPTION_STATUSES),
          allLabel: 'Tous les statuts',
        },
        {
          key: 'planId',
          type: 'select',
          label: 'Plan',
          options: plans.map((plan) => ({ value: plan.id, label: plan.name })),
          allLabel: 'Tous les plans',
        },
        {
          key: 'billingInterval',
          type: 'select',
          label: 'Facturation',
          options: toOptions(BILLING_INTERVAL_VALUES, BILLING_INTERVALS),
          allLabel: 'Toutes les facturations',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />

    <div className="navix-subscription-filter__sort">
      <FilterBar
        fields={[
          {
            key: 'by',
            type: 'select',
            label: 'Trier par',
            options: SORT_OPTIONS,
            allLabel: 'Tri : Entreprise',
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

export default SubscriptionFilters;
