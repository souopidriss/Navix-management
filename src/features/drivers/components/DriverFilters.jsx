/**
 * Navix Drivers — DriverFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Agence, Disponibilité, Statut, Catégorie de
 * permis) + tri (critère et sens) et bouton de réinitialisation. Le sélecteur
 * d'agences est restreint aux agences de l'entreprise sélectionnée.
 * Composant contrôlé connecté au store.
 *
 * Props :
 *   filters          : { companyId, agencyId, availability, status, licenseCategory }
 *   companies        : liste des entreprises (options du filtre Entreprise)
 *   agencies         : liste des agences (restreintes par entreprise)
 *   sort             : { by, direction }
 *   onChange         : (key: string, value: string) => void
 *   onSortChange     : (by: string, direction: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Button } from '@/components/ui';
import {
  DRIVER_STATUSES,
  DRIVER_STATUS_VALUES,
  DRIVER_AVAILABILITY,
  DRIVER_AVAILABILITY_VALUES,
  LICENSE_CATEGORIES,
  LICENSE_CATEGORY_VALUES,
  SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './DriverFilters.css';

const toOptions = (values, labels) => values.map((value) => ({ value, label: labels?.[value] ?? value }));

const SelectField = ({ id, label, value, onChange, options, allLabel }) => (
  <div className="navix-driver-filter__field">
    <label htmlFor={id} className="visually-hidden">
      {label}
    </label>
    <select id={id} className="form-select" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const DriverFilters = ({
  filters,
  companies = [],
  agencies = [],
  sort,
  onChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}) => {
  const agencyOptions = agencies.filter(
    (agency) => !filters.companyId || agency.companyId === filters.companyId,
  );

  return (
    <div className="navix-driver-filter">
      <div className="navix-driver-filter__fields">
        <SelectField
          id="driver-filter-company"
          label="Entreprise"
          value={filters.companyId}
          onChange={(value) => onChange('companyId', value)}
          options={companies.map((company) => ({ value: company.id, label: company.name }))}
          allLabel="Toutes les entreprises"
        />
        <SelectField
          id="driver-filter-agency"
          label="Agence"
          value={filters.agencyId}
          onChange={(value) => onChange('agencyId', value)}
          options={agencyOptions.map((agency) => ({ value: agency.id, label: agency.name }))}
          allLabel="Toutes les agences"
        />
        <SelectField
          id="driver-filter-availability"
          label="Disponibilité"
          value={filters.availability}
          onChange={(value) => onChange('availability', value)}
          options={toOptions(DRIVER_AVAILABILITY_VALUES, DRIVER_AVAILABILITY)}
          allLabel="Toutes les disponibilités"
        />
        <SelectField
          id="driver-filter-status"
          label="Statut"
          value={filters.status}
          onChange={(value) => onChange('status', value)}
          options={toOptions(DRIVER_STATUS_VALUES, DRIVER_STATUSES)}
          allLabel="Tous les statuts"
        />
        <SelectField
          id="driver-filter-license"
          label="Catégorie de permis"
          value={filters.licenseCategory}
          onChange={(value) => onChange('licenseCategory', value)}
          options={LICENSE_CATEGORY_VALUES.map((category) => ({
            value: category,
            label: LICENSE_CATEGORIES[category].label,
          }))}
          allLabel="Toutes les catégories"
        />
        <SelectField
          id="driver-sort-by"
          label="Trier par"
          value={sort.by}
          onChange={(value) => onSortChange(value, sort.direction)}
          options={SORT_OPTIONS}
          allLabel="Tri : Nom"
        />
        <SelectField
          id="driver-sort-direction"
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
};

export default DriverFilters;
