import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  maintenanceSchema,
  maintenanceDefaultValues,
  toMaintenanceFormValues,
  toMaintenancePayload,
} from '@/features/maintenance/schemas';
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_TYPE_VALUES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_PRIORITY_VALUES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_STATUS_VALUES,
} from '@/features/maintenance/constants';
import { CLIENT_FLEET_COMPANY_ID } from '../../services/clientVehicleService';

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

const SelectField = ({ id, label, value, onChange, options, placeholder = 'Sélectionner…', disabled, hint, error }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      className={error ? 'form-select is-invalid' : 'form-select'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
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
    {error ? (
      <div className="invalid-feedback d-block">{error}</div>
    ) : hint ? (
      <small className="form-text text-secondary">{hint}</small>
    ) : null}
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
 * Modale de création / modification d'un entretien de la flotte Client.
 * Réutilise le schéma métier maintenance (Zod) ; l'entreprise est
 * pré-remplie avec l'entreprise propriétaire de la flotte Client.
 */
const ClientMaintenanceFormModal = ({ open, onClose, maintenance, vehicles, onSubmit, loading, error }) => {
  const isEditing = Boolean(maintenance);

  const defaults = isEditing
    ? { ...toMaintenanceFormValues(maintenance), companyId: CLIENT_FLEET_COMPANY_ID }
    : { ...maintenanceDefaultValues, companyId: CLIENT_FLEET_COMPANY_ID };

  const form = useZodForm({
    schema: maintenanceSchema,
    defaultValues: defaults,
    onSubmit: async (values) => {
      await onSubmit(toMaintenancePayload(values));
    },
  });

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.id,
    label: `${vehicle.brand} ${vehicle.model} · ${vehicle.registrationNumber}${vehicle.operationalStatus === 'maintenance' ? ' (en maintenance)' : ''}`,
    disabled: vehicle.operationalStatus === 'maintenance' && !isEditing,
  }));

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier l’entretien' : 'Planifier un entretien'}
      subtitle={isEditing ? maintenance?.maintenanceNumber : 'Planifiez une intervention sur votre flotte.'}
      icon="bi-wrench-adjustable"
      size="xl"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel={isEditing ? 'Enregistrer les modifications' : 'Planifier l’entretien'}
    >
      <div className="row g-3">
        <div className="col-12">
          <Divider>Intervention</Divider>
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-maint-vehicle"
            label="Véhicule"
            value={form.values.vehicleId}
            onChange={(value) => form.setField('vehicleId', value)}
            options={vehicleOptions}
            error={form.errors.vehicleId}
            placeholder="Sélectionner un véhicule…"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-maint-type"
            label="Type d’entretien"
            value={form.values.maintenanceType}
            onChange={(value) => form.setField('maintenanceType', value)}
            options={MAINTENANCE_TYPE_VALUES.map((type) => ({ value: type, label: MAINTENANCE_TYPES[type].label }))}
            error={form.errors.maintenanceType}
            placeholder="Sélectionner un type…"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-maint-priority"
            label="Priorité"
            value={form.values.priority}
            onChange={(value) => form.setField('priority', value)}
            options={MAINTENANCE_PRIORITY_VALUES.map((priority) => ({ value: priority, label: MAINTENANCE_PRIORITIES[priority].label }))}
            error={form.errors.priority}
            placeholder="Sélectionner une priorité…"
          />
        </div>
        <div className="col-12 col-md-6">
          <SelectField
            id="client-maint-status"
            label="Statut"
            value={form.values.status}
            onChange={(value) => form.setField('status', value)}
            options={MAINTENANCE_STATUS_VALUES.map((status) => ({ value: status, label: MAINTENANCE_STATUSES[status].label }))}
            error={form.errors.status}
            placeholder="Sélectionner un statut…"
            disabled={isEditing}
          />
        </div>

        <div className="col-12">
          <Divider>Planning</Divider>
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-maint-scheduled-date"
            label="Date prévue"
            type="date"
            value={form.values.scheduledDate}
            onChange={(value) => form.setField('scheduledDate', value)}
            error={form.errors.scheduledDate}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-maint-workshop"
            label="Atelier / Garage"
            value={form.values.workshop}
            onChange={(value) => form.setField('workshop', value)}
            placeholder="Ex. Garage Auto Douala"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-maint-mechanic"
            label="Mécanicien"
            value={form.values.mechanic}
            onChange={(value) => form.setField('mechanic', value)}
            placeholder="Ex. Patrick Ekollo"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-maint-supplier"
            label="Fournisseur"
            value={form.values.supplier}
            onChange={(value) => form.setField('supplier', value)}
            placeholder="Ex. Fournitures Auto Cameroun"
          />
        </div>

        <div className="col-12">
          <Divider>Kilométrage & coûts (FCFA)</Divider>
        </div>
        <div className="col-12 col-md-4">
          <TextField
            id="client-maint-mileage"
            label="Kilométrage actuel"
            type="number"
            inputMode="numeric"
            value={form.values.mileage}
            onChange={(value) => form.setField('mileage', value)}
            error={form.errors.mileage}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-4">
          <TextField
            id="client-maint-next-mileage"
            label="Prochain kilométrage"
            type="number"
            inputMode="numeric"
            value={form.values.nextMileage}
            onChange={(value) => form.setField('nextMileage', value)}
            error={form.errors.nextMileage}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-4">
          <TextField
            id="client-maint-next-date"
            label="Prochaine date"
            type="date"
            value={form.values.nextMaintenanceDate}
            onChange={(value) => form.setField('nextMaintenanceDate', value)}
            error={form.errors.nextMaintenanceDate}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-maint-estimated-cost"
            label="Coût estimé"
            type="number"
            inputMode="numeric"
            value={form.values.estimatedCost}
            onChange={(value) => form.setField('estimatedCost', value)}
            error={form.errors.estimatedCost}
            hint="Montant en FCFA — donnée de coût, sans impact financier."
            placeholder="0"
          />
        </div>

        <div className="col-12">
          <Divider>Description</Divider>
        </div>
        <div className="col-12">
          <TextAreaField
            id="client-maint-description"
            label="Description"
            value={form.values.description}
            onChange={(value) => form.setField('description', value)}
            error={form.errors.description}
            rows={3}
            placeholder="Décrivez l’intervention prévue…"
          />
        </div>
        <div className="col-12">
          <TextAreaField
            id="client-maint-diagnostic"
            label="Diagnostic"
            value={form.values.diagnostic}
            onChange={(value) => form.setField('diagnostic', value)}
            rows={2}
            placeholder="Constat, anomalie détectée…"
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientMaintenanceFormModal;
