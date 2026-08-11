/**
 * Navix Drivers — DriverFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Agence, Disponibilité, Statut, Catégorie de
 * permis) construite sur le FilterBar générique de la bibliothèque core.
 * Le sélecteur d'agences est restreint aux agences de l'entreprise
 * sélectionnée. Le tri se fait désormais par en-tête du tableau (DataTable).
 *
 * Props :
 *   filters          : { companyId, agencyId, availability, status, licenseCategory }
 *   companies        : liste des entreprises (options du filtre Entreprise)
 *   agencies         : liste des agences (restreintes par entreprise)
 *   onChange         : (key: string, value: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  DRIVER_STATUSES,
  DRIVER_STATUS_VALUES,
  DRIVER_AVAILABILITY,
  DRIVER_AVAILABILITY_VALUES,
  LICENSE_CATEGORIES,
  LICENSE_CATEGORY_VALUES,
} from '../constants';
import './DriverFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const DriverFilters = ({ filters, companies = [], agencies = [], onChange, onReset, hasActiveFilters }) => {
  const agencyOptions = agencies.filter(
    (agency) => !filters.companyId || agency.companyId === filters.companyId,
  );

  return (
    <Card className="navix-driver-filters">
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
            key: 'agencyId',
            type: 'select',
            label: 'Agence',
            options: agencyOptions.map((agency) => ({ value: agency.id, label: agency.name })),
            allLabel: 'Toutes les agences',
          },
          {
            key: 'availability',
            type: 'select',
            label: 'Disponibilité',
            options: toOptions(DRIVER_AVAILABILITY_VALUES, DRIVER_AVAILABILITY),
            allLabel: 'Toutes les disponibilités',
          },
          {
            key: 'status',
            type: 'select',
            label: 'Statut',
            options: toOptions(DRIVER_STATUS_VALUES, DRIVER_STATUSES),
            allLabel: 'Tous les statuts',
          },
          {
            key: 'licenseCategory',
            type: 'select',
            label: 'Catégorie de permis',
            options: LICENSE_CATEGORY_VALUES.map((category) => ({
              value: category,
              label: LICENSE_CATEGORIES[category].label,
            })),
            allLabel: 'Toutes les catégories',
          },
        ]}
        values={filters}
        onChange={onChange}
        onReset={onReset}
        hasActiveFilters={hasActiveFilters}
      />
    </Card>
  );
};

export default DriverFilters;
