import { useMemo } from 'react';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  buildTripFinishSchema,
  tripFinishDefaultValues,
  toFinishValues,
} from '@/features/trips/schemas';

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
 * Modale « Terminer le trajet » : relève les données d'arrivée (date, heure,
 * kilométrage, distance réelle). Le schéma est construit dynamiquement à
 * partir du contexte du trajet (règle arrivée ≥ départ, km arrivée > km départ).
 * La vitesse moyenne est calculée par le service.
 */
const ClientTripFinishModal = ({ open, onClose, trip, onSubmit, loading, error }) => {
  const schema = useMemo(
    () => buildTripFinishSchema({ departureDate: trip?.departureDate ?? '', departureMileage: trip?.departureMileage ?? 0 }),
    [trip],
  );

  const form = useZodForm({
    schema,
    defaultValues: tripFinishDefaultValues,
    onSubmit: async (values) => {
      await onSubmit(toFinishValues(values));
    },
  });

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Terminer le trajet"
      subtitle={`${trip?.tripNumber ?? ''} · ${trip?.departureLocation ?? ''} → ${trip?.arrivalLocation ?? ''}`}
      icon="bi-flag-fill"
      size="md"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Terminer le trajet"
    >
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-finish-arrival-date"
            label="Date d’arrivée"
            type="date"
            value={form.values.arrivalDate}
            onChange={(value) => form.setField('arrivalDate', value)}
            error={form.errors.arrivalDate}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-finish-arrival-time"
            label="Heure d’arrivée"
            type="time"
            value={form.values.arrivalTime}
            onChange={(value) => form.setField('arrivalTime', value)}
            error={form.errors.arrivalTime}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-finish-arrival-mileage"
            label="Kilométrage d’arrivée"
            type="number"
            inputMode="numeric"
            value={form.values.arrivalMileage}
            onChange={(value) => form.setField('arrivalMileage', value)}
            error={form.errors.arrivalMileage}
            hint={`Départ : ${trip?.departureMileage ?? 0} km.`}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-finish-actual-distance"
            label="Distance réelle (km)"
            type="number"
            inputMode="numeric"
            value={form.values.actualDistance}
            onChange={(value) => form.setField('actualDistance', value)}
            error={form.errors.actualDistance}
            placeholder="0"
          />
        </div>
        <div className="col-12 col-md-6">
          <TextField
            id="client-trip-finish-actual-duration"
            label="Durée réelle (min)"
            type="number"
            inputMode="numeric"
            value={form.values.actualDuration}
            onChange={(value) => form.setField('actualDuration', value)}
            error={form.errors.actualDuration}
            placeholder="0"
          />
        </div>
        <div className="col-12">
          <TextAreaField
            id="client-trip-finish-notes"
            label="Notes"
            value={form.values.notes}
            onChange={(value) => form.setField('notes', value)}
            placeholder="Observations de fin de trajet."
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientTripFinishModal;
