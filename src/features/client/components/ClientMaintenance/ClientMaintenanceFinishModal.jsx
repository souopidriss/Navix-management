import { useMemo } from 'react';
import { z } from 'zod';
import { Divider } from '@/components/ui';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import { formatMaintenanceMoney } from '@/features/maintenance/constants';

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

const buildFinishSchema = () =>
  z.object({
    completedAt: z.string().trim().min(1, 'La date de clôture est requise.'),
    actualCost: z.coerce.number({ invalid_type_error: 'Le coût réel est requis.' }).min(0, 'Le coût réel ne peut pas être négatif.'),
    performedWork: z.string().trim().optional(),
    nextMaintenanceDate: z.string().trim().optional(),
    nextMileage: z.coerce.number().optional(),
  });

const finishDefaultValues = {
  completedAt: new Date().toISOString().slice(0, 10),
  actualCost: 0,
  performedWork: '',
  nextMaintenanceDate: '',
  nextMileage: '',
};

/**
 * Modale « Clôturer l'entretien » : relève le coût réel, les travaux
 * réalisés et le prochain entretien programmé. Montant en FCFA — donnée
 * de coût, sans impact financier (wallet réservé au PROMPT 059).
 */
const ClientMaintenanceFinishModal = ({ open, onClose, maintenance, onSubmit, loading, error }) => {
  const schema = useMemo(() => buildFinishSchema(), []);

  const form = useZodForm({
    schema,
    defaultValues: finishDefaultValues,
    onSubmit: async (values) => {
      await onSubmit({
        completedAt: values.completedAt,
        actualCost: Number(values.actualCost) || 0,
        performedWork: values.performedWork || '',
        nextMaintenanceDate: values.nextMaintenanceDate || '',
        nextMileage: values.nextMileage === '' ? 0 : Number(values.nextMileage),
      });
    },
  });

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Clôturer l’entretien"
      subtitle={`${maintenance?.maintenanceNumber ?? ''} · ${maintenance?.vehicle?.registrationNumber ?? ''}`}
      icon="bi-check2-circle"
      size="lg"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Clôturer l’entretien"
    >
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <TextField
            id="client-maint-finish-date"
            label="Date de clôture"
            type="date"
            value={form.values.completedAt}
            onChange={(value) => form.setField('completedAt', value)}
            error={form.errors.completedAt}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-maint-finish-cost"
            label="Coût réel"
            type="number"
            inputMode="numeric"
            value={form.values.actualCost}
            onChange={(value) => form.setField('actualCost', value)}
            error={form.errors.actualCost}
            hint={
              maintenance
                ? `Estimé : ${formatMaintenanceMoney(maintenance.estimatedCost, maintenance.currency)}`
                : 'Montant en FCFA.'
            }
            placeholder="0"
          />
        </div>
        <div className="col-12">
          <TextAreaField
            id="client-maint-finish-work"
            label="Travaux réalisés"
            value={form.values.performedWork}
            onChange={(value) => form.setField('performedWork', value)}
            rows={3}
            placeholder="Récapitulatif des interventions effectuées…"
          />
        </div>
        <div className="col-12">
          <Divider className="d-block" />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-maint-finish-next-date"
            label="Prochaine date d’entretien"
            type="date"
            value={form.values.nextMaintenanceDate}
            onChange={(value) => form.setField('nextMaintenanceDate', value)}
            hint="Programmée automatiquement pour l’alerte de suivi."
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-maint-finish-next-mileage"
            label="Prochain kilométrage"
            type="number"
            inputMode="numeric"
            value={form.values.nextMileage}
            onChange={(value) => form.setField('nextMileage', value)}
            placeholder="0"
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientMaintenanceFinishModal;
