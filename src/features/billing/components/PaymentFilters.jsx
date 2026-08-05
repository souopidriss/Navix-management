/**
 * Navix Billing — PaymentFilters
 * --------------------------------------------------------------------------
 * Barre de filtres des paiements (Entreprise, Statut, Moyen, Devise) + tri
 * construite sur le FilterBar générique de Core UI.
 *
 * Props :
 *   filters          : { companyId, status, method, currency }
 *   companies        : liste des sociétés
 *   sort             : { by, direction }
 *   onChange         : (key: string, value: string) => void
 *   onSortChange     : (by: string, direction: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_VALUES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_VALUES,
  CURRENCIES,
  CURRENCY_VALUES,
  PAYMENT_SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './PaymentFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const PaymentFilters = ({
  filters,
  companies = [],
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
          options: toOptions(PAYMENT_STATUS_VALUES, PAYMENT_STATUSES),
          allLabel: 'Tous les statuts',
        },
        {
          key: 'method',
          type: 'select',
          label: 'Moyen de paiement',
          options: toOptions(PAYMENT_METHOD_VALUES, PAYMENT_METHODS),
          allLabel: 'Tous les moyens',
        },
        {
          key: 'currency',
          type: 'select',
          label: 'Devise',
          options: toOptions(CURRENCY_VALUES, CURRENCIES),
          allLabel: 'Toutes les devises',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />

    <div className="navix-payment-filter__sort">
      <FilterBar
        fields={[
          {
            key: 'by',
            type: 'select',
            label: 'Trier par',
            options: PAYMENT_SORT_OPTIONS,
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

export default PaymentFilters;
