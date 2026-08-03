/**
 * Navix Fuel — FuelFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Véhicule, Chauffeur, Type, Station, Période,
 * Statut) construite sur le FilterBar générique de la bibliothèque core.
 * Le tri se fait désormais par en-tête du tableau (DataTable).
 *
 * Props :
 *   filters          : { companyId, vehicleId, driverId, fuelType, stationName, period, status }
 *   companies        : liste des entreprises (options du filtre Entreprise)
 *   drivers          : liste des chauffeurs
 *   vehicles         : liste des véhicules
 *   onChange         : (key: string, value: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  FUEL_STATUSES,
  FUEL_STATUS_VALUES,
  FUEL_TYPES,
  FUEL_TYPE_VALUES,
  PERIOD_OPTIONS,
} from '../constants';
import './FuelFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const FuelFilters = ({
  filters,
  companies = [],
  drivers = [],
  vehicles = [],
  onChange,
  onReset,
  hasActiveFilters,
}) => (
  <Card className="navix-fuel-filters">
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
          key: 'vehicleId',
          type: 'select',
          label: 'Véhicule',
          options: vehicles.map((vehicle) => ({
            value: vehicle.id,
            label: vehicle.registrationNumber || `${vehicle.brand} ${vehicle.model}`.trim(),
          })),
          allLabel: 'Tous les véhicules',
        },
        {
          key: 'driverId',
          type: 'select',
          label: 'Chauffeur',
          options: drivers.map((driver) => ({ value: driver.id, label: driver.fullName })),
          allLabel: 'Tous les chauffeurs',
        },
        {
          key: 'fuelType',
          type: 'select',
          label: 'Type',
          options: toOptions(FUEL_TYPE_VALUES, FUEL_TYPES),
          allLabel: 'Tous les types',
        },
        {
          key: 'stationName',
          type: 'text',
          label: 'Station',
          placeholder: 'Station…',
        },
        {
          key: 'period',
          type: 'select',
          label: 'Période',
          options: PERIOD_OPTIONS.filter((option) => option.value),
          allLabel: 'Toutes les périodes',
        },
        {
          key: 'status',
          type: 'select',
          label: 'Statut',
          options: toOptions(FUEL_STATUS_VALUES, FUEL_STATUSES),
          allLabel: 'Tous les statuts',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />
  </Card>
);

export default FuelFilters;
