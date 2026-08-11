/**
 * Navix Assignments — AssignmentFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Agence, Statut, Type, Période) construite
 * sur le FilterBar générique de la bibliothèque core. Le sélecteur d'agences
 * est restreint aux agences de l'entreprise sélectionnée. Le tri se fait
 * désormais par en-tête du tableau (DataTable).
 *
 * Props :
 *   filters          : { companyId, agencyId, status, assignmentType, period }
 *   companies        : liste des entreprises (options du filtre Entreprise)
 *   agencies         : liste des agences (restreintes par entreprise)
 *   onChange         : (key: string, value: string) => void
 *   onReset          : () => void
 *   hasActiveFilters : booléen — affiche le bouton « Réinitialiser »
 */
import { Card } from '@/components/ui';
import { FilterBar } from '@/components/core';
import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_VALUES,
  ASSIGNMENT_TYPES,
  ASSIGNMENT_TYPE_VALUES,
  PERIOD_OPTIONS,
} from '../constants';
import './AssignmentFilters.css';

const toOptions = (values, meta) =>
  values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const AssignmentFilters = ({ filters, companies = [], agencies = [], onChange, onReset, hasActiveFilters }) => {
  const agencyOptions = agencies.filter(
    (agency) => !filters.companyId || agency.companyId === filters.companyId,
  );

  return (
    <Card className="navix-assignment-filters">
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
            key: 'status',
            type: 'select',
            label: 'Statut',
            options: toOptions(ASSIGNMENT_STATUS_VALUES, ASSIGNMENT_STATUSES),
            allLabel: 'Tous les statuts',
          },
          {
            key: 'assignmentType',
            type: 'select',
            label: 'Type',
            options: toOptions(ASSIGNMENT_TYPE_VALUES, ASSIGNMENT_TYPES),
            allLabel: 'Tous les types',
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
};

export default AssignmentFilters;
