/**
 * Navix Fuel — FuelFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Véhicule, Chauffeur, Type, Station, Période,
 * Statut) + tri (critère et sens) et bouton de réinitialisation.
 * Composant contrôlé connecté au store.
 *
 * Props :
 *   filters          : { companyId, vehicleId, driverId, fuelType, stationName, period, status }
 *   companies        : liste des entreprises (options du filtre Entreprise)
 *   drivers          : liste des chauffeurs
 *   vehicles         : liste des véhicules
 *   sort             : { by, direction }
 *   onChange         : (key: string, value: string) => void
 *   onSortChange     : (by: string, direction: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Button } from '@/components/ui';
import {
  FUEL_STATUSES,
  FUEL_STATUS_VALUES,
  FUEL_TYPES,
  FUEL_TYPE_VALUES,
  PERIOD_OPTIONS,
  SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './FuelFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const SelectField = ({ id, label, value, onChange, options, allLabel }) => (
  <div className="navix-fuel-filter__field">
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

const FuelFilters = ({
  filters,
  companies = [],
  drivers = [],
  vehicles = [],
  sort,
  onChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}) => (
  <div className="navix-fuel-filter">
    <div className="navix-fuel-filter__fields">
      <SelectField
        id="fuel-filter-company"
        label="Entreprise"
        value={filters.companyId}
        onChange={(value) => onChange('companyId', value)}
        options={companies.map((company) => ({ value: company.id, label: company.name }))}
        allLabel="Toutes les entreprises"
      />
      <SelectField
        id="fuel-filter-vehicle"
        label="Véhicule"
        value={filters.vehicleId}
        onChange={(value) => onChange('vehicleId', value)}
        options={vehicles.map((vehicle) => ({
          value: vehicle.id,
          label: vehicle.registrationNumber || `${vehicle.brand} ${vehicle.model}`.trim(),
        }))}
        allLabel="Tous les véhicules"
      />
      <SelectField
        id="fuel-filter-driver"
        label="Chauffeur"
        value={filters.driverId}
        onChange={(value) => onChange('driverId', value)}
        options={drivers.map((driver) => ({ value: driver.id, label: driver.fullName }))}
        allLabel="Tous les chauffeurs"
      />
      <SelectField
        id="fuel-filter-type"
        label="Type"
        value={filters.fuelType}
        onChange={(value) => onChange('fuelType', value)}
        options={toOptions(FUEL_TYPE_VALUES, FUEL_TYPES)}
        allLabel="Tous les types"
      />
      <div className="navix-fuel-filter__field">
        <label htmlFor="fuel-filter-station" className="visually-hidden">
          Station
        </label>
        <input
          id="fuel-filter-station"
          type="text"
          className="form-control"
          placeholder="Station…"
          value={filters.stationName}
          onChange={(event) => onChange('stationName', event.target.value)}
          autoComplete="off"
        />
      </div>
      <SelectField
        id="fuel-filter-period"
        label="Période"
        value={filters.period}
        onChange={(value) => onChange('period', value)}
        options={PERIOD_OPTIONS.filter((option) => option.value)}
        allLabel="Toutes les périodes"
      />
      <SelectField
        id="fuel-filter-status"
        label="Statut"
        value={filters.status}
        onChange={(value) => onChange('status', value)}
        options={toOptions(FUEL_STATUS_VALUES, FUEL_STATUSES)}
        allLabel="Tous les statuts"
      />
      <SelectField
        id="fuel-sort-by"
        label="Trier par"
        value={sort.by}
        onChange={(value) => onSortChange(value, sort.direction)}
        options={SORT_OPTIONS}
        allLabel="Tri : Date"
      />
      <SelectField
        id="fuel-sort-direction"
        label="Sens du tri"
        value={sort.direction}
        onChange={(value) => onSortChange(sort.by, value)}
        options={SORT_DIRECTIONS}
        allLabel="Ordre : Décroissant"
      />
    </div>

    {hasActiveFilters && (
      <Button variant="ghost" size="sm" icon="bi-arrow-counterclockwise" onClick={onReset}>
        Réinitialiser
      </Button>
    )}
  </div>
);

export default FuelFilters;
