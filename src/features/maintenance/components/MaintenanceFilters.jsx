/**
 * Navix Maintenance — MaintenanceFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Véhicule, Type, Priorité, Statut, Période)
 * construite sur le FilterBar générique de la bibliothèque core. Le tri se
 * fait par en-tête du tableau (DataTable).
 *
 * Props :
 *   filters          : { companyId, vehicleId, maintenanceType, priority, status, period }
 *   companies        : liste des entreprises (options du filtre Entreprise)
 *   vehicles         : liste des véhicules
 *   onChange         : (key: string, value: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_TYPE_VALUES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_PRIORITY_VALUES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_STATUS_VALUES,
  PERIOD_OPTIONS,
} from '../constants';
import './MaintenanceFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const MaintenanceFilters = ({
  filters,
  companies = [],
  vehicles = [],
  onChange,
  onReset,
  hasActiveFilters,
}) => (
  <Card className="navix-maint-filters">
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
          key: 'maintenanceType',
          type: 'select',
          label: 'Type',
          options: toOptions(MAINTENANCE_TYPE_VALUES, MAINTENANCE_TYPES),
          allLabel: 'Tous les types',
        },
        {
          key: 'priority',
          type: 'select',
          label: 'Priorité',
          options: toOptions(MAINTENANCE_PRIORITY_VALUES, MAINTENANCE_PRIORITIES),
          allLabel: 'Toutes les priorités',
        },
        {
          key: 'status',
          type: 'select',
          label: 'Statut',
          options: toOptions(MAINTENANCE_STATUS_VALUES, MAINTENANCE_STATUSES),
          allLabel: 'Tous les statuts',
        },
        {
          key: 'period',
          type: 'select',
          label: 'Période',
          options: PERIOD_OPTIONS.filter((option) => option.value),
          allLabel: 'Toutes les périodes',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />
  </Card>
);

export default MaintenanceFilters;
