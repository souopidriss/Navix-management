/**
 * Navix Billing — InvoiceFilters
 * --------------------------------------------------------------------------
 * Barre de filtres des factures (Entreprise, Statut, Devise) + tri (critère
 * et sens) construite sur le FilterBar générique de Core UI. Les options de
 * tri proviennent des constantes du module.
 *
 * Props :
 *   filters          : { companyId, status, currency }
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
  INVOICE_STATUSES,
  INVOICE_STATUS_VALUES,
  CURRENCIES,
  CURRENCY_VALUES,
  INVOICE_SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './InvoiceFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta[value]?.label ?? value }));

const InvoiceFilters = ({
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
          options: toOptions(INVOICE_STATUS_VALUES, INVOICE_STATUSES),
          allLabel: 'Tous les statuts',
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

    <div className="navix-invoice-filter__sort">
      <FilterBar
        fields={[
          {
            key: 'by',
            type: 'select',
            label: 'Trier par',
            options: INVOICE_SORT_OPTIONS,
            allLabel: 'Tri : Émise le',
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

export default InvoiceFilters;
