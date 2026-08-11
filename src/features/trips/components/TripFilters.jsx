/**
 * Navix Trips — TripFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Statut, Type, Période, Chauffeur, Véhicule)
 * construite sur le FilterBar générique de la bibliothèque core. Le tri se
 * fait désormais par en-tête du tableau (DataTable).
 *
 * Props :
 *   filters          : { companyId, status, tripType, period, driverId, vehicleId }
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
  TRIP_STATUSES,
  TRIP_STATUS_VALUES,
  TRIP_TYPES,
  TRIP_TYPE_VALUES,
  PERIOD_OPTIONS,
} from '../constants';
import './TripFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const TripFilters = ({ filters, companies = [], drivers = [], vehicles = [], onChange, onReset, hasActiveFilters }) => (
  <Card className="navix-trip-filters">
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
          options: toOptions(TRIP_STATUS_VALUES, TRIP_STATUSES),
          allLabel: 'Tous les statuts',
        },
        {
          key: 'tripType',
          type: 'select',
          label: 'Type',
          options: toOptions(TRIP_TYPE_VALUES, TRIP_TYPES),
          allLabel: 'Tous les types',
        },
        {
          key: 'period',
          type: 'select',
          label: 'Période',
          options: PERIOD_OPTIONS.filter((option) => option.value),
          allLabel: 'Toutes les périodes',
        },
        {
          key: 'driverId',
          type: 'select',
          label: 'Chauffeur',
          options: drivers.map((driver) => ({ value: driver.id, label: driver.fullName })),
          allLabel: 'Tous les chauffeurs',
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
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />
  </Card>
);

export default TripFilters;
