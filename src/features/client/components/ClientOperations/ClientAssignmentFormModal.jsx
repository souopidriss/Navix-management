import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  assignmentSchema,
  assignmentDefaultValues,
  toAssignmentFormValues,
  toAssignmentPayload,
} from '@/features/assignments/schemas';
import { ASSIGNMENT_TYPES, ASSIGNMENT_TYPE_VALUES } from '@/features/assignments/constants';
import { CLIENT_FLEET_COMPANY_ID } from '../../services/clientVehicleService';

const AGENCY_OPTIONS = [
  'Agence Douala',
  'Agence Yaoundé',
  'Agence Bafoussam',
  'Agence Garoua',
  'Agence Kribi',
  'Agence Ebolowa',
];

const TextField = ({ id, label, value, onChange, error, hint, placeholder, type = 'text', inputMode }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      className={error ? 'form-control is-invalid' : 'form-control'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
    />
    {error ? (
      <div className="invalid-feedback d-block" id={`${id}-error`}>
        {error}
      </div>
    ) : hint ? (
      <small className="form-text text-secondary" id={`${id}-hint`}>
        {hint}
      </small>
    ) : null}
  </div>
);

const SelectField = ({ id, label, value, onChange, options, placeholder = 'Sélectionner…', disabled, hint }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      className="form-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
    {hint && (
      <small className="form-text text-secondary" id={`${id}-hint`}>
        {hint}
      </small>
    )}
  </div>
);

const TextAreaField = ({ id, label, value, onChange, error, rows = 3, placeholder }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <textarea
      id={id}
      className={error ? 'form-control is-invalid' : 'form-control'}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
    />
    {error && (
      <div className="invalid-feedback d-block" id={`${id}-error`}>
        {error}
      </div>
    )}
  </div>
);

/**
 * Modale de création / modification d'une affectation véhicule ↔ chauffeur.
 * `activeVehicleIds` / `activeDriverIds` (affectations actives existantes)
 * et `busyDriverIds` (chauffeurs en service / en trajet) désactivent les
 * options inéligibles pour prévenir les conflits métier (409 côté service).
 */
const ClientAssignmentFormModal = ({
  open,
  onClose,
  assignment,
  vehicles,
  drivers,
  activeVehicleIds,
  activeDriverIds,
  busyDriverIds,
  onSubmit,
  loading,
  error,
}) => {
  const isEditing = Boolean(assignment);
  const editingId = assignment?.id ?? null;

  const defaults = isEditing
    ? { ...toAssignmentFormValues(assignment), companyId: CLIENT_FLEET_COMPANY_ID }
    : { ...assignmentDefaultValues, companyId: CLIENT_FLEET_COMPANY_ID };

  const form = useZodForm({
    schema: assignmentSchema,
    defaultValues: defaults,
    onSubmit: async (values) => {
      await onSubmit(toAssignmentPayload(values));
    },
  });

  const vehicleOptions = vehicles.map((vehicle) => {
    const isActive = activeVehicleIds.includes(vehicle.id) && vehicle.id !== editingId;
    return {
      value: vehicle.id,
      label: `${vehicle.brand} ${vehicle.model} · ${vehicle.registrationNumber}${isActive ? ' (déjà en affectation)' : ''}`,
      disabled: isActive,
    };
  });

  const driverOptions = drivers.map((driver) => {
    const isActive = activeDriverIds.includes(driver.id) && driver.id !== editingId;
    const isBusy = busyDriverIds.includes(driver.id);
    return {
      value: driver.id,
      label: `${driver.fullName}${isActive ? ' (déjà en affectation)' : isBusy ? ' (occupé)' : ''}`,
      disabled: isActive || isBusy,
    };
  });

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier l’affectation' : 'Créer une affectation'}
      subtitle={isEditing ? assignment?.assignmentNumber : 'Affectez un véhicule à un chauffeur.'}
      icon="bi-link-45deg"
      size="lg"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel={isEditing ? 'Enregistrer les modifications' : 'Créer l’affectation'}
    >
      <div className="row g-3">
        <div className="col-12">
          <Divider>Affectation</Divider>
        </div>
        <div className="col-12">
          <SelectField
            id="client-assignment-vehicle"
            label="Véhicule"
            value={form.values.vehicleId}
            onChange={(value) => form.setField('vehicleId', value)}
            options={vehicleOptions}
            error={form.errors.vehicleId}
            placeholder="Sélectionner un véhicule disponible…"
            hint="Les véhicules déjà en affectation active sont désactivés."
          />
        </div>
        <div className="col-12">
          <SelectField
            id="client-assignment-driver"
            label="Chauffeur"
            value={form.values.driverId}
            onChange={(value) => form.setField('driverId', value)}
            options={driverOptions}
            error={form.errors.driverId}
            placeholder="Sélectionner un chauffeur disponible…"
            hint="Les chauffeurs en affectation ou occupés (en service / en trajet) sont désactivés."
          />
        </div>

        <div className="col-12 col-md-6">
          <SelectField
            id="client-assignment-type"
            label="Type d’affectation"
            value={form.values.assignmentType}
            onChange={(value) => form.setField('assignmentType', value)}
            options={ASSIGNMENT_TYPE_VALUES.map((type) => ({
              value: type,
              label: ASSIGNMENT_TYPES[type].label,
            }))}
            placeholder="Sélectionner un type…"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-assignment-agency"
            label="Agence"
            value={form.values.agencyId}
            onChange={(value) => form.setField('agencyId', value)}
            options={AGENCY_OPTIONS.map((agency) => ({ value: agency, label: agency }))}
            placeholder="Sélectionner une agence…"
          />
        </div>

        <div className="col-12 col-md-6">
          <TextField
            id="client-assignment-start-date"
            label="Date de début"
            type="date"
            value={form.values.startDate}
            onChange={(value) => form.setField('startDate', value)}
            error={form.errors.startDate}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-assignment-end-date"
            label="Date de fin prévue"
            type="date"
            value={form.values.expectedEndDate}
            onChange={(value) => form.setField('expectedEndDate', value)}
            error={form.errors.expectedEndDate}
          />
        </div>

        <div className="col-12 col-md-6">
          <TextField
            id="client-assignment-start-mileage"
            label="Kilométrage de départ"
            type="number"
            inputMode="numeric"
            value={form.values.startMileage}
            onChange={(value) => form.setField('startMileage', value)}
            error={form.errors.startMileage}
            hint="En kilomètres."
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-assignment-fuel-start"
            label="Niveau de carburant (%)"
            type="number"
            inputMode="numeric"
            value={form.values.fuelLevelStart}
            onChange={(value) => form.setField('fuelLevelStart', value)}
            error={form.errors.fuelLevelStart}
            placeholder="0 – 100"
          />
        </div>

        <div className="col-12">
          <Divider>Justification</Divider>
        </div>
        <div className="col-12">
          <TextAreaField
            id="client-assignment-reason"
            label="Motif"
            value={form.values.reason}
            onChange={(value) => form.setField('reason', value)}
            error={form.errors.reason}
            rows={3}
            placeholder="Raison de l’affectation (mission, navette, remplacement…)."
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientAssignmentFormModal;
