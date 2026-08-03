/**
 * Navix Vehicles — VehicleFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Groupe, Marque, Statut, Carburant,
 * Transmission, Année) + tri (critère et sens) et bouton de réinitialisation.
 * Composant contrôlé connecté au store.
 *
 * Props :
 *   filters          : { companyId, group, brand, status, fuelType, transmission, year }
 *   companies        : liste des entreprises (options du filtre Entreprise)
 *   brands           : liste des marques disponibles (dérivée des données)
 *   years            : liste des années disponibles (dérivée des données)
 *   sort             : { by, direction }
 *   onChange         : (key: string, value: string) => void
 *   onSortChange     : (by: string, direction: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Button } from '@/components/ui';
import {
  VEHICLE_GROUPS,
  VEHICLE_GROUP_VALUES,
  VEHICLE_STATUSES,
  VEHICLE_STATUS_VALUES,
  FUEL_TYPES,
  FUEL_TYPE_VALUES,
  TRANSMISSIONS,
  TRANSMISSION_VALUES,
  SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './VehicleFilters.css';

const toOptions = (values, labels) => values.map((value) => ({ value, label: labels?.[value] ?? value }));

const SelectField = ({ id, label, value, onChange, options, allLabel }) => (
  <div className="navix-vehicle-filter__field">
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

const VehicleFilters = ({
  filters,
  companies = [],
  brands = [],
  years = [],
  sort,
  onChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}) => (
  <div className="navix-vehicle-filter">
    <div className="navix-vehicle-filter__fields">
      <SelectField
        id="vehicle-filter-company"
        label="Entreprise"
        value={filters.companyId}
        onChange={(value) => onChange('companyId', value)}
        options={companies.map((company) => ({ value: company.id, label: company.name }))}
        allLabel="Toutes les entreprises"
      />
      <SelectField
        id="vehicle-filter-group"
        label="Groupe"
        value={filters.group}
        onChange={(value) => onChange('group', value)}
        options={VEHICLE_GROUP_VALUES.map((group) => ({
          value: group,
          label: `Groupe ${group} · ${VEHICLE_GROUPS[group].label}`,
        }))}
        allLabel="Tous les groupes"
      />
      <SelectField
        id="vehicle-filter-brand"
        label="Marque"
        value={filters.brand}
        onChange={(value) => onChange('brand', value)}
        options={brands.map((brand) => ({ value: brand, label: brand }))}
        allLabel="Toutes les marques"
      />
      <SelectField
        id="vehicle-filter-status"
        label="Statut"
        value={filters.status}
        onChange={(value) => onChange('status', value)}
        options={toOptions(VEHICLE_STATUS_VALUES, VEHICLE_STATUSES)}
        allLabel="Tous les statuts"
      />
      <SelectField
        id="vehicle-filter-fuel"
        label="Carburant"
        value={filters.fuelType}
        onChange={(value) => onChange('fuelType', value)}
        options={toOptions(FUEL_TYPE_VALUES, FUEL_TYPES)}
        allLabel="Tous les carburants"
      />
      <SelectField
        id="vehicle-filter-transmission"
        label="Transmission"
        value={filters.transmission}
        onChange={(value) => onChange('transmission', value)}
        options={toOptions(TRANSMISSION_VALUES, TRANSMISSIONS)}
        allLabel="Toutes les transmissions"
      />
      <SelectField
        id="vehicle-filter-year"
        label="Année"
        value={filters.year}
        onChange={(value) => onChange('year', value)}
        options={years.map((year) => ({ value: String(year), label: String(year) }))}
        allLabel="Toutes les années"
      />
      <SelectField
        id="vehicle-sort-by"
        label="Trier par"
        value={sort.by}
        onChange={(value) => onSortChange(value, sort.direction)}
        options={SORT_OPTIONS}
        allLabel="Tri : Nom"
      />
      <SelectField
        id="vehicle-sort-direction"
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

export default VehicleFilters;
