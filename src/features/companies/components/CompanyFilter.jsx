/**
 * Navix Companies — CompanyFilter
 * --------------------------------------------------------------------------
 * Barre de filtres (Pays, Statut, Plan, Ville) + tri (critère et sens) et
 * bouton de réinitialisation. Composant contrôlé connecté au store.
 *
 * Props :
 *   filters         : { country, status, plan, city }
 *   cities          : liste des villes disponibles (dérivée des données)
 *   sort            : { by, direction }
 *   onChange        : (key: string, value: string) => void
 *   onSortChange    : (by: string, direction: string) => void
 *   onReset         : () => void
 *   hasActiveFilters: booléen — affiche le bouton « Réinitialiser »
 */
import { Button } from '@/components/ui';
import {
  COUNTRIES,
  COMPANY_STATUSES,
  COMPANY_STATUS_VALUES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLAN_VALUES,
  SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './CompanyFilter.css';

const toOptions = (values, labels) => values.map((value) => ({ value, label: labels?.[value] ?? value }));

const SelectField = ({ id, label, value, onChange, options, allLabel }) => (
  <div className="navix-company-filter__field">
    <label htmlFor={id} className="visually-hidden">
      {label}
    </label>
    <div className="input-group">
      <select id={id} className="form-select" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const CompanyFilter = ({ filters, cities = [], sort, onChange, onSortChange, onReset, hasActiveFilters }) => (
  <div className="navix-company-filter">
    <div className="navix-company-filter__fields">
      <SelectField
        id="company-filter-country"
        label="Pays"
        value={filters.country}
        onChange={(value) => onChange('country', value)}
        options={COUNTRIES.map((country) => ({ value: country, label: country }))}
        allLabel="Tous les pays"
      />
      <SelectField
        id="company-filter-status"
        label="Statut"
        value={filters.status}
        onChange={(value) => onChange('status', value)}
        options={toOptions(COMPANY_STATUS_VALUES, COMPANY_STATUSES)}
        allLabel="Tous les statuts"
      />
      <SelectField
        id="company-filter-plan"
        label="Plan d'abonnement"
        value={filters.plan}
        onChange={(value) => onChange('plan', value)}
        options={toOptions(SUBSCRIPTION_PLAN_VALUES, SUBSCRIPTION_PLANS)}
        allLabel="Tous les plans"
      />
      <SelectField
        id="company-filter-city"
        label="Ville"
        value={filters.city}
        onChange={(value) => onChange('city', value)}
        options={cities.map((city) => ({ value: city, label: city }))}
        allLabel="Toutes les villes"
      />
      <SelectField
        id="company-sort-by"
        label="Trier par"
        value={sort.by}
        onChange={(value) => onSortChange(value, sort.direction)}
        options={SORT_OPTIONS}
        allLabel="Tri : Nom"
      />
      <SelectField
        id="company-sort-direction"
        label="Sens du tri"
        value={sort.direction}
        onChange={(value) => onSortChange(sort.by, value)}
        options={SORT_DIRECTIONS}
        allLabel="Ordre : Croissant"
      />
    </div>

    {hasActiveFilters && (
      <Button variant="ghost" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
        Réinitialiser
      </Button>
    )}
  </div>
);

export default CompanyFilter;
