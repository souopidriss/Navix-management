/**
 * Navix Assignments — AssignmentFilters
 * --------------------------------------------------------------------------
 * Barre de filtres (Entreprise, Agence, Statut, Type, Période) + tri
 * (critère et sens) et bouton de réinitialisation. Le sélecteur d'agences
 * est restreint aux agences de l'entreprise sélectionnée.
 * Composant contrôlé connecté au store.
 *
 * Props :
 *   filters          : { companyId, agencyId, status, assignmentType, period }
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
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_VALUES,
  ASSIGNMENT_TYPES,
  ASSIGNMENT_TYPE_VALUES,
  PERIOD_OPTIONS,
  SORT_OPTIONS,
  SORT_DIRECTIONS,
} from '../constants';
import './AssignmentFilters.css';

const toOptions = (values, meta) => values.map((value) => ({ value, label: meta?.[value]?.label ?? value }));

const SelectField = ({ id, label, value, onChange, options, allLabel }) => (
  <div className="navix-assignment-filter__field">
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

const AssignmentFilters = ({
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
    <div className="navix-assignment-filter">
      <div className="navix-assignment-filter__fields">
        <SelectField
          id="assignment-filter-company"
          label="Entreprise"
          value={filters.companyId}
          onChange={(value) => onChange('companyId', value)}
          options={companies.map((company) => ({ value: company.id, label: company.name }))}
          allLabel="Toutes les entreprises"
        />
        <SelectField
          id="assignment-filter-agency"
          label="Agence"
          value={filters.agencyId}
          onChange={(value) => onChange('agencyId', value)}
          options={agencyOptions.map((agency) => ({ value: agency.id, label: agency.name }))}
          allLabel="Toutes les agences"
        />
        <SelectField
          id="assignment-filter-status"
          label="Statut"
          value={filters.status}
          onChange={(value) => onChange('status', value)}
          options={toOptions(ASSIGNMENT_STATUS_VALUES, ASSIGNMENT_STATUSES)}
          allLabel="Tous les statuts"
        />
        <SelectField
          id="assignment-filter-type"
          label="Type"
          value={filters.assignmentType}
          onChange={(value) => onChange('assignmentType', value)}
          options={toOptions(ASSIGNMENT_TYPE_VALUES, ASSIGNMENT_TYPES)}
          allLabel="Tous les types"
        />
        <SelectField
          id="assignment-filter-period"
          label="Période"
          value={filters.period}
          onChange={(value) => onChange('period', value)}
          options={PERIOD_OPTIONS.filter((option) => option.value)}
          allLabel="Toutes les périodes"
        />
        <SelectField
          id="assignment-sort-by"
          label="Trier par"
          value={sort.by}
          onChange={(value) => onSortChange(value, sort.direction)}
          options={SORT_OPTIONS}
          allLabel="Tri : Date de début"
        />
        <SelectField
          id="assignment-sort-direction"
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
};

export default AssignmentFilters;
