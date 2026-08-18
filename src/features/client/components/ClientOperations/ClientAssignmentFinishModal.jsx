import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  assignmentFinishSchema,
  finishDefaultValues,
  toFinishValues,
} from '@/features/assignments/schemas';

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

const TextAreaField = ({ id, label, value, onChange, rows = 3, placeholder }) => (
  <div>
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <textarea
      id={id}
      className="form-control"
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </div>
);

/**
 * Modale « Fin d'affectation » : clôture une affectation active avec les
 * relevés finaux (date, kilométrage, carburant). Déclenche la cascade
 * (recalcul disponibilité chauffeur, véhicule libre si plus de trajet).
 */
const ClientAssignmentFinishModal = ({ open, onClose, assignment, onSubmit, loading, error }) => {
  const form = useZodForm({
    schema: assignmentFinishSchema,
    defaultValues: finishDefaultValues,
    onSubmit: async (values) => {
      await onSubmit(toFinishValues(values));
    },
  });

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Clôturer l’affectation"
      subtitle={`${assignment?.assignmentNumber ?? ''} · ${assignment?.vehicle?.registrationNumber ?? ''}`}
      icon="bi-flag-fill"
      size="md"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Clôturer l’affectation"
    >
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <TextField
            id="client-assignment-finish-end-date"
            label="Date de fin"
            type="date"
            value={form.values.endDate}
            onChange={(value) => form.setField('endDate', value)}
            error={form.errors.endDate}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-assignment-finish-end-mileage"
            label="Kilométrage final"
            type="number"
            inputMode="numeric"
            value={form.values.endMileage}
            onChange={(value) => form.setField('endMileage', value)}
            error={form.errors.endMileage}
            hint="En kilomètres."
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-assignment-finish-fuel"
            label="Niveau de carburant final (%)"
            type="number"
            inputMode="numeric"
            value={form.values.fuelLevelEnd}
            onChange={(value) => form.setField('fuelLevelEnd', value)}
            error={form.errors.fuelLevelEnd}
            placeholder="0 – 100"
          />
        </div>
        <div className="col-12">
          <TextAreaField
            id="client-assignment-finish-reason"
            label="Motif de clôture"
            value={form.values.reason}
            onChange={(value) => form.setField('reason', value)}
            placeholder="Observations de fin d’affectation."
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientAssignmentFinishModal;
