/**
 * Navix Reports — ReportFilters
 * --------------------------------------------------------------------------
 * Panneau de filtres globaux d'un rapport : construit les champs déclaratifs
 * de la FilterBar Core à partir des options du service (entreprises, agences,
 * groupes de véhicules, véhicules, chauffeurs) et de champs optionnels
 * (statuts, champs spécifiques de la catégorie).
 *
 * Props :
 *   isOpen        : booléen — panneau visible
 *   filters       : état des filtres (reportFilterDefaultValues)
 *   onChange      : (key, value) => void
 *   onReset       : () => void
 *   activeCount   : nombre de filtres actifs (badge « Réinitialiser »)
 *   options       : { companies, agencies, vehicles, drivers } — options du service
 *   statusOptions : [{ value, label }] — statuts de la catégorie (optionnel)
 *   extraFields   : descripteurs FilterBar supplémentaires (optionnel)
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import { VEHICLE_GROUPS } from '@/features/vehicles/constants';
import './ReportComponents.css';

const vehicleGroupOptions = () =>
  Object.entries(VEHICLE_GROUPS).map(([value, meta]) => ({ value, label: meta.label }));

const ReportFilters = ({
  isOpen = false,
  filters = {},
  onChange,
  onReset,
  activeCount = 0,
  options = {},
  statusOptions,
  extraFields = [],
}) => {
  if (!isOpen) return null;

  const fields = [
    {
      key: 'companyId',
      type: 'select',
      label: 'Entreprise',
      options: options.companies || [],
      allLabel: 'Toutes les entreprises',
    },
    {
      key: 'agencyId',
      type: 'select',
      label: 'Agence',
      options: options.agencies || [],
      allLabel: 'Toutes les agences',
    },
    {
      key: 'vehicleGroup',
      type: 'select',
      label: 'Groupe de véhicules',
      options: vehicleGroupOptions(),
      allLabel: 'Tous les groupes',
    },
    {
      key: 'vehicleId',
      type: 'select',
      label: 'Véhicule',
      options: options.vehicles || [],
      allLabel: 'Tous les véhicules',
    },
    {
      key: 'driverId',
      type: 'select',
      label: 'Chauffeur',
      options: options.drivers || [],
      allLabel: 'Tous les chauffeurs',
    },
    ...(statusOptions?.length
      ? [{ key: 'status', type: 'select', label: 'Statut', options: statusOptions, allLabel: 'Tous les statuts' }]
      : []),
    ...extraFields,
  ];

  return (
    <Card title="Filtres du rapport" subtitle={`${activeCount} filtre${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''}`}>
      <FilterBar
        fields={fields}
        values={filters}
        onChange={onChange}
        onReset={onReset}
        hasActiveFilters={activeCount > 0}
      />
    </Card>
  );
};

export default ReportFilters;
