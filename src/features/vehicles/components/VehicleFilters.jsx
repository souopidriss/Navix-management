/**
 * Navix Vehicles — VehicleFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Groupe, Marque, Statut, Carburant,
 * Transmission, Année) construite sur le FilterBar générique de la
 * bibliothèque core. Le tri se fait désormais par en-tête du tableau
 * (DataTable).
 *
 * Props :
 *   filters          : { companyId, group, brand, status, fuelType, transmission, year }
 *   companies        : liste des entreprises (options du filtre Entreprise)
 *   brands           : liste des marques disponibles (dérivée des données)
 *   years            : liste des années disponibles (dérivée des données)
 *   onChange         : (key: string, value: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  VEHICLE_GROUPS,
  VEHICLE_GROUP_VALUES,
  VEHICLE_STATUSES,
  VEHICLE_STATUS_VALUES,
  FUEL_TYPES,
  FUEL_TYPE_VALUES,
  TRANSMISSIONS,
  TRANSMISSION_VALUES,
} from '../constants';
import './VehicleFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const VehicleFilters = ({ filters, companies = [], brands = [], years = [], onChange, onReset, hasActiveFilters }) => (
  <Card className="navix-vehicle-filters">
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
          key: 'group',
          type: 'select',
          label: 'Groupe',
          options: VEHICLE_GROUP_VALUES.map((group) => ({
            value: group,
            label: `Groupe ${group} · ${VEHICLE_GROUPS[group].label}`,
          })),
          allLabel: 'Tous les groupes',
        },
        {
          key: 'brand',
          type: 'select',
          label: 'Marque',
          options: brands.map((brand) => ({ value: brand, label: brand })),
          allLabel: 'Toutes les marques',
        },
        {
          key: 'status',
          type: 'select',
          label: 'Statut',
          options: toOptions(VEHICLE_STATUS_VALUES, VEHICLE_STATUSES),
          allLabel: 'Tous les statuts',
        },
        {
          key: 'fuelType',
          type: 'select',
          label: 'Carburant',
          options: toOptions(FUEL_TYPE_VALUES, FUEL_TYPES),
          allLabel: 'Tous les carburants',
        },
        {
          key: 'transmission',
          type: 'select',
          label: 'Transmission',
          options: toOptions(TRANSMISSION_VALUES, TRANSMISSIONS),
          allLabel: 'Toutes les transmissions',
        },
        {
          key: 'year',
          type: 'select',
          label: 'Année',
          options: years.map((year) => ({ value: String(year), label: String(year) })),
          allLabel: 'Toutes les années',
        },
      ]}
      values={filters}
      onChange={onChange}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    />
  </Card>
);

export default VehicleFilters;
